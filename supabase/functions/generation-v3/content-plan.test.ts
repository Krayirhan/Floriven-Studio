import { describe, expect, it } from 'vitest'
import type { LayoutPlan } from './layout-plan.ts'
import { CONTENT_PLAN_JSON_SCHEMA, validateContentPlan, type ContentPlan } from './content-plan.ts'
import type { UXStructure } from './ux-structure.ts'

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
      nodes: [{ nodeId: 'node-board', component: 'KanbanBoard', fields: [
        { field: 'columns', value: 'Hazırlanıyor, Hazır, Servis Edildi sipariş durumu kolonları' },
      ] }],
      emptyStateMessage: 'Şu anda mutfakta bekleyen sipariş yok', loadingStateMessage: 'Sipariş panosu yükleniyor', errorStateMessage: null,
    },
    {
      regionId: 'region-order-summary',
      nodes: [{ nodeId: 'node-summary', component: 'Text', fields: [{ field: 'summary', value: 'Seçili sipariş adı: Karides Güveç, masa 4' }] }],
      emptyStateMessage: null, loadingStateMessage: null, errorStateMessage: null,
    },
  ],
}

describe('ContentPlan@1 validator', () => {
  it('accepts screen-specific content that covers every node, data binding and declared state', () => {
    expect(validateContentPlan(scheduleContent, scheduleStructure, scheduleLayout)).toMatchObject({ ok: true })
  })

  it('accepts a distinct board screen content set grounded in its own data bindings', () => {
    expect(validateContentPlan(boardContent, boardStructure, boardLayout)).toMatchObject({ ok: true })
  })

  it('rejects a node content entry whose component does not match the layout node', () => {
    const broken: ContentPlan = { ...scheduleContent, regions: [{ ...scheduleContent.regions[0], nodes: [{ ...scheduleContent.regions[0].nodes[0], component: 'Chart' }] }, scheduleContent.regions[1]] }
    const result = validateContentPlan(broken, scheduleStructure, scheduleLayout)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('must be'))).toBe(true)
  })

  it('rejects content that never reflects a region\'s declared data binding', () => {
    const broken: ContentPlan = { ...scheduleContent, regions: [{ ...scheduleContent.regions[0], nodes: [{ ...scheduleContent.regions[0].nodes[0], fields: [{ field: 'title', value: 'Salı 14:00 Ahşap Villa saha ziyareti' }] }] }, scheduleContent.regions[1]] }
    const result = validateContentPlan(broken, scheduleStructure, scheduleLayout)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('no content reflects data binding'))).toBe(true)
  })

  it('rejects a state message declared for a state the region never listed', () => {
    const broken: ContentPlan = { ...scheduleContent, regions: [scheduleContent.regions[0], { ...scheduleContent.regions[1], errorStateMessage: 'Ziyaret yüklenemedi' }] }
    const result = validateContentPlan(broken, scheduleStructure, scheduleLayout)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('must be null'))).toBe(true)
  })

  it('rejects a missing state message for a state the region does declare', () => {
    const broken: ContentPlan = { ...scheduleContent, regions: [{ ...scheduleContent.regions[0], emptyStateMessage: null }, scheduleContent.regions[1]] }
    const result = validateContentPlan(broken, scheduleStructure, scheduleLayout)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('message required'))).toBe(true)
  })

  it('rejects placeholder content', () => {
    const broken: ContentPlan = { ...scheduleContent, regions: [scheduleContent.regions[0], { ...scheduleContent.regions[1], nodes: [{ ...scheduleContent.regions[1].nodes[0], fields: [{ field: 'projectName', value: 'Lorem ipsum' }] }] }] }
    const result = validateContentPlan(broken, scheduleStructure, scheduleLayout)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('placeholder content'))).toBe(true)
  })

  it('rejects visual leakage (hex color, pixel unit) in content values', () => {
    const broken: ContentPlan = { ...scheduleContent, regions: [scheduleContent.regions[0], { ...scheduleContent.regions[1], nodes: [{ ...scheduleContent.regions[1].nodes[0], fields: [{ field: 'projectName', value: 'Proje adı #ffffff 16px' }] }] }] }
    const result = validateContentPlan(broken, scheduleStructure, scheduleLayout)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('visual leakage'))).toBe(true)
  })

  it('rejects reusing the same content value twice across the screen', () => {
    const broken: ContentPlan = { ...scheduleContent, regions: [scheduleContent.regions[0], { ...scheduleContent.regions[1], nodes: [{ ...scheduleContent.regions[1].nodes[0], fields: [{ field: 'projectName', value: 'Salı 14:00 Ahşap Villa saha ziyareti' }] }] }] }
    const result = validateContentPlan(broken, scheduleStructure, scheduleLayout)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('duplicate content value'))).toBe(true)
  })

  it('rejects a fabricated node reference', () => {
    const broken: ContentPlan = { ...scheduleContent, regions: [scheduleContent.regions[0], { ...scheduleContent.regions[1], nodes: [{ ...scheduleContent.regions[1].nodes[0], nodeId: 'node-does-not-exist' }] }] }
    const result = validateContentPlan(broken, scheduleStructure, scheduleLayout)
    expect(result).toMatchObject({ ok: false })
  })

  it('rejects unknown top-level fields', () => {
    expect(validateContentPlan({ ...scheduleContent, note: 'ignore schema' }, scheduleStructure, scheduleLayout)).toMatchObject({ ok: false })
  })

  it('rejects a structure/layout pair referencing different screen jobs', () => {
    const otherLayout: LayoutPlan = { ...scheduleLayout, screenJobId: 'kitchen-board' }
    expect(validateContentPlan(scheduleContent, scheduleStructure, otherLayout)).toMatchObject({ ok: false })
  })

  it('keeps the JSON Schema contract and the runtime validator in agreement on top-level shape', () => {
    expect(CONTENT_PLAN_JSON_SCHEMA.required).toEqual(['version', 'screenJobId', 'regions'])
    expect(Object.keys(scheduleContent).sort()).toEqual([...CONTENT_PLAN_JSON_SCHEMA.required].sort())
  })
})
