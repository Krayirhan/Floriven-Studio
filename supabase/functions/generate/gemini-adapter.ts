export type GeminiParseCode = 'PROVIDER_RESPONSE_DECODE_FAILED' | 'PROVIDER_ENVELOPE_INVALID' | 'PROVIDER_BLOCKED_RESPONSE' | 'PROVIDER_TRUNCATED_RESPONSE' | 'PROVIDER_BAD_RESPONSE'

export type GeminiNormalizedResult = {
  provider: 'google'
  text: string
  finishReason?: string
  diagnostics: {
    candidateCount: number
    partCount: number
    textPartCount: number
    finishReason?: string
    outputLength: number
    parseStage: 'gemini_envelope' | 'model_output'
  }
}

export class GeminiAdapterError extends Error {
  constructor(readonly code: GeminiParseCode, message: string, readonly diagnostics: Record<string, unknown> = {}) { super(message) }
}

const BLOCKED_FINISH_REASONS = new Set(['SAFETY', 'RECITATION', 'BLOCKLIST', 'PROHIBITED_CONTENT', 'SPII'])

export function normalizeGeminiText(text: string): string {
  const trimmed = text.trim()
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  return (fenced?.[1] ?? trimmed).trim()
}

export function parseGeminiGenerateContentResponse(response: unknown): GeminiNormalizedResult {
  if (!response || typeof response !== 'object') throw new GeminiAdapterError('PROVIDER_ENVELOPE_INVALID', 'Gemini response must be an object')
  const envelope = response as { candidates?: unknown; promptFeedback?: { blockReason?: string; safetyRatings?: unknown } }
  const candidates = Array.isArray(envelope.candidates) ? envelope.candidates : []
  if (candidates.length === 0) {
    const reason = envelope.promptFeedback?.blockReason
    throw new GeminiAdapterError(reason ? 'PROVIDER_BLOCKED_RESPONSE' : 'PROVIDER_ENVELOPE_INVALID', reason ? `Gemini prompt blocked: ${reason}` : 'Gemini response contained no candidates', { parseStage: 'gemini_envelope', candidateCount: 0, blockReason: reason, safetyRatings: envelope.promptFeedback?.safetyRatings })
  }

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') continue
    const item = candidate as { content?: { parts?: unknown }; finishReason?: string }
    const finishReason = item.finishReason
    if (finishReason === 'MAX_TOKENS') throw new GeminiAdapterError('PROVIDER_TRUNCATED_RESPONSE', 'Gemini output was truncated by token limit', { parseStage: 'gemini_envelope', candidateCount: candidates.length, finishReason })
    if (BLOCKED_FINISH_REASONS.has(finishReason ?? '')) throw new GeminiAdapterError('PROVIDER_BLOCKED_RESPONSE', `Gemini blocked the response: ${finishReason}`, { parseStage: 'gemini_envelope', candidateCount: candidates.length, finishReason })
    if (finishReason && finishReason !== 'STOP') throw new GeminiAdapterError('PROVIDER_BAD_RESPONSE', `Gemini returned unusable finish reason: ${finishReason}`, { parseStage: 'gemini_envelope', candidateCount: candidates.length, finishReason })

    const parts = Array.isArray(item.content?.parts) ? item.content.parts : []
    const textParts = parts.filter((part): part is { text: string; thought?: boolean } => !!part && typeof part === 'object' && typeof (part as { text?: unknown }).text === 'string' && !(part as { thought?: unknown }).thought)
    const text = normalizeGeminiText(textParts.map((part) => part.text).join(''))
    if (text) {
      return { provider: 'google', text, finishReason, diagnostics: { candidateCount: candidates.length, partCount: parts.length, textPartCount: textParts.length, finishReason, outputLength: text.length, parseStage: 'model_output' } }
    }
  }

  throw new GeminiAdapterError('PROVIDER_ENVELOPE_INVALID', 'Gemini candidates contained no usable text', { parseStage: 'gemini_envelope', candidateCount: candidates.length })
}
