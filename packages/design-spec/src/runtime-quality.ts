import type { CriticReport } from "./critic-gate";
import type { GeometryIssue } from "./geometry-validator";
import type { RuntimeLayoutIdentityReport, RuntimeVisualHierarchyReport } from "./runtime-visual-identity";

export type RuntimeGateName = "geometry" | "visual" | "crossScreen" | "layoutIdentity" | "visualHierarchy";

export type RuntimeQualityEvidence = {
  geometryIssues: readonly GeometryIssue[];
  visualCritic?: CriticReport;
  crossScreenCritic?: CriticReport;
  layoutIdentity?: RuntimeLayoutIdentityReport;
  visualHierarchy?: RuntimeVisualHierarchyReport;
};

export type RuntimeQualityReport = {
  gates: Record<RuntimeGateName, boolean>;
  pendingGates: RuntimeGateName[];
  finalEligible: boolean;
};

export function evaluateFinalEligibility(staticQualityPassed: boolean, evidence: RuntimeQualityEvidence): RuntimeQualityReport {
  const runtime = evaluateRuntimeQuality(evidence);
  return staticQualityPassed ? runtime : { ...runtime, finalEligible: false };
}

/**
 * Combines trusted renderer and critic outputs. This function deliberately
 * does not produce those outputs: callers must supply renderer-derived bounds
 * and a completed critic report before an output can be called final.
 */
export function evaluateRuntimeQuality(evidence: RuntimeQualityEvidence): RuntimeQualityReport {
  const visualReady = evidence.visualCritic !== undefined;
  const crossScreenReady = evidence.crossScreenCritic !== undefined;
  const layoutIdentityReady = evidence.layoutIdentity !== undefined;
  const visualHierarchyReady = evidence.visualHierarchy !== undefined;
  const gates = {
    geometry: evidence.geometryIssues.length === 0,
    visual: evidence.visualCritic?.passed === true,
    crossScreen: evidence.crossScreenCritic?.passed === true,
    layoutIdentity: evidence.layoutIdentity?.passed === true,
    visualHierarchy: evidence.visualHierarchy?.passed === true,
  };
  const pendingGates = (Object.entries({ visual: visualReady, crossScreen: crossScreenReady, layoutIdentity: layoutIdentityReady, visualHierarchy: visualHierarchyReady }) as [RuntimeGateName, boolean][])
    .filter(([, ready]) => !ready)
    .map(([gate]) => gate);

  return {
    gates,
    pendingGates,
    finalEligible: pendingGates.length === 0 && Object.values(gates).every(Boolean),
  };
}
