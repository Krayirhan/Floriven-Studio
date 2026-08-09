import { describe, expect, it } from 'vitest'
import { buildProviderHeaders } from './provider-auth'

describe('provider authentication headers', () => {
  it('uses only x-goog-api-key for native Gemini requests', () => {
    const headers = buildProviderHeaders('google-native', 'test-google-key')

    expect(headers['x-goog-api-key']).toBe('test-google-key')
    expect(headers.Authorization).toBeUndefined()
    expect(headers['Content-Type']).toBe('application/json')
  })

  it('preserves Bearer auth for OpenAI-compatible providers', () => {
    const headers = buildProviderHeaders('openai-compatible', 'test-provider-key')

    expect(headers.Authorization).toBe('Bearer test-provider-key')
    expect(headers['x-goog-api-key']).toBeUndefined()
  })
})
