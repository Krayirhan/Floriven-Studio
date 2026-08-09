import { describe, expect, it } from "vitest";
import { evaluateProductionGates, GOLDEN_SCREENS, validateProductionMetrics } from "./production-gates";

describe("production gates", () => {
  const pass = { schema: true, accessibility: true, structural: true, geometry: true, semantic: true, visual: true, crossScreen: true };
  it("permits final output only when every quality gate passes", () => expect(evaluateProductionGates(pass).finalEligible).toBe(true));
  it("surfaces a failed quality gate", () => expect(evaluateProductionGates({ ...pass, geometry: false }).failedGates).toEqual(["geometry"]));
  it("defines every required golden screen archetype", () => expect(GOLDEN_SCREENS).toHaveLength(6));
  it("enforces the V2 benchmark release thresholds", () => {
    expect(validateProductionMetrics({ nestedCardCount: 0, invalidFabCount: 0, emptyInteractiveSurfaceCount: 0, focusedFlowBottomNavViolation: 0, overflowCount: 0, overlapCount: 0, visualScore: 8, taskClarity: 8, patternSuitability: 8 })).toEqual([]);
    expect(validateProductionMetrics({ nestedCardCount: 1, invalidFabCount: 0, emptyInteractiveSurfaceCount: 0, focusedFlowBottomNavViolation: 0, overflowCount: 0, overlapCount: 0, visualScore: 7, taskClarity: 7, patternSuitability: 7 })).toEqual(expect.arrayContaining(["NESTED_CARD_GATE", "VISUAL_SCORE_GATE", "TASK_CLARITY_GATE", "PATTERN_SUITABILITY_GATE"]));
  });
});
