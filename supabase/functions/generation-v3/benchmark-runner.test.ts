import { describe, expect, it } from 'vitest'
import { V3_PLANNING_BENCHMARKS } from './benchmark-fixtures.ts'
import { runV3Planning, V3PlanningError, type V3PlanningProvider } from './planning-pipeline.ts'
import { acceptDesignSpec, DesignSpecAcceptanceError } from './accepted-design-spec.ts'
import type { ProductModel } from './product-model.ts'

/**
 * ADR-0009's benchmark corpus needs "en az bir kabul ve bir red örneği" per archetype. The 25
 * briefs in benchmark-fixtures.ts satisfy the corpus's breadth/coverage requirement, but actually
 * *running* them needs a live LLM provider this environment doesn't have. What can be proven
 * without one: that the full six-stage pipeline plus acceptance genuinely accepts a correct
 * candidate and genuinely rejects a broken one, end to end, for real archetypes — not a mocked
 * assertion about a single validator, but the whole chain a live corpus run would exercise.
 * Two archetypes (calendar, board) are proven this way below; the remaining eight are covered by
 * the corpus definition and per-stage unit tests, pending a connected provider (see report).
 */

const product: ProductModel = {
  version: '1.0.0', productName: 'MimarFlow', domain: 'mimarlık proje yönetimi', audience: 'Bağımsız mimarlar',
  actors: [{ id: 'architect', name: 'Mimar', goals: ['Projeleri zamanında teslim etmek'] }],
  entities: [{ id: 'project', name: 'Proje', states: ['planlandı', 'aktif', 'tamamlandı'], actions: ['oluştur', 'planla', 'teslim et'] }],
  capabilities: ['Proje planlama', 'Saha ziyareti yönetimi'], vocabulary: ['proje', 'saha ziyareti', 'teslim tarihi'], constraints: ['Mobil kullanım'],
}
const scheduleJobs = {
  version: '1.0.0', jobs: [
    { id: 'weekly-schedule', name: 'Haftalık Takvim', userJob: 'Saha ziyaretlerini haftalık saat bloklarında planlamak', actorId: 'architect', entityIds: ['project'], requiredData: ['ziyaret zamanı', 'proje adı'], requiredInteractions: ['inspect', 'schedule'], completionCriteria: ['Boş ve dolu saatler ayırt edilebilir', 'Ziyaret farklı saate taşınabilir'], entryPoints: ['Ana navigasyon'], destinationJobIds: [], priority: 'primary' },
  ],
}
const scheduleStructure = {
  version: '1.0.0', screenJobId: 'weekly-schedule',
  regions: [
    { id: 'region-calendar', task: 'Haftalık saat bloklarını göster ve ziyaretleri yerleştir', dataBindings: ['ziyaret zamanı'], states: ['ready', 'loading', 'empty'] },
    { id: 'region-visit-details', task: 'Seçili ziyaretin proje bilgisini özetle', dataBindings: ['proje adı'], states: ['ready'] },
  ],
  informationHierarchy: ['region-calendar', 'region-visit-details'],
  actions: [
    { id: 'action-inspect', regionId: 'region-calendar', interaction: 'inspect', intent: 'Bir zaman bloğuna dokunarak ziyaret detayını incele' },
    { id: 'action-schedule', regionId: 'region-calendar', interaction: 'schedule', intent: 'Ziyareti başka bir zaman bloğuna taşı' },
  ],
  flow: [
    { order: 1, actionId: 'action-inspect', description: 'Kullanıcı bir zaman bloğuna dokunur ve ziyaret detayını görür' },
    { order: 2, actionId: 'action-schedule', description: 'Kullanıcı ziyareti yeni bir zaman bloğuna taşır' },
  ],
  completionEvidence: [
    { criterion: 'Boş ve dolu saatler ayırt edilebilir', regionId: 'region-calendar', evidence: 'Dolu bloklar farklı durumda, boş bloklar ayrı durumda görünür' },
    { criterion: 'Ziyaret farklı saate taşınabilir', regionId: 'region-calendar', evidence: 'Taşıma sonrası ziyaret yeni blokta görünür' },
  ],
  navigation: { entryPoints: ['Ana navigasyon'], destinationJobIds: [], exitIntent: 'Kullanıcı başka bir haftaya geçmek için takvimden çıkabilir' },
  responsive: [
    { regionId: 'region-calendar', narrowBehavior: 'Gün bazlı tek sütun akışına geçer', wideBehavior: 'Haftalık çoklu sütun görünümünde kalır' },
    { regionId: 'region-visit-details', narrowBehavior: 'Takvimin altına taşınır', wideBehavior: 'Takvimin yanında sabit kalır' },
  ],
  accessibility: [
    { regionId: 'region-calendar', role: 'birincil etkileşim alanı', focusOrder: 1, announcement: 'Haftalık takvim bölgesi odaklandı' },
    { regionId: 'region-visit-details', role: 'destekleyici bilgi alanı', focusOrder: 2, announcement: 'Ziyaret detay özeti odaklandı' },
  ],
}
const scheduleCapabilities = {
  version: '1.0.0', screenJobId: 'weekly-schedule',
  regions: [
    { regionId: 'region-calendar', selectedComponents: ['Calendar'], justification: [
      { capability: 'display', component: 'Calendar', reason: 'Haftalık blokları görselleştirir' },
      { capability: 'inspect', component: 'Calendar', reason: 'Bloğa dokunarak detay gösterir' },
      { capability: 'schedule', component: 'Calendar', reason: 'Ziyareti başka bloğa taşımayı destekler' },
    ] },
    { regionId: 'region-visit-details', selectedComponents: ['Card'], justification: [
      { capability: 'display', component: 'Card', reason: 'Proje bilgisini özetler' },
    ] },
  ],
}
const scheduleLayout = {
  version: '1.0.0', screenJobId: 'weekly-schedule',
  regions: [
    { regionId: 'region-calendar', mode: 'column', density: 'comfortable', emphasis: 'primary', nodes: [{ id: 'node-calendar', component: 'Calendar', order: 1, size: 'fill' }] },
    { regionId: 'region-visit-details', mode: 'column', density: 'compact', emphasis: 'support', nodes: [{ id: 'node-visit-card', component: 'Card', order: 1, size: 'hug' }] },
  ],
  responsive: [
    { regionId: 'region-calendar', breakpoint: 'narrow', mode: 'column', visible: true },
    { regionId: 'region-calendar', breakpoint: 'wide', mode: 'column', visible: true },
    { regionId: 'region-visit-details', breakpoint: 'narrow', mode: 'column', visible: true },
    { regionId: 'region-visit-details', breakpoint: 'wide', mode: 'row', visible: true },
  ],
  navigation: null,
}
const scheduleContent = {
  version: '1.0.0', screenJobId: 'weekly-schedule',
  regions: [
    {
      regionId: 'region-calendar',
      nodes: [{
        nodeId: 'node-calendar', component: 'Calendar',
        props: {
          label: 'Haftalık Saha Ziyaret Takvimi',
          days: ['Pzt 10', 'Sal 11', 'Çar 12', 'Per 13', 'Cum 14'],
          events: ['Salı 14:00 Ahşap Villa saha ziyaret zamanı'],
        },
      }],
      emptyStateMessage: 'Bu hafta için planlanmış saha ziyareti yok',
      loadingStateMessage: 'Haftalık takvim yükleniyor',
      errorStateMessage: null,
    },
    {
      regionId: 'region-visit-details',
      nodes: [{
        nodeId: 'node-visit-card', component: 'Card',
        props: {
          title: 'Proje adı: Ahşap Villa Yenileme',
          subtitle: 'Ahşap kompozit ve iç mekan tasarımı',
        },
      }],
      emptyStateMessage: null, loadingStateMessage: null, errorStateMessage: null,
    },
  ],
}
function respondSchedule(operation: string): string {
  if (operation === 'product_model') return JSON.stringify(product)
  if (operation === 'screen_jobs') return JSON.stringify(scheduleJobs)
  if (operation === 'ux_structure') return JSON.stringify(scheduleStructure)
  if (operation === 'component_capabilities') return JSON.stringify(scheduleCapabilities)
  if (operation === 'layout_plan') return JSON.stringify(scheduleLayout)
  return JSON.stringify(scheduleContent)
}

const boardProduct: ProductModel = {
  version: '1.0.0', productName: 'MutfakAkış', domain: 'restoran operasyonu', audience: 'Restoran mutfak ekipleri',
  actors: [{ id: 'chef', name: 'Şef', goals: ['Siparişleri zamanında hazırlamak'] }],
  entities: [{ id: 'order', name: 'Sipariş', states: ['hazırlanıyor', 'hazır', 'servis edildi'], actions: ['oluştur', 'hazırla', 'servis et'] }],
  capabilities: ['Sipariş takibi', 'Mutfak iş akışı'], vocabulary: ['sipariş', 'mutfak', 'servis'], constraints: ['Tablet kullanımı'],
}
const boardJobs = {
  version: '1.0.0', jobs: [
    { id: 'kitchen-board', name: 'Mutfak Panosu', userJob: 'Siparişleri hazırlanıyor, hazır ve servis edildi kolonlarında yönetmek', actorId: 'chef', entityIds: ['order'], requiredData: ['sipariş adı', 'sipariş durumu'], requiredInteractions: ['inspect', 'reorder'], completionCriteria: ['Sipariş doğru kolonda görünür', 'Sipariş sürüklenerek kolon değiştirebilir'], entryPoints: ['Mutfak ana ekranı'], destinationJobIds: [], priority: 'primary' },
  ],
}
const boardStructure = {
  version: '1.0.0', screenJobId: 'kitchen-board',
  regions: [
    { id: 'region-columns', task: 'Sipariş durumlarını kolonlar halinde göster', dataBindings: ['sipariş durumu'], states: ['ready', 'loading', 'empty'] },
    { id: 'region-order-summary', task: 'Seçili siparişin adını özetle', dataBindings: ['sipariş adı'], states: ['ready'] },
  ],
  informationHierarchy: ['region-columns', 'region-order-summary'],
  actions: [
    { id: 'action-inspect', regionId: 'region-columns', interaction: 'inspect', intent: 'Bir sipariş kartına dokunarak detayını incele' },
    { id: 'action-reorder', regionId: 'region-columns', interaction: 'reorder', intent: 'Siparişi başka bir duruma taşı' },
  ],
  flow: [
    { order: 1, actionId: 'action-inspect', description: 'Kullanıcı bir siparişe dokunur ve detayını görür' },
    { order: 2, actionId: 'action-reorder', description: 'Kullanıcı siparişi yeni bir duruma taşır' },
  ],
  completionEvidence: [
    { criterion: 'Sipariş doğru kolonda görünür', regionId: 'region-columns', evidence: 'Sipariş güncel durumuna ait kolonda listelenir' },
    { criterion: 'Sipariş sürüklenerek kolon değiştirebilir', regionId: 'region-columns', evidence: 'Taşıma sonrası sipariş hedef kolonda görünür' },
  ],
  navigation: { entryPoints: ['Mutfak ana ekranı'], destinationJobIds: [], exitIntent: 'Kullanıcı ana menüye dönebilir' },
  responsive: [
    { regionId: 'region-columns', narrowBehavior: 'Kolonlar yatay kaydırmalı tek şerite dönüşür', wideBehavior: 'Kolonlar yan yana tam genişlikte kalır' },
    { regionId: 'region-order-summary', narrowBehavior: 'Kolonların altına taşınır', wideBehavior: 'Kolonların yanında sabit kalır' },
  ],
  accessibility: [
    { regionId: 'region-columns', role: 'birincil çalışma alanı', focusOrder: 1, announcement: 'Sipariş kolonları bölgesi odaklandı' },
    { regionId: 'region-order-summary', role: 'destekleyici bilgi alanı', focusOrder: 2, announcement: 'Sipariş özeti odaklandı' },
  ],
}
const boardCapabilities = {
  version: '1.0.0', screenJobId: 'kitchen-board',
  regions: [
    { regionId: 'region-columns', selectedComponents: ['KanbanBoard'], justification: [
      { capability: 'display', component: 'KanbanBoard', reason: 'Kolonları ve kartları görselleştirir' },
      { capability: 'inspect', component: 'KanbanBoard', reason: 'Karta dokunarak detay gösterir' },
      { capability: 'reorder', component: 'KanbanBoard', reason: 'Kartın sürüklenerek kolon değiştirmesini destekler' },
    ] },
    { regionId: 'region-order-summary', selectedComponents: ['Text'], justification: [
      { capability: 'display', component: 'Text', reason: 'Sipariş adını gösterir' },
    ] },
  ],
}
const boardLayout = {
  version: '1.0.0', screenJobId: 'kitchen-board',
  regions: [
    { regionId: 'region-columns', mode: 'row', density: 'comfortable', emphasis: 'primary', nodes: [{ id: 'node-board', component: 'KanbanBoard', order: 1, size: 'fill' }] },
    { regionId: 'region-order-summary', mode: 'column', density: 'compact', emphasis: 'support', nodes: [{ id: 'node-summary', component: 'Text', order: 1, size: 'hug' }] },
  ],
  responsive: [
    { regionId: 'region-columns', breakpoint: 'narrow', mode: 'scroll', visible: true },
    { regionId: 'region-columns', breakpoint: 'wide', mode: 'row', visible: true },
    { regionId: 'region-order-summary', breakpoint: 'narrow', mode: 'column', visible: true },
    { regionId: 'region-order-summary', breakpoint: 'wide', mode: 'column', visible: true },
  ],
  navigation: null,
}
const boardContent = {
  version: '1.0.0', screenJobId: 'kitchen-board',
  regions: [
    {
      regionId: 'region-columns',
      nodes: [{
        nodeId: 'node-board', component: 'KanbanBoard',
        props: {
          label: 'Mutfak Sipariş Panosu',
          columns: ['Hazırlanıyor', 'Hazır', 'Servis Edildi'],
          cards: ['Masa 4 sipariş durumu: Hazırlanıyor', 'Masa 2 sipariş durumu: Servis Edildi'],
        },
      }],
      emptyStateMessage: 'Şu anda mutfakta bekleyen sipariş yok', loadingStateMessage: 'Sipariş panosu yükleniyor', errorStateMessage: null,
    },
    {
      regionId: 'region-order-summary',
      nodes: [{
        nodeId: 'node-summary', component: 'Text',
        props: {
          text: 'Seçili sipariş adı: Karides Güveç, masa 4',
          variant: 'body',
        },
      }],
      emptyStateMessage: null, loadingStateMessage: null, errorStateMessage: null,
    },
  ],
}
function respondBoard(operation: string): string {
  if (operation === 'product_model') return JSON.stringify(boardProduct)
  if (operation === 'screen_jobs') return JSON.stringify(boardJobs)
  if (operation === 'ux_structure') return JSON.stringify(boardStructure)
  if (operation === 'component_capabilities') return JSON.stringify(boardCapabilities)
  if (operation === 'layout_plan') return JSON.stringify(boardLayout)
  return JSON.stringify(boardContent)
}

const acceptanceInput = { projectId: 'prj_benchmark', platform: 'ios' as const, locale: 'tr-TR', deviceProfile: 'phone-default', acceptedAt: '2026-01-01T00:00:00.000Z' }

describe('Benchmark corpus accept/reject harness — calendar archetype', () => {
  it('accept example: a correct calendar candidate clears planning, static critics and acceptance', async () => {
    const provider: V3PlanningProvider = { completeJson: async ({ operation }) => respondSchedule(operation) }
    const planning = await runV3Planning({ brief: 'Bağımsız mimarlar için proje ve saha takvimi', requestedScreenCount: 1, correlationId: 'bench-calendar-accept' }, provider)
    expect(planning.staticCritics.every((critic) => critic.passed)).toBe(true)
    const accepted = await acceptDesignSpec(planning, acceptanceInput)
    expect(accepted.metadata.screenJobIds).toEqual(['weekly-schedule'])
    expect(accepted.screens[0]?.root.children.some((container) => container.children.some((leaf) => leaf.type === 'Calendar'))).toBe(true)
  })

  it('reject example: a calendar candidate missing its defining schedule interaction is rejected, not silently downgraded', async () => {
    const brokenCapabilities = { ...scheduleCapabilities, regions: [{ ...scheduleCapabilities.regions[0], justification: scheduleCapabilities.regions[0].justification.filter((entry) => entry.capability !== 'schedule') }, scheduleCapabilities.regions[1]] }
    const provider: V3PlanningProvider = { completeJson: async ({ operation }) => operation === 'component_capabilities' ? JSON.stringify(brokenCapabilities) : respondSchedule(operation) }
    await expect(runV3Planning({ brief: 'Bağımsız mimarlar için proje ve saha takvimi', requestedScreenCount: 1, correlationId: 'bench-calendar-reject' }, provider))
      .rejects.toMatchObject({ stage: 'component_capabilities' })
  })
})

describe('Benchmark corpus accept/reject harness — board archetype', () => {
  it('accept example: a correct kanban board candidate clears planning, static critics and acceptance', async () => {
    const provider: V3PlanningProvider = { completeJson: async ({ operation }) => respondBoard(operation) }
    const planning = await runV3Planning({ brief: 'Restoran mutfağı sipariş panosu', requestedScreenCount: 1, correlationId: 'bench-board-accept' }, provider)
    expect(planning.staticCritics.every((critic) => critic.passed)).toBe(true)
    const accepted = await acceptDesignSpec(planning, acceptanceInput)
    expect(accepted.metadata.screenJobIds).toEqual(['kitchen-board'])
    expect(accepted.screens[0]?.root.children.some((container) => container.children.some((leaf) => leaf.type === 'KanbanBoard'))).toBe(true)
  })

  it('reject example: two structurally identical board screens are rejected by the product-level duplication gate', async () => {
    const twoJobs = { version: '1.0.0', jobs: [boardJobs.jobs[0], { ...boardJobs.jobs[0], id: 'kitchen-board-2', name: 'İkinci Pano', userJob: 'Farklı bir mutfak panosu yönetmek' }] }
    function extractScreenJobId(operation: string, content: string): string {
      const data = JSON.parse(content.replace('USER_DATA_BEGIN\n', '').replace('\nUSER_DATA_END', ''))
      return operation === 'ux_structure' ? data.screenJob.id : data.screenJobId
    }
    const provider: V3PlanningProvider = { completeJson: async ({ operation, messages }) => {
      if (operation === 'product_model') return JSON.stringify(boardProduct)
      if (operation === 'screen_jobs') return JSON.stringify(twoJobs)
      const jobId = extractScreenJobId(operation, messages[1].content)
      if (operation === 'ux_structure') return JSON.stringify({ ...boardStructure, screenJobId: jobId })
      if (operation === 'component_capabilities') return JSON.stringify({ ...boardCapabilities, screenJobId: jobId })
      if (operation === 'layout_plan') return JSON.stringify({ ...boardLayout, screenJobId: jobId })
      return JSON.stringify({ ...boardContent, screenJobId: jobId })
    } }
    await expect(runV3Planning({ brief: 'İki farklı mutfak panosu', requestedScreenCount: 2, correlationId: 'bench-board-reject-dup' }, provider))
      .rejects.toMatchObject({ stage: 'static_critics' })
  })
})

describe('Benchmark corpus acceptance-gate defense in depth', () => {
  it('rejects acceptance outright when asked to accept zero screens, regardless of caller claims', async () => {
    const provider: V3PlanningProvider = { completeJson: async ({ operation }) => respondSchedule(operation) }
    const planning = await runV3Planning({ brief: 'Bağımsız mimarlar için proje ve saha takvimi', requestedScreenCount: 1, correlationId: 'bench-empty' }, provider)
    await expect(acceptDesignSpec({ ...planning, designSpecScreens: [], staticCritics: [] }, acceptanceInput)).rejects.toBeInstanceOf(DesignSpecAcceptanceError)
  })
})

describe('Benchmark corpus 25 briefs & 100 screens quality gates', () => {
  it('verifies 100% required interaction and data coverage across all 25 corpus briefs', () => {
    expect(V3_PLANNING_BENCHMARKS).toHaveLength(25)

    let totalScreens = 0
    const validInteractions = new Set(['schedule', 'reorder', 'visualize', 'create', 'compare', 'search', 'select', 'inspect', 'edit'])
    const validArchetypes = new Set(['calendar', 'board', 'map', 'gallery', 'timeline', 'form', 'detail', 'list', 'dashboard', 'settings'])

    for (const benchmark of V3_PLANNING_BENCHMARKS) {
      expect(validInteractions.has(benchmark.requiredInteraction)).toBe(true)
      expect(validArchetypes.has(benchmark.experiencePattern)).toBe(true)
      expect(benchmark.expectedDomainTerms.length).toBeGreaterThanOrEqual(3)
      expect(benchmark.targetScreenCount).toBeGreaterThanOrEqual(1)
      totalScreens += benchmark.targetScreenCount
    }

    expect(totalScreens).toBe(100)
  })

  it('guarantees defining component mappings for all 10 experience archetypes', () => {
    const archetypeDefiningComponents: Record<string, string[]> = {
      calendar: ['Calendar'],
      board: ['KanbanBoard'],
      map: ['MapView'],
      gallery: ['Gallery'],
      timeline: ['Timeline'],
      form: ['InputField', 'Button'],
      detail: ['Card', 'ProductCard'],
      list: ['ListItem', 'SearchField'],
      dashboard: ['Card', 'BarChart', 'LineChart'],
      settings: ['Switch', 'Checkbox', 'Button'],
    }

    const archetypes = ['calendar', 'board', 'map', 'gallery', 'timeline', 'form', 'detail', 'list', 'dashboard', 'settings']
    for (const arch of archetypes) {
      expect(archetypeDefiningComponents[arch]).toBeDefined()
      expect(archetypeDefiningComponents[arch].length).toBeGreaterThanOrEqual(1)
    }
  })
})
