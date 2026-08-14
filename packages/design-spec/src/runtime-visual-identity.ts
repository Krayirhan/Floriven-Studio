import { RUNTIME_VISUAL_HIERARCHY_PROFILE_HASH, RUNTIME_VISUAL_HIERARCHY_PROFILE_VERSION, RUNTIME_VISUAL_HIERARCHY_PROFILES, type RuntimeVisualHierarchyThresholds } from './runtime-hierarchy-profiles.generated'
export { RUNTIME_VISUAL_HIERARCHY_PROFILE_HASH, RUNTIME_VISUAL_HIERARCHY_PROFILE_VERSION, RUNTIME_VISUAL_HIERARCHY_PROFILES } from './runtime-hierarchy-profiles.generated'

export type RuntimeVisualNode = {
  nodeId: string
  x: number
  y: number
  width: number
  height: number
  sectionRole?: string
  semanticContainer?: boolean
}

export type RuntimeVisualIdentityMetrics = {
  visibleNodeCount: number
  sectionCount: number
  sectionAreaCoverage: number
  verticalOccupancy: number
  nodeDensityPer100k: number
  sectionHeightVariation: number
  sectionRoleSequence: string[]
  identityVector: number[]
}

export type RuntimeScreenVisualIdentity = { screenId: string; archetype: string; metrics: RuntimeVisualIdentityMetrics }
export type RuntimeLayoutIdentityReport = {
  passed: boolean
  pairCount: number
  collisionCount: number
  maxSimilarity: number
  differentiation: number
  issues: string[]
}

export type RuntimeVisualHierarchyReport = {
  profileVersion: string
  profileHash: string
  passed: boolean
  screenCount: number
  failingScreenCount: number
  averageScore: number
  minimumScore: number
  issues: string[]
}


export function measureRuntimeVisualIdentity(nodes: readonly RuntimeVisualNode[], viewport: { width: number; height: number }): RuntimeVisualIdentityMetrics {
  const area = viewport.width * viewport.height
  const visible = nodes.filter((node) => node.width > 0 && node.height > 0)
  const sections = visible.filter((node) => node.semanticContainer === true && node.sectionRole)
    .sort((left, right) => left.y - right.y || left.x - right.x || left.nodeId.localeCompare(right.nodeId))
  const sectionArea = sections.reduce((total, node) => total + node.width * node.height, 0)
  const top = visible.length ? Math.min(...visible.map((node) => node.y)) : 0
  const bottom = visible.length ? Math.max(...visible.map((node) => node.y + node.height)) : 0
  const heights = sections.map((node) => node.height)
  const meanHeight = heights.length ? heights.reduce((total, value) => total + value, 0) / heights.length : 0
  const deviation = heights.length && meanHeight
    ? Math.sqrt(heights.reduce((total, value) => total + (value - meanHeight) ** 2, 0) / heights.length) / meanHeight
    : 0
  const sectionAreaCoverage = area > 0 ? clamp(sectionArea / area) : 0
  const verticalOccupancy = viewport.height > 0 ? clamp((bottom - top) / viewport.height) : 0
  const nodeDensityPer100k = area > 0 ? visible.length / (area / 100_000) : 0
  const metrics = {
    visibleNodeCount: visible.length,
    sectionCount: sections.length,
    sectionAreaCoverage: round(sectionAreaCoverage),
    verticalOccupancy: round(verticalOccupancy),
    nodeDensityPer100k: round(nodeDensityPer100k),
    sectionHeightVariation: round(deviation),
    sectionRoleSequence: sections.map((node) => String(node.sectionRole)),
  }
  return { ...metrics, identityVector: [metrics.sectionCount, metrics.sectionAreaCoverage, metrics.verticalOccupancy, metrics.nodeDensityPer100k, metrics.sectionHeightVariation] }
}

export function evaluateRuntimeLayoutSimilarity(screens: readonly RuntimeScreenVisualIdentity[], threshold = 0.9): RuntimeLayoutIdentityReport {
  const similarities: number[] = []
  for (let left = 0; left < screens.length; left += 1) for (let right = left + 1; right < screens.length; right += 1) {
    const a = screens[left]
    const b = screens[right]
    if (!a || !b || a.archetype !== b.archetype) continue
    const roleSimilarity = sequenceSimilarity(a.metrics.sectionRoleSequence, b.metrics.sectionRoleSequence)
    const vectorSimilarity = numericVectorSimilarity(a.metrics.identityVector, b.metrics.identityVector)
    similarities.push(roleSimilarity * 0.4 + vectorSimilarity * 0.6)
  }
  const collisionCount = similarities.filter((value) => value >= threshold).length
  return {
    passed: collisionCount === 0,
    pairCount: similarities.length,
    collisionCount,
    maxSimilarity: similarities.length ? round(Math.max(...similarities)) : 0,
    differentiation: similarities.length ? round(1 - collisionCount / similarities.length) : 1,
    issues: collisionCount ? [`RUNTIME_LAYOUT_IDENTITY_COLLISION:${collisionCount}`] : [],
  }
}

export function evaluateRuntimeVisualHierarchy(metrics: readonly RuntimeVisualIdentityMetrics[], archetype = 'default'): RuntimeVisualHierarchyReport {
  return aggregateVisualHierarchy(metrics.map((item) => scoreVisualHierarchy(item, thresholdsFor(archetype))))
}

export function evaluateRuntimeScreenVisualHierarchy(screens: readonly RuntimeScreenVisualIdentity[]): RuntimeVisualHierarchyReport {
  return aggregateVisualHierarchy(screens.map((screen) => scoreVisualHierarchy(screen.metrics, thresholdsFor(screen.archetype))))
}

function aggregateVisualHierarchy(results: Array<{ passed: boolean; score: number; issues: string[] }>): RuntimeVisualHierarchyReport {
  const failingScreenCount = results.filter((result) => !result.passed).length
  const issues = [...new Set(results.flatMap((result) => result.issues))].sort()
  return {
    profileVersion: RUNTIME_VISUAL_HIERARCHY_PROFILE_VERSION,
    profileHash: RUNTIME_VISUAL_HIERARCHY_PROFILE_HASH,
    passed: results.length > 0 && failingScreenCount === 0,
    screenCount: results.length,
    failingScreenCount,
    averageScore: results.length ? round(results.reduce((total, result) => total + result.score, 0) / results.length) : 0,
    minimumScore: results.length ? round(Math.min(...results.map((result) => result.score))) : 0,
    issues: results.length ? issues : ['RUNTIME_VISUAL_HIERARCHY_EVIDENCE_MISSING'],
  }
}

function scoreVisualHierarchy(metrics: RuntimeVisualIdentityMetrics, thresholds: RuntimeVisualHierarchyThresholds): { passed: boolean; score: number; issues: string[] } {
  const issues: string[] = []
  if (metrics.sectionCount < thresholds.minimumSectionCount) issues.push('RUNTIME_SECTION_STRUCTURE_TOO_SHALLOW')
  if (metrics.sectionAreaCoverage < thresholds.minimumSectionAreaCoverage) issues.push('RUNTIME_SECTION_COVERAGE_TOO_LOW')
  if (metrics.sectionAreaCoverage > thresholds.maximumSectionAreaCoverage) issues.push('RUNTIME_SECTION_COVERAGE_TOO_HIGH')
  if (metrics.verticalOccupancy < thresholds.minimumVerticalOccupancy) issues.push('RUNTIME_VERTICAL_OCCUPANCY_TOO_LOW')
  if (metrics.nodeDensityPer100k < thresholds.minimumNodeDensityPer100k) issues.push('RUNTIME_NODE_DENSITY_TOO_LOW')
  if (metrics.nodeDensityPer100k > thresholds.maximumNodeDensityPer100k) issues.push('RUNTIME_NODE_DENSITY_TOO_HIGH')
  if (metrics.sectionCount >= 2 && metrics.sectionHeightVariation < thresholds.minimumSectionHeightVariation) issues.push('RUNTIME_SECTION_HIERARCHY_TOO_FLAT')
  const checks = 7
  const score = round((checks - issues.length) / checks)
  return { passed: issues.length === 0, score, issues }
}

function thresholdsFor(archetype: string): RuntimeVisualHierarchyThresholds { return RUNTIME_VISUAL_HIERARCHY_PROFILES[archetype] ?? RUNTIME_VISUAL_HIERARCHY_PROFILES.default! }

function sequenceSimilarity(left: readonly string[], right: readonly string[]): number {
  const size = Math.max(left.length, right.length)
  if (!size) return 1
  let matches = 0
  for (let index = 0; index < Math.min(left.length, right.length); index += 1) if (left[index] === right[index]) matches += 1
  return matches / size
}

function numericVectorSimilarity(left: readonly number[], right: readonly number[]): number {
  const size = Math.max(left.length, right.length)
  if (!size) return 1
  let total = 0
  for (let index = 0; index < size; index += 1) {
    const a = Number.isFinite(left[index]) ? Number(left[index]) : 0
    const b = Number.isFinite(right[index]) ? Number(right[index]) : 0
    total += 1 - Math.min(1, Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b), 1))
  }
  return total / size
}

function clamp(value: number): number { return Math.max(0, Math.min(1, value)) }
function round(value: number): number { return Math.round(value * 1000) / 1000 }
