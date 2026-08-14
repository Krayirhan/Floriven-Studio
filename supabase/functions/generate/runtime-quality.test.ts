import { describe, expect, it } from "vitest";
import { evaluateRuntimeQuality, isRuntimeQualityEvidence } from "./runtime-quality";

const critic = {
  visualHierarchy: 8, taskClarity: 8, informationDensity: 8, spacingRhythm: 8,
  typography: 8, surfaceUsage: 8, patternSuitability: 8, navigation: 8,
  screenDifferentiation: 8, crossScreenConsistency: 8,
};

describe("runtime quality evidence", () => {
  it("rejects malformed or unbounded renderer evidence", () => {
    expect(isRuntimeQualityEvidence({ geometryIssues: ["UNKNOWN"] })).toBe(false);
    expect(isRuntimeQualityEvidence({ geometryIssues: [], visualCritic: { taskClarity: 99 } })).toBe(false);
  });

  it("requires all renderer and critic gates before final eligibility", () => {
    expect(evaluateRuntimeQuality({ geometryIssues: [] }).finalEligible).toBe(false);
    expect(evaluateRuntimeQuality({ geometryIssues: ["COMPONENT_OVERLAP"], visualCritic: critic, crossScreenCritic: critic }).finalEligible).toBe(false);
    expect(evaluateRuntimeQuality({ geometryIssues: [], visualCritic: critic, crossScreenCritic: critic }).finalEligible).toBe(true);
  });
});
