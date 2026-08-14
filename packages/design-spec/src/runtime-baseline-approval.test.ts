import { describe, expect, it } from 'vitest'
import { requiresRuntimeBaselineApproval, validateRuntimeBaselineApproval } from './runtime-baseline-approval'

describe('runtime baseline approval contract', () => {
  const hash = 'a'.repeat(64)
  it('requires hash-bound reviewer evidence for baseline changes', () => {
    expect(requiresRuntimeBaselineApproval(['docs/certification/baselines/runtime-replay-manifest.json'])).toBe(true)
    expect(validateRuntimeBaselineApproval({ baselineSha256: hash, approvedBy: 'release-owner', approvedAt: '2026-08-14T00:00:00.000Z', reviewReference: 'PR-123' }, hash)).toEqual([])
  })
  it('rejects stale or anonymous approval', () => {
    expect(validateRuntimeBaselineApproval({ baselineSha256: 'b'.repeat(64), approvedBy: '', approvedAt: 'invalid', reviewReference: '' }, hash)).toEqual(expect.arrayContaining(['RUNTIME_BASELINE_APPROVAL_HASH_MISMATCH', 'RUNTIME_BASELINE_APPROVER_MISSING', 'RUNTIME_BASELINE_REVIEW_REFERENCE_MISSING', 'RUNTIME_BASELINE_APPROVAL_DATE_INVALID']))
  })
})
