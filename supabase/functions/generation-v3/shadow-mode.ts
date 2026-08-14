/**
 * Generation V3 Shadow Mode Comparator.
 * Runs V3 in parallel with V2 to observe task success, latency, repetition and placeholder metrics without affecting the live user response.
 */

export type GenerationMetrics = {
  success: boolean
  latencyMs: number
  screenCount: number
  placeholderCount: number
  duplicateRatePct: number
  verifiedScreenCount: number
}

export type ShadowComparisonResult = {
  briefId: string
  v2Metrics: GenerationMetrics
  v3Metrics: GenerationMetrics
  comparison: {
    taskSuccessNonDegraded: boolean
    placeholderReductionPct: number
    duplicateReductionPct: number
    latencyDeltaMs: number
  }
}

/**
 * Computes comparative metrics between V2 and V3 generation runs on the same brief.
 */
export function evaluateShadowComparison(
  briefId: string,
  v2: GenerationMetrics,
  v3: GenerationMetrics,
): ShadowComparisonResult {
  const taskSuccessNonDegraded = v3.success || (!v2.success && !v3.success)

  const placeholderReductionPct = v2.placeholderCount > 0
    ? Math.round(((v2.placeholderCount - v3.placeholderCount) / v2.placeholderCount) * 100)
    : (v3.placeholderCount === 0 ? 100 : 0)

  const duplicateReductionPct = v2.duplicateRatePct > 0
    ? Math.round(((v2.duplicateRatePct - v3.duplicateRatePct) / v2.duplicateRatePct) * 100)
    : (v3.duplicateRatePct === 0 ? 100 : 0)

  const latencyDeltaMs = v3.latencyMs - v2.latencyMs

  return {
    briefId,
    v2Metrics: v2,
    v3Metrics: v3,
    comparison: {
      taskSuccessNonDegraded,
      placeholderReductionPct,
      duplicateReductionPct,
      latencyDeltaMs,
    },
  }
}
