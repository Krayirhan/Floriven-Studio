import { type InteractionCapability } from './screen-jobs.ts'
import { canonical, exactKeys, isObject, nonEmptyString, stringList, uniqueIds, type ValidationResult } from './validation.ts'
import { type UXStructure } from './ux-structure.ts'

export const COMPONENT_CAPABILITIES_VERSION = '1.0.0' as const

/** Baseline capability every region needs regardless of interactions: something must render its data. */
export type Capability = InteractionCapability | 'display'

/**
 * Functional subset of the canonical renderer allowlist (apps/web/src/features/studio/canvas/componentRegistry.ts).
 * Pure layout primitives (Screen, SafeArea, ScrollView, Stack, Row, Grid, Divider) carry no capability of their
 * own and are excluded — they belong to LayoutPlan, not capability selection.
 */
export const V3_COMPONENT_TYPES = [
  'Text', 'Image', 'Icon', 'Button', 'IconButton', 'TextField', 'SearchField', 'Checkbox', 'Switch', 'Card', 'ListItem',
  'Badge', 'Avatar', 'TabBar', 'BottomNavigation', 'TopAppBar', 'Modal', 'Form', 'Progress',
  'Metric', 'Chart', 'SegmentedControl', 'FloatingActionButton',
  'Calendar', 'Timeline', 'Gallery', 'KanbanBoard', 'MapView',
  'CareSummary', 'MedicationTimeline', 'MedicationDoseRow', 'HealthMetric', 'UnitInput',
  'RangeChart', 'TargetRange', 'StatusAlert', 'SafetyNotice', 'SuccessFeedback',
  'EditorialHero', 'FeatureStory', 'StoryCard', 'Byline', 'MetadataStrip',
  'PullQuote', 'SectionIndex', 'ArchiveEntry',
  'CommerceHero', 'ProductCard', 'PriceBlock', 'ProductGallery',
  'VariantSelector', 'CartLine', 'OrderSummary', 'DeliveryPromise',
  'LearningHero', 'XpProgress', 'StreakBadge', 'LessonCard',
  'RoadmapStep', 'QuizChoice', 'AnswerFeedback', 'AchievementBadge',
  'CommandSummary', 'SignalChart', 'RiskIndicator', 'OperationRow',
  'IncidentTimeline', 'DataMatrix', 'ControlToggle', 'AuditEntry',
] as const
export type V3ComponentType = typeof V3_COMPONENT_TYPES[number]
const V3_COMPONENT_TYPE_SET = new Set<string>(V3_COMPONENT_TYPES)

/** Which capabilities each canonical component can actually satisfy — the only source of truth for selection. */
export const COMPONENT_CAPABILITY_MATRIX: Record<V3ComponentType, Capability[]> = {
  Text: ['display'], Image: ['display'], Icon: ['display'],
  Button: ['display', 'select'], IconButton: ['display', 'select'],
  TextField: ['display', 'create', 'edit'], SearchField: ['display', 'search'],
  Checkbox: ['display', 'select', 'edit'], Switch: ['display', 'select', 'edit'],
  Card: ['display', 'select', 'inspect'], ListItem: ['display', 'select', 'inspect'],
  Badge: ['display'], Avatar: ['display', 'select'],
  TabBar: ['display', 'navigate', 'filter'], BottomNavigation: ['display', 'navigate'], TopAppBar: ['display', 'navigate', 'search'],
  Modal: ['display'], Form: ['display', 'create', 'edit'], Progress: ['display'],
  Metric: ['display', 'compare'], Chart: ['display', 'visualize', 'compare'],
  SegmentedControl: ['display', 'select', 'filter'], FloatingActionButton: ['display', 'create'],
  Calendar: ['display', 'schedule', 'select', 'inspect'], Timeline: ['display', 'visualize', 'inspect'],
  Gallery: ['display', 'select', 'inspect'], KanbanBoard: ['display', 'reorder', 'select', 'inspect'], MapView: ['display', 'visualize', 'select'],
  CareSummary: ['display'], MedicationTimeline: ['display', 'visualize', 'inspect'], MedicationDoseRow: ['display', 'inspect', 'edit'],
  HealthMetric: ['display', 'compare'], UnitInput: ['display', 'create', 'edit'],
  RangeChart: ['display', 'visualize', 'compare'], TargetRange: ['display', 'compare'],
  StatusAlert: ['display'], SafetyNotice: ['display'], SuccessFeedback: ['display'],
  EditorialHero: ['display'], FeatureStory: ['display', 'select'], StoryCard: ['display', 'select', 'inspect'],
  Byline: ['display'], MetadataStrip: ['display'], PullQuote: ['display'],
  SectionIndex: ['display', 'navigate'], ArchiveEntry: ['display', 'select', 'inspect'],
  CommerceHero: ['display'], ProductCard: ['display', 'select', 'inspect'], PriceBlock: ['display', 'compare'],
  ProductGallery: ['display', 'select', 'inspect'], VariantSelector: ['display', 'select', 'filter'],
  CartLine: ['display', 'edit', 'delete'], OrderSummary: ['display'], DeliveryPromise: ['display'],
  LearningHero: ['display'], XpProgress: ['display', 'compare'], StreakBadge: ['display'],
  LessonCard: ['display', 'select', 'inspect'], RoadmapStep: ['display', 'inspect', 'navigate'],
  QuizChoice: ['display', 'select'], AnswerFeedback: ['display'], AchievementBadge: ['display'],
  CommandSummary: ['display'], SignalChart: ['display', 'visualize', 'compare'], RiskIndicator: ['display', 'compare'],
  OperationRow: ['display', 'select', 'inspect'], IncidentTimeline: ['display', 'visualize', 'inspect'],
  DataMatrix: ['display', 'compare', 'filter'], ControlToggle: ['display', 'select', 'edit'], AuditEntry: ['display', 'inspect'],
}

export type RegionCapabilityRequirement = { regionId: string; requiredCapabilities: Capability[] }

/** Pure, deterministic derivation from UXStructure — never asked of the model, never influenced by wording or title. */
export function deriveRegionCapabilities(structure: UXStructure): RegionCapabilityRequirement[] {
  return structure.regions.map((region) => {
    const interactionCapabilities = structure.actions.filter((action) => action.regionId === region.id).map((action) => action.interaction as Capability)
    const capabilities = new Set<Capability>(['display', ...interactionCapabilities])
    return { regionId: region.id, requiredCapabilities: [...capabilities] }
  })
}

export type CapabilityJustification = { capability: Capability; component: V3ComponentType; reason: string }
export type RegionComponentSelection = { regionId: string; selectedComponents: V3ComponentType[]; justification: CapabilityJustification[] }
export type ComponentCapabilities = { version: typeof COMPONENT_CAPABILITIES_VERSION; screenJobId: string; regions: RegionComponentSelection[] }

export const COMPONENT_CAPABILITIES_JSON_SCHEMA = {
  $id: 'floriven.generation-v3.ComponentCapabilities@1', type: 'object', additionalProperties: false,
  required: ['version', 'screenJobId', 'regions'],
  properties: {
    version: { const: COMPONENT_CAPABILITIES_VERSION }, screenJobId: { type: 'string' },
    regions: { type: 'array', minItems: 2, maxItems: 10 },
  },
} as const

export function validateComponentCapabilities(input: unknown, structure: UXStructure): ValidationResult<ComponentCapabilities> {
  const issues: string[] = []
  if (!isObject(input)) return { ok: false, issues: ['componentCapabilities: object required'] }
  exactKeys(input, ['version', 'screenJobId', 'regions'], 'componentCapabilities', issues)
  if (input.version !== COMPONENT_CAPABILITIES_VERSION) issues.push('componentCapabilities.version: unsupported version')
  if (input.screenJobId !== structure.screenJobId) issues.push(`componentCapabilities.screenJobId: must reference ${structure.screenJobId}`)

  const requirements = deriveRegionCapabilities(structure)
  const requirementByRegion = new Map(requirements.map((requirement) => [requirement.regionId, requirement]))
  const regions = validateRegions(input.regions, requirementByRegion, issues)
  if (!regions) return { ok: false, issues }

  const coveredRegionIds = new Set(regions.map((region) => region.regionId))
  for (const requirement of requirements) if (!coveredRegionIds.has(requirement.regionId)) issues.push(`componentCapabilities.regions: missing selection for region ${requirement.regionId}`)

  return issues.length ? { ok: false, issues } : { ok: true, value: input as ComponentCapabilities }
}

function validateRegions(value: unknown, requirementByRegion: Map<string, RegionCapabilityRequirement>, issues: string[]): RegionComponentSelection[] | undefined {
  if (!Array.isArray(value) || value.length < 2 || value.length > 10) { issues.push('componentCapabilities.regions: 2-10 selections required'); return undefined }
  const regions: RegionComponentSelection[] = []
  value.forEach((raw, index) => {
    const path = `componentCapabilities.regions[${index}]`
    if (!isObject(raw)) { issues.push(`${path}: object required`); return }
    exactKeys(raw, ['regionId', 'selectedComponents', 'justification'], path, issues)
    const validRegionId = nonEmptyString(raw.regionId, `${path}.regionId`, issues, 80)
    const requirement = validRegionId && typeof raw.regionId === 'string' ? requirementByRegion.get(raw.regionId) : undefined
    if (validRegionId && !requirement) { issues.push(`${path}.regionId: unknown region ${String(raw.regionId)}`); return }
    if (!requirement) return

    const validComponents = stringList(raw.selectedComponents, `${path}.selectedComponents`, issues, { min: 1, max: 6 })
    if (validComponents) (raw.selectedComponents as string[]).forEach((type, componentIndex) => {
      if (!V3_COMPONENT_TYPE_SET.has(type)) issues.push(`${path}.selectedComponents[${componentIndex}]: unknown component ${type}`)
    })

    const justification = validateJustification(raw.justification, `${path}.justification`, requirement, issues)

    if (validComponents && justification) {
      const selected = raw.selectedComponents as V3ComponentType[]
      validateCoverage(selected, justification, requirement, path, issues)
      regions.push({ regionId: raw.regionId as string, selectedComponents: selected, justification })
    }
  })
  uniqueIds(regions.map((region) => ({ id: region.regionId })), 'componentCapabilities.regions', issues)
  return regions
}

function validateJustification(value: unknown, path: string, requirement: RegionCapabilityRequirement, issues: string[]): CapabilityJustification[] | undefined {
  if (!Array.isArray(value) || value.length < 1 || value.length > 10) { issues.push(`${path}: 1-10 entries required`); return undefined }
  const requiredSet = new Set(requirement.requiredCapabilities)
  const entries: CapabilityJustification[] = []
  value.forEach((raw, index) => {
    const entryPath = `${path}[${index}]`
    if (!isObject(raw)) { issues.push(`${entryPath}: object required`); return }
    exactKeys(raw, ['capability', 'component', 'reason'], entryPath, issues)
    const valid = nonEmptyString(raw.capability, `${entryPath}.capability`, issues, 40)
      && nonEmptyString(raw.component, `${entryPath}.component`, issues, 80)
      && nonEmptyString(raw.reason, `${entryPath}.reason`, issues, 240)
    if (!valid) return
    const capability = raw.capability as string
    const component = raw.component as string
    if (!requiredSet.has(capability as Capability)) { issues.push(`${entryPath}.capability: "${capability}" not required by region ${requirement.regionId}`); return }
    if (!V3_COMPONENT_TYPE_SET.has(component)) { issues.push(`${entryPath}.component: unknown component ${component}`); return }
    const supports = COMPONENT_CAPABILITY_MATRIX[component as V3ComponentType].includes(capability as Capability)
    if (!supports) { issues.push(`${entryPath}: ${component} does not support capability "${capability}"`); return }
    entries.push({ capability: capability as Capability, component: component as V3ComponentType, reason: raw.reason as string })
  })
  return entries.length === (Array.isArray(value) ? value.length : 0) ? entries : undefined
}

function validateCoverage(selected: V3ComponentType[], justification: CapabilityJustification[], requirement: RegionCapabilityRequirement, path: string, issues: string[]): void {
  const justifiedCapabilities = canonicalSet(justification.map((entry) => entry.capability))
  for (const capability of requirement.requiredCapabilities) if (!justifiedCapabilities.has(canonical(capability))) issues.push(`${path}: missing justification for capability "${capability}"`)

  const justifiedComponents = new Set(justification.map((entry) => entry.component))
  for (const component of selected) if (!justifiedComponents.has(component)) issues.push(`${path}.selectedComponents: ${component} is not justified by any required capability`)
  for (const component of justifiedComponents) if (!selected.includes(component)) issues.push(`${path}: justification references ${component} which is not in selectedComponents`)
}

function canonicalSet(values: string[]): Set<string> {
  return new Set(values.map(canonical))
}
