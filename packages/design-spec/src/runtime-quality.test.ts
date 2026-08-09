import { describe, expect, it } from "vitest";
import { evaluateCriticGate } from "./critic-gate";
import { evaluateFinalEligibility, evaluateRuntimeQuality } from "./runtime-quality";

const criticPass = evaluateCriticGate({
  visualHierarchy: 8, taskClarity: 8, informationDensity: 8, spacingRhythm: 8,
  typography: 8, surfaceUsage: 8, patternSuitability: 8, navigation: 8,
  screenDifferentiation: 8, crossScreenConsistency: 8,
});

describe("runtime quality evidence", () => {
  it("does not mark output final until renderer and both critic inputs exist", () => {
    const result = evaluateRuntimeQuality({ geometryIssues: [] });
    expect(result.finalEligible).toBe(false);
    expect(result.pendingGates).toEqual(["visual", "crossScreen"]);
  });

  it("requires clean geometry and passing critic reports", () => {
    const result = evaluateRuntimeQuality({
      geometryIssues: ["HORIZONTAL_OVERFLOW"],
      visualCritic: criticPass,
      crossScreenCritic: criticPass,
    });
    expect(result.finalEligible).toBe(false);
    expect(result.gates.geometry).toBe(false);
  });

  it("marks a fully evidenced output final-eligible", () => {
    expect(evaluateRuntimeQuality({
      geometryIssues: [], visualCritic: criticPass, crossScreenCritic: criticPass,
    }).finalEligible).toBe(true);
  });

  it("never lets a critical static failure pass through excellent runtime evidence", () => {
    const result = evaluateFinalEligibility(false, { geometryIssues: [], visualCritic: criticPass, crossScreenCritic: criticPass });
    expect(result.finalEligible).toBe(false);
    expect(result.gates.geometry).toBe(true);
  });

  it.each([
    ["missing runtime evidence", { geometryIssues: [] }],
    ["critical geometry", { geometryIssues: ["COMPONENT_OVERLAP" as const], visualCritic: criticPass, crossScreenCritic: criticPass }],
    ["failed visual critic", { geometryIssues: [], visualCritic: { ...criticPass, passed: false }, crossScreenCritic: criticPass }],
    ["failed cross-screen critic", { geometryIssues: [], visualCritic: criticPass, crossScreenCritic: { ...criticPass, passed: false } }],
  ])("keeps FINAL impossible for %s", (_name, evidence) => {
    expect(evaluateFinalEligibility(true, evidence).finalEligible).toBe(false);
  });
});
