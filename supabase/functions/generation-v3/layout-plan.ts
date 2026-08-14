import { COMPONENT_CAPABILITY_MATRIX, type ComponentCapabilities, type V3ComponentType } from './component-capabilities.ts'
import { exactKeys, isObject, nonEmptyString, type ValidationResult } from './validation.ts'
import { type UXStructure } from './ux-structure.ts'

export const LAYOUT_PLAN_VERSION = '1.0.0' as const

/** Container arrangement modes from DesignSpec's layout model (docs/02-architecture/DESIGN_SPEC.md#6). */
export type LayoutMode = 'column' | 'row' | 'stack' | 'grid' | 'absolute' | 'scroll'
export type SizeMode = 'hug' | 'fill' | 'fixed'
export type Density = 'compact' | 'comfortable' | 'spacious'
export type Emphasis = 'primary' | 'secondary' | 'support'
export type Breakpoint = 'narrow' | 'wide'
export type NavigationPlacementSlot = 'top' | 'bottom' | 'inline'

const LAYOUT_MODES = new Set<LayoutMode>(['column', 'row', 'stack', 'grid', 'absolute', 'scroll'])
const SIZE_MODES = new Set<SizeMode>(['hug', 'fill', 'fixed'])
const DENSITIES = new Set<Density>(['compact', 'comfortable', 'spacious'])
const BREAKPOINTS = new Set<Breakpoint>(['narrow', 'wide'])
const PLACEMENT_SLOTS = new Set<NavigationPlacementSlot>(['top', 'bottom', 'inline'])

export type LayoutNode = { id: string; component: V3ComponentType; order: number; size: SizeMode }
export type RegionLayout = { regionId: string; mode: LayoutMode; density: Density; emphasis: Emphasis; nodes: LayoutNode[] }
export type ResponsiveLayoutRule = { regionId: string; breakpoint: Breakpoint; mode: LayoutMode; visible: boolean }
export type NavigationPlacement = { regionId: string; component: V3ComponentType; placement: NavigationPlacementSlot }

export type LayoutPlan = {
  version: typeof LAYOUT_PLAN_VERSION
  screenJobId: string
  regions: RegionLayout[]
  responsive: ResponsiveLayoutRule[]
  navigation: NavigationPlacement | null
}

export const LAYOUT_PLAN_JSON_SCHEMA = {
  $id: 'floriven.generation-v3.LayoutPlan@1', type: 'object', additionalProperties: false,
  required: ['version', 'screenJobId', 'regions', 'responsive', 'navigation'],
  properties: {
    version: { const: LAYOUT_PLAN_VERSION }, screenJobId: { type: 'string' },
    regions: { type: 'array', minItems: 2, maxItems: 10 }, responsive: { type: 'array' },
    navigation: { type: ['object', 'null'] },
  },
} as const

/** Content priority is fixed by UXStructure.informationHierarchy — never re-decided by this stage. */
export function deriveRegionEmphasis(structure: UXStructure): Map<string, Emphasis> {
  const order = structure.informationHierarchy
  const emphasis = new Map<string, Emphasis>()
  order.forEach((regionId, index) => {
    if (index === 0) emphasis.set(regionId, 'primary')
    else if (index === order.length - 1) emphasis.set(regionId, 'support')
    else emphasis.set(regionId, 'secondary')
  })
  return emphasis
}

function findNavigationCandidates(capabilities: ComponentCapabilities): Array<{ regionId: string; component: V3ComponentType }> {
  const candidates: Array<{ regionId: string; component: V3ComponentType }> = []
  for (const region of capabilities.regions) {
    for (const component of region.selectedComponents) {
      if (COMPONENT_CAPABILITY_MATRIX[component].includes('navigate')) candidates.push({ regionId: region.regionId, component })
    }
  }
  return candidates
}

export function validateLayoutPlan(input: unknown, structure: UXStructure, capabilities: ComponentCapabilities): ValidationResult<LayoutPlan> {
  const issues: string[] = []
  if (!isObject(input)) return { ok: false, issues: ['layoutPlan: object required'] }
  if (capabilities.screenJobId !== structure.screenJobId) return { ok: false, issues: ['layoutPlan: structure and capabilities reference different screen jobs'] }
  exactKeys(input, ['version', 'screenJobId', 'regions', 'responsive', 'navigation'], 'layoutPlan', issues)
  if (input.version !== LAYOUT_PLAN_VERSION) issues.push('layoutPlan.version: unsupported version')
  if (input.screenJobId !== structure.screenJobId) issues.push(`layoutPlan.screenJobId: must reference ${structure.screenJobId}`)

  const capabilitiesByRegion = new Map(capabilities.regions.map((region) => [region.regionId, region]))
  const emphasisByRegion = deriveRegionEmphasis(structure)
  const regionIds = new Set(structure.regions.map((region) => region.id))

  const regions = validateRegions(input.regions, regionIds, capabilitiesByRegion, emphasisByRegion, issues)
  const responsive = validateResponsive(input.responsive, regionIds, issues)
  const navigation = validateNavigation(input.navigation, capabilities, issues)

  if (!regions || !responsive || navigation === undefined) return { ok: false, issues }
  const allNodeIds = regions.flatMap((region) => region.nodes.map((node) => node.id))
  if (new Set(allNodeIds).size !== allNodeIds.length) issues.push('layoutPlan.regions: node ids must be unique across the whole screen')
  return issues.length ? { ok: false, issues } : { ok: true, value: input as LayoutPlan }
}

function validateRegions(
  value: unknown,
  regionIds: Set<string>,
  capabilitiesByRegion: Map<string, ComponentCapabilities['regions'][number]>,
  emphasisByRegion: Map<string, Emphasis>,
  issues: string[],
): RegionLayout[] | undefined {
  if (!Array.isArray(value) || value.length !== regionIds.size) { issues.push(`layoutPlan.regions: exactly ${regionIds.size} region layouts required`); return undefined }
  const regions: RegionLayout[] = []
  const seen = new Set<string>()
  value.forEach((raw, index) => {
    const path = `layoutPlan.regions[${index}]`
    if (!isObject(raw)) { issues.push(`${path}: object required`); return }
    exactKeys(raw, ['regionId', 'mode', 'density', 'emphasis', 'nodes'], path, issues)
    if (!nonEmptyString(raw.regionId, `${path}.regionId`, issues, 80)) return
    const regionId = raw.regionId as string
    if (!regionIds.has(regionId)) { issues.push(`${path}.regionId: unknown region ${regionId}`); return }
    if (seen.has(regionId)) { issues.push(`${path}.regionId: duplicate region ${regionId}`); return }
    seen.add(regionId)

    if (!LAYOUT_MODES.has(raw.mode as LayoutMode)) issues.push(`${path}.mode: invalid layout mode`)
    if (!DENSITIES.has(raw.density as Density)) issues.push(`${path}.density: invalid density`)
    const expectedEmphasis = emphasisByRegion.get(regionId)
    if (raw.emphasis !== expectedEmphasis) issues.push(`${path}.emphasis: must be "${expectedEmphasis}" per informationHierarchy`)

    const selection = capabilitiesByRegion.get(regionId)
    const nodes = selection ? validateNodes(raw.nodes, selection.selectedComponents, `${path}.nodes`, issues) : undefined
    if (nodes && LAYOUT_MODES.has(raw.mode as LayoutMode) && DENSITIES.has(raw.density as Density) && raw.emphasis === expectedEmphasis) {
      regions.push({ regionId, mode: raw.mode as LayoutMode, density: raw.density as Density, emphasis: raw.emphasis as Emphasis, nodes })
    }
  })
  return regions.length === regionIds.size ? regions : undefined
}

function validateNodes(value: unknown, selectedComponents: V3ComponentType[], path: string, issues: string[]): LayoutNode[] | undefined {
  if (!Array.isArray(value) || value.length !== selectedComponents.length) { issues.push(`${path}: exactly ${selectedComponents.length} nodes required`); return undefined }
  const nodes: LayoutNode[] = []
  const seenComponents = new Set<string>()
  const seenOrders = new Set<number>()
  value.forEach((raw, index) => {
    const nodePath = `${path}[${index}]`
    if (!isObject(raw)) { issues.push(`${nodePath}: object required`); return }
    exactKeys(raw, ['id', 'component', 'order', 'size'], nodePath, issues)
    const validId = nonEmptyString(raw.id, `${nodePath}.id`, issues, 80)
    const component = raw.component
    if (typeof component !== 'string' || !selectedComponents.includes(component as V3ComponentType)) { issues.push(`${nodePath}.component: must be one of this region's selected components`); return }
    if (seenComponents.has(component)) { issues.push(`${nodePath}.component: duplicate placement of ${component}`); return }
    seenComponents.add(component)
    const validOrder = typeof raw.order === 'number' && Number.isInteger(raw.order) && raw.order >= 1
    if (!validOrder) issues.push(`${nodePath}.order: positive integer required`)
    else if (seenOrders.has(raw.order as number)) { issues.push(`${nodePath}.order: duplicate order`); return }
    else seenOrders.add(raw.order as number)
    if (!SIZE_MODES.has(raw.size as SizeMode)) { issues.push(`${nodePath}.size: invalid size mode`); return }
    if (validId && validOrder) nodes.push({ id: raw.id as string, component: component as V3ComponentType, order: raw.order as number, size: raw.size as SizeMode })
  })
  return nodes.length === selectedComponents.length ? nodes : undefined
}

function validateResponsive(value: unknown, regionIds: Set<string>, issues: string[]): ResponsiveLayoutRule[] | undefined {
  const expectedCount = regionIds.size * 2
  if (!Array.isArray(value) || value.length !== expectedCount) { issues.push(`layoutPlan.responsive: exactly ${expectedCount} rules required (one per region per breakpoint)`); return undefined }
  const rules: ResponsiveLayoutRule[] = []
  const seen = new Set<string>()
  value.forEach((raw, index) => {
    const path = `layoutPlan.responsive[${index}]`
    if (!isObject(raw)) { issues.push(`${path}: object required`); return }
    exactKeys(raw, ['regionId', 'breakpoint', 'mode', 'visible'], path, issues)
    if (!nonEmptyString(raw.regionId, `${path}.regionId`, issues, 80)) return
    const regionId = raw.regionId as string
    if (!regionIds.has(regionId)) { issues.push(`${path}.regionId: unknown region ${regionId}`); return }
    if (!BREAKPOINTS.has(raw.breakpoint as Breakpoint)) { issues.push(`${path}.breakpoint: invalid breakpoint`); return }
    const key = `${regionId}:${raw.breakpoint}`
    if (seen.has(key)) { issues.push(`${path}: duplicate rule for ${key}`); return }
    seen.add(key)
    if (!LAYOUT_MODES.has(raw.mode as LayoutMode)) { issues.push(`${path}.mode: invalid layout mode`); return }
    if (typeof raw.visible !== 'boolean') { issues.push(`${path}.visible: boolean required`); return }
    rules.push({ regionId, breakpoint: raw.breakpoint as Breakpoint, mode: raw.mode as LayoutMode, visible: raw.visible })
  })
  for (const regionId of regionIds) for (const breakpoint of BREAKPOINTS) if (!seen.has(`${regionId}:${breakpoint}`)) issues.push(`layoutPlan.responsive: missing rule for ${regionId}:${breakpoint}`)
  return rules.length === expectedCount ? rules : undefined
}

function validateNavigation(value: unknown, capabilities: ComponentCapabilities, issues: string[]): NavigationPlacement | null | undefined {
  const candidates = findNavigationCandidates(capabilities)
  if (value === null) {
    if (candidates.length > 0) issues.push('layoutPlan.navigation: a navigate-capable component was selected but no placement was declared')
    return candidates.length > 0 ? undefined : null
  }
  if (!isObject(value)) { issues.push('layoutPlan.navigation: object or null required'); return undefined }
  exactKeys(value, ['regionId', 'component', 'placement'], 'layoutPlan.navigation', issues)
  const validStrings = nonEmptyString(value.regionId, 'layoutPlan.navigation.regionId', issues, 80) && nonEmptyString(value.component, 'layoutPlan.navigation.component', issues, 80)
  if (!validStrings) return undefined
  if (candidates.length === 0) { issues.push('layoutPlan.navigation: no navigate-capable component was selected; navigation must be null'); return undefined }
  const isCandidate = candidates.some((candidate) => candidate.regionId === value.regionId && candidate.component === value.component)
  if (!isCandidate) { issues.push('layoutPlan.navigation: does not reference a selected navigate-capable component'); return undefined }
  if (!PLACEMENT_SLOTS.has(value.placement as NavigationPlacementSlot)) { issues.push('layoutPlan.navigation.placement: invalid placement slot'); return undefined }
  return { regionId: value.regionId as string, component: value.component as V3ComponentType, placement: value.placement as NavigationPlacementSlot }
}
