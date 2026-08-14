export type ReleaseCandidateInput = {
  visualFixtureCount: number;
  adversarialCaseCount: number;
  accessibilityPassed: boolean;
  securityPassed: boolean;
  performancePassed: boolean;
  certificationPassed: boolean;
  rollbackRehearsed: boolean;
  monitoringActive: boolean;
  p0Count: number;
  p1Count: number;
};
export type ReleaseCandidateReport = { passed: boolean; failures: string[]; finalEligible: boolean; status: "RC_READY" | "BLOCKED" };

/** Server-side release decision; callers cannot override finalEligible. */
export function evaluateReleaseCandidate(input: ReleaseCandidateInput): ReleaseCandidateReport {
  const failures: string[] = [];
  if (input.visualFixtureCount !== 84) failures.push("VISUAL_FIXTURE_COUNT_GATE");
  if (input.adversarialCaseCount === 0) failures.push("ADVERSARIAL_MATRIX_GATE");
  if (!input.accessibilityPassed) failures.push("ACCESSIBILITY_GATE");
  if (!input.securityPassed) failures.push("SECURITY_GATE");
  if (!input.performancePassed) failures.push("PERFORMANCE_GATE");
  if (!input.certificationPassed) failures.push("CERTIFICATION_GATE");
  if (!input.rollbackRehearsed) failures.push("ROLLBACK_REHEARSAL_GATE");
  if (!input.monitoringActive) failures.push("MONITORING_GATE");
  if (input.p0Count > 0) failures.push("P0_GATE");
  if (input.p1Count > 0) failures.push("P1_GATE");
  return { passed: failures.length === 0, failures, finalEligible: failures.length === 0, status: failures.length === 0 ? "RC_READY" : "BLOCKED" };
}
