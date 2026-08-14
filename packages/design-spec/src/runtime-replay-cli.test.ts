import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { RUNTIME_VISUAL_HIERARCHY_PROFILE_HASH, RUNTIME_VISUAL_HIERARCHY_PROFILE_VERSION } from './runtime-hierarchy-profiles.generated'

const script = resolve(process.cwd(), '../../scripts/certification/compare-runtime-replay.mjs')
const manifest = () => ({ version: '2.0.0', rendererVersion: 'phone-screen-v4', candidateHash: 'cafebabe', capturedAt: '2026-08-14T00:00:00.000Z', hierarchyProfileVersion: RUNTIME_VISUAL_HIERARCHY_PROFILE_VERSION, hierarchyProfileHash: RUNTIME_VISUAL_HIERARCHY_PROFILE_HASH, screens: Array.from({ length: 6 }, (_, index) => ({ screenId: `screen-${index}`, archetype: 'dashboard', screenshotSha256: 'a'.repeat(64), screenshotBytes: 1000, viewport: { width: 390, height: 844 }, hierarchyScore: 1, bounds: [{ nodeId: `hero-${index}`, x: 10, y: 80, width: 370, height: 200 }] })) })

function run(baseline: object, candidate: object) {
  const directory = mkdtempSync(resolve(tmpdir(), 'floriven-replay-'))
  const baselinePath = resolve(directory, 'baseline.json'); const candidatePath = resolve(directory, 'candidate.json')
  writeFileSync(baselinePath, JSON.stringify(baseline)); writeFileSync(candidatePath, JSON.stringify(candidate))
  try { return { passed: true, output: execFileSync(process.execPath, [script], { encoding: 'utf8', env: { ...process.env, RUNTIME_REPLAY_BASELINE: baselinePath, RUNTIME_REPLAY_CANDIDATE: candidatePath } }) } }
  catch (error) { const failure = error as { stdout?: string; stderr?: string }; return { passed: false, output: `${failure.stdout ?? ''}${failure.stderr ?? ''}` } }
}

describe('runtime replay CLI provenance hardening', () => {
  it('accepts only canonical identical manifests', () => { expect(run(manifest(), manifest()).passed).toBe(true) })

  it('rejects pairwise-equal forged provenance and poisoned geometry', () => {
    const baseline = manifest(); const candidate = manifest()
    baseline.hierarchyProfileHash = 'd'.repeat(64); candidate.hierarchyProfileHash = 'd'.repeat(64)
    candidate.screens[0]!.bounds[0]!.x = Number.POSITIVE_INFINITY
    const result = run(baseline, candidate)
    expect(result.passed).toBe(false)
    expect(result.output).toContain('RUNTIME_REPLAY_BASELINE_INVALID:RUNTIME_REPLAY_HIERARCHY_PROFILE_HASH_UNTRUSTED')
    expect(result.output).toContain('RUNTIME_REPLAY_CANDIDATE_INVALID:INVALID_RUNTIME_REPLAY_SCREEN:screen-0')
  })
})
