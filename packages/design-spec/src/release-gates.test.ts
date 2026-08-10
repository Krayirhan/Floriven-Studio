import { describe, expect, it } from "vitest";
import { evaluateReleaseCandidate } from "./release-gates";

describe("RC release gates", () => {
  const ready = { visualFixtureCount: 84, adversarialCaseCount: 12, accessibilityPassed: true, securityPassed: true, performancePassed: true, certificationPassed: true, rollbackRehearsed: true, monitoringActive: true, p0Count: 0, p1Count: 0 };
  it("produces server-side FINAL_ELIGIBLE only when every gate passes", () => {
    expect(evaluateReleaseCandidate(ready)).toMatchObject({ passed: true, finalEligible: true, status: "RC_READY" });
  });
  it("blocks RC on incomplete evidence or severity findings", () => {
    const report = evaluateReleaseCandidate({ ...ready, visualFixtureCount: 83, p1Count: 1, monitoringActive: false });
    expect(report.finalEligible).toBe(false);
    expect(report.failures).toEqual(expect.arrayContaining(["VISUAL_FIXTURE_COUNT_GATE", "P1_GATE", "MONITORING_GATE"]));
  });
});
