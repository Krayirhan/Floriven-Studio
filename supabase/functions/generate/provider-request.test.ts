import { describe, expect, it } from 'vitest'
import { buildGoogleGenerateRequest } from './provider-request.ts'

describe('Google planning request policy', () => {
  const messages = [{ role: 'system' as const, content: 'plan' }, { role: 'user' as const, content: 'brief' }]
  it('explicitly requests minimal thinking for planning', () => {
    const request = buildGoogleGenerateRequest(messages, 800, 0.1, 'planning')
    expect(request.generationConfig.thinkingConfig).toEqual({ thinkingLevel: 'MINIMAL' })
  })
  it('does not apply planning thinking policy to composition', () => {
    const request = buildGoogleGenerateRequest(messages, 24000, 0.55, 'composition')
    expect(request.generationConfig).not.toHaveProperty('thinkingConfig')
  })
})
