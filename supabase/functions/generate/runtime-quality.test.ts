import { describe, expect, it } from "vitest";
import { evaluateRuntimeQuality, isRuntimeQualityEvidence } from "./runtime-quality";

const critic = {
  visualHierarchy: 8, taskClarity: 8, informationDensity: 8, spacingRhythm: 8,
  typography: 8, surfaceUsage: 8, patternSuitability: 8, navigation: 8,
  screenDifferentiation: 8, crossScreenConsistency: 8,
};
const layoutIdentity = { passed: true, pairCount: 1, collisionCount: 0, maxSimilarity: 0.7, differentiation: 1, issues: [] };
const visualHierarchy = { profileVersion: '1.0.0', profileHash: 'a'.repeat(64), passed: true, screenCount: 6, failingScreenCount: 0, averageScore: 1, minimumScore: 1, issues: [] };

describe("runtime quality evidence", () => {
  it("rejects malformed or unbounded renderer evidence", () => {
    expect(isRuntimeQualityEvidence({ geometryIssues: ["UNKNOWN"] })).toBe(false);
    expect(isRuntimeQualityEvidence({ geometryIssues: [], visualCritic: { taskClarity: 99 } })).toBe(false);
  });

  it("requires all renderer and critic gates before final eligibility", () => {
    expect(evaluateRuntimeQuality({ geometryIssues: [] }).finalEligible).toBe(false);
    expect(evaluateRuntimeQuality({ geometryIssues: ["COMPONENT_OVERLAP"], visualCritic: critic, crossScreenCritic: critic, layoutIdentity, visualHierarchy }).finalEligible).toBe(false);
    expect(evaluateRuntimeQuality({ geometryIssues: [], visualCritic: critic, crossScreenCritic: critic }).pendingGates).toContain('layoutIdentity');
    expect(evaluateRuntimeQuality({ geometryIssues: [], visualCritic: critic, crossScreenCritic: critic, layoutIdentity }).pendingGates).toContain('visualHierarchy');
    expect(evaluateRuntimeQuality({ geometryIssues: [], visualCritic: critic, crossScreenCritic: critic, layoutIdentity, visualHierarchy }).finalEligible).toBe(true);
    expect(evaluateRuntimeQuality({ geometryIssues: [], visualCritic: critic, crossScreenCritic: critic, layoutIdentity: { ...layoutIdentity, passed: false, collisionCount: 1 }, visualHierarchy }).finalEligible).toBe(false);
    expect(evaluateRuntimeQuality({ geometryIssues: [], visualCritic: critic, crossScreenCritic: critic, layoutIdentity, visualHierarchy: { ...visualHierarchy, passed: false, failingScreenCount: 1 } }).finalEligible).toBe(false);
  });
});
