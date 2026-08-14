/**
 * Generation V3 Privacy-Safe Telemetry & Metrics Emitter.
 * Adheres strictly to AGENTS.md: Never emits raw prompts, customer designs, credentials or PII to logs.
 */

export type TelemetryStage =
  | 'product_model'
  | 'screen_jobs'
  | 'ux_structure'
  | 'component_capabilities'
  | 'layout_plan'
  | 'content_plan'
  | 'static_critics'
  | 'repair'
  | 'render_critics'
  | 'acceptance'
  | 'overall'

export type TelemetryEvent = {
  correlationId: string
  tenantId: string
  projectId: string
  stage: TelemetryStage
  status: 'started' | 'succeeded' | 'failed' | 'retried' | 'repaired'
  latencyMs: number
  costCredits?: number
  retryCount?: number
  repairCount?: number
  errorCode?: string
  timestamp: string
}

export interface TelemetrySink {
  emit(event: TelemetryEvent): void
}

export class InMemoryTelemetrySink implements TelemetrySink {
  private readonly events: TelemetryEvent[] = []

  emit(event: TelemetryEvent): void {
    this.events.push(event)
  }

  getEvents(): readonly TelemetryEvent[] {
    return this.events
  }

  clear(): void {
    this.events.length = 0
  }
}

const SENSITIVE_KEY_PATTERNS = [
  /token/i,
  /password/i,
  /secret/i,
  /bearer/i,
  /authorization/i,
  /prompt/i,
  /brief/i,
  /email/i,
  /apikey/i,
]

/**
 * Recursively redacts sensitive keys and values from telemetry data payloads.
 * Masks tokens, passwords, raw prompts and personal identifiers.
 */
export function maskSensitiveData(input: unknown): unknown {
  if (input === null || input === undefined) return input
  if (typeof input === 'string') {
    if (input.startsWith('Bearer ') || input.startsWith('eyJh') || input.length > 500) {
      return '[REDACTED]'
    }
    return input
  }
  if (Array.isArray(input)) {
    return input.map(maskSensitiveData)
  }
  if (typeof input === 'object') {
    const masked: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key))) {
        masked[key] = '[REDACTED]'
      } else {
        masked[key] = maskSensitiveData(value)
      }
    }
    return masked
  }
  return input
}
