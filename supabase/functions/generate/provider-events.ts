export type ProviderEvent = {
  operation: string
  batchIndex?: number
  provider?: string
  model?: string
  status: 'started' | 'succeeded' | 'failed' | 'fallback'
  errorCode?: string
  fallbackUsed?: boolean
  durationMs?: number
  tokenUsage?: Record<string, unknown>
  sequence: number
}

export function appendProviderEvent(events: ProviderEvent[], event: Omit<ProviderEvent, 'sequence'>): ProviderEvent[] {
  return [...events, { ...event, sequence: events.length }]
}

export function classifyUnexpectedError(error: unknown): 'TECHNICAL_FAILURE' {
  return error instanceof Error ? 'TECHNICAL_FAILURE' : 'TECHNICAL_FAILURE'
}
