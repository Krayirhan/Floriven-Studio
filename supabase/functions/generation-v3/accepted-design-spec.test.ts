import { describe, expect, it } from 'vitest'
import { acceptDesignSpec, DesignSpecAcceptanceError } from './accepted-design-spec.ts'
import type { ComponentCapabilities } from './component-capabilities.ts'
import type { ContentPlan } from './content-plan.ts'
import { compileDesignSpecScreen } from './design-spec-compiler.ts'
import type { LayoutPlan } from './layout-plan.ts'
import type { V3PlanningOutput } from './planning-pipeline.ts'
import type { ProductModel } from './product-model.ts'
import type { RenderCriticsReport } from './render-critics.ts'
import type { ScreenJob } from './screen-jobs.ts'
import { runProductStaticCritics, runStaticCritics } from './static-critics.ts'
import type { UXStructure } from './ux-structure.ts'

const product: ProductModel = {
  version: '1.0.0', productName: 'MimarFlow', domain: 'mimarlık proje yönetimi', audience: 'Bağımsız mimarlar',
  actors: [{ id: 'architect', name: 'Mimar', goals: ['Projeleri zamanında teslim etmek'] }],
  entities: [{ id: 'project', name: 'Proje', states: ['planlandı', 'aktif', 'tamamlandı'], actions: ['oluştur', 'planla', 'teslim et'] }],
  capabilities: ['Proje planlama', 'Saha ziyareti yönetimi'], vocabulary: ['proje', 'saha ziyareti', 'teslim tarihi'], constraints: ['Mobil kullanım'],
}

const scheduleJob: ScreenJob = {
  id: 'weekly-schedule', name: 'Haftalık Takvim', userJob: 'Saha ziyaretlerini haftalık saat bloklarında planlamak', actorId: 'architect', entityIds: ['project'],
  requiredData: ['ziyaret zamanı', 'proje adı'], requiredInteractions: ['inspect', 'schedule'],
  completionCriteria: ['Boş ve dolu saatler ayırt edilebilir', 'Ziyaret farklı saate taşınabilir'],
  entryPoints: ['Ana navigasyon'], destinationJobIds: ['kitchen-board'], priority: 'primary',
}
const scheduleStructure: UXStructure = {
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
  navigation: { entryPoints: ['Ana navigasyon'], destinationJobIds: ['kitchen-board'], exitIntent: 'Kullanıcı mutfak panosuna geçebilir' },
  responsive: [
    { regionId: 'region-calendar', narrowBehavior: 'Gün bazlı tek sütun akışına geçer', wideBehavior: 'Haftalık çoklu sütun görünümünde kalır' },
    { regionId: 'region-visit-details', narrowBehavior: 'Takvimin altına taşınır', wideBehavior: 'Takvimin yanında sabit kalır' },
  ],
  accessibility: [
    { regionId: 'region-calendar', role: 'birincil etkileşim alanı', focusOrder: 1, announcement: 'Haftalık takvim bölgesi odaklandı' },
    { regionId: 'region-visit-details', role: 'destekleyici bilgi alanı', focusOrder: 2, announcement: 'Ziyaret detay özeti odaklandı' },
  ],
}
const scheduleCapabilities: ComponentCapabilities = {
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
const scheduleLayout: LayoutPlan = {
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
const scheduleContent: ContentPlan = {
  version: '1.0.0', screenJobId: 'weekly-schedule',
  regions: [
    {
      regionId: 'region-calendar',
      nodes: [{ nodeId: 'node-calendar', component: 'Calendar', fields: [
        { field: 'title', value: 'Salı 14:00 Ahşap Villa saha ziyareti' },
        { field: 'subtitle', value: 'Bu hafta planlanan ziyaret zamanı: Salı 14:00' },
      ] }],
      emptyStateMessage: 'Bu hafta için planlanmış saha ziyareti yok',
      loadingStateMessage: 'Haftalık takvim yükleniyor',
      errorStateMessage: null,
    },
    {
      regionId: 'region-visit-details',
      nodes: [{ nodeId: 'node-visit-card', component: 'Card', fields: [{ field: 'projectName', value: 'Proje adı: Ahşap Villa Yenileme' }] }],
      emptyStateMessage: null, loadingStateMessage: null, errorStateMessage: null,
    },
  ],
}
const scheduleScreen = compileDesignSpecScreen(scheduleJob, scheduleStructure, scheduleCapabilities, scheduleLayout, scheduleContent)

const boardJob: ScreenJob = {
  id: 'kitchen-board', name: 'Mutfak Panosu', userJob: 'Siparişleri hazırlanıyor, hazır ve servis edildi kolonlarında yönetmek', actorId: 'chef', entityIds: ['order'],
  requiredData: ['sipariş adı', 'sipariş durumu'], requiredInteractions: ['inspect', 'reorder'],
  completionCriteria: ['Sipariş doğru kolonda görünür', 'Sipariş sürüklenerek kolon değiştirebilir'],
  entryPoints: ['Mutfak ana ekranı'], destinationJobIds: ['weekly-schedule'], priority: 'primary',
}
const boardStructure: UXStructure = {
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
  navigation: { entryPoints: ['Mutfak ana ekranı'], destinationJobIds: ['weekly-schedule'], exitIntent: 'Kullanıcı takvime dönebilir' },
  responsive: [
    { regionId: 'region-columns', narrowBehavior: 'Kolonlar yatay kaydırmalı tek şerite dönüşür', wideBehavior: 'Kolonlar yan yana tam genişlikte kalır' },
    { regionId: 'region-order-summary', narrowBehavior: 'Kolonların altına taşınır', wideBehavior: 'Kolonların yanında sabit kalır' },
  ],
  accessibility: [
    { regionId: 'region-columns', role: 'birincil çalışma alanı', focusOrder: 1, announcement: 'Sipariş kolonları bölgesi odaklandı' },
    { regionId: 'region-order-summary', role: 'destekleyici bilgi alanı', focusOrder: 2, announcement: 'Sipariş özeti odaklandı' },
  ],
}
const boardCapabilities: ComponentCapabilities = {
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
const boardLayout: LayoutPlan = {
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
const boardContent: ContentPlan = {
  version: '1.0.0', screenJobId: 'kitchen-board',
  regions: [
    {
      regionId: 'region-columns',
      nodes: [{ nodeId: 'node-board', component: 'KanbanBoard', fields: [{ field: 'columns', value: 'Hazırlanıyor, Hazır, Servis Edildi sipariş durumu kolonları' }] }],
      emptyStateMessage: 'Şu anda mutfakta bekleyen sipariş yok', loadingStateMessage: 'Sipariş panosu yükleniyor', errorStateMessage: null,
    },
    {
      regionId: 'region-order-summary',
      nodes: [{ nodeId: 'node-summary', component: 'Text', fields: [{ field: 'summary', value: 'Seçili sipariş adı: Karides Güveç, masa 4' }] }],
      emptyStateMessage: null, loadingStateMessage: null, errorStateMessage: null,
    },
  ],
}
const boardScreen = compileDesignSpecScreen(boardJob, boardStructure, boardCapabilities, boardLayout, boardContent)

function buildPlanning(jobs: ScreenJob[], structures: UXStructure[], capabilities: ComponentCapabilities[], layouts: LayoutPlan[], contents: ContentPlan[], screens: ReturnType<typeof compileDesignSpecScreen>[]): V3PlanningOutput {
  const staticCritics = jobs.map((job, index) => runStaticCritics(job, structures[index], screens[index]))
  return {
    productModel: product, screenJobs: { version: '1.0.0', jobs }, uxStructures: structures,
    componentCapabilities: capabilities, layoutPlans: layouts, contentPlans: contents, designSpecScreens: screens,
    staticCritics, productStaticCritics: runProductStaticCritics(screens), repairs: [],
  }
}

const singleScreenPlanning = buildPlanning([{ ...scheduleJob, destinationJobIds: [] }], [{ ...scheduleStructure, navigation: { ...scheduleStructure.navigation, destinationJobIds: [] } }], [scheduleCapabilities], [scheduleLayout], [scheduleContent], [scheduleScreen])
const twoScreenPlanning = buildPlanning([scheduleJob, boardJob], [scheduleStructure, boardStructure], [scheduleCapabilities, boardCapabilities], [scheduleLayout, boardLayout], [scheduleContent, boardContent], [scheduleScreen, boardScreen])

const baseInput = { projectId: 'prj_test', platform: 'ios' as const, locale: 'tr-TR', deviceProfile: 'phone-default', acceptedAt: '2026-01-01T00:00:00.000Z' }

describe('acceptDesignSpec', () => {
  it('assembles a canonical document stamped NOT_VERIFIED when no render evidence is supplied', async () => {
    const accepted = await acceptDesignSpec(singleScreenPlanning, baseInput)
    expect(accepted.schemaVersion).toBe('1.0.0')
    expect(accepted.screens).toHaveLength(1)
    expect(accepted.flows).toEqual([])
    expect(accepted.metadata.renderEvidence).toBe('NOT_VERIFIED')
    expect(accepted.metadata.releaseEligible).toBe(false)
    expect(accepted.metadata.screenJobIds).toEqual(['weekly-schedule'])
    expect(accepted.metadata.contentHash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('is deterministic: identical input produces an identical content hash', async () => {
    const first = await acceptDesignSpec(singleScreenPlanning, baseInput)
    const second = await acceptDesignSpec(singleScreenPlanning, baseInput)
    expect(first.metadata.contentHash).toBe(second.metadata.contentHash)
  })

  it('changes the content hash when screen content actually changes', async () => {
    const mutated: V3PlanningOutput = { ...singleScreenPlanning, designSpecScreens: [{ ...scheduleScreen, name: 'Değişmiş Başlık' }] }
    const original = await acceptDesignSpec(singleScreenPlanning, baseInput)
    const changed = await acceptDesignSpec(mutated, baseInput)
    expect(changed.metadata.contentHash).not.toBe(original.metadata.contentHash)
  })

  it('assembles navigation flows from destinationJobIds, resolved to compiled screen ids', async () => {
    const accepted = await acceptDesignSpec(twoScreenPlanning, baseInput)
    expect(accepted.flows).toEqual([
      { id: 'flow_weekly-schedule_kitchen-board', fromScreenId: scheduleScreen.id, toScreenId: boardScreen.id },
      { id: 'flow_kitchen-board_weekly-schedule', fromScreenId: boardScreen.id, toScreenId: scheduleScreen.id },
    ])
    expect(accepted.metadata.screenJobIds).toEqual(['weekly-schedule', 'kitchen-board'])
  })

  it('marks VERIFIED and releaseEligible when every screen has a passing render capture', async () => {
    const renderCritics: RenderCriticsReport[] = [{ version: '1.0.0', screenJobId: 'weekly-schedule', passed: true, violations: [] }]
    const accepted = await acceptDesignSpec(singleScreenPlanning, { ...baseInput, renderCritics })
    expect(accepted.metadata.renderEvidence).toBe('VERIFIED')
    expect(accepted.metadata.releaseEligible).toBe(true)
  })

  it('rejects (BLOCKED) instead of silently downgrading when render evidence is present but failing', async () => {
    const renderCritics: RenderCriticsReport[] = [{ version: '1.0.0', screenJobId: 'weekly-schedule', passed: false, violations: [{ code: 'INSUFFICIENT_SECTION_COUNT', message: 'only one section' }] }]
    await expect(acceptDesignSpec(singleScreenPlanning, { ...baseInput, renderCritics })).rejects.toBeInstanceOf(DesignSpecAcceptanceError)
  })

  it('rejects when render evidence does not cover every screen', async () => {
    await expect(acceptDesignSpec(twoScreenPlanning, { ...baseInput, renderCritics: [{ version: '1.0.0', screenJobId: 'weekly-schedule', passed: true, violations: [] }] })).rejects.toThrow(DesignSpecAcceptanceError)
  })

  it('rejects render evidence referencing an unknown screen', async () => {
    const renderCritics: RenderCriticsReport[] = [{ version: '1.0.0', screenJobId: 'weekly-schedule', passed: true, violations: [] }, { version: '1.0.0', screenJobId: 'not-a-real-job', passed: true, violations: [] }]
    await expect(acceptDesignSpec(singleScreenPlanning, { ...baseInput, renderCritics })).rejects.toThrow(DesignSpecAcceptanceError)
  })

  it('rejects when product-level static critics did not pass, regardless of caller claims', async () => {
    const broken: V3PlanningOutput = { ...singleScreenPlanning, productStaticCritics: { version: '1.0.0', passed: false, duplicationRatePct: 100, duplicates: [] } }
    await expect(acceptDesignSpec(broken, baseInput)).rejects.toThrow(DesignSpecAcceptanceError)
  })

  it('rejects when any per-screen static critics report did not pass', async () => {
    const broken: V3PlanningOutput = { ...singleScreenPlanning, staticCritics: [{ version: '1.0.0', screenJobId: 'weekly-schedule', passed: false, violations: [{ code: 'EMPTY_REGION', message: 'x', nodeId: null }] }] }
    await expect(acceptDesignSpec(broken, baseInput)).rejects.toThrow(DesignSpecAcceptanceError)
  })

  it('rejects an empty projectId', async () => {
    await expect(acceptDesignSpec(singleScreenPlanning, { ...baseInput, projectId: '  ' })).rejects.toThrow(DesignSpecAcceptanceError)
  })

  it('rejects when there are no screens to accept', async () => {
    const empty: V3PlanningOutput = { ...singleScreenPlanning, designSpecScreens: [], staticCritics: [] }
    await expect(acceptDesignSpec(empty, baseInput)).rejects.toThrow(DesignSpecAcceptanceError)
  })
})
