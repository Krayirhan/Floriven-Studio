import type { ScreenArchetype } from './domain.ts'

type Node = Record<string, unknown>

export const SECTION_TOPOLOGY_ROLES = ['summary', 'filters', 'entity-list', 'form-fields', 'actions', 'analytics', 'details', 'settings'] as const
export type SectionTopologyRole = typeof SECTION_TOPOLOGY_ROLES[number]
export type SectionTopologyRequirement = { section: string; role: SectionTopologyRole }

const ROLE_COMPONENTS: Record<SectionTopologyRole, readonly string[]> = {
  summary: [
    'Metric', 'Progress', 'Badge',
    'CareSummary', 'HealthMetric', 'TargetRange',
    'CommerceHero', 'PriceBlock', 'OrderSummary', 'DeliveryPromise',
    'LearningHero', 'XpProgress', 'StreakBadge', 'AchievementBadge',
    'EditorialHero', 'FeatureStory', 'MetadataStrip',
    'CommandSummary', 'RiskIndicator',
  ],
  filters: ['SearchField', 'SegmentedControl', 'VariantSelector', 'SectionIndex'],
  'entity-list': [
    'ListItem', 'MedicationTimeline', 'MedicationDoseRow',
    'ProductCard', 'CartLine', 'LessonCard', 'RoadmapStep',
    'StoryCard', 'ArchiveEntry', 'OperationRow', 'IncidentTimeline', 'AuditEntry',
  ],
  'form-fields': ['TextField', 'Checkbox', 'Switch', 'UnitInput', 'QuizChoice'],
  actions: ['Button', 'IconButton', 'FloatingActionButton', 'SuccessFeedback', 'AnswerFeedback'],
  analytics: ['Chart', 'RangeChart', 'SignalChart', 'TargetRange', 'DataMatrix'],
  details: [
    'ListItem', 'Metric', 'Progress', 'HealthMetric', 'StatusAlert', 'SafetyNotice',
    'ProductGallery', 'PriceBlock', 'DeliveryPromise', 'Byline', 'MetadataStrip', 'PullQuote',
    'RiskIndicator', 'IncidentTimeline', 'AuditEntry',
  ],
  settings: ['Switch', 'Checkbox', 'ControlToggle', 'ListItem', 'VariantSelector'],
}

const ARCHETYPE_ROLES: Record<ScreenArchetype, readonly SectionTopologyRole[]> = {
  dashboard: ['summary', 'analytics', 'entity-list', 'actions'],
  management_list: ['filters', 'entity-list', 'summary', 'actions'],
  form: ['form-fields', 'summary', 'actions'],
  detail: ['details', 'summary', 'analytics', 'actions'],
  settings: ['settings', 'actions', 'details'],
  profile: ['settings', 'details', 'actions'],
  analytics: ['analytics', 'filters', 'summary', 'entity-list'],
}

export type SectionOwnershipReport = {
  ownershipCoverage: number
  orderingValid: boolean
  missingSections: string[]
  ownedNodeIds: string[]
}

export type SectionContainerReport = {
  containerCoverage: number
  orphanOwnedNodeCount: number
  missingHeadingCount: number
  materializedContainerCount: number
}

export type SectionMemberReport = {
  memberCoverage: number
  orphanSemanticNodeCount: number
  crossSectionViolationCount: number
  assignedMemberCount: number
  semanticAssignmentConfidence: number
  lowConfidenceMemberCount: number
  averageAssignmentMargin: number
  ambiguousMemberCount: number
  contractEvidenceAssignmentCount: number
  emptyContainerCount: number
  maxMemberConcentration: number
  distributionBalanced: boolean
  rolePurity: number
  crossRoleMemberCount: number
}

export type SectionMemberSemanticContext = {
  job: string
  primaryAction: string
  secondaryActions: string[]
  requiredData: string[]
}

export function validateSectionTopology(archetype: ScreenArchetype | undefined, sections: string[], requirements: SectionTopologyRequirement[]): string[] {
  const issues: string[] = []
  if (requirements.length !== sections.length) issues.push('every section must have exactly one topology role')
  if (new Set(requirements.map((item) => item.section)).size !== requirements.length) issues.push('topology sections must be unique')
  if (requirements.some((item) => !sections.includes(item.section))) issues.push('topology role references an unknown section')
  if (new Set(requirements.map((item) => item.role)).size < Math.min(2, sections.length)) issues.push('screen topology must use at least two distinct roles')
  if (archetype) {
    const allowed = new Set(ARCHETYPE_ROLES[archetype])
    if (requirements.some((item) => !allowed.has(item.role))) issues.push(`topology role is incompatible with ${archetype}`)
    const indexes = requirements.map((item) => ARCHETYPE_ROLES[archetype].indexOf(item.role))
    if (indexes.some((value, index) => index > 0 && value < indexes[index - 1])) issues.push(`topology role order is incompatible with ${archetype}`)
  }
  return issues
}

export function assignSectionOwnership(root: Node, archetype: ScreenArchetype | undefined, requirements: SectionTopologyRequirement[]): SectionOwnershipReport {
  if (!requirements.length) return { ownershipCoverage: 1, orderingValid: true, missingSections: [], ownedNodeIds: [] }
  const children = Array.isArray(root.children) ? root.children.filter(isRecord) : []
  const available = new Set(children.map((_, index) => index))
  const assignments: Array<{ requirement: SectionTopologyRequirement; node: Node; originalIndex: number }> = []

  for (const requirement of requirements) {
    const originalIndex = children.findIndex((node, index) => available.has(index) && ROLE_COMPONENTS[requirement.role].includes(String(node.type ?? '')))
    if (originalIndex < 0) continue
    available.delete(originalIndex)
    const node = children[originalIndex]
    node.props = { ...asRecord(node.props), contractSection: requirement.section, contractSectionRole: requirement.role }
    assignments.push({ requirement, node, originalIndex })
  }

  const navigation = children.filter((node) => node.type === 'BottomNavigation' || node.type === 'TabBar')
  const topBar = children.filter((node) => node.type === 'TopAppBar')
  const owned = new Set(assignments.map((assignment) => assignment.node))
  const unowned = children.filter((node) => !owned.has(node) && !navigation.includes(node) && !topBar.includes(node))
  const roleOrder = archetype ? ARCHETYPE_ROLES[archetype] : SECTION_TOPOLOGY_ROLES
  const orderedAssignments = [...assignments].sort((left, right) => {
    const roleDifference = roleOrder.indexOf(left.requirement.role) - roleOrder.indexOf(right.requirement.role)
    return roleDifference || left.originalIndex - right.originalIndex
  })
  root.children = [...topBar, ...orderedAssignments.map((assignment) => assignment.node), ...unowned, ...navigation]

  const missingSections = requirements.filter((requirement) => !assignments.some((assignment) => assignment.requirement.section === requirement.section)).map((requirement) => requirement.section)
  const assignedRoles = orderedAssignments.map((assignment) => assignment.requirement.role)
  const orderingValid = assignedRoles.every((role, index) => index === 0 || roleOrder.indexOf(role) >= roleOrder.indexOf(assignedRoles[index - 1]))
  return {
    ownershipCoverage: requirements.length ? assignments.length / requirements.length : 1,
    orderingValid,
    missingSections,
    ownedNodeIds: assignments.map((assignment) => String(assignment.node.id ?? '')).filter(Boolean),
  }
}

export function evaluateSectionOwnership(root: Node, archetype: ScreenArchetype | undefined, requirements: SectionTopologyRequirement[]): SectionOwnershipReport {
  if (!requirements.length) return { ownershipCoverage: 1, orderingValid: true, missingSections: [], ownedNodeIds: [] }
  const children = Array.isArray(root.children) ? root.children.filter(isRecord) : []
  const available = new Set(children.map((_, index) => index))
  const matches: Array<{ requirement: SectionTopologyRequirement; node: Node; index: number }> = []
  for (const requirement of requirements) {
    const index = children.findIndex((node, childIndex) => available.has(childIndex) && nodeSupportsRole(node, requirement.role))
    if (index < 0) continue
    available.delete(index)
    matches.push({ requirement, node: children[index], index })
  }
  const roleOrder = archetype ? ARCHETYPE_ROLES[archetype] : SECTION_TOPOLOGY_ROLES
  const orderingValid = matches.every((match, index) => index === 0 || (
    match.index > matches[index - 1].index
    && roleOrder.indexOf(match.requirement.role) >= roleOrder.indexOf(matches[index - 1].requirement.role)
  ))
  const missingSections = requirements.filter((requirement) => !matches.some((match) => match.requirement.section === requirement.section)).map((requirement) => requirement.section)
  return {
    ownershipCoverage: requirements.length ? matches.length / requirements.length : 1,
    orderingValid,
    missingSections,
    ownedNodeIds: matches.map((match) => String(match.node.id ?? '')).filter(Boolean),
  }
}

export function materializeSectionContainers(root: Node, requirements: SectionTopologyRequirement[], options: { maxAddedNodes?: number } = {}): SectionContainerReport {
  if (!requirements.length) return { containerCoverage: 1, orphanOwnedNodeCount: 0, missingHeadingCount: 0, materializedContainerCount: 0 }
  const children = Array.isArray(root.children) ? root.children.filter(isRecord) : []
  const existingContainers = children.filter(isSectionContainer)
  if (existingContainers.length) return evaluateSectionContainers(root, requirements)
  const consumed = new Set<Node>()
  const replacements = new Map<Node, Node>()
  let addedNodes = 0

  for (const requirement of requirements) {
    const owner = children.find((node) => !consumed.has(node) && asRecord(node.props).contractSection === requirement.section && asRecord(node.props).contractSectionRole === requirement.role)
    if (!owner) continue
    const heading = children.find((node) => !consumed.has(node) && node !== owner && node.type === 'Text' && normalize(String(asRecord(node.props).text ?? '')) === normalize(requirement.section))
    const requiredAddedNodes = 1 + Number(!heading)
    if (addedNodes + requiredAddedNodes > (options.maxAddedNodes ?? Number.POSITIVE_INFINITY)) continue
    const headingNode = heading ?? {
      id: `${String(owner.id)}_heading`,
      type: 'Text',
      props: { text: requirement.section, variant: 'heading' },
      a11y: { role: 'heading', label: requirement.section },
    }
    const container: Node = {
      id: `${String(owner.id)}_section`,
      type: 'Stack',
      props: { contractSection: requirement.section, contractSectionRole: requirement.role, semanticContainer: true },
      layout: { mode: 'column', gap: 'space.3' },
      a11y: { role: 'region', label: requirement.section },
      children: [headingNode, owner],
    }
    consumed.add(owner)
    if (heading) consumed.add(heading)
    replacements.set(owner, container)
    addedNodes += requiredAddedNodes
  }

  root.children = children.flatMap((node) => {
    if (replacements.has(node)) return [replacements.get(node)!]
    return consumed.has(node) ? [] : [node]
  })
  return evaluateSectionContainers(root, requirements)
}

export function evaluateSectionContainers(root: Node, requirements: SectionTopologyRequirement[]): SectionContainerReport {
  if (!requirements.length) return { containerCoverage: 1, orphanOwnedNodeCount: 0, missingHeadingCount: 0, materializedContainerCount: 0 }
  const children = Array.isArray(root.children) ? root.children.filter(isRecord) : []
  const containers = children.filter(isSectionContainer)
  let covered = 0
  let missingHeadingCount = 0
  for (const requirement of requirements) {
    const container = containers.find((node) => asRecord(node.props).contractSection === requirement.section && asRecord(node.props).contractSectionRole === requirement.role)
    if (!container || !nodeSupportsRole(container, requirement.role)) continue
    const hasHeading = flatten(container).some((node) => node.type === 'Text' && normalize(String(asRecord(node.props).text ?? '')) === normalize(requirement.section))
    if (!hasHeading) missingHeadingCount += 1
    else covered += 1
  }
  const ownedNodes = flatten(root).filter((node) => {
    const props = asRecord(node.props)
    return typeof props.contractSection === 'string' && typeof props.contractSectionRole === 'string' && !isSectionContainer(node)
  })
  const containerDescendants = new Set(containers.flatMap((container) => flatten(container).slice(1)))
  const orphanOwnedNodeCount = ownedNodes.filter((node) => !containerDescendants.has(node)).length
  return {
    containerCoverage: requirements.length ? covered / requirements.length : 1,
    orphanOwnedNodeCount,
    missingHeadingCount,
    materializedContainerCount: containers.length,
  }
}

export function assignSectionMembers(root: Node, requirements: SectionTopologyRequirement[], context?: SectionMemberSemanticContext): SectionMemberReport {
  if (!requirements.length) return emptyMemberReport()
  const children = Array.isArray(root.children) ? root.children.filter(isRecord) : []
  const containers = children.filter(isSectionContainer)
  if (!containers.length) return evaluateSectionMembers(root, requirements)
  const movable = children.filter((node) => !isShellNode(node) && !isSectionContainer(node))
  let assignedMemberCount = 0

  for (const node of movable) {
    const props = asRecord(node.props)
    const explicitSection = typeof props.contractSection === 'string' ? props.contractSection : undefined
    const explicitRole = typeof props.contractSectionRole === 'string' ? props.contractSectionRole : undefined
    const explicitContainer = containers.find((container) => {
      const containerProps = asRecord(container.props)
      return containerProps.contractSection === explicitSection && (!explicitRole || containerProps.contractSectionRole === explicitRole)
    })
    const selection = explicitContainer
      ? { container: explicitContainer, confidence: 1, method: 'explicit', margin: 1, ambiguous: false }
      : bestContainerFor(node, containers, context)
    const target = selection?.container
    if (!target) continue
    const targetProps = asRecord(target.props)
    node.props = {
      ...props,
      contractSection: targetProps.contractSection,
      contractSectionRole: targetProps.contractSectionRole,
      sectionMember: true,
      sectionAssignmentMethod: selection.method,
      sectionAssignmentConfidence: selection.confidence,
      sectionAssignmentMargin: selection.margin,
      sectionAssignmentAmbiguous: selection.ambiguous,
    }
    target.children = [...(Array.isArray(target.children) ? target.children.filter(isRecord) : []), node]
    assignedMemberCount += 1
  }
  const movableSet = new Set(movable)
  root.children = children.filter((node) => !movableSet.has(node))
  return { ...evaluateSectionMembers(root, requirements), assignedMemberCount }
}

export function evaluateSectionMembers(root: Node, requirements: SectionTopologyRequirement[]): SectionMemberReport {
  if (!requirements.length) return emptyMemberReport()
  const children = Array.isArray(root.children) ? root.children.filter(isRecord) : []
  const containers = children.filter(isSectionContainer)
  const orphanSemanticNodeCount = children.filter((node) => !isShellNode(node) && !isSectionContainer(node)).length
  let coveredMembers = 0
  let totalMembers = orphanSemanticNodeCount
  let crossSectionViolationCount = 0
  const confidenceValues: number[] = []
  const marginValues: number[] = []
  let lowConfidenceMemberCount = 0
  let ambiguousMemberCount = 0
  let contractEvidenceAssignmentCount = 0
  let roleAwareComponentCount = 0
  let roleCompatibleComponentCount = 0
  let crossRoleMemberCount = 0
  const containerMemberCounts: number[] = []
  for (const container of containers) {
    const containerProps = asRecord(container.props)
    const members = (Array.isArray(container.children) ? container.children.filter(isRecord) : []).filter((node) => !isContainerHeading(node, String(containerProps.contractSection ?? '')))
    containerMemberCounts.push(members.length)
    totalMembers += members.length
    for (const member of members) {
      const props = asRecord(member.props)
      const matches = props.contractSection === containerProps.contractSection && props.contractSectionRole === containerProps.contractSectionRole
      if (matches) coveredMembers += 1
      else crossSectionViolationCount += 1
      if (props.sectionMember === true && typeof props.sectionAssignmentConfidence === 'number') {
        confidenceValues.push(props.sectionAssignmentConfidence)
        if (props.sectionAssignmentConfidence < 0.35) lowConfidenceMemberCount += 1
        if (typeof props.sectionAssignmentMargin === 'number') marginValues.push(props.sectionAssignmentMargin)
        if (props.sectionAssignmentAmbiguous === true) ambiguousMemberCount += 1
        if (props.sectionAssignmentMethod === 'explicit' && props.contractRepairEvidence === true) contractEvidenceAssignmentCount += 1
      }
      const role = String(containerProps.contractSectionRole ?? '') as SectionTopologyRole
      const roleAwareComponents = flatten(member).filter((candidate) => componentRoles(String(candidate.type ?? '')).length > 0)
      const compatibleComponents = roleAwareComponents.filter((candidate) => ROLE_COMPONENTS[role]?.includes(String(candidate.type ?? '')))
      roleAwareComponentCount += roleAwareComponents.length
      roleCompatibleComponentCount += compatibleComponents.length
      if (roleAwareComponents.length > compatibleComponents.length) crossRoleMemberCount += 1
    }
  }
  const containedMemberCount = containerMemberCounts.reduce((total, value) => total + value, 0)
  const maxMemberConcentration = containedMemberCount ? Math.max(...containerMemberCounts, 0) / containedMemberCount : 0
  const distributionBalanced = containers.length < 2 || containedMemberCount < 4 || maxMemberConcentration <= 0.75
  return {
    memberCoverage: totalMembers ? coveredMembers / totalMembers : 1,
    orphanSemanticNodeCount,
    crossSectionViolationCount,
    assignedMemberCount: coveredMembers,
    semanticAssignmentConfidence: confidenceValues.length ? confidenceValues.reduce((total, value) => total + value, 0) / confidenceValues.length : 1,
    lowConfidenceMemberCount,
    averageAssignmentMargin: marginValues.length ? marginValues.reduce((total, value) => total + value, 0) / marginValues.length : 1,
    ambiguousMemberCount,
    contractEvidenceAssignmentCount,
    emptyContainerCount: containerMemberCounts.filter((count) => count === 0).length,
    maxMemberConcentration,
    distributionBalanced,
    rolePurity: roleAwareComponentCount ? roleCompatibleComponentCount / roleAwareComponentCount : 1,
    crossRoleMemberCount,
  }
}

export function evaluateSectionTopology(root: Node, requirements: SectionTopologyRequirement[]) {
  if (!requirements.length) return { topologyRoleCoverage: 1, missingTopologyRoles: [] as SectionTopologyRole[] }
  const types = new Set(flatten(root).map((node) => String(node.type ?? '')))
  const missingTopologyRoles = [...new Set(requirements.map((item) => item.role))]
    .filter((role) => !ROLE_COMPONENTS[role].some((type) => types.has(type)))
  const requiredRoles = new Set(requirements.map((item) => item.role)).size
  return { topologyRoleCoverage: requiredRoles ? 1 - missingTopologyRoles.length / requiredRoles : 1, missingTopologyRoles }
}

export function hasTopologyRole(role: SectionTopologyRole, nodes: Node[]): boolean {
  const types = new Set(nodes.map((node) => String(node.type ?? '')))
  return ROLE_COMPONENTS[role].some((type) => types.has(type))
}

function nodeSupportsRole(node: Node, role: SectionTopologyRole): boolean {
  return flatten(node).some((candidate) => ROLE_COMPONENTS[role].includes(String(candidate.type ?? '')))
}

function componentRoles(type: string): SectionTopologyRole[] {
  return SECTION_TOPOLOGY_ROLES.filter((role) => ROLE_COMPONENTS[role].includes(type))
}

function isSectionContainer(node: Node): boolean {
  return node.type === 'Stack' && asRecord(node.props).semanticContainer === true
}

function isShellNode(node: Node): boolean {
  return node.type === 'TopAppBar' || node.type === 'BottomNavigation' || node.type === 'TabBar'
}

function isContainerHeading(node: Node, section: string): boolean {
  return node.type === 'Text' && normalize(String(asRecord(node.props).text ?? '')) === normalize(section)
}

function bestContainerFor(node: Node, containers: Node[], context?: SectionMemberSemanticContext): { container: Node; confidence: number; method: string; margin: number; ambiguous: boolean } | undefined {
  const ranked: Array<{ container: Node; score: number; confidence: number; method: string }> = []
  for (const container of containers) {
    const containerProps = asRecord(container.props)
    const role = String(containerProps.contractSectionRole ?? '') as SectionTopologyRole
    const typeMatches = flatten(node).filter((candidate) => ROLE_COMPONENTS[role]?.includes(String(candidate.type ?? ''))).length
    const typeConfidence = typeMatches > 0 ? 1 : 0
    const semanticConfidence = tokenOverlap(nodeCorpus(node), semanticHints(String(containerProps.contractSection ?? ''), role, context))
    const neutral = ['Divider', 'Icon'].includes(String(node.type ?? ''))
    const confidence = neutral ? 1 : typeConfidence > 0 ? Math.min(1, 0.65 + semanticConfidence * 0.35) : semanticConfidence
    const score = typeConfidence * 0.4 + semanticConfidence * 0.6
    const method = neutral ? 'structural' : typeMatches > 0 && semanticConfidence > 0 ? 'type+semantic' : typeMatches > 0 ? 'type' : 'semantic'
    ranked.push({ container, score, confidence, method })
  }
  ranked.sort((left, right) => right.score - left.score)
  const best = ranked[0]
  if (!best) return undefined
  const neutral = ['Divider', 'Icon'].includes(String(node.type ?? ''))
  const margin = neutral || ranked.length === 1 ? 1 : Math.max(0, best.score - ranked[1].score)
  return { ...best, margin, ambiguous: !neutral && ranked.length > 1 && margin < 0.15 }
}

function semanticHints(section: string, role: SectionTopologyRole, context?: SectionMemberSemanticContext): string {
  if (!context) return section
  const roleHints = role === 'actions'
    ? [context.primaryAction, ...context.secondaryActions]
    : role === 'filters'
      ? ['ara', 'filtre', 'sırala', ...context.requiredData]
      : role === 'settings'
        ? ['ayar', 'tercih', ...context.requiredData, ...context.secondaryActions]
        : context.requiredData
  return [section, context.job, ...roleHints].join(' ')
}

function nodeCorpus(node: Node): string {
  const values: string[] = []
  for (const candidate of flatten(node)) {
    for (const value of Object.values(asRecord(candidate.props))) {
      if (typeof value === 'string' || typeof value === 'number') values.push(String(value))
      if (Array.isArray(value)) values.push(...value.filter((item): item is string | number => typeof item === 'string' || typeof item === 'number').map(String))
    }
  }
  return values.join(' ')
}

function tokenOverlap(left: string, right: string): number {
  const leftTokens = new Set(tokens(left))
  const rightTokens = new Set(tokens(right))
  if (!leftTokens.size || !rightTokens.size) return 0
  const shared = [...leftTokens].filter((token) => rightTokens.has(token)).length
  return shared / Math.min(leftTokens.size, rightTokens.size)
}

function tokens(value: string): string[] {
  return normalize(value).match(/[\p{L}\p{N}]+/gu)?.filter((token) => token.length >= 4).map((token) => token.length > 5 ? token.slice(0, 5) : token) ?? []
}

function emptyMemberReport(): SectionMemberReport {
  return { memberCoverage: 1, orphanSemanticNodeCount: 0, crossSectionViolationCount: 0, assignedMemberCount: 0, semanticAssignmentConfidence: 1, lowConfidenceMemberCount: 0, averageAssignmentMargin: 1, ambiguousMemberCount: 0, contractEvidenceAssignmentCount: 0, emptyContainerCount: 0, maxMemberConcentration: 0, distributionBalanced: true, rolePurity: 1, crossRoleMemberCount: 0 }
}

function normalize(value: string): string {
  return value.trim().replace(/\s+/gu, ' ').toLocaleLowerCase('tr-TR')
}

function flatten(node: Node): Node[] {
  const children = Array.isArray(node.children) ? node.children.filter(isRecord) : []
  return [node, ...children.flatMap(flatten)]
}

function isRecord(value: unknown): value is Node {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function asRecord(value: unknown): Node {
  return isRecord(value) ? value : {}
}
