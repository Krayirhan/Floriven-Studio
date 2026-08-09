import { describe, expect, it } from "vitest";
import { evaluateCriticGate } from "./critic-gate";

const passing = { visualHierarchy: 8, taskClarity: 8, informationDensity: 7.5, spacingRhythm: 8, typography: 8, surfaceUsage: 7, patternSuitability: 8, navigation: 8, screenDifferentiation: 7.5, crossScreenConsistency: 8 };
describe("critic gate", () => {
  it("passes the V2 critic thresholds", () => expect(evaluateCriticGate(passing).passed).toBe(true));
  it("reports the exact hard gate that fails", () => expect(evaluateCriticGate({ ...passing, navigation: 5 }).failures).toContain("NAVIGATION_GATE"));
});
