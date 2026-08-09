export type GateName = "schema" | "accessibility" | "structural" | "geometry" | "semantic" | "visual" | "crossScreen";
export type ProductionGateReport = { passed: boolean; failedGates: GateName[]; finalEligible: boolean };
export type GoldenScreenId = "golden-settings" | "golden-dense-list" | "golden-form" | "golden-detail" | "golden-dashboard" | "golden-analytics";

export const GOLDEN_SCREENS: readonly GoldenScreenId[] = ["golden-settings", "golden-dense-list", "golden-form", "golden-detail", "golden-dashboard", "golden-analytics"];

export type ProductionMetrics = {
  nestedCardCount: number;
  invalidFabCount: number;
  emptyInteractiveSurfaceCount: number;
  focusedFlowBottomNavViolation: number;
  overflowCount: number;
  overlapCount: number;
  visualScore: number;
  taskClarity: number;
  patternSuitability: number;
};

export function evaluateProductionGates(gates: Record<GateName, boolean>): ProductionGateReport {
  const failedGates = (Object.keys(gates) as GateName[]).filter((gate) => !gates[gate]);
  return { passed: failedGates.length === 0, failedGates, finalEligible: failedGates.length === 0 };
}

export function validateProductionMetrics(metrics: ProductionMetrics): string[] {
  const failures: string[] = [];
  if (metrics.nestedCardCount !== 0) failures.push("NESTED_CARD_GATE");
  if (metrics.invalidFabCount !== 0) failures.push("INVALID_FAB_GATE");
  if (metrics.emptyInteractiveSurfaceCount !== 0) failures.push("EMPTY_SURFACE_GATE");
  if (metrics.focusedFlowBottomNavViolation !== 0) failures.push("FOCUSED_NAV_GATE");
  if (metrics.overflowCount !== 0) failures.push("OVERFLOW_GATE");
  if (metrics.overlapCount !== 0) failures.push("OVERLAP_GATE");
  if (metrics.visualScore < 7.8) failures.push("VISUAL_SCORE_GATE");
  if (metrics.taskClarity < 8) failures.push("TASK_CLARITY_GATE");
  if (metrics.patternSuitability < 8) failures.push("PATTERN_SUITABILITY_GATE");
  return failures;
}
