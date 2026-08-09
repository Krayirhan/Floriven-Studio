import { describe, expect, it } from 'vitest'
import { appendProviderEvent, classifyUnexpectedError } from './provider-events.ts'

describe('provider event history', () => {
  it('appends planning, batches and fallback without replacing history', () => {
    let events = appendProviderEvent([], { operation: 'planning', status: 'succeeded', provider: 'google' })
    events = appendProviderEvent(events, { operation: 'composition', batchIndex: 0, status: 'succeeded', provider: 'google' })
    events = appendProviderEvent(events, { operation: 'composition', batchIndex: 1, status: 'failed', errorCode: 'COMPOSITION_TIMEOUT' })
    events = appendProviderEvent(events, { operation: 'composition', batchIndex: 1, status: 'fallback', fallbackUsed: true })
    events = appendProviderEvent(events, { operation: 'composition', batchIndex: 2, status: 'succeeded', provider: 'google' })
    expect(events.map((event) => `${event.operation}:${event.status}`)).toEqual(['planning:succeeded', 'composition:succeeded', 'composition:failed', 'composition:fallback', 'composition:succeeded'])
    expect(events.map((event) => event.sequence)).toEqual([0, 1, 2, 3, 4])
  })
  it('reserves TECHNICAL_FAILURE for unexpected application errors', () => expect(classifyUnexpectedError(new Error('unexpected_internal_fixture'))).toBe('TECHNICAL_FAILURE'))
})
