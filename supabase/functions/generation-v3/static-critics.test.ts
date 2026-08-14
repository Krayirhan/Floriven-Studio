import { describe, expect, it } from 'vitest'
import type { ComponentCapabilities } from './component-capabilities.ts'
import type { ContentPlan } from './content-plan.ts'
import { compileDesignSpecScreen, type DesignSpecScreen } from './design-spec-compiler.ts'
import type { LayoutPlan } from './layout-plan.ts'
import type { ScreenJob } from './screen-jobs.ts'
import { runProductStaticCritics, runStaticCritics } from './static-critics.ts'
import type { UXStructure } from './ux-structure.ts'

const scheduleJob: ScreenJob = {
  id: 'weekly-schedule', name: 'Haftalık Takvim', userJob: 'Saha ziyaretlerini haftalık saat bloklarında planlamak', actorId: 'architect', entityIds: ['project'],
  requiredData: ['ziyaret zamanı', 'proje adı'], requiredInteractions: ['inspect', 'schedule'],
  completionCriteria: ['Boş ve dolu saatler ayırt edilebilir', 'Ziyaret farklı saate taşınabilir'],
  entryPoints: ['Ana navigasyon'], destinationJobIds: [], priority: 'primary',
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
  entryPoints: ['Mutfak ana ekranı'], destinationJobIds: [], priority: 'primary',
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

describe('runStaticCritics', () => {
  it('passes a compiled screen with full interaction, data and completion-evidence coverage', () => {
    const report = runStaticCritics(scheduleJob, scheduleStructure, scheduleScreen)
    expect(report).toMatchObject({ passed: true, violations: [] })
  })

  it('passes a structurally distinct board screen the same way', () => {
    const report = runStaticCritics(boardJob, boardStructure, boardScreen)
    expect(report).toMatchObject({ passed: true, violations: [] })
  })

  it('flags a missing required interaction if the compiled tree lost it', () => {
    const broken: DesignSpecScreen = { ...scheduleScreen, root: { ...scheduleScreen.root, children: [{ ...scheduleScreen.root.children[0], children: [{ ...scheduleScreen.root.children[0].children[0], interactions: [] }] }, scheduleScreen.root.children[1]] } }
    const report = runStaticCritics(scheduleJob, scheduleStructure, broken)
    expect(report.passed).toBe(false)
    expect(report.violations.some((v) => v.code === 'MISSING_REQUIRED_INTERACTION')).toBe(true)
  })

  it('flags missing data coverage if the compiled tree lost a binding', () => {
    const broken: DesignSpecScreen = { ...scheduleScreen, root: { ...scheduleScreen.root, children: [scheduleScreen.root.children[0], { ...scheduleScreen.root.children[1], children: [{ ...scheduleScreen.root.children[1].children[0], bindings: [] }] }] } }
    const report = runStaticCritics(scheduleJob, scheduleStructure, broken)
    expect(report.passed).toBe(false)
    expect(report.violations.some((v) => v.code === 'MISSING_DATA_COVERAGE')).toBe(true)
  })

  it('flags an empty region', () => {
    const broken: DesignSpecScreen = { ...scheduleScreen, root: { ...scheduleScreen.root, children: [scheduleScreen.root.children[0], { ...scheduleScreen.root.children[1], children: [] }] } }
    const report = runStaticCritics(scheduleJob, scheduleStructure, broken)
    expect(report.passed).toBe(false)
    expect(report.violations.some((v) => v.code === 'EMPTY_REGION')).toBe(true)
  })

  it('flags an accessibility gap', () => {
    const broken: DesignSpecScreen = { ...scheduleScreen, root: { ...scheduleScreen.root, children: [{ ...scheduleScreen.root.children[0], a11y: { ...scheduleScreen.root.children[0].a11y, label: '' } }, scheduleScreen.root.children[1]] } }
    const report = runStaticCritics(scheduleJob, scheduleStructure, broken)
    expect(report.passed).toBe(false)
    expect(report.violations.some((v) => v.code === 'ACCESSIBILITY_GAP')).toBe(true)
  })

  it('flags incomplete completion evidence when its region has no content', () => {
    const broken: DesignSpecScreen = { ...scheduleScreen, root: { ...scheduleScreen.root, children: [{ ...scheduleScreen.root.children[0], children: [] }, scheduleScreen.root.children[1]] } }
    const report = runStaticCritics(scheduleJob, scheduleStructure, broken)
    expect(report.violations.some((v) => v.code === 'INCOMPLETE_COMPLETION_EVIDENCE')).toBe(true)
  })
})

describe('runProductStaticCritics', () => {
  it('passes when every compiled screen is structurally distinct', () => {
    const report = runProductStaticCritics([scheduleScreen, boardScreen])
    expect(report).toMatchObject({ passed: true, duplicationRatePct: 0, duplicates: [] })
  })

  it('passes trivially for a single screen', () => {
    expect(runProductStaticCritics([scheduleScreen])).toMatchObject({ passed: true, duplicationRatePct: 0 })
  })

  it('flags two screens that share the same structural fingerprint under different titles', () => {
    const clone = compileDesignSpecScreen(
      { ...scheduleJob, id: 'weekly-schedule-clone', name: 'Farklı Başlık' },
      { ...scheduleStructure, screenJobId: 'weekly-schedule-clone' },
      { ...scheduleCapabilities, screenJobId: 'weekly-schedule-clone' },
      { ...scheduleLayout, screenJobId: 'weekly-schedule-clone' },
      { ...scheduleContent, screenJobId: 'weekly-schedule-clone' },
    )
    const report = runProductStaticCritics([scheduleScreen, clone])
    expect(report.passed).toBe(false)
    expect(report.duplicationRatePct).toBe(100)
    expect(report.duplicates).toHaveLength(1)
  })
})
