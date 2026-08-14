export const RENDER_CRITICS_VERSION = '1.0.0' as const

/** Canonical capture viewport (docs/02-architecture/DESIGN_SPEC.md — "Canonical 390×844 capture"). */
export const CANONICAL_VIEWPORT = { width: 390, height: 844 } as const

/**
 * Numeric geometry facts a runtime capture step (real browser + screenshot) must produce.
 * This module never captures a screenshot itself — Canvas renderer/runtime integration is a
 * separate, not-yet-built stage. Render critics only score whatever metrics are handed to it,
 * so a caller can never fabricate a passing result without an actual capture behind these numbers.
 */
export type RuntimeCaptureMetrics = {
  screenJobId: string
  viewport: { width: number; height: number }
  visibleNodeCount: number
  sectionCount: number
  sectionAreaCoveragePct: number
  verticalOccupancyPct: number
  nodeDensityPer100kPx: number
  sectionHeightVariancePct: number
}

export type RenderViolationCode =
  | 'INVALID_METRIC_VALUE' | 'NON_CANONICAL_VIEWPORT'
  | 'INSUFFICIENT_SECTION_COUNT' | 'SECTION_AREA_OUT_OF_RANGE' | 'LOW_VERTICAL_OCCUPANCY'
  | 'NODE_DENSITY_OUT_OF_RANGE' | 'FLAT_SECTION_HEIGHT_VARIANCE'

export type RenderViolation = { code: RenderViolationCode; message: string }
export type RenderCriticsReport = { version: typeof RENDER_CRITICS_VERSION; screenJobId: string; passed: boolean; violations: RenderViolation[] }

type NumericMetricField = 'visibleNodeCount' | 'sectionCount' | 'sectionAreaCoveragePct' | 'verticalOccupancyPct' | 'nodeDensityPer100kPx' | 'sectionHeightVariancePct'
const NUMERIC_FIELDS: NumericMetricField[] = [
  'visibleNodeCount', 'sectionCount', 'sectionAreaCoveragePct', 'verticalOccupancyPct', 'nodeDensityPer100kPx', 'sectionHeightVariancePct',
]

/**
 * Scores captured geometry against DESIGN_SPEC.md's documented visualHierarchy gate
 * (default/conservative thresholds — archetype-specific calibration is a later refinement).
 * Fail-closed: non-finite, negative or non-canonical-viewport evidence is rejected outright,
 * never silently coerced into a passing score.
 */
export function evaluateRenderCritics(metrics: RuntimeCaptureMetrics): RenderCriticsReport {
  const violations: RenderViolation[] = []

  for (const field of NUMERIC_FIELDS) {
    const value = metrics[field]
    if (!Number.isFinite(value) || value < 0) violations.push({ code: 'INVALID_METRIC_VALUE', message: `${field}: must be a finite, non-negative number (got ${String(value)})` })
  }
  if (violations.length > 0) return { version: RENDER_CRITICS_VERSION, screenJobId: metrics.screenJobId, passed: false, violations }

  if (metrics.viewport.width !== CANONICAL_VIEWPORT.width || metrics.viewport.height !== CANONICAL_VIEWPORT.height) {
    violations.push({ code: 'NON_CANONICAL_VIEWPORT', message: `viewport must be ${CANONICAL_VIEWPORT.width}x${CANONICAL_VIEWPORT.height}, got ${metrics.viewport.width}x${metrics.viewport.height}` })
  }
  if (metrics.sectionCount < 2) violations.push({ code: 'INSUFFICIENT_SECTION_COUNT', message: `sectionCount must be >= 2, got ${metrics.sectionCount}` })
  if (metrics.sectionAreaCoveragePct < 25 || metrics.sectionAreaCoveragePct > 95) {
    violations.push({ code: 'SECTION_AREA_OUT_OF_RANGE', message: `sectionAreaCoveragePct must be within 25-95, got ${metrics.sectionAreaCoveragePct}` })
  }
  if (metrics.verticalOccupancyPct < 45) violations.push({ code: 'LOW_VERTICAL_OCCUPANCY', message: `verticalOccupancyPct must be >= 45, got ${metrics.verticalOccupancyPct}` })
  if (metrics.nodeDensityPer100kPx < 1 || metrics.nodeDensityPer100kPx > 15) {
    violations.push({ code: 'NODE_DENSITY_OUT_OF_RANGE', message: `nodeDensityPer100kPx must be within 1-15, got ${metrics.nodeDensityPer100kPx}` })
  }
  if (metrics.sectionCount >= 2 && metrics.sectionHeightVariancePct < 5) {
    violations.push({ code: 'FLAT_SECTION_HEIGHT_VARIANCE', message: `sectionHeightVariancePct must be >= 5 when sectionCount >= 2, got ${metrics.sectionHeightVariancePct}` })
  }

  return { version: RENDER_CRITICS_VERSION, screenJobId: metrics.screenJobId, passed: violations.length === 0, violations }
}
