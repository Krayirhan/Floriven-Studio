export type CompositionMode = 'ai_enhanced' | 'deterministic_baseline'

/** A quality-rejected AI composition can never become the persisted candidate. */
export function selectCompositionMode(options: {
  hasBaseline: boolean
  enhancedPassed: boolean
}): CompositionMode {
  return options.hasBaseline && !options.enhancedPassed
    ? 'deterministic_baseline'
    : 'ai_enhanced'
}
