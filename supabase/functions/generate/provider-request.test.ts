import { describe, expect, it } from 'vitest'
import { buildGoogleGenerateRequest } from './provider-request.ts'

describe('Google planning request policy', () => {
  const messages = [{ role: 'system' as const, content: 'plan' }, { role: 'user' as const, content: 'brief' }]
  // thinkingConfig: { thinkingBudget: 0 } was a per-operation override to keep
  // planning cheap on the older planning-only model. It is not universally
  // supported (400s on some models), so the request no longer sets it —
  // planning and composition share the same generationConfig shape.
  it('does not set a thinking policy for planning', () => {
    const request = buildGoogleGenerateRequest(messages, 800, 0.1, 'planning')
    expect(request.generationConfig).not.toHaveProperty('thinkingConfig')
  })
  it('does not set a thinking policy for composition', () => {
    const request = buildGoogleGenerateRequest(messages, 24000, 0.55, 'composition')
    expect(request.generationConfig).not.toHaveProperty('thinkingConfig')
  })
})
