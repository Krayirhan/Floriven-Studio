export const GEOMETRY_ISSUES = [
  "INVALID_DIMENSION",
  "HORIZONTAL_OVERFLOW",
  "VERTICAL_OVERFLOW",
  "COMPONENT_OVERLAP",
  "SAFE_AREA_COLLISION",
] as const;

export type GeometryIssue = typeof GEOMETRY_ISSUES[number];
export type CriticScores = {
  visualHierarchy: number;
  taskClarity: number;
  informationDensity: number;
  spacingRhythm: number;
  typography: number;
  surfaceUsage: number;
  patternSuitability: number;
  navigation: number;
  screenDifferentiation: number;
  crossScreenConsistency: number;
};
export type RuntimeQualityEvidence = {
  geometryIssues: GeometryIssue[];
  visualCritic?: CriticScores;
  crossScreenCritic?: CriticScores;
};

export function isRuntimeQualityEvidence(value: unknown): value is RuntimeQualityEvidence {
  if (!isRecord(value) || !Array.isArray(value.geometryIssues) || !value.geometryIssues.every(isGeometryIssue)) return false;
  return (value.visualCritic === undefined || isCriticScores(value.visualCritic))
    && (value.crossScreenCritic === undefined || isCriticScores(value.crossScreenCritic));
}

export function evaluateRuntimeQuality(evidence: RuntimeQualityEvidence) {
  const visualReady = evidence.visualCritic !== undefined;
  const crossScreenReady = evidence.crossScreenCritic !== undefined;
  const gates = {
    geometry: evidence.geometryIssues.length === 0,
    visual: visualReady && passesCriticGate(evidence.visualCritic),
    crossScreen: crossScreenReady && passesCriticGate(evidence.crossScreenCritic),
  };
  const pendingGates = [
    ...(visualReady ? [] : ["visual"]),
    ...(crossScreenReady ? [] : ["crossScreen"]),
  ];
  return {
    gates,
    pendingGates,
    finalEligible: pendingGates.length === 0 && Object.values(gates).every(Boolean),
  };
}

function passesCriticGate(scores: CriticScores | undefined) {
  if (!scores) return false;
  const values = Object.values(scores);
  return scores.taskClarity >= 7
    && scores.navigation >= 7
    && scores.surfaceUsage >= 6
    && scores.patternSuitability >= 7
    && values.reduce((total, score) => total + score, 0) / values.length >= 7.5;
}

function isGeometryIssue(value: unknown): value is GeometryIssue {
  return typeof value === "string" && GEOMETRY_ISSUES.includes(value as GeometryIssue);
}

function isCriticScores(value: unknown): value is CriticScores {
  if (!isRecord(value)) return false;
  const keys: (keyof CriticScores)[] = ["visualHierarchy", "taskClarity", "informationDensity", "spacingRhythm", "typography", "surfaceUsage", "patternSuitability", "navigation", "screenDifferentiation", "crossScreenConsistency"];
  return keys.every((key) => typeof value[key] === "number" && Number.isFinite(value[key]) && value[key] >= 0 && value[key] <= 10);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
