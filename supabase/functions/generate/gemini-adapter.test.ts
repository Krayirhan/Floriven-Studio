import { describe, expect, it } from 'vitest'
import { GeminiAdapterError, normalizeGeminiText, parseGeminiGenerateContentResponse } from './gemini-adapter'

const response = (parts: unknown[], finishReason = 'STOP') => ({ candidates: [{ content: { parts }, finishReason }] })

describe('native Gemini response adapter', () => {
  it('extracts normal text and supports JSON parsing', () => {
    const result = parseGeminiGenerateContentResponse(response([{ text: '{"ok":true}' }]))
    expect(result.text).toBe('{"ok":true}')
    expect(JSON.parse(result.text)).toEqual({ ok: true })
  })
  it('joins multiple textual parts in stable order', () => {
    expect(parseGeminiGenerateContentResponse(response([{ text: '{"ok":' }, { text: 'true}' }])).text).toBe('{"ok":true}')
  })
  it.each([undefined, [], null])('rejects missing or empty candidates: %s', (candidates) => {
    expect(() => parseGeminiGenerateContentResponse({ candidates })).toThrow(GeminiAdapterError)
  })
  it('rejects missing content and empty parts', () => {
    expect(() => parseGeminiGenerateContentResponse(response([]))).toThrow('no usable text')
    expect(() => parseGeminiGenerateContentResponse({ candidates: [{ finishReason: 'STOP' }] })).toThrow(GeminiAdapterError)
  })
  it('ignores non-text and thought parts', () => {
    const result = parseGeminiGenerateContentResponse(response([{ functionCall: { name: 'x' } }, { text: 'answer', thought: true }, { text: '{"ok":true}' }]))
    expect(result.text).toBe('{"ok":true}')
  })
  it('normalizes only a JSON markdown fence', () => {
    expect(normalizeGeminiText('```json\n{"ok":true}\n```')).toBe('{"ok":true}')
  })
  it.each([['MAX_TOKENS', 'PROVIDER_TRUNCATED_RESPONSE'], ['SAFETY', 'PROVIDER_BLOCKED_RESPONSE'], ['MALFORMED_FUNCTION_CALL', 'PROVIDER_BAD_RESPONSE']] as const)('classifies finish reason %s', (finishReason, code) => {
    try { parseGeminiGenerateContentResponse(response([{ text: 'ignored' }], finishReason)) } catch (error) { expect(error).toMatchObject({ code }); return }
    throw new Error('Expected adapter error')
  })
  it('classifies prompt-level blocking without candidates', () => {
    expect(() => parseGeminiGenerateContentResponse({ promptFeedback: { blockReason: 'SAFETY' } })).toThrow('prompt blocked')
  })
})
