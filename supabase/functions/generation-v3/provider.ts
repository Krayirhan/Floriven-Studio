import { type V3PlanningOperation, type V3PromptMessage } from './mod.ts'

/**
 * Live LLM provider for Generation V3's six planning operations. Deliberately self-contained —
 * ADR-0009 forbids building V3 on top of V2's engine — but it talks to the same external APIs,
 * the same env-var-named credentials, and the same google -> cerebras -> groq fallback chain as
 * supabase/functions/generate/index.ts, so a project that already has V2's provider secrets
 * configured needs nothing new to run V3.
 *
 * Never logs prompt content, brief text or raw model output — only operation name, provider,
 * status and latency, per AGENTS.md's "ham prompt... loglanmaz" rule.
 */

type ProviderConfig = {
  name: 'google' | 'cerebras' | 'groq'
  url: string
  model: string
  keyEnv: string
  tokenParam?: string
  extra?: Record<string, unknown>
}

const PROVIDERS: ProviderConfig[] = [
  { name: 'google', url: 'https://generativelanguage.googleapis.com/v1beta/models', model: Deno.env.get('GOOGLE_MODEL') ?? 'gemini-3.6-flash', keyEnv: 'GOOGLE_API_KEY' },
  { name: 'cerebras', url: 'https://api.cerebras.ai/v1/chat/completions', model: 'gpt-oss-120b', keyEnv: 'CEREBRAS_API_KEY', tokenParam: 'max_completion_tokens', extra: { reasoning_effort: 'low' } },
  { name: 'groq', url: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.3-70b-versatile', keyEnv: 'GROQ_API_KEY', tokenParam: 'max_tokens', extra: {} },
]

/** Planning replies are compact semantic contracts, not component trees — a firm cap keeps a verbose model from burning composition-sized budget here. */
const OPERATION_MAX_TOKENS: Record<V3PlanningOperation, number> = {
  product_model: 900, screen_jobs: 1600, ux_structure: 1800, component_capabilities: 1200, layout_plan: 1400, content_plan: 1800,
}

export class V3ProviderError extends Error {
  constructor(public readonly code: string, message: string, public readonly provider: string, public readonly retryable: boolean) {
    super(message)
    this.name = 'V3ProviderError'
  }
}

function buildRequestBody(provider: ProviderConfig, messages: V3PromptMessage[], maxTokens: number) {
  if (provider.name === 'google') {
    const system = messages.find((message) => message.role === 'system')
    return {
      contents: messages.filter((message) => message.role !== 'system').map((message) => ({ role: 'user', parts: [{ text: message.content }] })),
      ...(system ? { systemInstruction: { parts: [{ text: system.content }] } } : {}),
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.2, responseMimeType: 'application/json' },
    }
  }
  return { model: provider.model, messages, [provider.tokenParam ?? 'max_tokens']: maxTokens, temperature: 0.2, response_format: { type: 'json_object' }, ...provider.extra }
}

function extractContent(provider: ProviderConfig, data: Record<string, unknown>): string {
  if (provider.name === 'google') {
    const candidates = data.candidates as Array<{ content?: { parts?: Array<{ text?: string }> } }> | undefined
    const text = candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? ''
    if (!text.trim()) throw new V3ProviderError('PROVIDER_EMPTY_RESPONSE', 'Google provider returned no usable content', provider.name, false)
    return text
  }
  const choices = data.choices as Array<{ message?: { content?: string } }> | undefined
  const content = choices?.[0]?.message?.content ?? ''
  if (!content.trim()) throw new V3ProviderError('PROVIDER_EMPTY_RESPONSE', 'OpenAI-compatible provider returned no usable content', provider.name, false)
  return content
}

async function callProvider(provider: ProviderConfig, key: string, messages: V3PromptMessage[], maxTokens: number, timeoutMs: number): Promise<string> {
  const url = provider.name === 'google' ? `${provider.url}/${provider.model}:generateContent` : provider.url
  const headers: Record<string, string> = provider.name === 'google' ? { 'x-goog-api-key': key, 'Content-Type': 'application/json' } : { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }

  let res: Response
  try {
    res = await fetch(url, { method: 'POST', signal: AbortSignal.timeout(timeoutMs), headers, body: JSON.stringify(buildRequestBody(provider, messages, maxTokens)) })
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === 'TimeoutError'
    throw new V3ProviderError(timedOut ? 'PROVIDER_TIMEOUT' : 'PROVIDER_UNAVAILABLE', `${provider.name} request failed before a response was received`, provider.name, true)
  }

  if (res.ok) {
    let data: Record<string, unknown>
    try {
      data = await res.json() as Record<string, unknown>
    } catch {
      throw new V3ProviderError('PROVIDER_RESPONSE_DECODE_FAILED', `${provider.name} returned malformed JSON`, provider.name, false)
    }
    return extractContent(provider, data)
  }
  if (res.status === 401 || res.status === 403) throw new V3ProviderError('PROVIDER_AUTH_FAILED', `${provider.name} authentication failed (${res.status})`, provider.name, false)
  if (res.status === 402 || res.status === 429 || res.status >= 500) throw new V3ProviderError('PROVIDER_RETRYABLE', `${provider.name} error (${res.status})`, provider.name, true)
  throw new V3ProviderError('PROVIDER_BAD_RESPONSE', `${provider.name} error (${res.status})`, provider.name, false)
}

/** Tries each configured provider in order, falling through only on retryable failures — an auth or decode failure on one provider does not mask a working one behind it. */
export function createLiveV3Provider(timeoutMs = 45_000): { completeJson(input: { operation: V3PlanningOperation; messages: V3PromptMessage[]; correlationId: string; timeoutMs: number }): Promise<string> } {
  return {
    async completeJson({ operation, messages }) {
      const maxTokens = OPERATION_MAX_TOKENS[operation]
      let configuredCount = 0
      let lastError: V3ProviderError | undefined
      for (const provider of PROVIDERS) {
        const key = Deno.env.get(provider.keyEnv) ?? ''
        if (!key) continue
        configuredCount += 1
        try {
          return await callProvider(provider, key, messages, maxTokens, timeoutMs)
        } catch (error) {
          if (error instanceof V3ProviderError && !error.retryable) throw error
          lastError = error instanceof V3ProviderError ? error : new V3ProviderError('PROVIDER_UNAVAILABLE', 'unexpected provider failure', provider.name, true)
        }
      }
      if (configuredCount === 0) throw new V3ProviderError('PROVIDER_NOT_CONFIGURED', 'No AI provider credentials are configured (GOOGLE_API_KEY / CEREBRAS_API_KEY / GROQ_API_KEY)', 'none', false)
      throw lastError ?? new V3ProviderError('PROVIDER_UNAVAILABLE', 'All configured AI providers were unavailable', 'provider-chain', true)
    },
  }
}
