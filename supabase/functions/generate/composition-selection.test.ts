import { describe, expect, it } from 'vitest'
import { selectCompositionMode } from './composition-selection.ts'

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
})
