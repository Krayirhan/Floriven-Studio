export type ProviderFailureCode = 'PROVIDER_AUTH_FAILED' | 'PROVIDER_RATE_LIMITED' | 'PROVIDER_TIMEOUT' | 'PROVIDER_BAD_RESPONSE' | 'PROVIDER_UNAVAILABLE' | 'PROVIDER_INTERNAL_ERROR' | 'PROVIDER_PARSE_FAILED'

export function classifyProviderFailure(error: unknown): ProviderFailureCode | undefined {
  if (error instanceof DOMException && (error.name === 'TimeoutError' || error.name === 'AbortError')) return 'PROVIDER_TIMEOUT'
  return undefined
}

export function classifyProviderStatus(status: number): { code: ProviderFailureCode; retryable: boolean } | undefined {
  if (status >= 200 && status < 300) return undefined
  if (status === 401 || status === 403) return { code: 'PROVIDER_AUTH_FAILED', retryable: false }
  if (status === 429) return { code: 'PROVIDER_RATE_LIMITED', retryable: true }
  if (status >= 500) return { code: 'PROVIDER_UNAVAILABLE', retryable: true }
  return { code: 'PROVIDER_BAD_RESPONSE', retryable: false }
}
