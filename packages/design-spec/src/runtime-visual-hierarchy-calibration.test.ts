import { describe, expect, it } from 'vitest'
import { evaluateRuntimeHierarchyCalibration, RUNTIME_HIERARCHY_CALIBRATION_CORPUS } from './runtime-visual-hierarchy-calibration'
import { RUNTIME_VISUAL_HIERARCHY_PROFILES } from './runtime-visual-identity'

describe('runtime visual hierarchy calibration corpus', () => {
  it('covers every supported archetype with positive and negative examples', () => {
    for (const archetype of ['dashboard', 'analytics', 'management_list', 'form', 'detail', 'settings', 'profile']) {
      const cases = RUNTIME_HIERARCHY_CALIBRATION_CORPUS.filter((item) => item.archetype === archetype)
      expect(cases.some((item) => item.expectedPass)).toBe(true)
      expect(cases.some((item) => !item.expectedPass)).toBe(true)
      expect(RUNTIME_VISUAL_HIERARCHY_PROFILES[archetype]).toBeDefined()
    }
  })

  it('has zero known false positives and false negatives', () => {
    expect(evaluateRuntimeHierarchyCalibration()).toEqual({ caseCount: 14, correctCount: 14, falsePositiveCount: 0, falseNegativeCount: 0, accuracy: 1, passed: true })
  })
})
