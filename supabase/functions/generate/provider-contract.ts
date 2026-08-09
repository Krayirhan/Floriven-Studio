export type ProviderFailureCode = 'PROVIDER_TIMEOUT' | 'PROVIDER_AUTH_FAILED' | 'PROVIDER_BAD_RESPONSE'

export function classifyProviderFailure(error: unknown): ProviderFailureCode | undefined {
  if (error instanceof DOMException && (error.name === 'TimeoutError' || error.name === 'AbortError')) return 'PROVIDER_TIMEOUT'
  return undefined
}
