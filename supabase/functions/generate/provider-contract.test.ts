import { describe, expect, it } from 'vitest'
import { classifyProviderFailure, classifyProviderStatus } from './provider-contract'

describe('provider failure contract', () => {
  it('distinguishes provider timeout from caller timeout handling', () => {
    expect(classifyProviderFailure(new DOMException('deadline', 'TimeoutError'))).toBe('PROVIDER_TIMEOUT')
  })

  it('does not classify ordinary errors as provider timeout', () => {
    expect(classifyProviderFailure(new Error('caller polling stopped'))).toBeUndefined()
  })

  it.each([
    [401, 'PROVIDER_AUTH_FAILED', false],
    [403, 'PROVIDER_AUTH_FAILED', false],
    [429, 'PROVIDER_RATE_LIMITED', true],
    [503, 'PROVIDER_UNAVAILABLE', true],
    [400, 'PROVIDER_BAD_RESPONSE', false],
  ] as const)('classifies HTTP %s without a generic technical failure', (status, code, retryable) => {
    expect(classifyProviderStatus(status)).toEqual({ code, retryable })
  })
})
