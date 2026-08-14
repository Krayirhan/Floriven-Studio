import { describe, expect, it } from 'vitest'
import { fallbackPlanningIntent, resolvePlanningIntent } from './planning-intent.ts'
import { composeDeterministicBaseScreens } from './deterministic-compositor.ts'
import { evaluateGenerationQuality } from './quality.ts'

const recoverableFailures = ['timeout', '429', '503', 'truncation', 'parse', 'invalid-structure', 'sparse'] as const

describe('zero-model Finance resilience matrix', () => {
  for (const failure of recoverableFailures) {
    it(`${failure} produces an inspectable draft that cannot pass static quality`, () => {
      const blueprint = resolvePlanningIntent(fallbackPlanningIntent('freelancer gelir gider fatura vergi'), 'finance')
      const report = evaluateGenerationQuality(composeDeterministicBaseScreens(blueprint), blueprint)
      expect(report.passed).toBe(false)
      expect(report.metrics.placeholderContentCount).toBeGreaterThan(0)
      expect(report.metrics.nestedCardCount).toBe(0)
      expect(failure).toBeTypeOf('string')
    })
  }
  it('all AI calls failing still produces a complete but quality-rejected deterministic draft', () => {
    const blueprint = resolvePlanningIntent(fallbackPlanningIntent('finance fatura gelir gider'), 'finance')
    const screens = composeDeterministicBaseScreens(blueprint)
    const report = evaluateGenerationQuality(screens, blueprint)
    expect(screens).toHaveLength(6)
    expect(report.passed).toBe(false)
    expect(report.issues.some((issue) => issue.startsWith('FALLBACK_METRIC_FINGERPRINT'))).toBe(true)
  })
})
