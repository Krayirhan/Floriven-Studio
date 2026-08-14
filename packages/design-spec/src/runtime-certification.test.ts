import { describe, expect, it } from 'vitest';
import { RUNTIME_EVALUATION_VERSION, createCandidateHash, evaluateRuntimeCertification, validateRuntimeEvidence } from './runtime-certification';

const scores = { visualHierarchy: 8, taskClarity: 8, informationDensity: 8, spacingRhythm: 8, typography: 8, surfaceUsage: 8, patternSuitability: 8, navigation: 8, screenDifferentiation: 8, crossScreenConsistency: 8 };
const screens = [{ id: 'overview', name: 'Overview', root: { id: 'root', type: 'Screen', props: {}, children: [] } }];
const hash = createCandidateHash(screens);
const evidence = {
  candidateHash: hash,
  evaluationVersion: RUNTIME_EVALUATION_VERSION,
  screens: [{ screenId: 'overview', screenshotData: 'data:image/png;base64,AA==', screenshotSha256: 'a'.repeat(64), screenshotBytes: 1, rendererVersion: 'phone-screen-v2', viewport: { width: 390, height: 844 }, bounds: [{ nodeId: 'root', x: 0, y: 0, width: 390, height: 844 }] }],
};

describe('runtime certification contract', () => {
  it('binds complete browser evidence to the immutable candidate hash', () => {
    expect(validateRuntimeEvidence(evidence, ['overview'], hash)).toEqual([]);
    expect(validateRuntimeEvidence({ ...evidence, candidateHash: 'b'.repeat(8) }, ['overview'], hash)).toContain('CANDIDATE_HASH_MISMATCH');
  });

  it('derives a passing final result only from complete evidence and passing critics', () => {
    const report = evaluateRuntimeCertification(evidence, scores, scores);
    expect(report.passed).toBe(true);
    expect(report.evidenceScreenCount).toBe(1);
    expect(report.criticalIssues).toEqual([]);
  });

  it('blocks eligibility when actual DOM bounds expose geometry failure', () => {
    const unsafe = { ...evidence, screens: [{ ...evidence.screens[0], bounds: [{ nodeId: 'root', x: 0, y: 0, width: 500, height: 844 }] }] };
    expect(evaluateRuntimeCertification(unsafe, scores, scores).passed).toBe(false);
  });
});
