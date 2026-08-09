import { describe, expect, it } from 'vitest'
import { fallbackPlanningIntent, resolvePlanningIntent } from './planning-intent.ts'
import { composeDeterministicBaseScreens } from './deterministic-compositor.ts'
import { evaluateGenerationQuality } from './quality.ts'

describe('deterministic compositor', () => {
  it('builds a complete Finance tree without a provider', () => {
    const blueprint = resolvePlanningIntent(fallbackPlanningIntent('fatura gelir gider vergi'), 'finance')
    const screens = composeDeterministicBaseScreens(blueprint)
    expect(screens).toHaveLength(6)
    expect(screens.every((screen) => (screen.root as Record<string, unknown>).type === 'Screen')).toBe(true)
  })
  it('keeps screen and node IDs unique', () => {
    const blueprint = resolvePlanningIntent(fallbackPlanningIntent('finance'), 'finance')
    const screens = composeDeterministicBaseScreens(blueprint)
    expect(new Set(screens.map((screen) => screen.id)).size).toBe(screens.length)
  })
  it('reports the real deterministic quality baseline', () => {
    const blueprint = resolvePlanningIntent(fallbackPlanningIntent('fatura gelir gider vergi'), 'finance')
    const report = evaluateGenerationQuality(composeDeterministicBaseScreens(blueprint), blueprint)
    expect(report.score).toBeGreaterThanOrEqual(70)
    expect(report.passed).toBe(true)
    expect(report.metrics.nestedCardCount).toBe(0)
  })
})
