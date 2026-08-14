import { describe, expect, it } from 'vitest'
import { evaluateRuntimeScreenVisualHierarchy, measureRuntimeVisualIdentity } from '../../../packages/design-spec/src/runtime-visual-identity'
import { evaluateRuntimeMetricGates, type RuntimeMetricScreen } from './runtime-metrics'

const screen = (archetype: string, sparse = false): RuntimeMetricScreen => ({
  screenId: `${archetype}-${sparse ? 'sparse' : 'healthy'}`, archetype, viewport: { width: 390, height: 844 },
  bounds: sparse ? [{ nodeId: 'title', x: 20, y: 80, width: 350, height: 50, semanticContainer: true, sectionRole: 'summary' }] : [
    { nodeId: 'summary', x: 15, y: 70, width: 360, height: 130, semanticContainer: true, sectionRole: 'summary' },
    { nodeId: 'content', x: 15, y: 240, width: 360, height: 390, semanticContainer: true, sectionRole: archetype === 'form' ? 'form-fields' : 'analytics' },
    { nodeId: 'metric', x: 25, y: 90, width: 150, height: 60 },
    { nodeId: 'row', x: 25, y: 270, width: 340, height: 58 },
  ],
})

describe('runtime profile golden parity', () => {
  it.each(['dashboard', 'analytics', 'management_list', 'form', 'detail', 'settings', 'profile'])('keeps DesignSpec and Edge decisions identical for %s', (archetype) => {
    for (const fixture of [screen(archetype), screen(archetype, true)]) {
      const edge = evaluateRuntimeMetricGates([fixture]).visualHierarchy
      const metrics = measureRuntimeVisualIdentity(fixture.bounds, fixture.viewport)
      const canonical = evaluateRuntimeScreenVisualHierarchy([{ screenId: fixture.screenId, archetype, metrics }])
      expect({ profileVersion: edge.profileVersion, profileHash: edge.profileHash, passed: edge.passed, screenCount: edge.screenCount, failingScreenCount: edge.failingScreenCount, averageScore: edge.averageScore, minimumScore: edge.minimumScore, issues: edge.issues })
        .toEqual(canonical)
    }
  })
})
