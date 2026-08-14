import { type V3PlanningOperation, V3ProviderError } from './planning-pipeline.ts'
import { type V3PromptMessage } from './prompts.ts'

/**
 * Live LLM provider for Generation V3's planning operations. Deliberately self-contained —
 * ADR-0009 forbids building V3 on top of V2's engine — but it talks to the same env-var-named
 * credentials as supabase/functions/generate/index.ts, so a project that already has V2's
 * secrets configured needs nothing new to run V3.
 *
 * Gemini is primary (fastest, most reliable so far); the rest are emergency fallbacks only tried
 * when the one ahead of them fails (quota, outage, timeout) — not a load-balanced pool. Never
 * logs prompt content, brief text or raw model output — only operation name, provider, status
 * and latency, per AGENTS.md's "ham prompt... loglanmaz" rule.
 */

type ProviderConfig = {
  /** Short label for error messages/logs — never the same for two entries. */
  label: string
  kind: 'google' | 'openai-compatible'
  url: string
  model: string
  keyEnv: string
  tokenParam?: string
  extra?: Record<string, unknown>
  maxTokensCap?: number
}

const GOOGLE_MODEL = Deno.env.get('GOOGLE_MODEL') ?? 'gemini-2.5-flash'

const PROVIDERS: ProviderConfig[] = [
  {
    label: 'google', kind: 'google',
    url: `https://generativelanguage.googleapis.com/v1beta/models/${GOOGLE_MODEL}:generateContent`,
    model: GOOGLE_MODEL, keyEnv: 'GOOGLE_API_KEY',
  },
  {
    // Free-tier OpenRouter model, own quota pool separate from Gemini's — a live fallback rather
    // than primary: confirmed correct (clean JSON, ~3-14s per call) but consistently slower than
    // Gemini, and a multi-screen generation run with it as primary was observed live to blow past
    // Supabase's background-task execution ceiling and get killed mid-flight with the job stuck in
    // "processing" forever (no error ever recorded, since the process is killed externally, not a
    // catchable exception). reasoning.enabled: false is required — without it this model writes
    // its internal monologue into a separate "reasoning" field and often never reaches the visible
    // JSON answer at all before hitting the token budget (content: null, finish_reason: "length").
    label: 'openrouter/nemotron-3-super-120b', kind: 'openai-compatible',
    url: 'https://openrouter.ai/api/v1/chat/completions', model: 'nvidia/nemotron-3-super-120b-a12b:free', keyEnv: 'OPENROUTER_API_KEY',
    tokenParam: 'max_tokens', extra: { reasoning: { enabled: false } },
  },
  {
    label: 'cerebras/gpt-oss-120b', kind: 'openai-compatible',
    url: 'https://api.cerebras.ai/v1/chat/completions', model: 'gpt-oss-120b', keyEnv: 'CEREBRAS_API_KEY',
    tokenParam: 'max_completion_tokens', extra: { reasoning_effort: 'low' },
  },
  {
    // moonshotai/kimi-k2-instruct was discontinued on Groq (May 2026); Groq's own deprecation
    // notice points to this model as the replacement.
    label: 'groq/gpt-oss-120b', kind: 'openai-compatible',
    url: 'https://api.groq.com/openai/v1/chat/completions', model: 'openai/gpt-oss-120b', keyEnv: 'GROQ_API_KEY',
    tokenParam: 'max_tokens', maxTokensCap: 6_500,
  },
  {
    label: 'groq/llama-3.3-70b', kind: 'openai-compatible',
    url: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.3-70b-versatile', keyEnv: 'GROQ_API_KEY',
    tokenParam: 'max_tokens', maxTokensCap: 6_500,
  },
]

/**
 * Planning replies are compact semantic contracts, not component trees — a firm cap keeps a
 * verbose model from burning composition-sized budget here. These floors are deliberately well
 * above the visible-JSON size: a reasoning-capable model's internal "thinking" tokens are drawn
 * from the same maxOutputTokens budget before it writes the answer (supabase/functions/generate's
 * output-budget.ts hit and documents this exact truncation failure at 256 tokens; 4096 was its
 * fix). Gemini additionally has thinkingConfig disabled below so this budget goes entirely to
 * the visible answer rather than needing headroom for invisible reasoning tokens.
 */
/** design_spec_compile and static_critics are deterministic stages — they never call completeJson, so they're excluded here. */
type V3LlmOperation = Exclude<V3PlanningOperation, 'design_spec_compile' | 'static_critics'>
const OPERATION_MAX_TOKENS: Record<V3LlmOperation, number> = {
  product_model: 4_096, screen_jobs: 4_096, ux_structure: 6_144, component_capabilities: 4_096, layout_plan: 4_096, content_plan: 6_144,
  patch_plan: 4_096,
}

function buildRequestBody(provider: ProviderConfig, messages: V3PromptMessage[], maxTokens: number) {
  if (provider.kind === 'google') {
    const system = messages.find((message) => message.role === 'system')
    return {
      contents: messages.filter((message) => message.role !== 'system').map((message) => ({ role: 'user', parts: [{ text: message.content }] })),
      ...(system ? { systemInstruction: { parts: [{ text: system.content }] } } : {}),
      // Reasoning models draw invisible "thinking" tokens from this same budget before writing
      // the visible JSON answer — with a compact planning-sized budget that can truncate the
      // answer entirely (the exact cause of live "strict JSON parsing failed" failures).
      // thinkingBudget: 0 disables that for Gemini so the whole budget goes to the output.
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.2, responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } },
    }
  }
  return { model: provider.model, messages, [provider.tokenParam ?? 'max_tokens']: maxTokens, temperature: 0.2, response_format: { type: 'json_object' }, ...provider.extra }
}

/**
 * Unwraps a response some models return despite being told not to: a ```json ... ``` fence
 * anywhere in the text (not just wrapping the whole string), and/or leading or trailing prose
 * around the JSON object ("Here is the JSON: {...}"). This is not JSON repair — it only trims
 * outer wrapper noise; validation.ts's parseStrictJsonObject still does a plain, unforgiving
 * JSON.parse on whatever remains and rejects anything actually malformed inside the braces.
 */
function extractJsonText(text: string): string {
  const trimmed = text.trim()
  const fenced = /```(?:json)?\s*\n?([\s\S]*?)\n?```/.exec(trimmed)
  const candidate = fenced ? (fenced[1] ?? trimmed).trim() : trimmed
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) return candidate
  return candidate.slice(start, end + 1)
}

function extractContent(provider: ProviderConfig, data: Record<string, unknown>): string {
  if (provider.kind === 'google') {
    const candidates = data.candidates as Array<{ content?: { parts?: Array<{ text?: string }> } }> | undefined
    const text = candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? ''
    if (!text.trim()) throw new V3ProviderError('PROVIDER_EMPTY_RESPONSE', `${provider.label} returned no usable content`, provider.label, false)
    return extractJsonText(text)
  }
  const choices = data.choices as Array<{ message?: { content?: string } }> | undefined
  const content = choices?.[0]?.message?.content ?? ''
  if (!content.trim()) throw new V3ProviderError('PROVIDER_EMPTY_RESPONSE', `${provider.label} returned no usable content`, provider.label, false)
  return extractJsonText(content)
}

async function callProvider(provider: ProviderConfig, key: string, messages: V3PromptMessage[], maxTokens: number, timeoutMs: number): Promise<string> {
  const headers: Record<string, string> = provider.kind === 'google' ? { 'x-goog-api-key': key, 'Content-Type': 'application/json' } : { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }

  let res: Response
  try {
    res = await fetch(provider.url, { method: 'POST', signal: AbortSignal.timeout(timeoutMs), headers, body: JSON.stringify(buildRequestBody(provider, messages, maxTokens)) })
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === 'TimeoutError'
    throw new V3ProviderError(timedOut ? 'PROVIDER_TIMEOUT' : 'PROVIDER_UNAVAILABLE', `${provider.label} request failed before a response was received`, provider.label, true)
  }

  if (res.ok) {
    let data: Record<string, unknown>
    try {
      data = await res.json() as Record<string, unknown>
    } catch {
      throw new V3ProviderError('PROVIDER_RESPONSE_DECODE_FAILED', `${provider.label} returned malformed JSON`, provider.label, false)
    }
    return extractContent(provider, data)
  }
  if (res.status === 401 || res.status === 403) throw new V3ProviderError('PROVIDER_AUTH_FAILED', `${provider.label} authentication failed (${res.status})`, provider.label, false)
  if (res.status === 402 || res.status === 429 || res.status >= 500) throw new V3ProviderError('PROVIDER_RETRYABLE', `${provider.label} error (${res.status})`, provider.label, true)
  throw new V3ProviderError('PROVIDER_BAD_RESPONSE', `${provider.label} error (${res.status})`, provider.label, false)
}

/** Tries Gemini first, falling through to OpenRouter's free model and then the emergency-fallback models on any failure (quota, outage, timeout, bad model id) — a failure on one provider never masks a working one behind it. */
export function createLiveV3Provider(timeoutMs = 45_000): { completeJson(input: { operation: V3PlanningOperation; messages: V3PromptMessage[]; correlationId: string; timeoutMs: number }): Promise<string> } {
  return {
    async completeJson({ operation, messages }) {
      if (operation === 'design_spec_compile' || operation === 'static_critics') {
        throw new V3ProviderError('PROVIDER_INVALID_OPERATION', `${operation} is a deterministic stage and never calls the LLM provider`, 'none', false)
      }
      const maxTokens = OPERATION_MAX_TOKENS[operation]
      let configuredCount = 0
      let lastError: V3ProviderError | undefined
      for (const provider of PROVIDERS) {
        const key = Deno.env.get(provider.keyEnv) ?? ''
        if (!key) continue
        configuredCount += 1
        const providerMaxTokens = provider.maxTokensCap ? Math.min(maxTokens, provider.maxTokensCap) : maxTokens
        try {
          return await callProvider(provider, key, messages, providerMaxTokens, timeoutMs)
        } catch (error) {
          // Any failure on one provider — auth, bad model id, outage, whatever — is specific to
          // that provider and says nothing about the next one, so always fall through to it. Only
          // exhausting every configured provider is actually fatal.
          lastError = error instanceof V3ProviderError ? error : new V3ProviderError('PROVIDER_UNAVAILABLE', 'unexpected provider failure', provider.label, true)
        }
      }
      if (configuredCount === 0) throw new V3ProviderError('PROVIDER_NOT_CONFIGURED', 'No AI provider credentials are configured (OPENROUTER_API_KEY / GOOGLE_API_KEY / CEREBRAS_API_KEY / GROQ_API_KEY)', 'none', false)
      throw lastError ?? new V3ProviderError('PROVIDER_UNAVAILABLE', 'All configured AI providers were unavailable', 'provider-chain', true)
    },
  }
}
