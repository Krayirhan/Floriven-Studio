import { type LayoutPlan } from './layout-plan.ts'
import { canonical, exactKeys, isObject, nonEmptyString, type ValidationResult } from './validation.ts'
import { type ScreenState, type UXStructure } from './ux-structure.ts'

export const CONTENT_PLAN_VERSION = '1.0.0' as const

/** null means "this screen state does not apply to the region" — never invent copy for a state the region never declared. */
export type StateMessage = string | null

export type ContentField = { field: string; value: string }
export type NodeContent = { nodeId: string; component: string; fields: ContentField[] }
export type RegionContent = {
  regionId: string
  nodes: NodeContent[]
  emptyStateMessage: StateMessage
  loadingStateMessage: StateMessage
  errorStateMessage: StateMessage
}
export type ContentPlan = { version: typeof CONTENT_PLAN_VERSION; screenJobId: string; regions: RegionContent[] }

export const CONTENT_PLAN_JSON_SCHEMA = {
  $id: 'floriven.generation-v3.ContentPlan@1', type: 'object', additionalProperties: false,
  required: ['version', 'screenJobId', 'regions'],
  properties: { version: { const: CONTENT_PLAN_VERSION }, screenJobId: { type: 'string' }, regions: { type: 'array', minItems: 2, maxItems: 10 } },
} as const

/** Numeric/visual leakage only — content values are real UI copy and legitimately use ordinary words. */
const LEAK_PATTERNS: RegExp[] = [/#[0-9a-fA-F]{3,8}\b/, /\b\d+(\.\d+)?(px|rem|em|vh|vw|pt)\b/i]

const PLACEHOLDER_PHRASES = new Set([
  'lorem ipsum', 'sample text', 'placeholder', 'placeholder text', 'tbd', 'n/a', 'dummy data', 'example text', 'coming soon', 'test', 'test data',
  'örnek metin', 'metin buraya', 'test verisi', 'yer tutucu', 'yakında', 'içerik buraya',
].map(canonical))

function scanValue(value: string, path: string, issues: string[]): void {
  for (const pattern of LEAK_PATTERNS) if (pattern.test(value)) { issues.push(`${path}: visual leakage detected`); return }
  if (PLACEHOLDER_PHRASES.has(canonical(value))) issues.push(`${path}: placeholder content is not allowed`)
}

type StateKind = 'empty' | 'loading' | 'error'
const STATE_FIELD: Record<StateKind, keyof Pick<RegionContent, 'emptyStateMessage' | 'loadingStateMessage' | 'errorStateMessage'>> = {
  empty: 'emptyStateMessage', loading: 'loadingStateMessage', error: 'errorStateMessage',
}

export function validateContentPlan(input: unknown, structure: UXStructure, layout: LayoutPlan): ValidationResult<ContentPlan> {
  const issues: string[] = []
  if (!isObject(input)) return { ok: false, issues: ['contentPlan: object required'] }
  if (layout.screenJobId !== structure.screenJobId) return { ok: false, issues: ['contentPlan: structure and layout reference different screen jobs'] }
  exactKeys(input, ['version', 'screenJobId', 'regions'], 'contentPlan', issues)
  if (input.version !== CONTENT_PLAN_VERSION) issues.push('contentPlan.version: unsupported version')
  if (input.screenJobId !== structure.screenJobId) issues.push(`contentPlan.screenJobId: must reference ${structure.screenJobId}`)

  const structureRegionById = new Map(structure.regions.map((region) => [region.id, region]))
  const layoutRegionById = new Map(layout.regions.map((region) => [region.regionId, region]))
  const regions = validateRegions(input.regions, structureRegionById, layoutRegionById, issues)
  if (!regions) return { ok: false, issues }

  const allValues = regions.flatMap((region) => [
    ...region.nodes.flatMap((node) => node.fields.map((field) => field.value)),
    region.emptyStateMessage, region.loadingStateMessage, region.errorStateMessage,
  ].filter((value): value is string => typeof value === 'string'))
  const canonicalValues = allValues.map(canonical)
  if (new Set(canonicalValues).size !== canonicalValues.length) issues.push('contentPlan: duplicate content value reused across the screen')

  return issues.length ? { ok: false, issues } : { ok: true, value: input as ContentPlan }
}

function validateRegions(
  value: unknown,
  structureRegionById: Map<string, UXStructure['regions'][number]>,
  layoutRegionById: Map<string, LayoutPlan['regions'][number]>,
  issues: string[],
): RegionContent[] | undefined {
  if (!Array.isArray(value) || value.length !== structureRegionById.size) { issues.push(`contentPlan.regions: exactly ${structureRegionById.size} regions required`); return undefined }
  const regions: RegionContent[] = []
  const seen = new Set<string>()
  value.forEach((raw, index) => {
    const path = `contentPlan.regions[${index}]`
    if (!isObject(raw)) { issues.push(`${path}: object required`); return }
    exactKeys(raw, ['regionId', 'nodes', 'emptyStateMessage', 'loadingStateMessage', 'errorStateMessage'], path, issues)
    if (!nonEmptyString(raw.regionId, `${path}.regionId`, issues, 80)) return
    const regionId = raw.regionId as string
    const structureRegion = structureRegionById.get(regionId)
    const layoutRegion = layoutRegionById.get(regionId)
    if (!structureRegion || !layoutRegion) { issues.push(`${path}.regionId: unknown region ${regionId}`); return }
    if (seen.has(regionId)) { issues.push(`${path}.regionId: duplicate region ${regionId}`); return }
    seen.add(regionId)

    const nodes = validateNodes(raw.nodes, layoutRegion.nodes, `${path}.nodes`, issues)
    const states = validateStateMessages(raw, structureRegion.states, path, issues)
    if (!nodes || !states) return

    checkDataBindingCoverage(structureRegion.dataBindings, nodes, path, issues)
    regions.push({ regionId, nodes, ...states })
  })
  return regions.length === structureRegionById.size ? regions : undefined
}

function validateNodes(value: unknown, layoutNodes: LayoutPlan['regions'][number]['nodes'], path: string, issues: string[]): NodeContent[] | undefined {
  if (!Array.isArray(value) || value.length !== layoutNodes.length) { issues.push(`${path}: exactly ${layoutNodes.length} node content entries required`); return undefined }
  const layoutNodeById = new Map(layoutNodes.map((node) => [node.id, node]))
  const nodes: NodeContent[] = []
  const seen = new Set<string>()
  value.forEach((raw, index) => {
    const nodePath = `${path}[${index}]`
    if (!isObject(raw)) { issues.push(`${nodePath}: object required`); return }
    exactKeys(raw, ['nodeId', 'component', 'fields'], nodePath, issues)
    if (!nonEmptyString(raw.nodeId, `${nodePath}.nodeId`, issues, 80)) return
    const nodeId = raw.nodeId as string
    const layoutNode = layoutNodeById.get(nodeId)
    if (!layoutNode) { issues.push(`${nodePath}.nodeId: unknown node ${nodeId}`); return }
    if (seen.has(nodeId)) { issues.push(`${nodePath}.nodeId: duplicate node ${nodeId}`); return }
    seen.add(nodeId)
    if (raw.component !== layoutNode.component) { issues.push(`${nodePath}.component: must be "${layoutNode.component}" to match the layout node`); return }

    const fields = validateFields(raw.fields, `${nodePath}.fields`, issues)
    if (fields) nodes.push({ nodeId, component: layoutNode.component, fields })
  })
  return nodes.length === layoutNodes.length ? nodes : undefined
}

function validateFields(value: unknown, path: string, issues: string[]): ContentField[] | undefined {
  if (!Array.isArray(value) || value.length < 1 || value.length > 8) { issues.push(`${path}: 1-8 fields required`); return undefined }
  const fields: ContentField[] = []
  const seenNames = new Set<string>()
  value.forEach((raw, index) => {
    const fieldPath = `${path}[${index}]`
    if (!isObject(raw)) { issues.push(`${fieldPath}: object required`); return }
    exactKeys(raw, ['field', 'value'], fieldPath, issues)
    const valid = nonEmptyString(raw.field, `${fieldPath}.field`, issues, 40) && nonEmptyString(raw.value, `${fieldPath}.value`, issues, 400)
    if (!valid) return
    const fieldName = canonical(raw.field as string)
    if (seenNames.has(fieldName)) { issues.push(`${fieldPath}.field: duplicate field name`); return }
    seenNames.add(fieldName)
    scanValue(raw.value as string, `${fieldPath}.value`, issues)
    fields.push({ field: raw.field as string, value: raw.value as string })
  })
  return fields.length === value.length ? fields : undefined
}

function validateStateMessages(raw: Record<string, unknown>, states: ScreenState[], path: string, issues: string[]): Pick<RegionContent, 'emptyStateMessage' | 'loadingStateMessage' | 'errorStateMessage'> | undefined {
  const result: Record<string, StateMessage> = {}
  let valid = true
  for (const state of Object.keys(STATE_FIELD) as StateKind[]) {
    const field = STATE_FIELD[state]
    const declared = states.includes(state as ScreenState)
    const rawValue = raw[field]
    if (declared) {
      const fieldPath = `${path}.${field}`
      if (typeof rawValue !== 'string' || !rawValue.trim()) { issues.push(`${fieldPath}: message required because region declares "${state}" state`); valid = false; continue }
      if (rawValue.length > 240) { issues.push(`${fieldPath}: exceeds 240 characters`); valid = false; continue }
      scanValue(rawValue, fieldPath, issues)
      result[field] = rawValue
    } else {
      if (rawValue !== null) { issues.push(`${path}.${field}: must be null — region does not declare "${state}" state`); valid = false; continue }
      result[field] = null
    }
  }
  return valid ? (result as Pick<RegionContent, 'emptyStateMessage' | 'loadingStateMessage' | 'errorStateMessage'>) : undefined
}

function checkDataBindingCoverage(dataBindings: string[], nodes: NodeContent[], path: string, issues: string[]): void {
  const haystack = canonical(nodes.flatMap((node) => node.fields.map((field) => field.value)).join(' | '))
  for (const term of dataBindings) if (!haystack.includes(canonical(term))) issues.push(`${path}: no content reflects data binding "${term}"`)
}
