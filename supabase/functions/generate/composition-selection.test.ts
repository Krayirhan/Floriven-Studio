import { describe, expect, it } from 'vitest'
import { resolveCompositionOutcome, selectCompositionMode } from './composition-selection.ts'

describe('composition selection', () => {
  it('never persists a quality-rejected AI candidate as ai_enhanced', () => {
    expect(selectCompositionMode({ hasBaseline: true, enhancedPassed: false })).toBe('deterministic_baseline')
  })

  it('keeps a passing AI composition when no fallback is required', () => {
    expect(selectCompositionMode({ hasBaseline: true, enhancedPassed: true })).toBe('ai_enhanced')
  })

  it.each(['hard invariant', 'navigation mismatch', 'sparse output', 'provider failure'])('%s failure cannot select AI', () => {
    expect(selectCompositionMode({ hasBaseline: true, enhancedPassed: false })).toBe('deterministic_baseline')
  })

  it('marks provider fallback as degraded even when deterministic screens pass quality', () => {
    expect(resolveCompositionOutcome({ hasBaseline: true, enhancedPassed: true, providerFallbackReason: 'PROVIDER_TIMEOUT' })).toEqual({
      selectedCompositionMode: 'ai_enhanced', compositionMode: 'deterministic_fallback', degraded: true, fallbackReason: 'PROVIDER_TIMEOUT',
    })
  })

  it('exposes static-quality baseline selection as a deterministic fallback', () => {
    expect(resolveCompositionOutcome({ hasBaseline: true, enhancedPassed: false })).toEqual({
      selectedCompositionMode: 'deterministic_baseline', compositionMode: 'deterministic_fallback', degraded: true, fallbackReason: 'AI_STATIC_QUALITY_REJECTED',
    })
  })

  it('keeps accepted AI output non-degraded', () => {
    expect(resolveCompositionOutcome({ hasBaseline: true, enhancedPassed: true })).toEqual({
      selectedCompositionMode: 'ai_enhanced', compositionMode: 'ai_enhanced', degraded: false,
    })
  })
})
