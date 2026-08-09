import { describe, expect, it } from 'vitest'
import { classifyProviderFailure } from './provider-contract'

describe('provider failure contract', () => {
  it('distinguishes provider timeout from caller timeout handling', () => {
    expect(classifyProviderFailure(new DOMException('deadline', 'TimeoutError'))).toBe('PROVIDER_TIMEOUT')
  })

  it('does not classify ordinary errors as provider timeout', () => {
    expect(classifyProviderFailure(new Error('caller polling stopped'))).toBeUndefined()
  })
})
