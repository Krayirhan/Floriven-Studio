import { INTERACTIONS, type InteractionCapability, type ScreenJob } from './screen-jobs.ts'
import { canonical, exactKeys, isObject, nonEmptyString, stringList, uniqueIds, type ValidationResult } from './validation.ts'

export const UX_STRUCTURE_VERSION = '1.0.0' as const
export type ScreenState = 'empty' | 'loading' | 'error' | 'ready'

export type UXRegion = { id: string; task: string; dataBindings: string[]; states: ScreenState[] }
export type UXAction = { id: string; regionId: string; interaction: InteractionCapability; intent: string }
export type UXFlowStep = { order: number; actionId: string; description: string }
export type UXCompletionEvidence = { criterion: string; regionId: string; evidence: string }
export type UXNavigationIntent = { entryPoints: string[]; destinationJobIds: string[]; exitIntent: string }
export type UXResponsiveIntent = { regionId: string; narrowBehavior: string; wideBehavior: string }
export type UXAccessibilityIntent = { regionId: string; role: string; focusOrder: number; announcement: string }

export type UXStructure = {
  version: typeof UX_STRUCTURE_VERSION
  screenJobId: string
  regions: UXRegion[]
  /** Content priority order, most important region first — a permutation of regions[].id. */
  informationHierarchy: string[]
  actions: UXAction[]
  flow: UXFlowStep[]
  completionEvidence: UXCompletionEvidence[]
  navigation: UXNavigationIntent
  responsive: UXResponsiveIntent[]
  accessibility: UXAccessibilityIntent[]
}

const STATES = new Set<ScreenState>(['empty', 'loading', 'error', 'ready'])

/** Visual/component vocabulary this stage must never emit — UXStructure is presentation-free. */
const LEAK_PATTERNS: RegExp[] = [
  /#[0-9a-fA-F]{3,8}\b/,
  /\b\d+(\.\d+)?(px|rem|em|vh|vw|pt)\b/i,
  /\b(button|modal|dropdown|carousel|accordion|navbar|sidebar|tooltip|slider|checkbox|radio button|avatar|badge|chip|dialog|drawer|toast|icon|data table|bar chart|pie chart|grid layout|tab bar|breadcrumb|pagination|border[- ]?radius|box[- ]?shadow|font[- ]?family|font[- ]?size|background[- ]?color|gradient|bold text|italic text)\b/i,
]

function scanForLeaks(value: string, path: string, issues: string[]): void {
  for (const pattern of LEAK_PATTERNS) {
    if (pattern.test(value)) { issues.push(`${path}: visual or component leakage detected`); return }
  }
}

function canonicalSet(values: string[]): Set<string> {
  return new Set(values.map(canonical))
}

export const UX_STRUCTURE_JSON_SCHEMA = {
  $id: 'floriven.generation-v3.UXStructure@1', type: 'object', additionalProperties: false,
  required: ['version', 'screenJobId', 'regions', 'informationHierarchy', 'actions', 'flow', 'completionEvidence', 'navigation', 'responsive', 'accessibility'],
  properties: {
    version: { const: UX_STRUCTURE_VERSION }, screenJobId: { type: 'string' },
    regions: {
      type: 'array', minItems: 2, maxItems: 10,
      items: {
        type: 'object', additionalProperties: false, required: ['id', 'task', 'dataBindings', 'states'],
        properties: {
          id: { type: 'string' }, task: { type: 'string', description: 'purpose only — no component name, CSS, color or pixel value' },
          dataBindings: { type: 'array', minItems: 1, items: { type: 'string', description: 'must be one of the screen job\'s requiredData terms, verbatim' } },
          states: { type: 'array', minItems: 1, maxItems: 4, items: { type: 'string', enum: ['empty', 'loading', 'error', 'ready'] }, description: 'must include ready' },
        },
      },
    },
    informationHierarchy: { type: 'array', description: 'a permutation of every regions[].id, most important region first', items: { type: 'string' } },
    actions: {
      type: 'array', minItems: 1, maxItems: 20,
      items: {
        type: 'object', additionalProperties: false, required: ['id', 'regionId', 'interaction', 'intent'],
        properties: { id: { type: 'string' }, regionId: { type: 'string', description: 'must reference regions[].id' }, interaction: { type: 'string', description: 'must be one of the screen job\'s requiredInteractions' }, intent: { type: 'string' } },
      },
    },
    flow: {
      type: 'array', minItems: 1, maxItems: 20,
      items: { type: 'object', additionalProperties: false, required: ['order', 'actionId', 'description'], properties: { order: { type: 'integer', minimum: 1 }, actionId: { type: 'string', description: 'must reference actions[].id' }, description: { type: 'string' } } },
    },
    completionEvidence: {
      type: 'array', minItems: 1, maxItems: 10,
      items: { type: 'object', additionalProperties: false, required: ['criterion', 'regionId', 'evidence'], properties: { criterion: { type: 'string', description: 'must be one of the screen job\'s completionCriteria, verbatim' }, regionId: { type: 'string' }, evidence: { type: 'string' } } },
    },
    navigation: {
      type: 'object', additionalProperties: false, required: ['entryPoints', 'destinationJobIds', 'exitIntent'],
      properties: { entryPoints: { type: 'array', minItems: 1, items: { type: 'string' } }, destinationJobIds: { type: 'array', items: { type: 'string' } }, exitIntent: { type: 'string' } },
    },
    responsive: {
      type: 'array', description: 'exactly one entry per region',
      items: { type: 'object', additionalProperties: false, required: ['regionId', 'narrowBehavior', 'wideBehavior'], properties: { regionId: { type: 'string' }, narrowBehavior: { type: 'string' }, wideBehavior: { type: 'string' } } },
    },
    accessibility: {
      type: 'array', description: 'exactly one entry per region',
      items: { type: 'object', additionalProperties: false, required: ['regionId', 'role', 'focusOrder', 'announcement'], properties: { regionId: { type: 'string' }, role: { type: 'string' }, focusOrder: { type: 'integer', minimum: 1 }, announcement: { type: 'string' } } },
    },
  },
} as const

export function validateUXStructure(input: unknown, job: ScreenJob): ValidationResult<UXStructure> {
  const issues: string[] = []
  if (!isObject(input)) return { ok: false, issues: ['uxStructure: object required'] }
  exactKeys(input, ['version', 'screenJobId', 'regions', 'informationHierarchy', 'actions', 'flow', 'completionEvidence', 'navigation', 'responsive', 'accessibility'], 'uxStructure', issues)
  if (input.version !== UX_STRUCTURE_VERSION) issues.push('uxStructure.version: unsupported version')
  if (input.screenJobId !== job.id) issues.push(`uxStructure.screenJobId: must reference ${job.id}`)

  const regions = validateRegions(input.regions, issues)
  const regionIds = new Set((regions ?? []).map((region) => region.id))
  const informationHierarchy = validateInformationHierarchy(input.informationHierarchy, regionIds, issues)
  const actions = validateActions(input.actions, regionIds, issues)
  const actionIds = new Set((actions ?? []).map((action) => action.id))
  const flow = validateFlow(input.flow, actionIds, issues)
  const completionEvidence = validateCompletionEvidence(input.completionEvidence, regionIds, issues)
  const navigation = validateNavigation(input.navigation, issues)
  const responsive = validateResponsive(input.responsive, regionIds, issues)
  const accessibility = validateAccessibility(input.accessibility, regionIds, issues)

  if (!regions || !informationHierarchy || !actions || !flow || !completionEvidence || !navigation || !responsive || !accessibility) return { ok: false, issues }

  validateCoverage(job, regions, actions, completionEvidence, navigation, issues)
  return issues.length ? { ok: false, issues } : { ok: true, value: input as UXStructure }
}

function validateInformationHierarchy(value: unknown, regionIds: Set<string>, issues: string[]): string[] | undefined {
  const path = 'uxStructure.informationHierarchy'
  if (!stringList(value, path, issues, { min: regionIds.size, max: regionIds.size })) return undefined
  const ordered = value as string[]
  const orderedSet = new Set(ordered)
  if (orderedSet.size !== ordered.length) { issues.push(`${path}: must not repeat a region id`); return undefined }
  for (const id of ordered) if (!regionIds.has(id)) issues.push(`${path}: unknown region ${id}`)
  for (const id of regionIds) if (!orderedSet.has(id)) issues.push(`${path}: missing region ${id}`)
  return ordered
}

function validateRegions(value: unknown, issues: string[]): UXRegion[] | undefined {
  if (!Array.isArray(value) || value.length < 2 || value.length > 10) { issues.push('uxStructure.regions: 2-10 regions required'); return undefined }
  const regions: UXRegion[] = []
  value.forEach((raw, index) => {
    const path = `uxStructure.regions[${index}]`
    if (!isObject(raw)) { issues.push(`${path}: object required`); return }
    exactKeys(raw, ['id', 'task', 'dataBindings', 'states'], path, issues)
    const valid = nonEmptyString(raw.id, `${path}.id`, issues, 80)
      && nonEmptyString(raw.task, `${path}.task`, issues, 240)
      && stringList(raw.dataBindings, `${path}.dataBindings`, issues, { min: 1, max: 15 })
      && stringList(raw.states, `${path}.states`, issues, { min: 1, max: 4 })
    if (typeof raw.task === 'string') scanForLeaks(raw.task, `${path}.task`, issues)
    if (Array.isArray(raw.states)) {
      if (!raw.states.every((state) => typeof state === 'string' && STATES.has(state as ScreenState))) issues.push(`${path}.states: invalid state value`)
      else if (!raw.states.includes('ready')) issues.push(`${path}.states: must include ready`)
    }
    if (valid) regions.push(raw as UXRegion)
  })
  uniqueIds(regions, 'uxStructure.regions', issues)
  const taskCanon = regions.map((region) => canonical(region.task))
  if (new Set(taskCanon).size !== taskCanon.length) issues.push('uxStructure.regions: region tasks must be distinct')
  return regions
}

function validateActions(value: unknown, regionIds: Set<string>, issues: string[]): UXAction[] | undefined {
  if (!Array.isArray(value) || value.length < 1 || value.length > 20) { issues.push('uxStructure.actions: 1-20 actions required'); return undefined }
  const actions: UXAction[] = []
  value.forEach((raw, index) => {
    const path = `uxStructure.actions[${index}]`
    if (!isObject(raw)) { issues.push(`${path}: object required`); return }
    exactKeys(raw, ['id', 'regionId', 'interaction', 'intent'], path, issues)
    const valid = nonEmptyString(raw.id, `${path}.id`, issues, 80)
      && nonEmptyString(raw.regionId, `${path}.regionId`, issues, 80)
      && nonEmptyString(raw.interaction, `${path}.interaction`, issues, 40)
      && nonEmptyString(raw.intent, `${path}.intent`, issues, 240)
    if (typeof raw.intent === 'string') scanForLeaks(raw.intent, `${path}.intent`, issues)
    if (typeof raw.regionId === 'string' && !regionIds.has(raw.regionId)) issues.push(`${path}.regionId: unknown region ${raw.regionId}`)
    if (typeof raw.interaction === 'string' && !INTERACTIONS.has(raw.interaction as InteractionCapability)) issues.push(`${path}.interaction: unsupported interaction`)
    if (valid) actions.push(raw as UXAction)
  })
  uniqueIds(actions, 'uxStructure.actions', issues)
  return actions
}

function validateFlow(value: unknown, actionIds: Set<string>, issues: string[]): UXFlowStep[] | undefined {
  if (!Array.isArray(value) || value.length < 1 || value.length > 20) { issues.push('uxStructure.flow: 1-20 steps required'); return undefined }
  const steps: UXFlowStep[] = []
  const seenOrder = new Set<number>()
  value.forEach((raw, index) => {
    const path = `uxStructure.flow[${index}]`
    if (!isObject(raw)) { issues.push(`${path}: object required`); return }
    exactKeys(raw, ['order', 'actionId', 'description'], path, issues)
    const validOrder = typeof raw.order === 'number' && Number.isInteger(raw.order) && raw.order >= 1
    if (!validOrder) issues.push(`${path}.order: positive integer required`)
    else if (seenOrder.has(raw.order as number)) issues.push(`${path}.order: duplicate order`)
    else seenOrder.add(raw.order as number)
    const validStrings = nonEmptyString(raw.actionId, `${path}.actionId`, issues, 80) && nonEmptyString(raw.description, `${path}.description`, issues, 240)
    if (typeof raw.description === 'string') scanForLeaks(raw.description, `${path}.description`, issues)
    if (typeof raw.actionId === 'string' && !actionIds.has(raw.actionId)) issues.push(`${path}.actionId: unknown action ${raw.actionId}`)
    if (validOrder && validStrings) steps.push(raw as UXFlowStep)
  })
  return steps
}

function validateCompletionEvidence(value: unknown, regionIds: Set<string>, issues: string[]): UXCompletionEvidence[] | undefined {
  if (!Array.isArray(value) || value.length < 1 || value.length > 10) { issues.push('uxStructure.completionEvidence: 1-10 entries required'); return undefined }
  const entries: UXCompletionEvidence[] = []
  value.forEach((raw, index) => {
    const path = `uxStructure.completionEvidence[${index}]`
    if (!isObject(raw)) { issues.push(`${path}: object required`); return }
    exactKeys(raw, ['criterion', 'regionId', 'evidence'], path, issues)
    const valid = nonEmptyString(raw.criterion, `${path}.criterion`, issues, 300)
      && nonEmptyString(raw.regionId, `${path}.regionId`, issues, 80)
      && nonEmptyString(raw.evidence, `${path}.evidence`, issues, 240)
    if (typeof raw.evidence === 'string') scanForLeaks(raw.evidence, `${path}.evidence`, issues)
    if (typeof raw.regionId === 'string' && !regionIds.has(raw.regionId)) issues.push(`${path}.regionId: unknown region ${raw.regionId}`)
    if (valid) entries.push(raw as UXCompletionEvidence)
  })
  return entries
}

function validateNavigation(value: unknown, issues: string[]): UXNavigationIntent | undefined {
  if (!isObject(value)) { issues.push('uxStructure.navigation: object required'); return undefined }
  exactKeys(value, ['entryPoints', 'destinationJobIds', 'exitIntent'], 'uxStructure.navigation', issues)
  const valid = stringList(value.entryPoints, 'uxStructure.navigation.entryPoints', issues, { min: 1, max: 10 })
    && stringList(value.destinationJobIds, 'uxStructure.navigation.destinationJobIds', issues, { max: 10 })
    && nonEmptyString(value.exitIntent, 'uxStructure.navigation.exitIntent', issues, 240)
  if (typeof value.exitIntent === 'string') scanForLeaks(value.exitIntent, 'uxStructure.navigation.exitIntent', issues)
  return valid ? (value as UXNavigationIntent) : undefined
}

function validateResponsive(value: unknown, regionIds: Set<string>, issues: string[]): UXResponsiveIntent[] | undefined {
  if (!Array.isArray(value)) { issues.push('uxStructure.responsive: array required'); return undefined }
  const entries: UXResponsiveIntent[] = []
  value.forEach((raw, index) => {
    const path = `uxStructure.responsive[${index}]`
    if (!isObject(raw)) { issues.push(`${path}: object required`); return }
    exactKeys(raw, ['regionId', 'narrowBehavior', 'wideBehavior'], path, issues)
    const valid = nonEmptyString(raw.regionId, `${path}.regionId`, issues, 80)
      && nonEmptyString(raw.narrowBehavior, `${path}.narrowBehavior`, issues, 240)
      && nonEmptyString(raw.wideBehavior, `${path}.wideBehavior`, issues, 240)
    if (typeof raw.narrowBehavior === 'string') scanForLeaks(raw.narrowBehavior, `${path}.narrowBehavior`, issues)
    if (typeof raw.wideBehavior === 'string') scanForLeaks(raw.wideBehavior, `${path}.wideBehavior`, issues)
    if (typeof raw.regionId === 'string' && !regionIds.has(raw.regionId)) issues.push(`${path}.regionId: unknown region ${raw.regionId}`)
    if (valid) entries.push(raw as UXResponsiveIntent)
  })
  checkOneEntryPerRegion(entries, regionIds, 'uxStructure.responsive', issues)
  return entries
}

function validateAccessibility(value: unknown, regionIds: Set<string>, issues: string[]): UXAccessibilityIntent[] | undefined {
  if (!Array.isArray(value)) { issues.push('uxStructure.accessibility: array required'); return undefined }
  const entries: UXAccessibilityIntent[] = []
  value.forEach((raw, index) => {
    const path = `uxStructure.accessibility[${index}]`
    if (!isObject(raw)) { issues.push(`${path}: object required`); return }
    exactKeys(raw, ['regionId', 'role', 'focusOrder', 'announcement'], path, issues)
    const validStrings = nonEmptyString(raw.regionId, `${path}.regionId`, issues, 80)
      && nonEmptyString(raw.role, `${path}.role`, issues, 80)
      && nonEmptyString(raw.announcement, `${path}.announcement`, issues, 240)
    const validOrder = typeof raw.focusOrder === 'number' && Number.isInteger(raw.focusOrder) && raw.focusOrder >= 1
    if (!validOrder) issues.push(`${path}.focusOrder: positive integer required`)
    if (typeof raw.role === 'string') scanForLeaks(raw.role, `${path}.role`, issues)
    if (typeof raw.announcement === 'string') scanForLeaks(raw.announcement, `${path}.announcement`, issues)
    if (typeof raw.regionId === 'string' && !regionIds.has(raw.regionId)) issues.push(`${path}.regionId: unknown region ${raw.regionId}`)
    if (validStrings && validOrder) entries.push(raw as UXAccessibilityIntent)
  })
  checkOneEntryPerRegion(entries, regionIds, 'uxStructure.accessibility', issues)
  const orders = entries.map((entry) => entry.focusOrder)
  if (new Set(orders).size !== orders.length) issues.push('uxStructure.accessibility: focusOrder values must be unique')
  return entries
}

function checkOneEntryPerRegion(entries: Array<{ regionId: string }>, regionIds: Set<string>, path: string, issues: string[]): void {
  const seen = new Set<string>()
  for (const entry of entries) {
    if (seen.has(entry.regionId)) issues.push(`${path}: duplicate entry for region ${entry.regionId}`)
    seen.add(entry.regionId)
  }
  for (const id of regionIds) if (!seen.has(id)) issues.push(`${path}: missing entry for region ${id}`)
}

function validateCoverage(job: ScreenJob, regions: UXRegion[], actions: UXAction[], completionEvidence: UXCompletionEvidence[], navigation: UXNavigationIntent, issues: string[]): void {
  const dataRequired = canonicalSet(job.requiredData)
  const dataCovered = canonicalSet(regions.flatMap((region) => region.dataBindings))
  for (const item of job.requiredData) if (!dataCovered.has(canonical(item))) issues.push(`uxStructure.regions: missing data binding for "${item}"`)
  for (const item of regions.flatMap((region) => region.dataBindings)) if (!dataRequired.has(canonical(item))) issues.push(`uxStructure.regions: unbound data reference "${item}"`)

  const interactionsRequired = new Set(job.requiredInteractions)
  const interactionsCovered = new Set(actions.map((action) => action.interaction))
  for (const item of job.requiredInteractions) if (!interactionsCovered.has(item)) issues.push(`uxStructure.actions: missing interaction "${item}"`)
  for (const item of actions.map((action) => action.interaction)) if (!interactionsRequired.has(item)) issues.push(`uxStructure.actions: interaction "${item}" not required by job`)

  const criteriaRequired = canonicalSet(job.completionCriteria)
  const criteriaCovered = canonicalSet(completionEvidence.map((entry) => entry.criterion))
  for (const item of job.completionCriteria) if (!criteriaCovered.has(canonical(item))) issues.push(`uxStructure.completionEvidence: missing evidence for "${item}"`)
  for (const item of completionEvidence.map((entry) => entry.criterion)) if (!criteriaRequired.has(canonical(item))) issues.push(`uxStructure.completionEvidence: unknown criterion "${item}"`)

  const entryPointsAllowed = canonicalSet(job.entryPoints)
  for (const item of navigation.entryPoints) if (!entryPointsAllowed.has(canonical(item))) issues.push(`uxStructure.navigation.entryPoints: unknown entry point "${item}"`)

  const destinationsRequired = new Set(job.destinationJobIds)
  const destinationsDeclared = new Set(navigation.destinationJobIds)
  for (const item of navigation.destinationJobIds) if (!destinationsRequired.has(item)) issues.push(`uxStructure.navigation.destinationJobIds: unknown destination "${item}"`)
  for (const item of job.destinationJobIds) if (!destinationsDeclared.has(item)) issues.push(`uxStructure.navigation.destinationJobIds: missing destination "${item}"`)
}
