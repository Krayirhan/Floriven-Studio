import { describe, expect, it } from 'vitest'
import { validatePlanningIntent, resolvePlanningIntent } from './planning-intent.ts'
import { composeDeterministicBaseScreens } from './deterministic-compositor.ts'
import { evaluateGenerationQuality } from './quality.ts'
import { canonicalNavigation, validateArchetypeMinimumContent, validateCanonicalNavigation } from './candidate-invariants.ts'
import { selectCompositionMode } from './composition-selection.ts'
import { appendProviderEvent } from './provider-events.ts'
import { scheduleGenerationJob, type JobSnapshot } from './async-job-contract.ts'

// Frozen from RC22's persisted six-screen Finance ScreenGraph semantics.
const RC22_PRODUCTION_REPLAY = {
  domain: 'finance',
  screens: ['overview', 'transactions', 'invoices', 'invoice_form', 'analytics', 'settings'],
  nav: ['overview', 'transactions', 'invoices', 'analytics'],
  features: ['tax_reserve', 'search', 'filters', 'invoice_status', 'currency', 'notifications', 'analytics'],
}

describe('RC22 production baseline replay', () => {
  const blueprint = resolvePlanningIntent(validatePlanningIntent(RC22_PRODUCTION_REPLAY), 'fatura gelir gider vergi')
  const baseline = composeDeterministicBaseScreens(blueprint)
  const report = evaluateGenerationQuality(baseline, blueprint)

  it('keeps the deterministic draft renderable but rejects it as a quality-passing candidate', () => {
    expect(baseline).toHaveLength(6)
    expect(report.score).toBeLessThan(70)
    expect(report.passed).toBe(false)
    expect(report.metrics.fallbackMetricFingerprint).toBe(1)
    expect(report.issues).not.toContain('Alt navigasyon tüm ekranlarda aynı değil.')
  })

  it('uses the frozen ScreenGraph navigation everywhere except the focused form', () => {
    expect(canonicalNavigation(blueprint)).toEqual(['overview', 'transactions', 'invoices', 'analytics'])
    expect(validateCanonicalNavigation(baseline, blueprint)).toEqual([])
    const form = baseline.find((screen) => screen.id === 'invoice_form')!
    expect(JSON.stringify(form)).not.toContain('BottomNavigation')
  })

  it('has no sparse Finance archetype and no hard-invariant violations', () => {
    expect(validateArchetypeMinimumContent(baseline, blueprint)).toEqual([])
    expect(report.metrics.nestedCardCount).toBe(0)
    expect(report.metrics.invalidFabCount).toBe(0)
    expect(report.metrics.focusedFlowBottomNavViolations).toBe(0)
  })

  it('selects the deterministic draft for inspection but does not make it final-eligible', () => {
    const aiQuality = { score: 60, passed: false }
    expect(aiQuality.passed).toBe(false)
    expect(selectCompositionMode({ hasBaseline: true, enhancedPassed: aiQuality.passed })).toBe('deterministic_baseline')
    expect(report.passed).toBe(false)
  })

  it('persists the quality-regression fallback event before runtime handoff', () => {
    const events = appendProviderEvent([], {
      operation: 'composition_quality_gate', status: 'fallback', fallbackUsed: true, errorCode: 'QUALITY_REGRESSION',
    })
    expect(events).toMatchObject([{ operation: 'composition_quality_gate', status: 'fallback', fallbackUsed: true, errorCode: 'QUALITY_REGRESSION' }])
    expect(report.passed).toBe(false)
  })

  it('keeps a quality-rejected deterministic draft out of the runtime-ready state', async () => {
    const job: JobSnapshot & { resultScreens?: unknown[] } = { id: 'rc22-replay', status: 'queued', stage: 'queued', providerExecutions: 0 }
    let work!: () => Promise<void>
    const acknowledgement = scheduleGenerationJob(job, async () => {
      expect(report.passed).toBe(false)
      job.resultScreens = baseline
      job.stage = 'QUALITY_REJECTED'
      job.status = 'failed'
    }, (scheduled) => { work = scheduled })

    expect(acknowledgement.status).toBe('queued')
    await work()
    expect(job).toMatchObject({ status: 'failed', stage: 'QUALITY_REJECTED', resultScreens: baseline })
  })
})
