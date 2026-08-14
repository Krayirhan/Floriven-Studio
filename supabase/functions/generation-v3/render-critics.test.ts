import { describe, expect, it } from 'vitest'
import { CANONICAL_VIEWPORT, evaluateRenderCritics, type RuntimeCaptureMetrics } from './render-critics.ts'

const passingMetrics: RuntimeCaptureMetrics = {
  screenJobId: 'weekly-schedule',
  viewport: { width: 390, height: 844 },
  visibleNodeCount: 18,
  sectionCount: 2,
  sectionAreaCoveragePct: 60,
  verticalOccupancyPct: 70,
  nodeDensityPer100kPx: 6,
  sectionHeightVariancePct: 20,
}

describe('evaluateRenderCritics', () => {
  it('passes metrics that satisfy every documented visualHierarchy threshold', () => {
    expect(evaluateRenderCritics(passingMetrics)).toMatchObject({ passed: true, violations: [] })
  })

  it('uses the canonical 390x844 viewport constant', () => {
    expect(CANONICAL_VIEWPORT).toEqual({ width: 390, height: 844 })
  })

  it('rejects a non-canonical viewport', () => {
    const report = evaluateRenderCritics({ ...passingMetrics, viewport: { width: 1280, height: 800 } })
    expect(report.passed).toBe(false)
    expect(report.violations.some((v) => v.code === 'NON_CANONICAL_VIEWPORT')).toBe(true)
  })

  it('rejects fewer than 2 sections', () => {
    const report = evaluateRenderCritics({ ...passingMetrics, sectionCount: 1 })
    expect(report.passed).toBe(false)
    expect(report.violations.some((v) => v.code === 'INSUFFICIENT_SECTION_COUNT')).toBe(true)
  })

  it('rejects section area coverage outside 25-95%', () => {
    expect(evaluateRenderCritics({ ...passingMetrics, sectionAreaCoveragePct: 10 }).violations.some((v) => v.code === 'SECTION_AREA_OUT_OF_RANGE')).toBe(true)
    expect(evaluateRenderCritics({ ...passingMetrics, sectionAreaCoveragePct: 99 }).violations.some((v) => v.code === 'SECTION_AREA_OUT_OF_RANGE')).toBe(true)
  })

  it('rejects vertical occupancy below 45%', () => {
    const report = evaluateRenderCritics({ ...passingMetrics, verticalOccupancyPct: 20 })
    expect(report.violations.some((v) => v.code === 'LOW_VERTICAL_OCCUPANCY')).toBe(true)
  })

  it('rejects node density outside 1-15 per 100k px', () => {
    expect(evaluateRenderCritics({ ...passingMetrics, nodeDensityPer100kPx: 0.2 }).violations.some((v) => v.code === 'NODE_DENSITY_OUT_OF_RANGE')).toBe(true)
    expect(evaluateRenderCritics({ ...passingMetrics, nodeDensityPer100kPx: 40 }).violations.some((v) => v.code === 'NODE_DENSITY_OUT_OF_RANGE')).toBe(true)
  })

  it('rejects flat section height variance when there are 2+ sections', () => {
    const report = evaluateRenderCritics({ ...passingMetrics, sectionHeightVariancePct: 1 })
    expect(report.violations.some((v) => v.code === 'FLAT_SECTION_HEIGHT_VARIANCE')).toBe(true)
  })

  it('does not require height variance when there is only one section (still fails the section-count gate separately)', () => {
    const report = evaluateRenderCritics({ ...passingMetrics, sectionCount: 1, sectionHeightVariancePct: 0 })
    expect(report.violations.some((v) => v.code === 'FLAT_SECTION_HEIGHT_VARIANCE')).toBe(false)
  })

  it('fails closed on non-finite or negative metric values instead of coercing them', () => {
    const report = evaluateRenderCritics({ ...passingMetrics, verticalOccupancyPct: Number.NaN })
    expect(report.passed).toBe(false)
    expect(report.violations).toEqual([{ code: 'INVALID_METRIC_VALUE', message: expect.stringContaining('verticalOccupancyPct') }])
  })

  it('fails closed on Infinity and negative values without evaluating other thresholds', () => {
    const report = evaluateRenderCritics({ ...passingMetrics, nodeDensityPer100kPx: Number.POSITIVE_INFINITY, sectionCount: -1 })
    expect(report.passed).toBe(false)
    expect(report.violations.every((v) => v.code === 'INVALID_METRIC_VALUE')).toBe(true)
  })

  it('reports the screenJobId back on both pass and fail', () => {
    expect(evaluateRenderCritics(passingMetrics).screenJobId).toBe('weekly-schedule')
    expect(evaluateRenderCritics({ ...passingMetrics, sectionCount: 1 }).screenJobId).toBe('weekly-schedule')
  })
})
