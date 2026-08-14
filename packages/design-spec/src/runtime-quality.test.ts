import { describe, expect, it } from "vitest";
import { evaluateCriticGate } from "./critic-gate";
import { evaluateFinalEligibility, evaluateRuntimeQuality } from "./runtime-quality";

const criticPass = evaluateCriticGate({
  visualHierarchy: 8, taskClarity: 8, informationDensity: 8, spacingRhythm: 8,
  typography: 8, surfaceUsage: 8, patternSuitability: 8, navigation: 8,
  screenDifferentiation: 8, crossScreenConsistency: 8,
});
const layoutPass = { passed: true, pairCount: 1, collisionCount: 0, maxSimilarity: 0.7, differentiation: 1, issues: [] };
const hierarchyPass = { profileVersion: "1.0.0", profileHash: "a".repeat(64), passed: true, screenCount: 6, failingScreenCount: 0, averageScore: 1, minimumScore: 1, issues: [] };

describe("runtime quality evidence", () => {
  it("does not mark output final until renderer and both critic inputs exist", () => {
    const result = evaluateRuntimeQuality({ geometryIssues: [] });
    expect(result.finalEligible).toBe(false);
    expect(result.pendingGates).toEqual(["visual", "crossScreen", "layoutIdentity", "visualHierarchy"]);
  });

  it("requires clean geometry and passing critic reports", () => {
    const result = evaluateRuntimeQuality({
      geometryIssues: ["HORIZONTAL_OVERFLOW"],
      visualCritic: criticPass,
      crossScreenCritic: criticPass,
      layoutIdentity: layoutPass,
      visualHierarchy: hierarchyPass,
    });
    expect(result.finalEligible).toBe(false);
    expect(result.gates.geometry).toBe(false);
  });

  it("marks a fully evidenced output final-eligible", () => {
    expect(evaluateRuntimeQuality({
      geometryIssues: [], visualCritic: criticPass, crossScreenCritic: criticPass, layoutIdentity: layoutPass, visualHierarchy: hierarchyPass,
    }).finalEligible).toBe(true);
  });

  it("never lets a critical static failure pass through excellent runtime evidence", () => {
    const result = evaluateFinalEligibility(false, { geometryIssues: [], visualCritic: criticPass, crossScreenCritic: criticPass, layoutIdentity: layoutPass, visualHierarchy: hierarchyPass });
    expect(result.finalEligible).toBe(false);
    expect(result.gates.geometry).toBe(true);
  });

  it.each([
    ["missing runtime evidence", { geometryIssues: [] }],
    ["critical geometry", { geometryIssues: ["COMPONENT_OVERLAP" as const], visualCritic: criticPass, crossScreenCritic: criticPass, layoutIdentity: layoutPass, visualHierarchy: hierarchyPass }],
    ["failed visual critic", { geometryIssues: [], visualCritic: { ...criticPass, passed: false }, crossScreenCritic: criticPass, layoutIdentity: layoutPass, visualHierarchy: hierarchyPass }],
    ["failed cross-screen critic", { geometryIssues: [], visualCritic: criticPass, crossScreenCritic: { ...criticPass, passed: false }, layoutIdentity: layoutPass, visualHierarchy: hierarchyPass }],
    ["runtime layout clone", { geometryIssues: [], visualCritic: criticPass, crossScreenCritic: criticPass, layoutIdentity: { ...layoutPass, passed: false, collisionCount: 1, issues: ["RUNTIME_LAYOUT_IDENTITY_COLLISION:1"] }, visualHierarchy: hierarchyPass }],
    ["flat runtime hierarchy", { geometryIssues: [], visualCritic: criticPass, crossScreenCritic: criticPass, layoutIdentity: layoutPass, visualHierarchy: { ...hierarchyPass, passed: false, failingScreenCount: 1, issues: ["RUNTIME_SECTION_HIERARCHY_TOO_FLAT"] } }],
  ])("keeps FINAL impossible for %s", (_name, evidence) => {
    expect(evaluateFinalEligibility(true, evidence).finalEligible).toBe(false);
  });
});
