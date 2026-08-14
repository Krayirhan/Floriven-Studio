import { type ComponentCapabilities } from './component-capabilities.ts'
import { type A11y, type DataBinding, type DesignSpecScreen, type InteractionEvent } from './design-spec-compiler.ts'
import { type ScreenJob } from './screen-jobs.ts'
import { runStaticCritics, type StaticCriticsReport, type StaticViolation } from './static-critics.ts'
import { canonical } from './validation.ts'
import { type UXStructure } from './ux-structure.ts'

export const TARGETED_REPAIR_VERSION = '1.0.0' as const

export type RepairOperationType = 'replaceA11y' | 'replaceBindings' | 'replaceInteractions'
export type RepairOperation = { op: RepairOperationType; nodeId: string }
export type RepairResult = {
  version: typeof TARGETED_REPAIR_VERSION
  screenJobId: string
  screen: DesignSpecScreen
  operations: RepairOperation[]
  unrepairable: StaticViolation[]
}

/**
 * Recomputes only *derived* fields (a11y role/label, data bindings, interaction events) from
 * already-validated upstream facts (UXStructure, ComponentCapabilities) and patches back exactly
 * the nodes whose derived value drifted — nothing else in the tree is touched or regenerated.
 *
 * This never invents props, children or new nodes: content gaps (EMPTY_REGION, EMPTY_SCREEN,
 * INCOMPLETE_COMPLETION_EVIDENCE) have no derivable correct value, so they are reported as
 * `unrepairable` and must trigger re-generation upstream. Per ADR-0009 §9: repair patches
 * identified regions, it does not regenerate the document.
 *
 * Idempotent: running repair on an already-repaired (or already-passing) screen produces zero
 * operations, because every patch is "recompute from source of truth, apply only if different".
 */
export function runTargetedRepair(job: ScreenJob, structure: UXStructure, capabilities: ComponentCapabilities, screen: DesignSpecScreen, report: StaticCriticsReport): RepairResult {
  if (report.passed) return { version: TARGETED_REPAIR_VERSION, screenJobId: job.id, screen, operations: [], unrepairable: [] }

  const accessibilityByRegion = new Map(structure.accessibility.map((entry) => [entry.regionId, entry]))
  const capabilitiesByRegion = new Map(capabilities.regions.map((region) => [region.regionId, region]))
  const dataBindingsByRegion = new Map(structure.regions.map((region) => [region.id, region.dataBindings]))
  const actionsByRegion = new Map<string, typeof structure.actions>()
  for (const action of structure.actions) actionsByRegion.set(action.regionId, [...(actionsByRegion.get(action.regionId) ?? []), action])

  const operations: RepairOperation[] = []

  const patchedChildren = screen.root.children.map((container) => {
    const regionId = container.extensions['floriven.v3'].regionId
    let patchedContainer = container

    const expectedContainerA11y = accessibilityByRegion.get(regionId)
    if (expectedContainerA11y) {
      const recomputed: A11y = { role: expectedContainerA11y.role, label: expectedContainerA11y.announcement, hint: container.a11y.hint, state: container.a11y.state, order: expectedContainerA11y.focusOrder }
      if (!a11yEquals(container.a11y, recomputed)) {
        operations.push({ op: 'replaceA11y', nodeId: container.id })
        patchedContainer = { ...container, a11y: recomputed }
      }
    }

    const capabilitiesRegion = capabilitiesByRegion.get(regionId)
    const regionActions = actionsByRegion.get(regionId) ?? []
    const regionDataBindings = dataBindingsByRegion.get(regionId) ?? []

    const patchedLeaves = patchedContainer.children.map((leaf) => {
      let patchedLeaf = leaf

      const recomputedInteractions: InteractionEvent[] = capabilitiesRegion
        ? regionActions
          .filter((action) => capabilitiesRegion.justification.some((entry) => entry.capability === action.interaction && entry.component === leaf.type))
          .map((action) => ({ event: 'press', action: { type: 'setLocalState', params: { interaction: action.interaction, actionId: action.id } } }))
        : leaf.interactions
      if (!interactionsEqual(patchedLeaf.interactions, recomputedInteractions)) {
        operations.push({ op: 'replaceInteractions', nodeId: patchedLeaf.id })
        patchedLeaf = { ...patchedLeaf, interactions: recomputedInteractions }
      }

      const propValues: string[] = []
      for (const val of Object.values(patchedLeaf.props as Record<string, unknown>)) {
        if (typeof val === 'string') propValues.push(val)
        else if (typeof val === 'number' || typeof val === 'boolean') propValues.push(String(val))
        else if (Array.isArray(val)) {
          for (const item of val) {
            if (typeof item === 'string') propValues.push(item)
            else if (typeof item === 'number') propValues.push(String(item))
          }
        }
      }
      const joinedText = canonical(propValues.join(' | '))
      const recomputedBindings: DataBinding[] = regionDataBindings.filter((term) => joinedText.includes(canonical(term))).map((dataPath) => ({ dataPath }))
      if (!bindingsEqual(patchedLeaf.bindings, recomputedBindings)) {
        operations.push({ op: 'replaceBindings', nodeId: patchedLeaf.id })
        patchedLeaf = { ...patchedLeaf, bindings: recomputedBindings }
      }

      const fallbackLabel = propValues[0] ?? patchedLeaf.a11y.label
      const recomputedLeafA11y: A11y = { ...patchedLeaf.a11y, label: patchedLeaf.a11y.label.trim() ? patchedLeaf.a11y.label : fallbackLabel, role: patchedLeaf.a11y.role.trim() ? patchedLeaf.a11y.role : 'content' }
      if (!a11yEquals(patchedLeaf.a11y, recomputedLeafA11y)) {
        operations.push({ op: 'replaceA11y', nodeId: patchedLeaf.id })
        patchedLeaf = { ...patchedLeaf, a11y: recomputedLeafA11y }
      }

      return patchedLeaf
    })

    return { ...patchedContainer, children: patchedLeaves }
  })

  const patchedScreen: DesignSpecScreen = { ...screen, root: { ...screen.root, children: patchedChildren } }
  const finalReport = runStaticCritics(job, structure, patchedScreen)

  return { version: TARGETED_REPAIR_VERSION, screenJobId: job.id, screen: patchedScreen, operations, unrepairable: finalReport.violations }
}

function a11yEquals(a: A11y, b: A11y): boolean {
  return a.role === b.role && a.label === b.label && a.hint === b.hint && a.state === b.state && a.order === b.order
}
function bindingsEqual(a: DataBinding[], b: DataBinding[]): boolean {
  return a.length === b.length && a.every((entry, index) => entry.dataPath === b[index]?.dataPath)
}
function interactionsEqual(a: InteractionEvent[], b: InteractionEvent[]): boolean {
  return a.length === b.length && a.every((entry, index) => entry.action.params.interaction === b[index]?.action.params.interaction && entry.action.params.actionId === b[index]?.action.params.actionId)
}
