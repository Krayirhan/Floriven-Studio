import { createSemanticHash } from './semantic-hash';
import { createGeometryReport, type GeometryReport, type RenderedBounds } from './geometry-validator';
import { evaluateCriticGate, type CriticReport, type CriticScores } from './critic-gate';

export const RUNTIME_EVALUATION_VERSION = 'v1';

export type RuntimeScreenEvidence = {
  screenId: string;
  /** Transient trusted-runner payload. It is evaluated server-side and never persisted. */
  screenshotData: string;
  screenshotSha256: string;
  screenshotBytes: number;
  bounds: RenderedBounds[];
  viewport: { width: number; height: number; safeTop?: number; safeBottom?: number };
  rendererVersion: string;
};

export type RuntimeCertificationEvidence = {
  candidateHash: string;
  evaluationVersion: string;
  screens: RuntimeScreenEvidence[];
};

export type RuntimeCertificationReport = {
  candidateHash: string;
  evaluationVersion: string;
  evidenceScreenCount: number;
  geometry: Array<{ screenId: string; report: GeometryReport }>;
  visualCritic: CriticReport;
  crossScreenCritic: CriticReport;
  passed: boolean;
  criticalIssues: string[];
};

export function createCandidateHash(screens: unknown[]): string {
  return createSemanticHash({ screens: screens as never[], flows: [] });
}

export function validateRuntimeEvidence(evidence: RuntimeCertificationEvidence, expectedScreenIds: readonly string[], expectedHash: string): string[] {
  const issues: string[] = [];
  if (evidence.candidateHash !== expectedHash) issues.push('CANDIDATE_HASH_MISMATCH');
  if (evidence.evaluationVersion !== RUNTIME_EVALUATION_VERSION) issues.push('RUNTIME_EVALUATION_VERSION_MISMATCH');
  if (evidence.screens.length !== expectedScreenIds.length) issues.push('INCOMPLETE_SCREEN_EVIDENCE');
  const actual = new Set(evidence.screens.map((screen) => screen.screenId));
  if (actual.size !== evidence.screens.length || expectedScreenIds.some((id) => !actual.has(id))) issues.push('SCREEN_ID_MISMATCH');
  for (const screen of evidence.screens) {
    if (!/^[a-f0-9]{64}$/i.test(screen.screenshotSha256) || screen.screenshotBytes <= 0 || !screen.screenshotData.startsWith('data:image/')) issues.push(`INVALID_SCREENSHOT:${screen.screenId}`);
    if (!screen.rendererVersion || screen.viewport.width <= 0 || screen.viewport.height <= 0) issues.push(`INVALID_RENDER_METADATA:${screen.screenId}`);
    if (screen.bounds.length === 0) issues.push(`MISSING_NODE_BOUNDS:${screen.screenId}`);
  }
  return issues;
}

export function evaluateRuntimeCertification(
  evidence: RuntimeCertificationEvidence,
  visualScores: CriticScores,
  crossScreenScores: CriticScores,
): RuntimeCertificationReport {
  const geometry = evidence.screens.map((screen) => ({
    screenId: screen.screenId,
    report: createGeometryReport(screen.bounds, screen.viewport),
  }));
  const visualCritic = evaluateCriticGate(visualScores);
  const crossScreenCritic = evaluateCriticGate(crossScreenScores);
  const criticalIssues = [
    ...geometry.flatMap(({ screenId, report }) => report.issues.map((issue) => `${screenId}:${issue}`)),
    ...visualCritic.failures,
    ...crossScreenCritic.failures,
  ];
  return {
    candidateHash: evidence.candidateHash,
    evaluationVersion: evidence.evaluationVersion,
    evidenceScreenCount: evidence.screens.length,
    geometry,
    visualCritic,
    crossScreenCritic,
    passed: criticalIssues.length === 0,
    criticalIssues,
  };
}
