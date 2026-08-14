import { type V3PlanningOperation, V3ProviderError } from './planning-pipeline.ts'
import { type V3PromptMessage } from './prompts.ts'

/**
 * Live LLM provider for Generation V3's planning operations. Deliberately self-contained — ADR-0009
 * forbids building V3 on top of V2's engine — but it talks to the same Google Gemini API and the
 * same GOOGLE_API_KEY/GOOGLE_MODEL env vars as supabase/functions/generate/index.ts, so a project
 * that already has V2's Gemini secret configured needs nothing new to run V3. Gemini only, by
 * design — no cross-provider fallback chain.
 *
 * Never logs prompt content, brief text or raw model output — only operation name, provider,
 * status and latency, per AGENTS.md's "ham prompt... loglanmaz" rule.
 */

const GOOGLE_MODEL = Deno.env.get('GOOGLE_MODEL') ?? 'gemini-3.6-flash'
const GOOGLE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GOOGLE_MODEL}:generateContent`

/**
 * Planning replies are compact semantic contracts, not component trees — a firm cap keeps a
 * verbose model from burning composition-sized budget here. These floors are deliberately well
 * above the visible-JSON size: a reasoning-capable model's internal "thinking" tokens are drawn
 * from the same maxOutputTokens budget before it writes the answer (supabase/functions/generate's
 * output-budget.ts hit and documents this exact truncation failure at 256 tokens; 4096 was its fix).
 */
/** design_spec_compile and static_critics are deterministic stages — they never call completeJson, so they're excluded here. */
type V3LlmOperation = Exclude<V3PlanningOperation, 'design_spec_compile' | 'static_critics'>
const OPERATION_MAX_TOKENS: Record<V3LlmOperation, number> = {
  product_model: 4_096, screen_jobs: 4_096, ux_structure: 6_144, component_capabilities: 4_096, layout_plan: 4_096, content_plan: 6_144,
  patch_plan: 4_096,
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

function extractContent(data: Record<string, unknown>): string {
  const candidates = data.candidates as Array<{ content?: { parts?: Array<{ text?: string }> } }> | undefined
  const text = candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? ''
  if (!text.trim()) throw new V3ProviderError('PROVIDER_EMPTY_RESPONSE', 'Google provider returned no usable content', 'google', false)
  return extractJsonText(text)
}

async function callGoogle(key: string, messages: V3PromptMessage[], maxTokens: number, timeoutMs: number): Promise<string> {
  const system = messages.find((message) => message.role === 'system')
  const body = {
    contents: messages.filter((message) => message.role !== 'system').map((message) => ({ role: 'user', parts: [{ text: message.content }] })),
    ...(system ? { systemInstruction: { parts: [{ text: system.content }] } } : {}),
    generationConfig: { maxOutputTokens: maxTokens, temperature: 0.2, responseMimeType: 'application/json' },
  }

  let res: Response
  try {
    res = await fetch(GOOGLE_URL, {
      method: 'POST', signal: AbortSignal.timeout(timeoutMs),
      headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === 'TimeoutError'
    throw new V3ProviderError(timedOut ? 'PROVIDER_TIMEOUT' : 'PROVIDER_UNAVAILABLE', 'google request failed before a response was received', 'google', true)
  }

  if (res.ok) {
    let data: Record<string, unknown>
    try {
      data = await res.json() as Record<string, unknown>
    } catch {
      throw new V3ProviderError('PROVIDER_RESPONSE_DECODE_FAILED', 'google returned malformed JSON', 'google', false)
    }
    return extractContent(data)
  }
  if (res.status === 401 || res.status === 403) throw new V3ProviderError('PROVIDER_AUTH_FAILED', `google authentication failed (${res.status})`, 'google', false)
  if (res.status === 402 || res.status === 429 || res.status >= 500) throw new V3ProviderError('PROVIDER_RETRYABLE', `google error (${res.status})`, 'google', true)
  throw new V3ProviderError('PROVIDER_BAD_RESPONSE', `google error (${res.status})`, 'google', false)
}

export function createLiveV3Provider(timeoutMs = 45_000): { completeJson(input: { operation: V3PlanningOperation; messages: V3PromptMessage[]; correlationId: string; timeoutMs: number }): Promise<string> } {
  return {
    async completeJson({ operation, messages }) {
      if (operation === 'design_spec_compile' || operation === 'static_critics') {
        throw new V3ProviderError('PROVIDER_INVALID_OPERATION', `${operation} is a deterministic stage and never calls the LLM provider`, 'none', false)
      }
      const key = Deno.env.get('GOOGLE_API_KEY') ?? ''
      if (!key) throw new V3ProviderError('PROVIDER_NOT_CONFIGURED', 'No AI provider credentials are configured (GOOGLE_API_KEY)', 'none', false)
      const maxTokens = OPERATION_MAX_TOKENS[operation]
      return callGoogle(key, messages, maxTokens, timeoutMs)
    },
  }
}
