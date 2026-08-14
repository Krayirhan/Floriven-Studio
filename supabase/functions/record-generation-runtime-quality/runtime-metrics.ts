import { RUNTIME_VISUAL_HIERARCHY_PROFILES, RUNTIME_VISUAL_HIERARCHY_PROFILE_HASH, RUNTIME_VISUAL_HIERARCHY_PROFILE_VERSION } from '../_shared/runtime-hierarchy-profiles.generated.ts'

export type RuntimeBound = {
  nodeId: string
  x: number
  y: number
  width: number
  height: number
  semanticContainer?: boolean
  sectionRole?: string
}

export type RuntimeMetricScreen = {
  screenId: string
  archetype: string
  bounds: RuntimeBound[]
  viewport: { width: number; height: number }
}

type Metrics = {
  visibleNodeCount: number
  sectionCount: number
  sectionAreaCoverage: number
  verticalOccupancy: number
  nodeDensityPer100k: number
  sectionHeightVariation: number
  sectionRoleSequence: string[]
  identityVector: number[]
}

export function evaluateRuntimeMetricGates(screens: RuntimeMetricScreen[]) {
  const measured = screens.map((screen) => ({ screenId: screen.screenId, archetype: screen.archetype, metrics: measure(screen.bounds, screen.viewport) }))
  return { layoutIdentity: layoutIdentity(measured), visualHierarchy: { ...visualHierarchy(measured), profileVersion: RUNTIME_VISUAL_HIERARCHY_PROFILE_VERSION, profileHash: RUNTIME_VISUAL_HIERARCHY_PROFILE_HASH } }
}

function measure(nodes: RuntimeBound[], viewport: { width: number; height: number }): Metrics {
  const area = viewport.width * viewport.height
  const visible = nodes.filter((node) => node.width > 0 && node.height > 0)
  const sections = visible.filter((node) => node.semanticContainer && node.sectionRole).sort((a, b) => a.y - b.y || a.x - b.x || a.nodeId.localeCompare(b.nodeId))
  const top = visible.length ? Math.min(...visible.map((node) => node.y)) : 0
  const bottom = visible.length ? Math.max(...visible.map((node) => node.y + node.height)) : 0
  const heights = sections.map((node) => node.height)
  const mean = heights.length ? heights.reduce((sum, height) => sum + height, 0) / heights.length : 0
  const variation = mean ? Math.sqrt(heights.reduce((sum, height) => sum + (height - mean) ** 2, 0) / heights.length) / mean : 0
  const metrics = {
    visibleNodeCount: visible.length,
    sectionCount: sections.length,
    sectionAreaCoverage: area > 0 ? clamp(sections.reduce((sum, node) => sum + node.width * node.height, 0) / area) : 0,
    verticalOccupancy: viewport.height > 0 ? clamp((bottom - top) / viewport.height) : 0,
    nodeDensityPer100k: area > 0 ? visible.length / (area / 100_000) : 0,
    sectionHeightVariation: variation,
    sectionRoleSequence: sections.map((node) => String(node.sectionRole)),
  }
  const rounded = Object.fromEntries(Object.entries(metrics).map(([key, value]) => [key, typeof value === 'number' ? round(value) : value])) as Omit<Metrics, 'identityVector'>
  return { ...rounded, identityVector: [rounded.sectionCount, rounded.sectionAreaCoverage, rounded.verticalOccupancy, rounded.nodeDensityPer100k, rounded.sectionHeightVariation] }
}

function visualHierarchy(screens: Array<{ archetype: string; metrics: Metrics }>) {
  const results = screens.map(({ archetype, metrics: item }) => {
    const profile = hierarchyProfile(archetype)
    const issues = [
      ...(item.sectionCount < 2 ? ['RUNTIME_SECTION_STRUCTURE_TOO_SHALLOW'] : []),
      ...(item.sectionAreaCoverage < profile.minimumSectionAreaCoverage ? ['RUNTIME_SECTION_COVERAGE_TOO_LOW'] : []),
      ...(item.sectionAreaCoverage > 0.95 ? ['RUNTIME_SECTION_COVERAGE_TOO_HIGH'] : []),
      ...(item.verticalOccupancy < profile.minimumVerticalOccupancy ? ['RUNTIME_VERTICAL_OCCUPANCY_TOO_LOW'] : []),
      ...(item.nodeDensityPer100k < profile.minimumNodeDensityPer100k ? ['RUNTIME_NODE_DENSITY_TOO_LOW'] : []),
      ...(item.nodeDensityPer100k > 15 ? ['RUNTIME_NODE_DENSITY_TOO_HIGH'] : []),
      ...(item.sectionCount >= 2 && item.sectionHeightVariation < profile.minimumSectionHeightVariation ? ['RUNTIME_SECTION_HIERARCHY_TOO_FLAT'] : []),
    ]
    return { passed: issues.length === 0, score: round((7 - issues.length) / 7), issues }
  })
  const failingScreenCount = results.filter((result) => !result.passed).length
  return { passed: screens.length > 0 && failingScreenCount === 0, screenCount: screens.length, failingScreenCount, averageScore: screens.length ? round(results.reduce((sum, result) => sum + result.score, 0) / screens.length) : 0, minimumScore: screens.length ? Math.min(...results.map((result) => result.score)) : 0, issues: screens.length ? [...new Set(results.flatMap((result) => result.issues))].sort() : ['RUNTIME_VISUAL_HIERARCHY_EVIDENCE_MISSING'] }
}

function hierarchyProfile(archetype: string) {
  return RUNTIME_VISUAL_HIERARCHY_PROFILES[archetype] ?? RUNTIME_VISUAL_HIERARCHY_PROFILES.default!
}

function layoutIdentity(screens: Array<{ screenId: string; archetype: string; metrics: Metrics }>) {
  const similarities: number[] = []
  for (let left = 0; left < screens.length; left += 1) for (let right = left + 1; right < screens.length; right += 1) {
    const a = screens[left]; const b = screens[right]
    if (!a || !b || a.archetype !== b.archetype) continue
    const size = Math.max(a.metrics.sectionRoleSequence.length, b.metrics.sectionRoleSequence.length)
    const roleSimilarity = size ? a.metrics.sectionRoleSequence.filter((role, index) => role === b.metrics.sectionRoleSequence[index]).length / size : 1
    const vectorSimilarity = a.metrics.identityVector.reduce((sum, value, index) => { const other = b.metrics.identityVector[index] ?? 0; return sum + 1 - Math.min(1, Math.abs(value - other) / Math.max(Math.abs(value), Math.abs(other), 1)) }, 0) / a.metrics.identityVector.length
    similarities.push(roleSimilarity * 0.4 + vectorSimilarity * 0.6)
  }
  const collisionCount = similarities.filter((similarity) => similarity >= 0.9).length
  return { passed: collisionCount === 0, pairCount: similarities.length, collisionCount, maxSimilarity: similarities.length ? round(Math.max(...similarities)) : 0, differentiation: similarities.length ? round(1 - collisionCount / similarities.length) : 1, issues: collisionCount ? [`RUNTIME_LAYOUT_IDENTITY_COLLISION:${collisionCount}`] : [] }
}

function clamp(value: number) { return Math.max(0, Math.min(1, value)) }
function round(value: number) { return Math.round(value * 1000) / 1000 }
