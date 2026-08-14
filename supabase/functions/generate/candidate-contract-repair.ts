import type { ProductBlueprint, ProductScreenSpec } from './domain.ts'
import { hasTopologyRole, type SectionTopologyRole } from './section-topology.ts'

type Node = Record<string, unknown>

export type ContractRepairOperation = {
  op: 'add'
  screenId: string
  nodeId: string
  obligation: 'section' | 'primary_action' | 'secondary_action' | 'required_data' | 'navigation_target' | 'topology_role'
  source: string
}

export function repairScreenContract(
  screen: Node,
  planned: ProductScreenSpec,
  blueprint: ProductBlueprint,
  options: { maxOperations?: number } = {},
): ContractRepairOperation[] {
  const contract = planned.contract
  if (!contract?.primaryAction.trim()) return []
  const root = asRecord(screen.root)
  const children = Array.isArray(root.children) ? root.children.filter(isRecord) : []
  const existingIds = new Set(flatten(root).map((node) => String(node.id ?? '')).filter(Boolean))
  const operations: ContractRepairOperation[] = []
  const additions: Node[] = []
  let visibleText = visibleContent(root)

  const add = (obligation: ContractRepairOperation['obligation'], source: string, type: string, props: Node, targetRole?: SectionTopologyRole) => {
    if (covers(source, visibleText)) return
    if (operations.length >= (options.maxOperations ?? Number.POSITIVE_INFINITY)) return
    const baseId = `${planned.id}_contract_${obligation}_${operations.length + 1}`
    const nodeId = uniqueId(baseId, existingIds)
    const target = targetRole ? uniqueRequirement(contract.sectionRoles ?? [], targetRole) : undefined
    additions.push({
      id: nodeId,
      type,
      props: target ? {
        ...props,
        contractSection: target.section,
        contractSectionRole: target.role,
        contractRepairEvidence: true,
      } : props,
      a11y: { role: type === 'Button' ? 'button' : type === 'Text' ? 'heading' : 'group', label: source },
    })
    operations.push({ op: 'add', screenId: planned.id, nodeId, obligation, source })
    visibleText = `${visibleText} ${normalize(source)}`
  }

  for (const section of contract.requiredSections) add('section', section, 'Text', { text: section, variant: 'heading' })
  for (const field of contract.requiredData) {
    if (planned.archetype === 'form') add('required_data', field, 'TextField', { label: field, placeholder: `${field} bilgisini girin` }, 'form-fields')
    else add('required_data', field, 'ListItem', { title: field, subtitle: `${planned.name} için zorunlu veri`, trailing: deterministicValue(`${planned.id}:${field}`) })
  }
  for (const action of contract.secondaryActions) add('secondary_action', action, 'Button', { label: action, variant: 'secondary' }, 'actions')
  add('primary_action', contract.primaryAction, 'Button', { label: contract.primaryAction }, 'actions')
  for (const targetId of contract.navigationTargetIds) {
    const target = blueprint.screens.find((candidate) => candidate.id === targetId)
    if (target) add('navigation_target', target.name, 'Button', { label: `${target.name} ekranına git`, targetScreenId: target.id, variant: 'secondary' }, 'actions')
  }
  const topologyNodes = () => [...flatten(root), ...additions]
  for (const requirement of contract.sectionRoles ?? []) {
    if (hasTopologyRole(requirement.role, topologyNodes())) continue
    if (operations.length >= (options.maxOperations ?? Number.POSITIVE_INFINITY)) break
    const witness = topologyWitness(planned, requirement.section, requirement.role)
    const baseId = `${planned.id}_contract_topology_${requirement.role}`
    const nodeId = uniqueId(baseId, existingIds)
    additions.push({
      id: nodeId,
      ...witness,
      props: {
        ...witness.props,
        contractSection: requirement.section,
        contractSectionRole: requirement.role,
        contractRepairEvidence: true,
      },
      a11y: { role: witness.type === 'Button' ? 'button' : 'group', label: requirement.section },
    })
    operations.push({ op: 'add', screenId: planned.id, nodeId, obligation: 'topology_role', source: requirement.role })
  }

  if (!additions.length) return operations
  const navigationIndex = children.findIndex((node) => node.type === 'BottomNavigation' || node.type === 'TabBar')
  const insertionIndex = navigationIndex < 0 ? children.length : navigationIndex
  root.children = [...children.slice(0, insertionIndex), ...additions, ...children.slice(insertionIndex)]
  root.props = {
    ...asRecord(root.props),
    contractRepair: {
      version: '1.0.0',
      operationCount: operations.length,
      repairedObligations: operations.map((operation) => operation.obligation),
    },
  }
  screen.root = root
  return operations
}

function uniqueRequirement(requirements: Array<{ section: string; role: SectionTopologyRole }>, role: SectionTopologyRole) {
  const matches = requirements.filter((requirement) => requirement.role === role)
  return matches.length === 1 ? matches[0] : undefined
}

function topologyWitness(screen: ProductScreenSpec, section: string, role: SectionTopologyRole): { type: string; props: Node } {
  if (role === 'summary') return { type: 'Metric', props: { label: section, value: deterministicValue(`${screen.id}:${section}`), caption: screen.purpose } }
  if (role === 'filters') return { type: 'SegmentedControl', props: { items: ['Tümü', section, 'Öncelikli'] } }
  if (role === 'entity-list') return { type: 'ListItem', props: { title: section, subtitle: `${screen.name} kayıtları`, trailing: deterministicValue(section) } }
  if (role === 'form-fields') return { type: 'TextField', props: { label: section, placeholder: `${section} bilgisini girin` } }
  if (role === 'actions') return { type: 'Button', props: { label: screen.contract.primaryAction } }
  if (role === 'analytics') return { type: 'Chart', props: { label: section, values: [21, 34, 29, 47, 42, 56] } }
  if (role === 'settings') return { type: 'Switch', props: { label: section, checked: true } }
  return { type: 'ListItem', props: { title: section, subtitle: screen.purpose, trailing: 'Güncel' } }
}

function visibleContent(root: Node): string {
  const values: string[] = []
  for (const node of flatten(root)) {
    if (node.type === 'BottomNavigation' || node.type === 'TabBar' || node.type === 'TopAppBar') continue
    for (const value of Object.values(asRecord(node.props))) {
      if (typeof value === 'string' || typeof value === 'number') values.push(String(value))
    }
  }
  return normalize(values.join(' '))
}

function covers(expected: string, actual: string): boolean {
  const tokens = semanticTokens(expected)
  if (!tokens.length) return true
  const actualTokens = new Set(semanticTokens(actual))
  return tokens.every((token) => actualTokens.has(token))
}

function semanticTokens(value: string): string[] {
  return normalize(value).match(/[\p{L}\p{N}]+/gu)?.filter((token) => token.length >= 4).map((token) => token.length > 5 ? token.slice(0, 5) : token) ?? []
}

function normalize(value: string): string {
  return value.trim().replace(/\s+/gu, ' ').toLocaleLowerCase('tr-TR')
}

function deterministicValue(seed: string): string {
  let hash = 19
  for (const character of seed) hash = (hash * 31 + character.charCodeAt(0)) % 997
  return String(10 + hash % 89)
}

function uniqueId(base: string, seen: Set<string>): string {
  let candidate = base
  let suffix = 2
  while (seen.has(candidate)) candidate = `${base}_${suffix++}`
  seen.add(candidate)
  return candidate
}

function flatten(node: Node): Node[] {
  const children = Array.isArray(node.children) ? node.children.filter(isRecord) : []
  return [node, ...children.flatMap(flatten)]
}

function asRecord(value: unknown): Node {
  return isRecord(value) ? value : {}
}

function isRecord(value: unknown): value is Node {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}
