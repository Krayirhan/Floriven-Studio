import { sha256Hex, stableStringify } from './crypto-utils.ts'
import { type DesignSpecScreen } from './design-spec-compiler.ts'
import { type RenderCriticsReport } from './render-critics.ts'
import { type V3PlanningOutput } from './planning-pipeline.ts'

export const ACCEPTED_DESIGN_SPEC_SCHEMA_VERSION = '1.0.0' as const

export type Platform = 'ios' | 'android' | 'web'
export type RenderEvidenceStatus = 'NOT_VERIFIED' | 'BLOCKED' | 'VERIFIED'

export type AcceptedDesignSpecInput = {
  projectId: string
  platform: Platform
  locale: string
  deviceProfile: string
  /** Caller-supplied ISO-8601 instant — kept out of this module so acceptance stays a pure, testable function. */
  acceptedAt: string
  /**
   * Real runtime capture scores, one per screen, when a live render pass has actually run.
   * Omit when no capture happened yet — acceptance still proceeds but is stamped NOT_VERIFIED,
   * never silently upgraded to VERIFIED. A present-but-failing report BLOCKS acceptance outright.
   */
  renderCritics?: RenderCriticsReport[]
}

export type NavigationFlow = { id: string; fromScreenId: string; toScreenId: string }

export type AcceptedDesignSpec = {
  schemaVersion: typeof ACCEPTED_DESIGN_SPEC_SCHEMA_VERSION
  projectId: string
  platform: Platform
  locale: string
  deviceProfile: string
  tokens: Record<string, never>
  assets: never[]
  screens: DesignSpecScreen[]
  flows: NavigationFlow[]
  metadata: {
    acceptedAt: string
    contentHash: string
    revision: number
    screenJobIds: string[]
    repairedScreenJobIds: string[]
    renderEvidence: RenderEvidenceStatus
    releaseEligible: boolean
  }
}

export class DesignSpecAcceptanceError extends Error {
  constructor(public readonly issues: string[]) {
    super('Generation V3 DesignSpec acceptance failed')
    this.name = 'DesignSpecAcceptanceError'
  }
}

/**
 * Final gate of the ADR-0009 pipeline: assembles the canonical top-level DesignSpec document
 * (docs/02-architecture/DESIGN_SPEC.md#3) from an already-validated planning run, and stamps an
 * immutable content signature. Re-verifies the pipeline's own pass/fail guarantees one more time
 * (defense in depth, same posture as static critics) — never accepts a document whose screens
 * didn't actually pass their gates, regardless of what the caller claims.
 */
export async function acceptDesignSpec(planning: V3PlanningOutput, input: AcceptedDesignSpecInput): Promise<AcceptedDesignSpec> {
  const issues: string[] = []
  if (!input.projectId.trim()) issues.push('acceptance: projectId is required')
  if (!input.locale.trim()) issues.push('acceptance: locale is required')
  if (!input.deviceProfile.trim()) issues.push('acceptance: deviceProfile is required')
  if (planning.designSpecScreens.length === 0) issues.push('acceptance: no screens to accept')
  if (planning.designSpecScreens.length !== planning.screenJobs.jobs.length) issues.push('acceptance: screen count does not match screen job count')
  if (!planning.productStaticCritics.passed) issues.push('acceptance: product-level static critics did not pass')
  for (const critic of planning.staticCritics) if (!critic.passed) issues.push(`acceptance: screen ${critic.screenJobId} static critics did not pass`)
  if (issues.length) throw new DesignSpecAcceptanceError(issues)

  const jobs = planning.screenJobs.jobs
  const screenIdByJobId = new Map(jobs.map((job, index) => [job.id, planning.designSpecScreens[index]?.id]))
  const flows: NavigationFlow[] = []
  for (const job of jobs) {
    const fromScreenId = screenIdByJobId.get(job.id)
    if (!fromScreenId) { issues.push(`acceptance: no compiled screen for ${job.id}`); continue }
    for (const destinationJobId of job.destinationJobIds) {
      const toScreenId = screenIdByJobId.get(destinationJobId)
      if (!toScreenId) { issues.push(`acceptance: navigation target ${destinationJobId} has no compiled screen`); continue }
      flows.push({ id: `flow_${slug(job.id)}_${slug(destinationJobId)}`, fromScreenId, toScreenId })
    }
  }
  if (issues.length) throw new DesignSpecAcceptanceError(issues)

  const renderEvidence = evaluateRenderEvidence(jobs.map((job) => job.id), input.renderCritics, issues)
  if (issues.length) throw new DesignSpecAcceptanceError(issues)

  const contentHash = await computeContentHash(planning.designSpecScreens)

  return {
    schemaVersion: ACCEPTED_DESIGN_SPEC_SCHEMA_VERSION,
    projectId: input.projectId, platform: input.platform, locale: input.locale, deviceProfile: input.deviceProfile,
    tokens: {}, assets: [],
    screens: planning.designSpecScreens,
    flows,
    metadata: {
      acceptedAt: input.acceptedAt,
      contentHash,
      revision: 1,
      screenJobIds: jobs.map((job) => job.id),
      repairedScreenJobIds: planning.repairs.filter((repair) => repair.operations.length > 0).map((repair) => repair.screenJobId),
      renderEvidence,
      releaseEligible: renderEvidence === 'VERIFIED',
    },
  }
}

function evaluateRenderEvidence(screenJobIds: string[], renderCritics: RenderCriticsReport[] | undefined, issues: string[]): RenderEvidenceStatus {
  if (!renderCritics) return 'NOT_VERIFIED'
  const byJobId = new Map(renderCritics.map((report) => [report.screenJobId, report]))
  for (const jobId of screenJobIds) {
    const report = byJobId.get(jobId)
    if (!report) { issues.push(`acceptance: no render capture evidence for ${jobId}`); continue }
    if (!report.passed) issues.push(`acceptance: render critics failed for ${jobId} (${report.violations.map((v) => v.code).join(', ')})`)
  }
  for (const jobId of byJobId.keys()) if (!screenJobIds.includes(jobId)) issues.push(`acceptance: render capture evidence references unknown screen ${jobId}`)
  return issues.length ? 'BLOCKED' : 'VERIFIED'
}

function slug(value: string): string {
  const cleaned = value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '')
  return cleaned || 'x'
}

function computeContentHash(screens: DesignSpecScreen[]): Promise<string> {
  return sha256Hex(stableStringify(screens))
}
