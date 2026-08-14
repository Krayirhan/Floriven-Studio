import { describe, expect, it } from 'vitest'
import { fallbackPlanningIntent, resolvePlanningIntent, validatePlanningIntent } from './planning-intent.ts'

describe('deterministic planning intent', () => {
  it('resolves Finance intent deterministically', () => {
    const intent = fallbackPlanningIntent('fatura gelir gider vergi finans')
    expect(resolvePlanningIntent(intent, 'brief').screens.map((screen) => screen.id)).toEqual(intent.screens)
  })
  it('rejects unknown screen and feature keys', () => expect(() => validatePlanningIntent({ domain: 'x', screens: ['unknown'], nav: ['unknown'], features: ['x'] })).toThrow())
  it('does not create duplicate IDs', () => {
    const blueprint = resolvePlanningIntent(fallbackPlanningIntent('finance'), 'brief')
    expect(new Set(blueprint.screens.map((screen) => screen.id)).size).toBe(blueprint.screens.length)
  })
})
