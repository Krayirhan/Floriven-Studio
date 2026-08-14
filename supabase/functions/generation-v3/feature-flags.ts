/**
 * Generation V3 Feature Flags & Emergency Kill Switch.
 * Provides deterministic percentage rollouts and immediate safe fallback to V2.
 */

export type GenerationFeatureFlags = {
  /** When true, forces 100% of traffic to V2 regardless of rollout percentage. */
  v3KillSwitchEnabled: boolean
  /** Percentage of traffic routed to V3 (0-100). */
  v3RolloutPercentage: number
  /** Explicitly whitelisted tenant IDs always routed to V3 (unless kill switch is enabled). */
  allowedTenantIds?: string[]
}

export const DEFAULT_FEATURE_FLAGS: GenerationFeatureFlags = {
  v3KillSwitchEnabled: false,
  v3RolloutPercentage: 0,
  allowedTenantIds: [],
}

/** Simple 32-bit FNV-1a hash for deterministic bucket allocation across string inputs. */
function fnv1a(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) % 100
}

/**
 * Resolves which generation engine to use ('v2' or 'v3') for a given tenant & user.
 * 1. If kill switch is enabled -> returns 'v2'.
 * 2. If tenantId is in allowedTenantIds -> returns 'v3'.
 * 3. Deterministically hashes `${tenantId}:${userId}` into a 0-99 bucket and compares against rolloutPercentage.
 */
export function resolveGenerationEngine(
  tenantId: string,
  userId: string,
  flags: GenerationFeatureFlags = DEFAULT_FEATURE_FLAGS,
): 'v2' | 'v3' {
  if (flags.v3KillSwitchEnabled) {
    return 'v2'
  }

  if (flags.allowedTenantIds && flags.allowedTenantIds.includes(tenantId)) {
    return 'v3'
  }

  const clampedPercentage = Math.max(0, Math.min(100, flags.v3RolloutPercentage))
  if (clampedPercentage <= 0) return 'v2'
  if (clampedPercentage >= 100) return 'v3'

  const bucket = fnv1a(`${tenantId}:${userId}`)
  return bucket < clampedPercentage ? 'v3' : 'v2'
}
