import { describe, expect, it } from 'vitest'
import { repairScreenContract } from './candidate-contract-repair'
import type { ProductBlueprint } from './domain'

const planned = {
  id: 'projects', name: 'Projeler', route: '/projects',
  purpose: 'Projeleri durum ve teslim tarihine göre yönetmek', sections: ['Durum özeti', 'Proje kayıtları'],
  role: 'core' as const, priority: 'primary' as const, navigationPlacement: 'primary' as const,
  archetype: 'management_list' as const,
  contract: {
    version: '1.0.0' as const,
    job: 'Projeleri durum ve teslim tarihine göre yönetmek',
    requiredSections: ['Durum özeti', 'Proje kayıtları'],
    primaryAction: 'Yeni proje oluştur',
    secondaryActions: ['Projeleri filtrele'],
    requiredData: ['proje sorumlusu', 'teslim tarihi'],
    navigationTargetIds: ['invoices'],
    sectionRoles: [
      { section: 'Durum özeti', role: 'filters' as const },
      { section: 'Proje kayıtları', role: 'entity-list' as const },
    ],
  },
}

const blueprint: ProductBlueprint = {
  productDomain: 'project-management', audience: 'Ekipler', entities: ['proje'], capabilities: ['proje yönetimi'], contentVocabulary: ['teslim tarihi'],
  screens: [planned, { ...planned, id: 'invoices', name: 'Faturalar', route: '/invoices', purpose: 'Faturaları izlemek', contract: { ...planned.contract, job: 'Faturaları izlemek', navigationTargetIds: [] } }],
  navigation: { primaryScreenIds: ['projects', 'invoices'], utilityScreenIds: [] },
  screenPolicy: { requestedCount: 2, minCount: 2, maxCount: 2, rationale: 'Test' },
}

function candidate() {
  return {
    id: 'projects', name: 'Projeler', route: '/projects',
    root: { id: 'projects_root', type: 'Screen', props: {}, children: [
      { id: 'projects_bar', type: 'TopAppBar', props: { title: 'Projeler' } },
      { id: 'projects_existing', type: 'Text', props: { text: 'Durum özeti', variant: 'heading' } },
      { id: 'projects_nav', type: 'BottomNavigation', props: { items: ['Projeler', 'Faturalar'] } },
    ] },
  }
}

describe('candidate ScreenContract repair', () => {
  it('adds only missing obligations before navigation and preserves existing nodes', () => {
    const screen = candidate()
    const operations = repairScreenContract(screen, planned, blueprint)
    const children = screen.root.children

    expect(operations.map((operation) => operation.obligation)).toEqual([
      'section', 'required_data', 'required_data', 'secondary_action', 'primary_action', 'navigation_target',
      'topology_role',
    ])
    expect(children[0]?.id).toBe('projects_bar')
    expect(children[1]?.id).toBe('projects_existing')
    expect(children.at(-1)?.id).toBe('projects_nav')
    expect(new Set(operations.map((operation) => operation.nodeId)).size).toBe(operations.length)
    expect(screen.root.props.contractRepair).toMatchObject({ version: '1.0.0', operationCount: 7 })
  })

  it('is idempotent after the first targeted repair', () => {
    const screen = candidate()
    repairScreenContract(screen, planned, blueprint)
    const snapshot = JSON.stringify(screen)

    expect(repairScreenContract(screen, planned, blueprint)).toEqual([])
    expect(JSON.stringify(screen)).toBe(snapshot)
  })

  it('does not mutate a candidate whose contract is already fulfilled', () => {
    const screen = candidate()
    screen.root.children.splice(2, 0,
      { id: 'section', type: 'Text', props: { text: 'Proje kayıtları', variant: 'heading' } },
      { id: 'owner', type: 'ListItem', props: { title: 'Proje sorumlusu' } },
      { id: 'date', type: 'ListItem', props: { title: 'Teslim tarihi' } },
      { id: 'filter', type: 'Button', props: { label: 'Projeleri filtrele' } },
      { id: 'create', type: 'Button', props: { label: 'Yeni proje oluştur' } },
      { id: 'target', type: 'Button', props: { label: 'Faturalar ekranına git' } },
      { id: 'filters', type: 'SearchField', props: { placeholder: 'Projelerde ara' } },
    )
    const snapshot = JSON.stringify(screen)

    expect(repairScreenContract(screen, planned, blueprint)).toEqual([])
    expect(JSON.stringify(screen)).toBe(snapshot)
  })

  it('respects the caller node budget instead of truncating existing content', () => {
    const screen = candidate()
    const existingIds = screen.root.children.map((node) => node.id)
    const operations = repairScreenContract(screen, planned, blueprint, { maxOperations: 2 })

    expect(operations).toHaveLength(2)
    expect(existingIds.every((id) => screen.root.children.some((node) => node.id === id))).toBe(true)
    expect(screen.root.children.at(-1)?.id).toBe('projects_nav')
  })

  it('adds explicit section evidence only when a repair obligation has one valid target', () => {
    const actionPlanned = {
      ...planned,
      sections: ['Proje kayıtları', 'İşlemler'],
      contract: {
        ...planned.contract,
        requiredSections: ['Proje kayıtları', 'İşlemler'],
        sectionRoles: [
          { section: 'Proje kayıtları', role: 'entity-list' as const },
          { section: 'İşlemler', role: 'actions' as const },
        ],
      },
    }
    const screen = candidate()

    repairScreenContract(screen, actionPlanned, { ...blueprint, screens: [actionPlanned, blueprint.screens[1]] })

    const primaryAction = screen.root.children.find((node) => node.props?.label === actionPlanned.contract.primaryAction)
    expect(primaryAction?.props).toMatchObject({
      contractSection: 'İşlemler',
      contractSectionRole: 'actions',
      contractRepairEvidence: true,
    })
  })

  it('does not invent explicit evidence when an obligation has multiple same-role targets', () => {
    const ambiguousPlanned = {
      ...planned,
      contract: {
        ...planned.contract,
        sectionRoles: [
          { section: 'Hızlı işlemler', role: 'actions' as const },
          { section: 'Diğer işlemler', role: 'actions' as const },
        ],
      },
    }
    const screen = candidate()

    repairScreenContract(screen, ambiguousPlanned, { ...blueprint, screens: [ambiguousPlanned, blueprint.screens[1]] })

    const primaryAction = screen.root.children.find((node) => node.props?.label === ambiguousPlanned.contract.primaryAction)
    expect(primaryAction?.props.contractRepairEvidence).toBeUndefined()
    expect(primaryAction?.props.contractSection).toBeUndefined()
  })
})
