import { describe, expect, it } from 'vitest'
import { compareRuntimeReplay, validateRuntimeReplayManifest, type RuntimeReplayManifest } from './runtime-replay'
import { RUNTIME_VISUAL_HIERARCHY_PROFILE_HASH, RUNTIME_VISUAL_HIERARCHY_PROFILE_VERSION } from './runtime-hierarchy-profiles.generated'

const manifest = (): RuntimeReplayManifest => ({ version: '2.0.0', rendererVersion: 'phone-screen-v4', candidateHash: 'cafebabe', capturedAt: '2026-08-14T00:00:00.000Z', hierarchyProfileVersion: RUNTIME_VISUAL_HIERARCHY_PROFILE_VERSION, hierarchyProfileHash: RUNTIME_VISUAL_HIERARCHY_PROFILE_HASH, screens: Array.from({ length: 6 }, (_, index) => ({ screenId: `screen-${index}`, archetype: 'dashboard', screenshotSha256: 'a'.repeat(64), screenshotBytes: 1000, viewport: { width: 390, height: 844 }, hierarchyScore: 1, bounds: [{ nodeId: `hero-${index}`, x: 10, y: 80, width: 370, height: 200 }] })) })

describe('production runtime replay drift', () => {
  it('accepts identical evidence and validates the manifest', () => {
    const baseline = manifest()
    expect(validateRuntimeReplayManifest(baseline)).toEqual([])
    expect(compareRuntimeReplay(baseline, structuredClone(baseline))).toMatchObject({ passed: true, changedScreenshotCount: 0, maximumGeometryDelta: 0, issues: [] })
  })

  it('blocks material screenshot, inventory, geometry and hierarchy drift', () => {
    const baseline = manifest(); const candidate = manifest(); const screen = candidate.screens[0]!
    screen.screenshotSha256 = 'b'.repeat(64); screen.screenshotBytes = 1300; screen.hierarchyScore = 0.7
    screen.bounds = [{ nodeId: 'hero', x: 70, y: 180, width: 260, height: 100 }, { nodeId: 'extra', x: 0, y: 0, width: 10, height: 10 }]
    expect(compareRuntimeReplay(baseline, candidate)).toMatchObject({ passed: false, changedScreenshotCount: 1, issues: expect.arrayContaining(['RUNTIME_REPLAY_SCREENSHOT_HASH_DRIFT', 'RUNTIME_REPLAY_SCREENSHOT_DRIFT', 'RUNTIME_REPLAY_NODE_INVENTORY_DRIFT', 'RUNTIME_REPLAY_GEOMETRY_DRIFT', 'RUNTIME_REPLAY_HIERARCHY_DRIFT']) })
  })

  it('reports screen-set and renderer drift', () => {
    const baseline = manifest(); const candidate = manifest(); candidate.rendererVersion = 'phone-screen-v5'; candidate.screens = []
    expect(compareRuntimeReplay(baseline, candidate).issues).toEqual(expect.arrayContaining(['RUNTIME_REPLAY_CANDIDATE_INVALID:UNSUPPORTED_RUNTIME_REPLAY_RENDERER', 'RUNTIME_REPLAY_CANDIDATE_INVALID:RUNTIME_REPLAY_SCREEN_COUNT_INVALID']))
  })

  it('rejects replay evidence produced by a different hierarchy contract', () => {
    const baseline = manifest(); const candidate = manifest(); candidate.hierarchyProfileHash = 'd'.repeat(64)
    expect(compareRuntimeReplay(baseline, candidate).issues).toContain('RUNTIME_REPLAY_CANDIDATE_INVALID:RUNTIME_REPLAY_HIERARCHY_PROFILE_HASH_UNTRUSTED')
  })

  it('rejects matching forged provenance instead of trusting pairwise equality', () => {
    const baseline = manifest(); const candidate = manifest()
    baseline.hierarchyProfileHash = 'd'.repeat(64); candidate.hierarchyProfileHash = 'd'.repeat(64)
    expect(compareRuntimeReplay(baseline, candidate).issues).toEqual(expect.arrayContaining([
      'RUNTIME_REPLAY_BASELINE_INVALID:RUNTIME_REPLAY_HIERARCHY_PROFILE_HASH_UNTRUSTED',
      'RUNTIME_REPLAY_CANDIDATE_INVALID:RUNTIME_REPLAY_HIERARCHY_PROFILE_HASH_UNTRUSTED',
    ]))
  })

  it('rejects legacy, downgraded and malformed manifests fail-closed', () => {
    const legacy = manifest() as unknown as Record<string, unknown>
    delete legacy.hierarchyProfileHash
    legacy.hierarchyProfileVersion = '0.9.0'
    expect(validateRuntimeReplayManifest(legacy)).toEqual(expect.arrayContaining(['RUNTIME_REPLAY_HIERARCHY_PROFILE_VERSION_UNTRUSTED', 'RUNTIME_REPLAY_HIERARCHY_PROFILE_HASH_UNTRUSTED']))
    expect(validateRuntimeReplayManifest({ version: '2.0.0' })).toContain('INVALID_RUNTIME_REPLAY_SCREEN_COLLECTION')
  })

  it('rejects non-finite and out-of-viewport geometry that could bypass drift thresholds', () => {
    const poisoned = manifest() as unknown as { screens: Array<{ hierarchyScore: number; bounds: Array<{ x: number; y: number; width: number; height: number; nodeId: string }> }> }
    poisoned.screens[0]!.hierarchyScore = Number.NaN
    poisoned.screens[1]!.bounds[0]!.x = Number.POSITIVE_INFINITY
    poisoned.screens[2]!.bounds[0]!.width = 500
    expect(validateRuntimeReplayManifest(poisoned)).toEqual(expect.arrayContaining(['INVALID_RUNTIME_REPLAY_SCREEN:screen-0', 'INVALID_RUNTIME_REPLAY_SCREEN:screen-1', 'INVALID_RUNTIME_REPLAY_SCREEN:screen-2']))
  })
})
