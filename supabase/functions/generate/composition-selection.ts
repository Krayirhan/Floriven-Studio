export type CompositionMode = 'ai_enhanced' | 'deterministic_baseline'

export type PublicCompositionMode = 'ai_enhanced' | 'deterministic_fallback'

export type CompositionOutcome = {
  selectedCompositionMode: CompositionMode
  compositionMode: PublicCompositionMode
  degraded: boolean
  fallbackReason?: string
}

/** A quality-rejected AI composition can never become the persisted candidate. */
export function selectCompositionMode(options: {
  hasBaseline: boolean
  enhancedPassed: boolean
}): CompositionMode {
  return options.hasBaseline && !options.enhancedPassed
    ? 'deterministic_baseline'
    : 'ai_enhanced'
}

/** Stable provenance exposed to clients; provider fallback always wins. */
export function resolveCompositionOutcome(options: {
  hasBaseline: boolean
  enhancedPassed: boolean
  providerFallbackReason?: string
}): CompositionOutcome {
  const selectedCompositionMode = selectCompositionMode(options)
  const fallbackReason = options.providerFallbackReason
    ?? (selectedCompositionMode === 'deterministic_baseline' ? 'AI_STATIC_QUALITY_REJECTED' : undefined)
  const degraded = fallbackReason !== undefined
  return {
    selectedCompositionMode,
    compositionMode: degraded ? 'deterministic_fallback' : 'ai_enhanced',
    degraded,
    ...(fallbackReason ? { fallbackReason } : {}),
  }
}
