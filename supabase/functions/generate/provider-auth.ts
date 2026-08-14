export type ProviderAuth = 'google-native' | 'openai-compatible'

export function buildProviderHeaders(provider: ProviderAuth, key: string): Record<string, string> {
  return {
    ...(provider === 'google-native' ? { 'x-goog-api-key': key } : { Authorization: `Bearer ${key}` }),
    'Content-Type': 'application/json',
  }
}
