import type { ScreenContract } from './screen-contract.ts'
import type { SectionTopologyRole } from './section-topology.ts'

type Node = Record<string, unknown>

export type IdentityIntentRepairReport = {
  addedNodeCount: number
  supportingWitnessAdded: number
  dominantWitnessAdded: number
  densityWitnessAdded: number
  budgetExhausted: boolean
  beforeScore: number
  afterScore: number
  effectivenessGain: number
  effective: boolean
  unnecessary: boolean
}

export function repairIdentityIntent(root: Node, contract: ScreenContract, options: { maxAddedNodes?: number } = {}): IdentityIntentRepairReport {
  const intent = contract.identityIntent
  const empty = { addedNodeCount: 0, supportingWitnessAdded: 0, dominantWitnessAdded: 0, densityWitnessAdded: 0, budgetExhausted: false, beforeScore: 1, afterScore: 1, effectivenessGain: 0, effective: true, unnecessary: false }
  if (!intent) return empty
  const children = Array.isArray(root.children) ? root.children.filter(isRecord) : []
  const containers = children.filter((node) => node.type === 'Stack' && asRecord(node.props).semanticContainer === true)
  const byRole = (role: SectionTopologyRole) => containers.find((node) => asRecord(node.props).contractSectionRole === role)
  const dominant = byRole(intent.dominantRole)
  const supporting = byRole(intent.supportingRole)
  if (!dominant || !supporting) return empty
  const limit = options.maxAddedNodes ?? Number.POSITIVE_INFINITY
  const seen = new Set(flatten(root).map((node) => String(node.id ?? '')).filter(Boolean))
  const report = { ...empty }
  const memberCount = (container: Node) => (Array.isArray(container.children) ? container.children.filter(isRecord) : [])
    .filter((node) => !isHeading(node, String(asRecord(container.props).contractSection ?? ''))).length
  const state = () => {
    const dominantCount = memberCount(dominant)
    const supportingCount = memberCount(supporting)
    const totalMembers = containers.reduce((total, container) => total + memberCount(container), 0)
    const rolesFulfilled = dominantCount > supportingCount && supportingCount > 0
    const densityFulfilled = intent.densityProfile === 'focused' ? totalMembers <= 8 : intent.densityProfile === 'dense' ? totalMembers >= 9 : totalMembers >= 5 && totalMembers <= 12
    return { fulfilled: rolesFulfilled && densityFulfilled, score: (Number(rolesFulfilled) + Number(densityFulfilled)) / 2 }
  }
  const before = state()
  report.beforeScore = before.score
  const add = (container: Node, reason: 'supporting' | 'dominant' | 'density') => {
    if (report.addedNodeCount >= limit) {
      report.budgetExhausted = true
      return false
    }
    const props = asRecord(container.props)
    const role = String(props.contractSectionRole) as SectionTopologyRole
    const section = String(props.contractSection)
    const id = uniqueId(`identity_${role}_${reason}`, seen)
    const witness = witnessFor(role, section, id)
    witness.props = {
      ...asRecord(witness.props),
      contractSection: section,
      contractSectionRole: role,
      contractRepairEvidence: true,
      identityIntentRepair: reason,
      sectionMember: true,
      sectionAssignmentMethod: 'explicit',
      sectionAssignmentConfidence: 1,
      sectionAssignmentMargin: 1,
      sectionAssignmentAmbiguous: false,
    }
    container.children = [...(Array.isArray(container.children) ? container.children.filter(isRecord) : []), witness]
    report.addedNodeCount += 1
    if (reason === 'supporting') report.supportingWitnessAdded += 1
    if (reason === 'dominant') report.dominantWitnessAdded += 1
    if (reason === 'density') report.densityWitnessAdded += 1
    return true
  }

  if (memberCount(supporting) === 0) add(supporting, 'supporting')
  while (memberCount(dominant) <= memberCount(supporting) && add(dominant, 'dominant')) { /* bounded by node budget */ }
  const minimum = intent.densityProfile === 'dense' ? 9 : intent.densityProfile === 'balanced' ? 5 : 0
  const totalMembers = () => containers.reduce((total, container) => total + memberCount(container), 0)
  while (totalMembers() < minimum && add(dominant, 'density')) { /* bounded by node budget */ }
  const after = state()
  report.afterScore = after.score
  report.effectivenessGain = after.score - before.score
  report.effective = report.addedNodeCount === 0 || report.effectivenessGain > 0
  report.unnecessary = report.addedNodeCount > 0 && before.fulfilled
  return report
}

function witnessFor(role: SectionTopologyRole, section: string, id: string): Node {
  if (role === 'summary') return { id, type: 'Metric', props: { label: section, value: '—' } }
  if (role === 'filters') return { id, type: 'SegmentedControl', props: { items: ['Tümü', section] } }
  if (role === 'entity-list' || role === 'details') return { id, type: 'ListItem', props: { title: section, subtitle: 'Güncel' } }
  if (role === 'form-fields') return { id, type: 'TextField', props: { label: section, placeholder: `${section} bilgisini girin` } }
  if (role === 'actions') return { id, type: 'Button', props: { label: section } }
  if (role === 'analytics') return { id, type: 'Chart', props: { label: section, values: [18, 24, 21, 31] } }
  return { id, type: 'Switch', props: { label: section, checked: false } }
}

function isHeading(node: Node, section: string): boolean {
  return node.type === 'Text' && normalize(String(asRecord(node.props).text ?? '')) === normalize(section)
}

function normalize(value: string): string { return value.trim().replace(/\s+/gu, ' ').toLocaleLowerCase('tr-TR') }
function flatten(node: Node): Node[] { const children = Array.isArray(node.children) ? node.children.filter(isRecord) : []; return [node, ...children.flatMap(flatten)] }
function asRecord(value: unknown): Node { return isRecord(value) ? value : {} }
function isRecord(value: unknown): value is Node { return !!value && typeof value === 'object' && !Array.isArray(value) }
function uniqueId(base: string, seen: Set<string>): string { let value = base; let suffix = 2; while (seen.has(value)) value = `${base}_${suffix++}`; seen.add(value); return value }
