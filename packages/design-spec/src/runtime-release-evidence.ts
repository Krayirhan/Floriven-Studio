export type RuntimeReleaseEvidenceInput = {
  captureEnvironmentReady: boolean | null
  baselineManifestValid: boolean | null
  baselineApprovalValid: boolean | null
  replayPassed: boolean | null
  runtimeFinalEligible: boolean | null
}

export type RuntimeReleaseEvidenceStatus = 'VERIFIED' | 'NOT_VERIFIED' | 'BLOCKED'

export function evaluateRuntimeReleaseEvidence(input: RuntimeReleaseEvidenceInput) {
  const entries = Object.entries(input) as Array<[keyof RuntimeReleaseEvidenceInput, boolean | null]>
  const failedChecks = entries.filter(([, value]) => value === false).map(([key]) => key)
  const pendingChecks = entries.filter(([, value]) => value === null).map(([key]) => key)
  const status: RuntimeReleaseEvidenceStatus = failedChecks.length ? 'BLOCKED' : pendingChecks.length ? 'NOT_VERIFIED' : 'VERIFIED'
  return { status, releaseEligible: status === 'VERIFIED', failedChecks, pendingChecks }
}
