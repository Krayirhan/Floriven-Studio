export type RuntimeBaselineApproval = {
  baselineSha256: string
  approvedBy: string
  approvedAt: string
  reviewReference: string
}

export function validateRuntimeBaselineApproval(value: unknown, expectedSha256: string): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ['RUNTIME_BASELINE_APPROVAL_MISSING']
  const approval = value as Partial<RuntimeBaselineApproval>
  const issues: string[] = []
  if (!/^[a-f0-9]{64}$/i.test(approval.baselineSha256 ?? '') || approval.baselineSha256 !== expectedSha256) issues.push('RUNTIME_BASELINE_APPROVAL_HASH_MISMATCH')
  if (!approval.approvedBy?.trim()) issues.push('RUNTIME_BASELINE_APPROVER_MISSING')
  if (!approval.reviewReference?.trim()) issues.push('RUNTIME_BASELINE_REVIEW_REFERENCE_MISSING')
  if (!approval.approvedAt || Number.isNaN(Date.parse(approval.approvedAt))) issues.push('RUNTIME_BASELINE_APPROVAL_DATE_INVALID')
  return issues
}

export function requiresRuntimeBaselineApproval(changedPaths: readonly string[]): boolean {
  return changedPaths.some((file) => file.replaceAll('\\', '/').startsWith('docs/certification/baselines/'))
}
