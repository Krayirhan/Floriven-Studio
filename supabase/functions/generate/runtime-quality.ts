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
  layoutIdentity?: { passed: boolean; pairCount: number; collisionCount: number; maxSimilarity: number; differentiation: number; issues: string[] };
  visualHierarchy?: { profileVersion: string; profileHash: string; passed: boolean; screenCount: number; failingScreenCount: number; averageScore: number; minimumScore: number; issues: string[] };
};

export function isRuntimeQualityEvidence(value: unknown): value is RuntimeQualityEvidence {
  if (!isRecord(value) || !Array.isArray(value.geometryIssues) || !value.geometryIssues.every(isGeometryIssue)) return false;
  return (value.visualCritic === undefined || isCriticScores(value.visualCritic))
    && (value.crossScreenCritic === undefined || isCriticScores(value.crossScreenCritic))
    && (value.layoutIdentity === undefined || isLayoutIdentityReport(value.layoutIdentity))
    && (value.visualHierarchy === undefined || isVisualHierarchyReport(value.visualHierarchy));
}

export function evaluateRuntimeQuality(evidence: RuntimeQualityEvidence) {
  const visualReady = evidence.visualCritic !== undefined;
  const crossScreenReady = evidence.crossScreenCritic !== undefined;
  const layoutIdentityReady = evidence.layoutIdentity !== undefined;
  const visualHierarchyReady = evidence.visualHierarchy !== undefined;
  const gates = {
    geometry: evidence.geometryIssues.length === 0,
    visual: visualReady && passesCriticGate(evidence.visualCritic),
    crossScreen: crossScreenReady && passesCriticGate(evidence.crossScreenCritic),
    layoutIdentity: evidence.layoutIdentity?.passed === true,
    visualHierarchy: evidence.visualHierarchy?.passed === true,
  };
  const pendingGates = [
    ...(visualReady ? [] : ["visual"]),
    ...(crossScreenReady ? [] : ["crossScreen"]),
    ...(layoutIdentityReady ? [] : ["layoutIdentity"]),
    ...(visualHierarchyReady ? [] : ["visualHierarchy"]),
  ];
  return {
    gates,
    pendingGates,
    finalEligible: pendingGates.length === 0 && Object.values(gates).every(Boolean),
  };
}

function isVisualHierarchyReport(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return typeof value.passed === 'boolean'
    && /^\d+\.\d+\.\d+$/.test(String(value.profileVersion))
    && /^[a-f0-9]{64}$/i.test(String(value.profileHash))
    && ['screenCount', 'failingScreenCount', 'averageScore', 'minimumScore'].every((key) => typeof value[key] === 'number' && Number.isFinite(value[key]))
    && Array.isArray(value.issues) && value.issues.every((issue) => typeof issue === 'string');
}

function isLayoutIdentityReport(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return typeof value.passed === 'boolean'
    && ['pairCount', 'collisionCount', 'maxSimilarity', 'differentiation'].every((key) => typeof value[key] === 'number' && Number.isFinite(value[key]))
    && Array.isArray(value.issues) && value.issues.every((issue) => typeof issue === 'string');
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
