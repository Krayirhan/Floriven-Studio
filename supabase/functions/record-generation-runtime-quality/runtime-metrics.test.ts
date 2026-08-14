import { describe, expect, it } from 'vitest'
import { evaluateRuntimeMetricGates, type RuntimeMetricScreen } from './runtime-metrics'

const screen = (screenId: string, archetype: string, secondHeight = 390): RuntimeMetricScreen => ({
  screenId, archetype, viewport: { width: 390, height: 844 }, bounds: [
    { nodeId: `${screenId}-summary`, x: 15, y: 70, width: 360, height: 130, semanticContainer: true, sectionRole: 'summary' },
    { nodeId: `${screenId}-list`, x: 15, y: 220, width: 360, height: secondHeight, semanticContainer: true, sectionRole: 'entity-list' },
    { nodeId: `${screenId}-metric`, x: 25, y: 90, width: 150, height: 60 },
    { nodeId: `${screenId}-row`, x: 25, y: 260, width: 340, height: 58 },
  ],
})

describe('trusted runtime metric gates', () => {
  it('detects same-archetype clones while accepting healthy hierarchy', () => {
    const report = evaluateRuntimeMetricGates([screen('a', 'management_list'), screen('b', 'management_list')])
    expect(report.layoutIdentity).toMatchObject({ passed: false, collisionCount: 1 })
    expect(report.visualHierarchy).toMatchObject({ passed: true, failingScreenCount: 0, profileVersion: '1.0.0', profileHash: expect.stringMatching(/^[a-f0-9]{64}$/) })
  })

  it('blocks title-only runtime evidence', () => {
    const sparse = screen('a', 'dashboard'); sparse.bounds = sparse.bounds.slice(0, 1)
    expect(evaluateRuntimeMetricGates([sparse]).visualHierarchy).toMatchObject({ passed: false, failingScreenCount: 1 })
  })

  it('calibrates focused forms more gently than analytical screens', () => {
    const focused = screen('focused', 'form', 145)
    focused.bounds[0]!.height = 125
    focused.bounds[1]!.y = 400
    focused.bounds.push({ nodeId: 'field', x: 25, y: 420, width: 340, height: 52 })
    expect(evaluateRuntimeMetricGates([focused]).visualHierarchy.passed).toBe(true)
    expect(evaluateRuntimeMetricGates([{ ...focused, archetype: 'dashboard' }]).visualHierarchy.passed).toBe(false)
  })
})
