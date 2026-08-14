import type { RuntimeBound } from './runtime-metrics.ts'

export const RUNTIME_EVIDENCE_VERSION = 'v2'
export const RUNTIME_RENDERER_VERSION = 'phone-screen-v4'
export const RUNTIME_VIEWPORT = { width: 390, height: 844 } as const

export type RuntimeCertificationEvidence = { candidateHash: string; evaluationVersion: string; screens: Array<{ screenId: string; archetype: string; screenshotData: string; screenshotSha256: string; screenshotBytes: number; bounds: RuntimeBound[]; viewport: { width: number; height: number }; rendererVersion: string }> }

export function isRuntimeEvidence(value: unknown): value is RuntimeCertificationEvidence { return isRecord(value) && typeof value.candidateHash === 'string' && typeof value.evaluationVersion === 'string' && Array.isArray(value.screens) }

export async function validateRuntimeEvidence(evidence: RuntimeCertificationEvidence, expectedIds: string[], expectedHash: string) {
  const issues: string[] = []
  if (evidence.candidateHash !== expectedHash) issues.push('CANDIDATE_HASH_MISMATCH')
  if (evidence.evaluationVersion !== RUNTIME_EVIDENCE_VERSION) issues.push('RUNTIME_EVALUATION_VERSION_MISMATCH')
  if (evidence.screens.length !== expectedIds.length) issues.push('INCOMPLETE_SCREEN_EVIDENCE')
  const ids = new Set(evidence.screens.map((screen) => screen.screenId))
  if (ids.size !== evidence.screens.length || expectedIds.some((id) => !ids.has(id))) issues.push('SCREEN_ID_MISMATCH')
  for (const screen of evidence.screens) {
    const screenshot = decodePng(screen.screenshotData)
    if (!screenshot || !Number.isInteger(screen.screenshotBytes) || screen.screenshotBytes <= 0 || screenshot.byteLength !== screen.screenshotBytes || !/^[a-f0-9]{64}$/i.test(screen.screenshotSha256) || await sha256(screenshot) !== screen.screenshotSha256.toLowerCase()) issues.push(`INVALID_SCREENSHOT:${screen.screenId}`)
    if (!screen.archetype || screen.rendererVersion !== RUNTIME_RENDERER_VERSION || screen.viewport.width !== RUNTIME_VIEWPORT.width || screen.viewport.height !== RUNTIME_VIEWPORT.height || !screen.bounds.length || screen.bounds.some((bound) => !validBound(bound))) issues.push(`INVALID_RENDER_METADATA:${screen.screenId}`)
    if (screen.bounds.some((bound) => bound.semanticContainer === true && !bound.sectionRole)) issues.push(`INVALID_SECTION_METADATA:${screen.screenId}`)
  }
  return issues
}

function decodePng(value: string) {
  const match = /^data:image\/png;base64,([A-Za-z0-9+/]+={0,2})$/.exec(value)
  if (!match?.[1]) return undefined
  try { return Uint8Array.from(atob(match[1]), (character) => character.charCodeAt(0)) } catch { return undefined }
}
function validBound(bound: RuntimeBound) { return [bound.x, bound.y, bound.width, bound.height].every((value) => Number.isFinite(value)) && bound.x >= 0 && bound.y >= 0 && bound.width > 0 && bound.height > 0 && bound.x + bound.width <= RUNTIME_VIEWPORT.width && bound.y + bound.height <= RUNTIME_VIEWPORT.height }
async function sha256(value: Uint8Array) { const digest = await crypto.subtle.digest('SHA-256', value); return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('') }
function isRecord(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value) }
