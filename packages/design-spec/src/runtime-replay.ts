export const RUNTIME_REPLAY_VERSION = '2.0.0' as const

import { CANONICAL_VIEWPORT } from './layout/types'
import { RUNTIME_RENDERER_VERSION } from './runtime-baseline'
import { RUNTIME_VISUAL_HIERARCHY_PROFILE_HASH, RUNTIME_VISUAL_HIERARCHY_PROFILE_VERSION } from './runtime-hierarchy-profiles.generated'

export type RuntimeReplayBound = { nodeId: string; x: number; y: number; width: number; height: number }
export type RuntimeReplayScreen = {
  screenId: string
  archetype: string
  screenshotSha256: string
  screenshotBytes: number
  bounds: RuntimeReplayBound[]
  viewport: { width: number; height: number }
  hierarchyScore: number
}
export type RuntimeReplayManifest = {
  version: typeof RUNTIME_REPLAY_VERSION
  rendererVersion: string
  candidateHash: string
  capturedAt: string
  hierarchyProfileVersion: string
  hierarchyProfileHash: string
  screens: RuntimeReplayScreen[]
}
export type RuntimeReplayDriftReport = {
  passed: boolean
  comparedScreenCount: number
  missingScreenCount: number
  changedScreenshotCount: number
  maximumScreenshotByteDelta: number
  maximumNodeInventoryDelta: number
  maximumGeometryDelta: number
  maximumHierarchyScoreDelta: number
  issues: string[]
}

export function compareRuntimeReplay(baseline: RuntimeReplayManifest, candidate: RuntimeReplayManifest): RuntimeReplayDriftReport {
  const issues: string[] = []
  const baselineIssues = validateRuntimeReplayManifest(baseline)
  const candidateIssues = validateRuntimeReplayManifest(candidate)
  issues.push(...baselineIssues.map((issue) => `RUNTIME_REPLAY_BASELINE_INVALID:${issue}`), ...candidateIssues.map((issue) => `RUNTIME_REPLAY_CANDIDATE_INVALID:${issue}`))
  if (issues.length) return emptyDriftReport(issues)
  if (baseline.version !== candidate.version) issues.push('RUNTIME_REPLAY_VERSION_MISMATCH')
  if (baseline.rendererVersion !== candidate.rendererVersion) issues.push('RUNTIME_REPLAY_RENDERER_MISMATCH')
  if (baseline.hierarchyProfileVersion !== candidate.hierarchyProfileVersion || baseline.hierarchyProfileHash !== candidate.hierarchyProfileHash) issues.push('RUNTIME_REPLAY_HIERARCHY_PROFILE_MISMATCH')
  const candidateById = new Map(candidate.screens.map((screen) => [screen.screenId, screen]))
  let missingScreenCount = 0
  let changedScreenshotCount = 0
  let maximumScreenshotByteDelta = 0
  let maximumNodeInventoryDelta = 0
  let maximumGeometryDelta = 0
  let maximumHierarchyScoreDelta = 0
  for (const expected of baseline.screens) {
    const actual = candidateById.get(expected.screenId)
    if (!actual) { missingScreenCount += 1; continue }
    if (expected.screenshotSha256 !== actual.screenshotSha256) changedScreenshotCount += 1
    maximumScreenshotByteDelta = Math.max(maximumScreenshotByteDelta, ratioDelta(expected.screenshotBytes, actual.screenshotBytes))
    maximumNodeInventoryDelta = Math.max(maximumNodeInventoryDelta, nodeInventoryDelta(expected.bounds, actual.bounds))
    maximumGeometryDelta = Math.max(maximumGeometryDelta, geometryDelta(expected, actual))
    maximumHierarchyScoreDelta = Math.max(maximumHierarchyScoreDelta, Math.abs(expected.hierarchyScore - actual.hierarchyScore))
  }
  const extraScreenCount = candidate.screens.filter((screen) => !baseline.screens.some((expected) => expected.screenId === screen.screenId)).length
  if (missingScreenCount || extraScreenCount) issues.push('RUNTIME_REPLAY_SCREEN_SET_DRIFT')
  if (changedScreenshotCount) issues.push('RUNTIME_REPLAY_SCREENSHOT_HASH_DRIFT')
  if (maximumScreenshotByteDelta > 0.08) issues.push('RUNTIME_REPLAY_SCREENSHOT_DRIFT')
  if (maximumNodeInventoryDelta > 0.1) issues.push('RUNTIME_REPLAY_NODE_INVENTORY_DRIFT')
  if (maximumGeometryDelta > 0.03) issues.push('RUNTIME_REPLAY_GEOMETRY_DRIFT')
  if (maximumHierarchyScoreDelta > 0.1) issues.push('RUNTIME_REPLAY_HIERARCHY_DRIFT')
  return { passed: issues.length === 0, comparedScreenCount: Math.max(0, baseline.screens.length - missingScreenCount), missingScreenCount: missingScreenCount + extraScreenCount, changedScreenshotCount, maximumScreenshotByteDelta: round(maximumScreenshotByteDelta), maximumNodeInventoryDelta: round(maximumNodeInventoryDelta), maximumGeometryDelta: round(maximumGeometryDelta), maximumHierarchyScoreDelta: round(maximumHierarchyScoreDelta), issues }
}

export function validateRuntimeReplayManifest(manifest: unknown): string[] {
  const issues: string[] = []
  if (!isRecord(manifest)) return ['INVALID_RUNTIME_REPLAY_MANIFEST']
  if (manifest.version !== RUNTIME_REPLAY_VERSION) issues.push('UNSUPPORTED_RUNTIME_REPLAY_VERSION')
  if (manifest.rendererVersion !== RUNTIME_RENDERER_VERSION) issues.push('UNSUPPORTED_RUNTIME_REPLAY_RENDERER')
  if (manifest.hierarchyProfileVersion !== RUNTIME_VISUAL_HIERARCHY_PROFILE_VERSION) issues.push('RUNTIME_REPLAY_HIERARCHY_PROFILE_VERSION_UNTRUSTED')
  if (manifest.hierarchyProfileHash !== RUNTIME_VISUAL_HIERARCHY_PROFILE_HASH) issues.push('RUNTIME_REPLAY_HIERARCHY_PROFILE_HASH_UNTRUSTED')
  if (!isNonEmptyString(manifest.candidateHash) || !/^[a-f0-9]{8}$/i.test(manifest.candidateHash) || !isIsoTimestamp(manifest.capturedAt)) issues.push('INCOMPLETE_RUNTIME_REPLAY_METADATA')
  if (!Array.isArray(manifest.screens)) return [...issues, 'INVALID_RUNTIME_REPLAY_SCREEN_COLLECTION']
  if (manifest.screens.length !== 6) issues.push('RUNTIME_REPLAY_SCREEN_COUNT_INVALID')
  const ids = new Set<string>()
  for (const value of manifest.screens) {
    if (!isRecord(value)) { issues.push('INVALID_RUNTIME_REPLAY_SCREEN:unknown'); continue }
    const screen = value
    const screenId = isNonEmptyString(screen.screenId) ? screen.screenId : 'unknown'
    if (ids.has(screenId)) issues.push(`DUPLICATE_RUNTIME_REPLAY_SCREEN:${screenId}`)
    ids.add(screenId)
    if (!isNonEmptyString(screen.archetype) || !isSha256(screen.screenshotSha256) || !isPositiveInteger(screen.screenshotBytes) || !isCanonicalViewport(screen.viewport) || !isFiniteNumber(screen.hierarchyScore) || screen.hierarchyScore < 0 || screen.hierarchyScore > 1 || !Array.isArray(screen.bounds) || !screen.bounds.length || screen.bounds.some((bound) => !isValidBound(bound))) issues.push(`INVALID_RUNTIME_REPLAY_SCREEN:${screenId}`)
  }
  return issues
}

function emptyDriftReport(issues: string[]): RuntimeReplayDriftReport { return { passed: false, comparedScreenCount: 0, missingScreenCount: 0, changedScreenshotCount: 0, maximumScreenshotByteDelta: 0, maximumNodeInventoryDelta: 0, maximumGeometryDelta: 0, maximumHierarchyScoreDelta: 0, issues } }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value) }
function isNonEmptyString(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0 }
function isFiniteNumber(value: unknown): value is number { return typeof value === 'number' && Number.isFinite(value) }
function isPositiveInteger(value: unknown): value is number { return isFiniteNumber(value) && Number.isInteger(value) && value > 0 }
function isSha256(value: unknown): value is string { return typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value) }
function isIsoTimestamp(value: unknown): value is string { return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && !Number.isNaN(Date.parse(value)) }
function isCanonicalViewport(value: unknown) { return isRecord(value) && value.width === CANONICAL_VIEWPORT.width && value.height === CANONICAL_VIEWPORT.height }
function isValidBound(value: unknown) {
  if (!isRecord(value) || !isNonEmptyString(value.nodeId) || !isFiniteNumber(value.x) || !isFiniteNumber(value.y) || !isFiniteNumber(value.width) || !isFiniteNumber(value.height)) return false
  return value.x >= 0 && value.y >= 0 && value.width > 0 && value.height > 0 && value.x + value.width <= CANONICAL_VIEWPORT.width && value.y + value.height <= CANONICAL_VIEWPORT.height
}

function nodeInventoryDelta(left: RuntimeReplayBound[], right: RuntimeReplayBound[]) {
  const leftIds = new Set(left.map((bound) => bound.nodeId)); const rightIds = new Set(right.map((bound) => bound.nodeId))
  const changed = [...leftIds].filter((id) => !rightIds.has(id)).length + [...rightIds].filter((id) => !leftIds.has(id)).length
  return changed / Math.max(leftIds.size, rightIds.size, 1)
}
function geometryDelta(left: RuntimeReplayScreen, right: RuntimeReplayScreen) {
  const rightById = new Map(right.bounds.map((bound) => [bound.nodeId, bound])); const deltas: number[] = []
  for (const bound of left.bounds) { const other = rightById.get(bound.nodeId); if (!other) continue; deltas.push(Math.abs(bound.x - other.x) / left.viewport.width, Math.abs(bound.y - other.y) / left.viewport.height, Math.abs(bound.width - other.width) / left.viewport.width, Math.abs(bound.height - other.height) / left.viewport.height) }
  return deltas.length ? deltas.reduce((sum, value) => sum + value, 0) / deltas.length : 1
}
function ratioDelta(left: number, right: number) { return Math.abs(left - right) / Math.max(left, right, 1) }
function round(value: number) { return Math.round(value * 1000) / 1000 }
