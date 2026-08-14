import { describe, expect, it } from 'vitest'
import { evaluateRuntimeReleaseEvidence } from './runtime-release-evidence'

describe('runtime release evidence decision', () => {
  it('keeps missing live evidence explicitly not verified', () => {
    expect(evaluateRuntimeReleaseEvidence({ captureEnvironmentReady: null, baselineManifestValid: null, baselineApprovalValid: null, replayPassed: null, runtimeFinalEligible: null })).toEqual({ status: 'NOT_VERIFIED', releaseEligible: false, failedChecks: [], pendingChecks: ['captureEnvironmentReady', 'baselineManifestValid', 'baselineApprovalValid', 'replayPassed', 'runtimeFinalEligible'] })
  })
  it('does not turn unknown evidence into a pass', () => {
    expect(evaluateRuntimeReleaseEvidence({ captureEnvironmentReady: true, baselineManifestValid: true, baselineApprovalValid: true, replayPassed: null, runtimeFinalEligible: null })).toMatchObject({ status: 'NOT_VERIFIED', releaseEligible: false })
  })
  it('verifies only the complete successful chain', () => {
    expect(evaluateRuntimeReleaseEvidence({ captureEnvironmentReady: true, baselineManifestValid: true, baselineApprovalValid: true, replayPassed: true, runtimeFinalEligible: true })).toEqual({ status: 'VERIFIED', releaseEligible: true, failedChecks: [], pendingChecks: [] })
  })
  it('blocks an explicit live failure', () => {
    expect(evaluateRuntimeReleaseEvidence({ captureEnvironmentReady: true, baselineManifestValid: true, baselineApprovalValid: true, replayPassed: false, runtimeFinalEligible: false })).toMatchObject({ status: 'BLOCKED', releaseEligible: false, failedChecks: ['replayPassed', 'runtimeFinalEligible'] })
  })
})
