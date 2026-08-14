import { describe, expect, it } from 'vitest'
import { assignSectionMembers, assignSectionOwnership, evaluateSectionContainers, evaluateSectionMembers, evaluateSectionOwnership, evaluateSectionTopology, materializeSectionContainers, validateSectionTopology } from './section-topology'

describe('section topology contract', () => {
  it('accepts archetype-compatible roles and rejects text-only role repetition', () => {
    expect(validateSectionTopology('management_list', ['Filtreler', 'Kayıtlar'], [
      { section: 'Filtreler', role: 'filters' },
      { section: 'Kayıtlar', role: 'entity-list' },
    ])).toEqual([])

    expect(validateSectionTopology('form', ['Alanlar', 'Tamamlama'], [
      { section: 'Alanlar', role: 'form-fields' },
      { section: 'Tamamlama', role: 'form-fields' },
    ])).toContain('screen topology must use at least two distinct roles')
    expect(validateSectionTopology('form', ['Alanlar', 'Analiz'], [
      { section: 'Alanlar', role: 'form-fields' },
      { section: 'Analiz', role: 'analytics' },
    ])).toContain('topology role is incompatible with form')
  })

  it('requires component evidence instead of accepting section headings alone', () => {
    const requirements = [
      { section: 'Filtreler', role: 'filters' as const },
      { section: 'Proje kayıtları', role: 'entity-list' as const },
    ]
    const textOnly = { type: 'Screen', children: [
      { type: 'Text', props: { text: 'Filtreler' } },
      { type: 'Text', props: { text: 'Proje kayıtları' } },
    ] }
    const structural = { type: 'Screen', children: [
      { type: 'SearchField', props: { placeholder: 'Projelerde ara' } },
      { type: 'ListItem', props: { title: 'Atlas Yenileme' } },
    ] }

    expect(evaluateSectionTopology(textOnly, requirements)).toMatchObject({ topologyRoleCoverage: 0, missingTopologyRoles: ['filters', 'entity-list'] })
    expect(evaluateSectionTopology(structural, requirements)).toMatchObject({ topologyRoleCoverage: 1, missingTopologyRoles: [] })
  })

  it('assigns unique ownership and repairs management-list ordering without losing shell nodes', () => {
    const requirements = [
      { section: 'Filtreler', role: 'filters' as const },
      { section: 'Proje kayıtları', role: 'entity-list' as const },
      { section: 'Hızlı işlemler', role: 'actions' as const },
    ]
    const root = { type: 'Screen', props: {}, children: [
      { id: 'bar', type: 'TopAppBar', props: { title: 'Projeler' } },
      { id: 'action', type: 'Button', props: { label: 'Yeni proje' } },
      { id: 'list', type: 'ListItem', props: { title: 'Atlas' } },
      { id: 'filter', type: 'SearchField', props: { placeholder: 'Ara' } },
      { id: 'nav', type: 'BottomNavigation', props: { items: ['Projeler'] } },
    ] }

    expect(evaluateSectionOwnership(root, 'management_list', requirements).orderingValid).toBe(false)
    const assigned = assignSectionOwnership(root, 'management_list', requirements)
    expect(assigned).toMatchObject({ ownershipCoverage: 1, orderingValid: true, missingSections: [] })
    expect(root.children.map((node) => node.id)).toEqual(['bar', 'filter', 'list', 'action', 'nav'])
    expect(root.children[1].props).toMatchObject({ contractSection: 'Filtreler', contractSectionRole: 'filters' })
    expect(evaluateSectionOwnership(root, 'management_list', requirements).orderingValid).toBe(true)
  })

  it('does not let one component own two required sections', () => {
    const root = { type: 'Screen', children: [{ id: 'only-row', type: 'ListItem', props: { title: 'Atlas' } }] }
    const result = evaluateSectionOwnership(root, 'management_list', [
      { section: 'Aktif projeler', role: 'entity-list' },
      { section: 'Geciken projeler', role: 'entity-list' },
    ])
    expect(result.ownershipCoverage).toBe(0.5)
    expect(result.missingSections).toEqual(['Geciken projeler'])
  })

  it('materializes heading and owner inside explicit Stack containers while preserving shell', () => {
    const requirements = [
      { section: 'Filtreler', role: 'filters' as const },
      { section: 'Proje kayıtları', role: 'entity-list' as const },
    ]
    const root = { type: 'Screen', children: [
      { id: 'bar', type: 'TopAppBar', props: { title: 'Projeler' } },
      { id: 'filter-heading', type: 'Text', props: { text: 'Filtreler', variant: 'heading' } },
      { id: 'filter', type: 'SearchField', props: { placeholder: 'Ara', contractSection: 'Filtreler', contractSectionRole: 'filters' } },
      { id: 'row', type: 'ListItem', props: { title: 'Atlas', contractSection: 'Proje kayıtları', contractSectionRole: 'entity-list' } },
      { id: 'nav', type: 'BottomNavigation', props: { items: ['Projeler'] } },
    ] }

    const report = materializeSectionContainers(root, requirements, { maxAddedNodes: 3 })
    expect(report).toMatchObject({ containerCoverage: 1, orphanOwnedNodeCount: 0, missingHeadingCount: 0, materializedContainerCount: 2 })
    expect(root.children.map((node) => node.type)).toEqual(['TopAppBar', 'Stack', 'Stack', 'BottomNavigation'])
    expect(root.children[1].children?.map((node) => node.id)).toEqual(['filter-heading', 'filter'])
    expect(root.children[2].children?.map((node) => node.type)).toEqual(['Text', 'ListItem'])
    const snapshot = JSON.stringify(root)
    expect(materializeSectionContainers(root, requirements)).toEqual(evaluateSectionContainers(root, requirements))
    expect(JSON.stringify(root)).toBe(snapshot)
  })

  it('leaves ownership visible for quality rejection when the node budget cannot fit containers', () => {
    const requirements = [{ section: 'Filtreler', role: 'filters' as const }]
    const root = { type: 'Screen', children: [
      { id: 'filter', type: 'SearchField', props: { placeholder: 'Ara', contractSection: 'Filtreler', contractSectionRole: 'filters' } },
    ] }
    expect(materializeSectionContainers(root, requirements, { maxAddedNodes: 1 })).toMatchObject({ containerCoverage: 0, orphanOwnedNodeCount: 1 })
    expect(root.children[0].type).toBe('SearchField')
  })

  it('moves every non-shell semantic node into the best matching section container', () => {
    const requirements = [
      { section: 'Filtreler', role: 'filters' as const },
      { section: 'Kayıtlar', role: 'entity-list' as const },
      { section: 'İşlemler', role: 'actions' as const },
    ]
    const container = (id: string, section: string, role: string, ownerType: string) => ({
      id, type: 'Stack', props: { semanticContainer: true, contractSection: section, contractSectionRole: role },
      children: [
        { id: `${id}-heading`, type: 'Text', props: { text: section, variant: 'heading' } },
        { id: `${id}-owner`, type: ownerType, props: { contractSection: section, contractSectionRole: role } },
      ],
    })
    const root = { type: 'Screen', children: [
      { id: 'bar', type: 'TopAppBar', props: { title: 'Projeler' } },
      container('filters', 'Filtreler', 'filters', 'SearchField'),
      container('records', 'Kayıtlar', 'entity-list', 'ListItem'),
      container('actions', 'İşlemler', 'actions', 'Button'),
      { id: 'extra-filter', type: 'SegmentedControl', props: { items: ['Tümü', 'Aktif'] } },
      { id: 'extra-row', type: 'ListItem', props: { title: 'Atlas' } },
      { id: 'extra-action', type: 'Button', props: { label: 'Yeni proje' } },
      { id: 'nav', type: 'BottomNavigation', props: { items: ['Projeler'] } },
    ] }

    const report = assignSectionMembers(root, requirements)
    expect(report).toMatchObject({ memberCoverage: 1, orphanSemanticNodeCount: 0, crossSectionViolationCount: 0, assignedMemberCount: 3 })
    expect(root.children.map((node) => node.id)).toEqual(['bar', 'filters', 'records', 'actions', 'nav'])
    expect(root.children[1].children?.at(-1)?.id).toBe('extra-filter')
    expect(root.children[2].children?.at(-1)?.id).toBe('extra-row')
    expect(root.children[3].children?.at(-1)?.id).toBe('extra-action')
    const snapshot = JSON.stringify(root)
    expect(assignSectionMembers(root, requirements).assignedMemberCount).toBe(0)
    expect(JSON.stringify(root)).toBe(snapshot)
  })

  it('reports orphan and cross-section members instead of accepting mislabeled grouping', () => {
    const requirements = [{ section: 'Filtreler', role: 'filters' as const }]
    const root = { type: 'Screen', children: [
      { id: 'filters', type: 'Stack', props: { semanticContainer: true, contractSection: 'Filtreler', contractSectionRole: 'filters' }, children: [
        { id: 'heading', type: 'Text', props: { text: 'Filtreler' } },
        { id: 'wrong', type: 'SearchField', props: { contractSection: 'Başka bölüm', contractSectionRole: 'filters' } },
      ] },
      { id: 'orphan', type: 'Button', props: { label: 'Uygula' } },
    ] }
    expect(evaluateSectionMembers(root, requirements)).toMatchObject({ memberCoverage: 0, orphanSemanticNodeCount: 1, crossSectionViolationCount: 1 })
  })

  it('uses ScreenContract terms to separate neutral Text nodes with deterministic confidence', () => {
    const requirements = [
      { section: 'Fatura ayrıntıları', role: 'details' as const },
      { section: 'Fatura işlemleri', role: 'actions' as const },
    ]
    const container = (id: string, section: string, role: string, ownerType: string) => ({
      id, type: 'Stack', props: { semanticContainer: true, contractSection: section, contractSectionRole: role }, children: [
        { id: `${id}-heading`, type: 'Text', props: { text: section } },
        { id: `${id}-owner`, type: ownerType, props: { contractSection: section, contractSectionRole: role } },
      ],
    })
    const root = { type: 'Screen', children: [
      container('details', 'Fatura ayrıntıları', 'details', 'ListItem'),
      container('actions', 'Fatura işlemleri', 'actions', 'Button'),
      { id: 'date-copy', type: 'Text', props: { text: 'Ödeme tarihi 14 Ağustos 2026' } },
      { id: 'send-copy', type: 'Text', props: { text: 'Faturayı müşteriye gönder' } },
    ] }
    const report = assignSectionMembers(root, requirements, {
      job: 'Müşteri faturasını hazırlamak ve tahsilatı izlemek',
      primaryAction: 'Faturayı müşteriye gönder',
      secondaryActions: ['Taslağı kaydet'],
      requiredData: ['ödeme tarihi', 'fatura tutarı'],
    })

    expect(root.children[0].children?.at(-1)?.id).toBe('date-copy')
    expect(root.children[1].children?.at(-1)?.id).toBe('send-copy')
    expect(report.semanticAssignmentConfidence).toBeGreaterThan(0.3)
    expect(report.lowConfidenceMemberCount).toBe(0)
    expect(root.children[1].children?.at(-1)?.props).toMatchObject({ sectionAssignmentMethod: 'semantic' })
  })

  it('flags semantically unrelated copy while allowing neutral structural separators', () => {
    const requirements = [{ section: 'Proje kayıtları', role: 'entity-list' as const }]
    const root = { type: 'Screen', children: [
      { id: 'records', type: 'Stack', props: { semanticContainer: true, contractSection: 'Proje kayıtları', contractSectionRole: 'entity-list' }, children: [
        { id: 'heading', type: 'Text', props: { text: 'Proje kayıtları' } },
        { id: 'owner', type: 'ListItem', props: { contractSection: 'Proje kayıtları', contractSectionRole: 'entity-list' } },
      ] },
      { id: 'unrelated', type: 'Text', props: { text: 'Hoş geldiniz' } },
      { id: 'divider', type: 'Divider', props: {} },
    ] }
    const report = assignSectionMembers(root, requirements, { job: 'Projeleri yönetmek', primaryAction: 'Proje oluştur', secondaryActions: [], requiredData: ['proje adı'] })
    expect(report.lowConfidenceMemberCount).toBe(1)
    expect(root.children[0].children?.find((node) => node.id === 'divider')?.props).toMatchObject({ sectionAssignmentMethod: 'structural', sectionAssignmentConfidence: 1 })
  })

  it('marks a deterministic tie as ambiguous instead of silently treating it as decisive', () => {
    const requirements = [
      { section: 'Kayıtlar', role: 'entity-list' as const },
      { section: 'Ayrıntılar', role: 'details' as const },
    ]
    const container = (id: string, section: string, role: string) => ({
      id, type: 'Stack', props: { semanticContainer: true, contractSection: section, contractSectionRole: role }, children: [
        { id: `${id}-heading`, type: 'Text', props: { text: section } },
        { id: `${id}-owner`, type: 'ListItem', props: { contractSection: section, contractSectionRole: role } },
      ],
    })
    const root = { type: 'Screen', children: [
      container('records', 'Kayıtlar', 'entity-list'),
      container('details', 'Ayrıntılar', 'details'),
      { id: 'neutral-row', type: 'ListItem', props: { title: 'Güncel öğe' } },
    ] }

    const report = assignSectionMembers(root, requirements)

    expect(root.children[0].children?.at(-1)?.id).toBe('neutral-row')
    expect(root.children[0].children?.at(-1)?.props).toMatchObject({ sectionAssignmentMargin: 0, sectionAssignmentAmbiguous: true })
    expect(report).toMatchObject({ ambiguousMemberCount: 1, averageAssignmentMargin: 0 })
  })

  it('uses contract semantics to create a decisive assignment margin', () => {
    const requirements = [
      { section: 'Fatura kayıtları', role: 'entity-list' as const },
      { section: 'Tahsilat ayrıntıları', role: 'details' as const },
    ]
    const container = (id: string, section: string, role: string) => ({
      id, type: 'Stack', props: { semanticContainer: true, contractSection: section, contractSectionRole: role }, children: [
        { id: `${id}-heading`, type: 'Text', props: { text: section } },
        { id: `${id}-owner`, type: 'ListItem', props: { contractSection: section, contractSectionRole: role } },
      ],
    })
    const root = { type: 'Screen', children: [
      container('records', 'Fatura kayıtları', 'entity-list'),
      container('details', 'Tahsilat ayrıntıları', 'details'),
      { id: 'payment-row', type: 'ListItem', props: { title: 'Tahsilat ayrıntıları ve ödeme tarihi' } },
    ] }

    const report = assignSectionMembers(root, requirements, {
      job: 'Faturaları ve tahsilatları yönetmek', primaryAction: 'Tahsilatı kaydet', secondaryActions: [], requiredData: ['ödeme tarihi'],
    })

    expect(root.children[1].children?.at(-1)?.id).toBe('payment-row')
    expect(root.children[1].children?.at(-1)?.props.sectionAssignmentMargin).toBeGreaterThanOrEqual(0.15)
    expect(report.ambiguousMemberCount).toBe(0)
  })

  it('never marks an explicit section assignment as ambiguous', () => {
    const requirements = [
      { section: 'Kayıtlar', role: 'entity-list' as const },
      { section: 'Ayrıntılar', role: 'details' as const },
    ]
    const root = { type: 'Screen', children: [
      { id: 'records', type: 'Stack', props: { semanticContainer: true, contractSection: 'Kayıtlar', contractSectionRole: 'entity-list' }, children: [{ id: 'records-heading', type: 'Text', props: { text: 'Kayıtlar' } }] },
      { id: 'details', type: 'Stack', props: { semanticContainer: true, contractSection: 'Ayrıntılar', contractSectionRole: 'details' }, children: [{ id: 'details-heading', type: 'Text', props: { text: 'Ayrıntılar' } }] },
      { id: 'explicit', type: 'ListItem', props: { title: 'Öğe', contractSection: 'Ayrıntılar', contractSectionRole: 'details', contractRepairEvidence: true } },
    ] }

    const report = assignSectionMembers(root, requirements)

    expect(root.children[1].children?.at(-1)?.props).toMatchObject({ sectionAssignmentMethod: 'explicit', sectionAssignmentMargin: 1, sectionAssignmentAmbiguous: false })
    expect(report.ambiguousMemberCount).toBe(0)
    expect(report.contractEvidenceAssignmentCount).toBe(1)
  })

  it('detects empty containers and dominant member concentration on multi-section screens', () => {
    const requirements = [
      { section: 'Özet', role: 'summary' as const },
      { section: 'İşlemler', role: 'actions' as const },
      { section: 'Analiz', role: 'analytics' as const },
    ]
    const member = (id: string, section: string, role: string, type: string) => ({
      id, type, props: { contractSection: section, contractSectionRole: role, sectionMember: true, sectionAssignmentConfidence: 1, sectionAssignmentMargin: 1 },
    })
    const root = { type: 'Screen', children: [
      { id: 'summary', type: 'Stack', props: { semanticContainer: true, contractSection: 'Özet', contractSectionRole: 'summary' }, children: [
        { id: 'summary-heading', type: 'Text', props: { text: 'Özet' } },
        member('metric-1', 'Özet', 'summary', 'Metric'),
        member('metric-2', 'Özet', 'summary', 'Metric'),
        member('metric-3', 'Özet', 'summary', 'Metric'),
        member('metric-4', 'Özet', 'summary', 'Metric'),
      ] },
      { id: 'actions', type: 'Stack', props: { semanticContainer: true, contractSection: 'İşlemler', contractSectionRole: 'actions' }, children: [
        { id: 'actions-heading', type: 'Text', props: { text: 'İşlemler' } },
        member('button', 'İşlemler', 'actions', 'Button'),
      ] },
      { id: 'analytics', type: 'Stack', props: { semanticContainer: true, contractSection: 'Analiz', contractSectionRole: 'analytics' }, children: [
        { id: 'analytics-heading', type: 'Text', props: { text: 'Analiz' } },
      ] },
    ] }

    expect(evaluateSectionMembers(root, requirements)).toMatchObject({
      emptyContainerCount: 1,
      maxMemberConcentration: 0.8,
      distributionBalanced: false,
    })
  })

  it('does not penalize small or exactly seventy-five-percent distributions', () => {
    const requirements = [
      { section: 'Özet', role: 'summary' as const },
      { section: 'İşlemler', role: 'actions' as const },
    ]
    const root = { type: 'Screen', children: [
      { type: 'Stack', props: { semanticContainer: true, contractSection: 'Özet', contractSectionRole: 'summary' }, children: [
        { type: 'Text', props: { text: 'Özet' } }, { type: 'Metric', props: { contractSection: 'Özet', contractSectionRole: 'summary' } },
        { type: 'Metric', props: { contractSection: 'Özet', contractSectionRole: 'summary' } }, { type: 'Metric', props: { contractSection: 'Özet', contractSectionRole: 'summary' } },
      ] },
      { type: 'Stack', props: { semanticContainer: true, contractSection: 'İşlemler', contractSectionRole: 'actions' }, children: [
        { type: 'Text', props: { text: 'İşlemler' } }, { type: 'Button', props: { contractSection: 'İşlemler', contractSectionRole: 'actions' } },
      ] },
    ] }

    expect(evaluateSectionMembers(root, requirements)).toMatchObject({ maxMemberConcentration: 0.75, distributionBalanced: true })
  })

  it('measures role purity while ignoring neutral presentation nodes', () => {
    const requirements = [{ section: 'Filtreler', role: 'filters' as const }]
    const root = { type: 'Screen', children: [
      { type: 'Stack', props: { semanticContainer: true, contractSection: 'Filtreler', contractSectionRole: 'filters' }, children: [
        { type: 'Text', props: { text: 'Filtreler' } },
        { type: 'SearchField', props: { contractSection: 'Filtreler', contractSectionRole: 'filters' } },
        { type: 'Divider', props: { contractSection: 'Filtreler', contractSectionRole: 'filters' } },
        { type: 'Button', props: { contractSection: 'Filtreler', contractSectionRole: 'filters', label: 'Kaydet' } },
      ] },
    ] }

    expect(evaluateSectionMembers(root, requirements)).toMatchObject({ rolePurity: 0.5, crossRoleMemberCount: 1 })
  })

  it('accepts components shared by multiple roles when the current role supports them', () => {
    const requirements = [{ section: 'Ayrıntılar', role: 'details' as const }]
    const root = { type: 'Screen', children: [
      { type: 'Stack', props: { semanticContainer: true, contractSection: 'Ayrıntılar', contractSectionRole: 'details' }, children: [
        { type: 'Text', props: { text: 'Ayrıntılar' } },
        { type: 'ListItem', props: { contractSection: 'Ayrıntılar', contractSectionRole: 'details' } },
        { type: 'Metric', props: { contractSection: 'Ayrıntılar', contractSectionRole: 'details' } },
      ] },
    ] }

    expect(evaluateSectionMembers(root, requirements)).toMatchObject({ rolePurity: 1, crossRoleMemberCount: 0 })
  })

  it.each([
    ['CareSummary', 'summary'],
    ['ProductCard', 'entity-list'],
    ['QuizChoice', 'form-fields'],
    ['StoryCard', 'entity-list'],
    ['SignalChart', 'analytics'],
  ] as const)('maps domain component %s to its semantic role %s', (type, role) => {
    const requirements = [{ section: 'Domain bölümü', role }]
    const root = { type: 'Screen', children: [
      { type: 'Stack', props: { semanticContainer: true, contractSection: 'Domain bölümü', contractSectionRole: role }, children: [
        { type: 'Text', props: { text: 'Domain bölümü' } },
        { type, props: { contractSection: 'Domain bölümü', contractSectionRole: role } },
      ] },
    ] }

    expect(evaluateSectionTopology(root, requirements).topologyRoleCoverage).toBe(1)
    expect(evaluateSectionMembers(root, requirements)).toMatchObject({ rolePurity: 1, crossRoleMemberCount: 0 })
  })

  it('rejects a domain component placed under an unrelated section role', () => {
    const requirements = [{ section: 'Filtreler', role: 'filters' as const }]
    const root = { type: 'Screen', children: [
      { type: 'Stack', props: { semanticContainer: true, contractSection: 'Filtreler', contractSectionRole: 'filters' }, children: [
        { type: 'Text', props: { text: 'Filtreler' } },
        { type: 'ProductCard', props: { contractSection: 'Filtreler', contractSectionRole: 'filters' } },
      ] },
    ] }

    expect(evaluateSectionMembers(root, requirements)).toMatchObject({ rolePurity: 0, crossRoleMemberCount: 1 })
  })
})
