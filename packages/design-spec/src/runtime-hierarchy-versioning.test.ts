import { describe, expect, it } from 'vitest'
import { classifyRuntimeHierarchyChange, satisfiesRuntimeHierarchyVersion } from './runtime-hierarchy-versioning'

const contract = (version: string, minimum = 0.25) => ({ version, profiles: { default: { minimumSectionAreaCoverage: minimum, maximumSectionAreaCoverage: 0.95 } } })
describe('runtime hierarchy semver policy', () => {
  it('requires major for tighter thresholds', () => {
    expect(classifyRuntimeHierarchyChange(contract('1.0.0'), contract('2.0.0', 0.3))).toBe('major')
    expect(satisfiesRuntimeHierarchyVersion('1.0.0', '1.1.0', 'major')).toBe(false)
    expect(satisfiesRuntimeHierarchyVersion('1.0.0', '2.0.0', 'major')).toBe(true)
  })
  it('requires minor for loosening or adding profiles', () => {
    expect(classifyRuntimeHierarchyChange(contract('1.0.0'), contract('1.1.0', 0.2))).toBe('minor')
    expect(satisfiesRuntimeHierarchyVersion('1.0.0', '1.1.0', 'minor')).toBe(true)
  })
  it('rejects version churn without contract change', () => {
    expect(classifyRuntimeHierarchyChange(contract('1.0.0'), contract('1.0.1'))).toBe('none')
    expect(satisfiesRuntimeHierarchyVersion('1.0.0', '1.0.1', 'none')).toBe(false)
  })
})
