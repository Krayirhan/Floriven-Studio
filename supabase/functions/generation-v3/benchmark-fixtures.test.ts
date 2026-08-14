import { describe, expect, it } from 'vitest'
import { V3_PLANNING_BENCHMARKS, type ExperienceArchetype } from './benchmark-fixtures.ts'
import { productModelMessages } from './prompts.ts'

const REQUIRED_ARCHETYPES: ExperienceArchetype[] = ['calendar', 'board', 'map', 'gallery', 'timeline', 'form', 'detail', 'list', 'dashboard', 'settings']

describe('Generation V3 benchmark corpus (ADR-0009 acceptance gate)', () => {
  it('contains at least 25 distinct cross-domain briefs with measurable expectations', () => {
    expect(V3_PLANNING_BENCHMARKS.length).toBeGreaterThanOrEqual(25)
    expect(new Set(V3_PLANNING_BENCHMARKS.map((fixture) => fixture.id)).size).toBe(V3_PLANNING_BENCHMARKS.length)
    expect(new Set(V3_PLANNING_BENCHMARKS.map((fixture) => fixture.brief)).size).toBe(V3_PLANNING_BENCHMARKS.length)
    for (const fixture of V3_PLANNING_BENCHMARKS) {
      expect(fixture.expectedDomainTerms.length).toBeGreaterThanOrEqual(3)
      expect(fixture.brief.length).toBeGreaterThan(30)
    }
  })

  it('targets exactly 100 screens across the corpus', () => {
    const total = V3_PLANNING_BENCHMARKS.reduce((sum, fixture) => sum + fixture.targetScreenCount, 0)
    expect(total).toBe(100)
    for (const fixture of V3_PLANNING_BENCHMARKS) {
      expect(fixture.targetScreenCount).toBeGreaterThanOrEqual(1)
      expect(fixture.targetScreenCount).toBeLessThanOrEqual(12)
    }
  })

  it('covers every required experience archetype (calendar, board, map, gallery, timeline, form, detail, list, dashboard, settings) with at least two briefs each', () => {
    const countByArchetype = new Map<ExperienceArchetype, number>()
    for (const fixture of V3_PLANNING_BENCHMARKS) countByArchetype.set(fixture.experiencePattern, (countByArchetype.get(fixture.experiencePattern) ?? 0) + 1)
    for (const archetype of REQUIRED_ARCHETYPES) expect(countByArchetype.get(archetype) ?? 0).toBeGreaterThanOrEqual(2)
    // No fixture claims an archetype outside the required ten — the corpus can't silently grow an untracked category.
    for (const fixture of V3_PLANNING_BENCHMARKS) expect(REQUIRED_ARCHETYPES).toContain(fixture.experiencePattern)
  })

  it('keeps every brief in the untrusted user-data boundary', () => {
    for (const fixture of V3_PLANNING_BENCHMARKS) {
      const messages = productModelMessages(fixture.brief)
      expect(messages[0].content).not.toContain(fixture.brief)
      expect(messages[1].content).toContain(JSON.stringify(fixture.brief))
    }
  })
})
