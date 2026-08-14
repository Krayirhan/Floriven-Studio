import { describe, expect, it } from 'vitest'
import { evaluateRuntimeLayoutSimilarity, evaluateRuntimeVisualHierarchy, measureRuntimeVisualIdentity, type RuntimeVisualIdentityMetrics } from './runtime-visual-identity'

describe('runtime visual identity measurement', () => {
  it('derives canonical geometry metrics and section role order without content', () => {
    const result = measureRuntimeVisualIdentity([
      { nodeId: 'summary', x: 15, y: 80, width: 360, height: 120, semanticContainer: true, sectionRole: 'summary' },
      { nodeId: 'list', x: 15, y: 220, width: 360, height: 360, semanticContainer: true, sectionRole: 'entity-list' },
      { nodeId: 'metric', x: 25, y: 100, width: 160, height: 70 },
      { nodeId: 'row', x: 25, y: 250, width: 340, height: 56 },
    ], { width: 390, height: 844 })

    expect(result).toMatchObject({ visibleNodeCount: 4, sectionCount: 2, sectionRoleSequence: ['summary', 'entity-list'] })
    expect(result.sectionAreaCoverage).toBeGreaterThan(0.5)
    expect(result.verticalOccupancy).toBeGreaterThan(0.5)
    expect(result.identityVector).toHaveLength(5)
    expect(JSON.stringify(result)).not.toContain('metric')
  })

  it('ignores zero-area nodes and remains finite for empty evidence', () => {
    expect(measureRuntimeVisualIdentity([{ nodeId: 'hidden', x: 0, y: 0, width: 0, height: 20 }], { width: 390, height: 844 })).toEqual({
      visibleNodeCount: 0, sectionCount: 0, sectionAreaCoverage: 0, verticalOccupancy: 0, nodeDensityPer100k: 0,
      sectionHeightVariation: 0, sectionRoleSequence: [], identityVector: [0, 0, 0, 0, 0],
    })
  })

  it('rejects same-archetype runtime clones while ignoring different archetypes', () => {
    const metrics = (vector: number[], roles: string[]): RuntimeVisualIdentityMetrics => ({ visibleNodeCount: 10, sectionCount: vector[0] ?? 0, sectionAreaCoverage: vector[1] ?? 0, verticalOccupancy: vector[2] ?? 0, nodeDensityPer100k: vector[3] ?? 0, sectionHeightVariation: vector[4] ?? 0, sectionRoleSequence: roles, identityVector: vector })
    const report = evaluateRuntimeLayoutSimilarity([
      { screenId: 'projects', archetype: 'management_list', metrics: metrics([2, 0.7, 0.8, 4, 0.2], ['filters', 'entity-list']) },
      { screenId: 'clients', archetype: 'management_list', metrics: metrics([2, 0.7, 0.8, 4, 0.2], ['filters', 'entity-list']) },
      { screenId: 'dashboard', archetype: 'dashboard', metrics: metrics([2, 0.7, 0.8, 4, 0.2], ['filters', 'entity-list']) },
    ])
    expect(report).toMatchObject({ passed: false, pairCount: 1, collisionCount: 1, maxSimilarity: 1, differentiation: 0 })
    expect(report.issues).toEqual(['RUNTIME_LAYOUT_IDENTITY_COLLISION:1'])
  })

  it('accepts materially different role and geometry profiles', () => {
    const base = measureRuntimeVisualIdentity([{ nodeId: 'a', x: 0, y: 0, width: 390, height: 200, semanticContainer: true, sectionRole: 'summary' }, { nodeId: 'b', x: 0, y: 220, width: 390, height: 200, semanticContainer: true, sectionRole: 'analytics' }], { width: 390, height: 844 })
    const distinct = measureRuntimeVisualIdentity([{ nodeId: 'a', x: 20, y: 40, width: 160, height: 80, semanticContainer: true, sectionRole: 'filters' }, { nodeId: 'b', x: 200, y: 40, width: 160, height: 700, semanticContainer: true, sectionRole: 'entity-list' }], { width: 390, height: 844 })
    expect(evaluateRuntimeLayoutSimilarity([{ screenId: 'a', archetype: 'analytics', metrics: base }, { screenId: 'b', archetype: 'analytics', metrics: distinct }])).toMatchObject({ passed: true, collisionCount: 0 })
  })

  it('accepts a populated, layered runtime hierarchy', () => {
    const metrics = measureRuntimeVisualIdentity([
      { nodeId: 'summary', x: 15, y: 70, width: 360, height: 130, semanticContainer: true, sectionRole: 'summary' },
      { nodeId: 'list', x: 15, y: 220, width: 360, height: 390, semanticContainer: true, sectionRole: 'entity-list' },
      { nodeId: 'metric', x: 25, y: 90, width: 150, height: 60 },
      { nodeId: 'row-1', x: 25, y: 250, width: 340, height: 58 },
      { nodeId: 'row-2', x: 25, y: 325, width: 340, height: 58 },
    ], { width: 390, height: 844 })
    expect(evaluateRuntimeVisualHierarchy([metrics])).toMatchObject({ passed: true, screenCount: 1, failingScreenCount: 0, minimumScore: 1, issues: [] })
  })

  it('rejects title-only and uniformly flat runtime output', () => {
    const sparse = measureRuntimeVisualIdentity([
      { nodeId: 'title', x: 20, y: 80, width: 350, height: 50, semanticContainer: true, sectionRole: 'summary' },
    ], { width: 390, height: 844 })
    const report = evaluateRuntimeVisualHierarchy([sparse])
    expect(report).toMatchObject({ passed: false, failingScreenCount: 1 })
    expect(report.issues).toContain('RUNTIME_SECTION_STRUCTURE_TOO_SHALLOW')
    expect(report.issues).toContain('RUNTIME_VERTICAL_OCCUPANCY_TOO_LOW')
  })
})
