import { type V3ComponentType } from './component-capabilities.ts'
import {
  validateComponentProps,
  type ComponentPropsMap,
} from './component-contracts.ts'
import { type LayoutPlan } from './layout-plan.ts'
import { canonical, exactKeys, isObject, nonEmptyString, type ValidationResult } from './validation.ts'
import { type ScreenState, type UXStructure } from './ux-structure.ts'

export const CONTENT_PLAN_VERSION = '1.0.0' as const

/** null means "this screen state does not apply to the region" — never invent copy for a state the region never declared. */
export type StateMessage = string | null

export type NodeContent<T extends V3ComponentType = V3ComponentType> = {
  nodeId: string
  component: T
  props: ComponentPropsMap[T]
}

export type RegionContent = {
  regionId: string
  nodes: NodeContent[]
  emptyStateMessage: StateMessage
  loadingStateMessage: StateMessage
  errorStateMessage: StateMessage
}

export type ContentPlan = {
  version: typeof CONTENT_PLAN_VERSION
  screenJobId: string
  regions: RegionContent[]
}

export const CONTENT_PLAN_JSON_SCHEMA = {
  $id: 'floriven.generation-v3.ContentPlan@1', type: 'object', additionalProperties: false,
  required: ['version', 'screenJobId', 'regions'],
  properties: {
    version: { const: CONTENT_PLAN_VERSION }, screenJobId: { type: 'string' },
    regions: {
      type: 'array', minItems: 2, maxItems: 10,
      items: {
        type: 'object', additionalProperties: false, required: ['regionId', 'nodes', 'emptyStateMessage', 'loadingStateMessage', 'errorStateMessage'],
        properties: {
          regionId: { type: 'string' },
          nodes: {
            type: 'array', description: 'exactly one entry per layout node in this region, same nodeId/component pairing with typed props',
            items: {
              type: 'object', additionalProperties: false, required: ['nodeId', 'component', 'props'],
              properties: {
                nodeId: { type: 'string', description: 'must match the layout node id' },
                component: { type: 'string', description: 'must match that layout node\'s component' },
                props: { type: 'object', description: 'typed props matching the canonical component contract' },
              },
            },
          },
          emptyStateMessage: { type: ['string', 'null'], description: 'string only if the region declares an empty state, else null' },
          loadingStateMessage: { type: ['string', 'null'], description: 'string only if the region declares a loading state, else null' },
          errorStateMessage: { type: ['string', 'null'], description: 'string only if the region declares an error state, else null' },
        },
      },
    },
  },
} as const

/** Numeric/visual leakage only — content values are real UI copy and legitimately use ordinary words. */
const LEAK_PATTERNS: RegExp[] = [/#[0-9a-fA-F]{3,8}\b/, /\b\d+(\.\d+)?(px|rem|em|vh|vw|pt)\b/i]

const PLACEHOLDER_PHRASES = new Set([
  'lorem ipsum', 'sample text', 'placeholder', 'placeholder text', 'tbd', 'n/a', 'dummy data', 'example text', 'coming soon', 'test', 'test data',
  'örnek metin', 'metin buraya', 'test verisi', 'yer tutucu', 'yakında', 'içerik buraya',
].map(canonical))

function scanValue(value: string, path: string, issues: string[]): void {
  for (const pattern of LEAK_PATTERNS) {
    if (pattern.test(value)) {
      issues.push(`${path}: visual leakage detected`)
      return
    }
  }
  if (PLACEHOLDER_PHRASES.has(canonical(value))) {
    issues.push(`${path}: placeholder content is not allowed`)
  }
}

export function extractStringsFromProps(props: unknown): string[] {
  if (props === null || props === undefined) return []
  if (typeof props === 'string') return [props]
  if (typeof props === 'number' || typeof props === 'boolean') return [String(props)]
  if (Array.isArray(props)) {
    return props.flatMap(extractStringsFromProps)
  }
  if (typeof props === 'object') {
    return Object.values(props).flatMap(extractStringsFromProps)
  }
  return []
}

function scanPropsValues(props: unknown, path: string, issues: string[]): void {
  if (props === null || props === undefined) return
  if (typeof props === 'string') {
    scanValue(props, path, issues)
  } else if (Array.isArray(props)) {
    props.forEach((item, idx) => scanPropsValues(item, `${path}[${idx}]`, issues))
  } else if (typeof props === 'object') {
    for (const [k, v] of Object.entries(props as Record<string, unknown>)) {
      scanPropsValues(v, `${path}.${k}`, issues)
    }
  }
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

  const allSignificantValues = regions.flatMap((region) => [
    ...region.nodes.flatMap((node) => extractStringsFromProps(node.props)),
    region.emptyStateMessage, region.loadingStateMessage, region.errorStateMessage,
  ].filter((value): value is string => typeof value === 'string' && value.trim().length > 3))
  const canonicalValues = allSignificantValues.map(canonical)
  if (new Set(canonicalValues).size !== canonicalValues.length) {
    issues.push('contentPlan: duplicate content value reused across the screen')
  }

  return issues.length ? { ok: false, issues } : { ok: true, value: input as ContentPlan }
}

function validateRegions(
  value: unknown,
  structureRegionById: Map<string, UXStructure['regions'][number]>,
  layoutRegionById: Map<string, LayoutPlan['regions'][number]>,
  issues: string[],
): RegionContent[] | undefined {
  if (!Array.isArray(value) || value.length !== structureRegionById.size) {
    issues.push(`contentPlan.regions: exactly ${structureRegionById.size} regions required`)
    return undefined
  }
  const regions: RegionContent[] = []
  const seen = new Set<string>()
  value.forEach((raw, index) => {
    const path = `contentPlan.regions[${index}]`
    if (!isObject(raw)) {
      issues.push(`${path}: object required`)
      return
    }
    exactKeys(raw, ['regionId', 'nodes', 'emptyStateMessage', 'loadingStateMessage', 'errorStateMessage'], path, issues)
    if (!nonEmptyString(raw.regionId, `${path}.regionId`, issues, 80)) return
    const regionId = raw.regionId as string
    const structureRegion = structureRegionById.get(regionId)
    const layoutRegion = layoutRegionById.get(regionId)
    if (!structureRegion || !layoutRegion) {
      issues.push(`${path}.regionId: unknown region ${regionId}`)
      return
    }
    if (seen.has(regionId)) {
      issues.push(`${path}.regionId: duplicate region ${regionId}`)
      return
    }
    seen.add(regionId)

    const nodes = validateNodes(raw.nodes, layoutRegion.nodes, `${path}.nodes`, issues)
    const states = validateStateMessages(raw, structureRegion.states, path, issues)
    if (!nodes || !states) return

    checkDataBindingCoverage(structureRegion.dataBindings, nodes, path, issues)
    regions.push({ regionId, nodes, ...states })
  })
  return regions.length === structureRegionById.size ? regions : undefined
}

function validateNodes(
  value: unknown,
  layoutNodes: LayoutPlan['regions'][number]['nodes'],
  path: string,
  issues: string[],
): NodeContent[] | undefined {
  if (!Array.isArray(value) || value.length !== layoutNodes.length) {
    issues.push(`${path}: exactly ${layoutNodes.length} node content entries required`)
    return undefined
  }
  const layoutNodeById = new Map(layoutNodes.map((node) => [node.id, node]))
  const nodes: NodeContent[] = []
  const seen = new Set<string>()
  value.forEach((raw, index) => {
    const nodePath = `${path}[${index}]`
    if (!isObject(raw)) {
      issues.push(`${nodePath}: object required`)
      return
    }
    exactKeys(raw, ['nodeId', 'component', 'props'], nodePath, issues)
    if (!nonEmptyString(raw.nodeId, `${nodePath}.nodeId`, issues, 80)) return
    const nodeId = raw.nodeId as string
    const layoutNode = layoutNodeById.get(nodeId)
    if (!layoutNode) {
      issues.push(`${nodePath}.nodeId: unknown node ${nodeId}`)
      return
    }
    if (seen.has(nodeId)) {
      issues.push(`${nodePath}.nodeId: duplicate node ${nodeId}`)
      return
    }
    seen.add(nodeId)
    if (raw.component !== layoutNode.component) {
      issues.push(`${nodePath}.component: must be "${layoutNode.component}" to match the layout node`)
      return
    }

    const propValidation = validateComponentProps(layoutNode.component, raw.props, `${nodePath}.props`)
    if (!propValidation.ok) {
      issues.push(...propValidation.issues)
      return
    }

    scanPropsValues(propValidation.value, `${nodePath}.props`, issues)
    nodes.push({ nodeId, component: layoutNode.component, props: propValidation.value })
  })
  return nodes.length === layoutNodes.length ? nodes : undefined
}

function validateStateMessages(
  raw: Record<string, unknown>,
  states: ScreenState[],
  path: string,
  issues: string[],
): Pick<RegionContent, 'emptyStateMessage' | 'loadingStateMessage' | 'errorStateMessage'> | undefined {
  const result: Record<string, StateMessage> = {}
  let valid = true
  for (const state of Object.keys(STATE_FIELD) as StateKind[]) {
    const field = STATE_FIELD[state]
    const declared = states.includes(state as ScreenState)
    const rawValue = raw[field]
    if (declared) {
      const fieldPath = `${path}.${field}`
      if (typeof rawValue !== 'string' || !rawValue.trim()) {
        issues.push(`${fieldPath}: message required because region declares "${state}" state`)
        valid = false
        continue
      }
      if (rawValue.length > 240) {
        issues.push(`${fieldPath}: exceeds 240 characters`)
        valid = false
        continue
      }
      scanValue(rawValue, fieldPath, issues)
      result[field] = rawValue
    } else {
      if (rawValue !== null) {
        issues.push(`${path}.${field}: must be null — region does not declare "${state}" state`)
        valid = false
        continue
      }
      result[field] = null
    }
  }
  return valid ? (result as Pick<RegionContent, 'emptyStateMessage' | 'loadingStateMessage' | 'errorStateMessage'>) : undefined
}

function checkDataBindingCoverage(dataBindings: string[], nodes: NodeContent[], path: string, issues: string[]): void {
  const haystack = canonical(nodes.flatMap((node) => extractStringsFromProps(node.props)).join(' | '))
  for (const term of dataBindings) {
    if (!haystack.includes(canonical(term))) {
      issues.push(`${path}: no content reflects data binding "${term}"`)
    }
  }
}
