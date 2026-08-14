import { describe, expect, it } from 'vitest'
import type { ComponentCapabilities } from './component-capabilities.ts'
import { deriveRegionEmphasis, LAYOUT_PLAN_JSON_SCHEMA, validateLayoutPlan, type LayoutPlan } from './layout-plan.ts'
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

const boardStructure: UXStructure = {
  version: '1.0.0', screenJobId: 'kitchen-board',
  regions: [
    { id: 'region-columns', task: 'Sipariş durumlarını kolonlar halinde göster', dataBindings: ['sipariş durumu'], states: ['ready', 'loading', 'empty'] },
    { id: 'region-order-summary', task: 'Seçili siparişin adını özetle', dataBindings: ['sipariş adı'], states: ['ready'] },
    { id: 'region-nav', task: 'Mutfak bölümleri arasında geçiş sağla', dataBindings: ['sipariş durumu'], states: ['ready'] },
  ],
  informationHierarchy: ['region-columns', 'region-order-summary', 'region-nav'],
  actions: [
    { id: 'action-inspect', regionId: 'region-columns', interaction: 'inspect', intent: 'Bir sipariş kartına dokunarak detayını incele' },
    { id: 'action-reorder', regionId: 'region-columns', interaction: 'reorder', intent: 'Siparişi başka bir duruma taşı' },
    { id: 'action-navigate', regionId: 'region-nav', interaction: 'navigate', intent: 'Mutfak bölümleri arasında geçiş yap' },
  ],
  flow: [
    { order: 1, actionId: 'action-inspect', description: 'Kullanıcı bir siparişe dokunur ve detayını görür' },
    { order: 2, actionId: 'action-reorder', description: 'Kullanıcı siparişi yeni bir duruma taşır' },
    { order: 3, actionId: 'action-navigate', description: 'Kullanıcı başka bir mutfak bölümüne geçer' },
  ],
  completionEvidence: [
    { criterion: 'Sipariş doğru kolonda görünür', regionId: 'region-columns', evidence: 'Sipariş güncel durumuna ait kolonda listelenir' },
    { criterion: 'Sipariş sürüklenerek kolon değiştirebilir', regionId: 'region-columns', evidence: 'Taşıma sonrası sipariş hedef kolonda görünür' },
  ],
  navigation: { entryPoints: ['Mutfak ana ekranı'], destinationJobIds: [], exitIntent: 'Kullanıcı ana menüye dönebilir' },
  responsive: [
    { regionId: 'region-columns', narrowBehavior: 'Kolonlar yatay kaydırmalı tek şerite dönüşür', wideBehavior: 'Kolonlar yan yana tam genişlikte kalır' },
    { regionId: 'region-order-summary', narrowBehavior: 'Kolonların altına taşınır', wideBehavior: 'Kolonların yanında sabit kalır' },
    { regionId: 'region-nav', narrowBehavior: 'Alt sekme çubuğuna dönüşür', wideBehavior: 'Üst şeritte sabit kalır' },
  ],
  accessibility: [
    { regionId: 'region-columns', role: 'birincil çalışma alanı', focusOrder: 1, announcement: 'Sipariş kolonları bölgesi odaklandı' },
    { regionId: 'region-order-summary', role: 'destekleyici bilgi alanı', focusOrder: 2, announcement: 'Sipariş özeti odaklandı' },
    { regionId: 'region-nav', role: 'gezinme alanı', focusOrder: 3, announcement: 'Bölüm gezinmesi odaklandı' },
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
    { regionId: 'region-nav', selectedComponents: ['TabBar'], justification: [
      { capability: 'display', component: 'TabBar', reason: 'Bölümleri listeler' },
      { capability: 'navigate', component: 'TabBar', reason: 'Bölümler arası geçişi destekler' },
    ] },
  ],
}
const boardLayout: LayoutPlan = {
  version: '1.0.0', screenJobId: 'kitchen-board',
  regions: [
    { regionId: 'region-columns', mode: 'row', density: 'comfortable', emphasis: 'primary', nodes: [{ id: 'node-board', component: 'KanbanBoard', order: 1, size: 'fill' }] },
    { regionId: 'region-order-summary', mode: 'column', density: 'compact', emphasis: 'secondary', nodes: [{ id: 'node-summary', component: 'Text', order: 1, size: 'hug' }] },
    { regionId: 'region-nav', mode: 'row', density: 'compact', emphasis: 'support', nodes: [{ id: 'node-nav', component: 'TabBar', order: 1, size: 'fill' }] },
  ],
  responsive: [
    { regionId: 'region-columns', breakpoint: 'narrow', mode: 'scroll', visible: true },
    { regionId: 'region-columns', breakpoint: 'wide', mode: 'row', visible: true },
    { regionId: 'region-order-summary', breakpoint: 'narrow', mode: 'column', visible: true },
    { regionId: 'region-order-summary', breakpoint: 'wide', mode: 'column', visible: true },
    { regionId: 'region-nav', breakpoint: 'narrow', mode: 'row', visible: true },
    { regionId: 'region-nav', breakpoint: 'wide', mode: 'row', visible: true },
  ],
  navigation: { regionId: 'region-nav', component: 'TabBar', placement: 'bottom' },
}

describe('LayoutPlan@1 emphasis derivation', () => {
  it('assigns primary to the first hierarchy entry, support to the last, secondary in between', () => {
    expect([...deriveRegionEmphasis(boardStructure)]).toEqual([
      ['region-columns', 'primary'], ['region-order-summary', 'secondary'], ['region-nav', 'support'],
    ])
  })
})

describe('LayoutPlan@1 validator', () => {
  it('accepts a schedule screen layout with no navigation candidates and a null navigation slot', () => {
    expect(validateLayoutPlan(scheduleLayout, scheduleStructure, scheduleCapabilities)).toMatchObject({ ok: true })
  })

  it('accepts a distinct board screen layout that places a navigate-capable component', () => {
    expect(validateLayoutPlan(boardLayout, boardStructure, boardCapabilities)).toMatchObject({ ok: true })
  })

  it('rejects an emphasis that contradicts the fixed information hierarchy', () => {
    const broken = { ...scheduleLayout, regions: [{ ...scheduleLayout.regions[0], emphasis: 'support' as const }, scheduleLayout.regions[1]] }
    const result = validateLayoutPlan(broken, scheduleStructure, scheduleCapabilities)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('informationHierarchy'))).toBe(true)
  })

  it('rejects a node placing a component that was never selected for the region', () => {
    const broken = { ...scheduleLayout, regions: [{ ...scheduleLayout.regions[0], nodes: [{ id: 'node-x', component: 'Chart' as const, order: 1, size: 'fill' as const }] }, scheduleLayout.regions[1]] }
    const result = validateLayoutPlan(broken, scheduleStructure, scheduleCapabilities)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('selected components'))).toBe(true)
  })

  it('rejects a region missing a node for one of its selected components', () => {
    const broken = { ...boardLayout, regions: [boardLayout.regions[0], boardLayout.regions[1], { ...boardLayout.regions[2], nodes: [] }] }
    const result = validateLayoutPlan(broken, boardStructure, boardCapabilities)
    expect(result).toMatchObject({ ok: false })
  })

  it('rejects a responsive rule set missing a breakpoint for a region', () => {
    const broken = { ...scheduleLayout, responsive: scheduleLayout.responsive.slice(0, 3) }
    const result = validateLayoutPlan(broken, scheduleStructure, scheduleCapabilities)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('rules required'))).toBe(true)
  })

  it('rejects declaring navigation when no navigate-capable component was selected', () => {
    const broken = { ...scheduleLayout, navigation: { regionId: 'region-calendar', component: 'Calendar' as const, placement: 'top' as const } }
    const result = validateLayoutPlan(broken, scheduleStructure, scheduleCapabilities)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('navigation must be null'))).toBe(true)
  })

  it('rejects a null navigation when a navigate-capable component was selected', () => {
    const result = validateLayoutPlan({ ...boardLayout, navigation: null }, boardStructure, boardCapabilities)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('no placement was declared'))).toBe(true)
  })

  it('rejects navigation referencing a component that was not selected', () => {
    const broken = { ...boardLayout, navigation: { regionId: 'region-columns', component: 'KanbanBoard' as const, placement: 'top' as const } }
    const result = validateLayoutPlan(broken, boardStructure, boardCapabilities)
    expect(result).toMatchObject({ ok: false })
  })

  it('rejects a node id reused across two different regions', () => {
    const broken = { ...scheduleLayout, regions: [scheduleLayout.regions[0], { ...scheduleLayout.regions[1], nodes: [{ ...scheduleLayout.regions[1].nodes[0], id: scheduleLayout.regions[0].nodes[0].id }] }] }
    const result = validateLayoutPlan(broken, scheduleStructure, scheduleCapabilities)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('node ids must be unique'))).toBe(true)
  })

  it('rejects a fabricated region reference', () => {
    const broken = { ...scheduleLayout, regions: [scheduleLayout.regions[0], { ...scheduleLayout.regions[1], regionId: 'region-does-not-exist' }] }
    const result = validateLayoutPlan(broken, scheduleStructure, scheduleCapabilities)
    expect(result).toMatchObject({ ok: false })
  })

  it('rejects unknown top-level fields', () => {
    expect(validateLayoutPlan({ ...scheduleLayout, note: 'ignore schema' }, scheduleStructure, scheduleCapabilities)).toMatchObject({ ok: false })
  })

  it('rejects a structure/capabilities pair referencing different screen jobs', () => {
    expect(validateLayoutPlan(scheduleLayout, scheduleStructure, boardCapabilities)).toMatchObject({ ok: false })
  })

  it('keeps the JSON Schema contract and the runtime validator in agreement on top-level shape', () => {
    expect(LAYOUT_PLAN_JSON_SCHEMA.required).toEqual(['version', 'screenJobId', 'regions', 'responsive', 'navigation'])
    expect(Object.keys(scheduleLayout).sort()).toEqual([...LAYOUT_PLAN_JSON_SCHEMA.required].sort())
  })
})
