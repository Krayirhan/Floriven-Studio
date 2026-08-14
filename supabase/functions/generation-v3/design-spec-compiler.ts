import { type ComponentCapabilities, type V3ComponentType } from './component-capabilities.ts'
import { type ContentPlan } from './content-plan.ts'
import { type Density, type LayoutMode, type LayoutPlan, type SizeMode } from './layout-plan.ts'
import { type ScreenJob } from './screen-jobs.ts'
import { canonical } from './validation.ts'
import { type UXStructure } from './ux-structure.ts'

export const DESIGN_SPEC_SCREEN_VERSION = '1.0.0' as const

export type A11y = { role: string; label: string; hint: string | null; state: string | null; order: number }
export type DataBinding = { dataPath: string }
export type InteractionEvent = { event: 'press'; action: { type: 'setLocalState'; params: { interaction: string; actionId: string } } }

/** Namespaced per DESIGN_SPEC.md#2 ("bilinmeyen property... extensions alanında ad alanlı tutulur") — traceability only, never rendered. */
export type V3Extensions = { 'floriven.v3': { regionId: string; sourceNodeId: string | null } }

export type LeafNode = {
  id: string
  type: V3ComponentType
  props: Record<string, string>
  layout: { size: SizeMode }
  bindings: DataBinding[]
  interactions: InteractionEvent[]
  a11y: A11y
  visibility: true
  extensions: V3Extensions
}
export type RegionContainerNode = {
  id: string
  type: 'Stack'
  props: Record<string, never>
  layout: { mode: LayoutMode; gap: string }
  children: LeafNode[]
  bindings: DataBinding[]
  a11y: A11y
  visibility: true
  extensions: V3Extensions
}
export type ScreenRootNode = {
  id: string
  type: 'Screen'
  props: Record<string, never>
  layout: { mode: 'column'; gap: string }
  children: RegionContainerNode[]
  bindings: DataBinding[]
  a11y: A11y
  visibility: true
}
export type DesignSpecScreen = { id: string; name: string; route: string; root: ScreenRootNode }

export class DesignSpecCompileError extends Error {
  constructor(public readonly issues: string[]) {
    super('Generation V3 DesignSpec compile failed')
    this.name = 'DesignSpecCompileError'
  }
}

const DENSITY_GAP: Record<Density, string> = { compact: 'space.2', comfortable: 'space.4', spacious: 'space.6' }

function slug(value: string): string {
  const cleaned = value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '')
  return cleaned || 'x'
}

/**
 * Deterministic, LLM-free translation of the validated planning contracts into a canonical
 * DesignSpec screen node tree (docs/02-architecture/DESIGN_SPEC.md#4). Never invents content,
 * components or bindings — every node traces back to a UXStructure/LayoutPlan/ContentPlan fact.
 */
export function compileDesignSpecScreen(job: ScreenJob, structure: UXStructure, capabilities: ComponentCapabilities, layout: LayoutPlan, content: ContentPlan): DesignSpecScreen {
  const ids = [structure.screenJobId, capabilities.screenJobId, layout.screenJobId, content.screenJobId]
  if (ids.some((id) => id !== job.id)) throw new DesignSpecCompileError([`compile: all inputs must reference screen job ${job.id}`])

  const layoutRegionById = new Map(layout.regions.map((region) => [region.regionId, region]))
  const contentRegionById = new Map(content.regions.map((region) => [region.regionId, region]))
  const capabilitiesRegionById = new Map(capabilities.regions.map((region) => [region.regionId, region]))
  const accessibilityByRegion = new Map(structure.accessibility.map((entry) => [entry.regionId, entry]))
  const actionsByRegion = new Map<string, typeof structure.actions>()
  for (const action of structure.actions) actionsByRegion.set(action.regionId, [...(actionsByRegion.get(action.regionId) ?? []), action])

  const screenId = `scr_${slug(job.id)}`
  const containers = structure.informationHierarchy.map((regionId) => {
    const layoutRegion = layoutRegionById.get(regionId)
    const contentRegion = contentRegionById.get(regionId)
    const capabilitiesRegion = capabilitiesRegionById.get(regionId)
    const accessibility = accessibilityByRegion.get(regionId)
    if (!layoutRegion || !contentRegion || !capabilitiesRegion || !accessibility) throw new DesignSpecCompileError([`compile: incomplete region data for ${regionId}`])

    const leaves = [...layoutRegion.nodes].sort((a, b) => a.order - b.order).map((layoutNode) => {
      const nodeContent = contentRegion.nodes.find((node) => node.nodeId === layoutNode.id)
      if (!nodeContent) throw new DesignSpecCompileError([`compile: missing content for node ${layoutNode.id}`])
      const props = Object.fromEntries(nodeContent.fields.map((field) => [field.field, field.value]))
      const joinedText = canonical(nodeContent.fields.map((field) => field.value).join(' | '))
      const bindings: DataBinding[] = structureDataBindingsFor(regionId, structure)
        .filter((term) => joinedText.includes(canonical(term)))
        .map((dataPath) => ({ dataPath }))
      const interactions: InteractionEvent[] = (actionsByRegion.get(regionId) ?? [])
        .filter((action) => capabilitiesRegion.justification.some((entry) => entry.capability === action.interaction && entry.component === layoutNode.component))
        .map((action) => ({ event: 'press', action: { type: 'setLocalState', params: { interaction: action.interaction, actionId: action.id } } }))
      const leaf: LeafNode = {
        id: `node_${slug(job.id)}_${slug(layoutNode.id)}`,
        type: layoutNode.component,
        props,
        layout: { size: layoutNode.size },
        bindings,
        interactions,
        a11y: { role: 'content', label: nodeContent.fields[0]?.value ?? layoutNode.component, hint: null, state: null, order: layoutNode.order },
        visibility: true,
        extensions: { 'floriven.v3': { regionId, sourceNodeId: layoutNode.id } },
      }
      return leaf
    })

    const container: RegionContainerNode = {
      id: `node_${slug(job.id)}_${slug(regionId)}`,
      type: 'Stack',
      props: {},
      layout: { mode: layoutRegion.mode, gap: DENSITY_GAP[layoutRegion.density] },
      children: leaves,
      bindings: [],
      a11y: { role: accessibility.role, label: accessibility.announcement, hint: null, state: null, order: accessibility.focusOrder },
      visibility: true,
      extensions: { 'floriven.v3': { regionId, sourceNodeId: null } },
    }
    return container
  })

  const root: ScreenRootNode = {
    id: `node_${slug(job.id)}_root`,
    type: 'Screen',
    props: {},
    layout: { mode: 'column', gap: 'space.4' },
    children: containers,
    bindings: [],
    a11y: { role: 'main', label: job.name, hint: null, state: null, order: 0 },
    visibility: true,
  }

  const screen: DesignSpecScreen = { id: screenId, name: job.name, route: `/${slug(job.id)}`, root }
  const issues = checkInvariants(screen)
  if (issues.length) throw new DesignSpecCompileError(issues)
  return screen
}

function structureDataBindingsFor(regionId: string, structure: UXStructure): string[] {
  return structure.regions.find((region) => region.id === regionId)?.dataBindings ?? []
}

/** Defensive self-check on the compiler's own output — should never fail for consistent inputs. */
function checkInvariants(screen: DesignSpecScreen): string[] {
  const issues: string[] = []
  const seenIds = new Set<string>()
  const urlSafe = /^[a-z0-9_-]+$/i
  function visit(node: { id: string; type: string }): void {
    if (!urlSafe.test(node.id)) issues.push(`${node.id}: id must be URL-safe`)
    if (seenIds.has(node.id)) issues.push(`${node.id}: duplicate node id`)
    seenIds.add(node.id)
  }
  visit(screen.root)
  for (const container of screen.root.children) {
    visit(container)
    for (const leaf of container.children) visit(leaf)
  }
  if (!screen.root.children.length) issues.push('root: at least one region container required')
  return issues
}
