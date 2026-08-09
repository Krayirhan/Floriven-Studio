export type CriticScores = { visualHierarchy: number; taskClarity: number; informationDensity: number; spacingRhythm: number; typography: number; surfaceUsage: number; patternSuitability: number; navigation: number; screenDifferentiation: number; crossScreenConsistency: number };
export type CriticReport = { scores: CriticScores; overall: number; passed: boolean; failures: string[] };

/** Applies V2 thresholds to externally supplied (vision or human) scores without invoking a model. */
export function evaluateCriticGate(scores: CriticScores): CriticReport {
  const failures: string[] = [];
  if (scores.taskClarity < 7) failures.push("TASK_CLARITY_GATE");
  if (scores.navigation < 7) failures.push("NAVIGATION_GATE");
  if (scores.surfaceUsage < 6) failures.push("SURFACE_USAGE_GATE");
  if (scores.patternSuitability < 7) failures.push("PATTERN_SUITABILITY_GATE");
  const overall = Object.values(scores).reduce((total, score) => total + score, 0) / Object.values(scores).length;
  if (overall < 7.5) failures.push("OVERALL_CRITIC_GATE");
  return { scores, overall, passed: failures.length === 0, failures };
}
