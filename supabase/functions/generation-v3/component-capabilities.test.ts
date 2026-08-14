import { describe, expect, it } from 'vitest'
import {
  COMPONENT_CAPABILITIES_JSON_SCHEMA, deriveRegionCapabilities, validateComponentCapabilities,
  type ComponentCapabilities,
} from './component-capabilities.ts'
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

describe('ComponentCapabilities@1 capability derivation', () => {
  it('derives a display baseline plus every bound interaction, and nothing else', () => {
    expect(deriveRegionCapabilities(scheduleStructure)).toEqual([
      { regionId: 'region-calendar', requiredCapabilities: ['display', 'inspect', 'schedule'] },
      { regionId: 'region-visit-details', requiredCapabilities: ['display'] },
    ])
  })
})

describe('ComponentCapabilities@1 validator', () => {
  it('accepts a schedule screen selection covering every required capability with one justified component per region', () => {
    expect(validateComponentCapabilities(scheduleCapabilities, scheduleStructure)).toMatchObject({ ok: true })
  })

  it('accepts a distinct board screen selection driven by its own capability set, not by title', () => {
    expect(validateComponentCapabilities(boardCapabilities, boardStructure)).toMatchObject({ ok: true })
  })

  it('rejects an unknown component name outside the canonical allowlist', () => {
    const broken = { ...scheduleCapabilities, regions: [{ ...scheduleCapabilities.regions[0], selectedComponents: ['MagicScheduler'] }, scheduleCapabilities.regions[1]] }
    const result = validateComponentCapabilities(broken, scheduleStructure)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('unknown component'))).toBe(true)
  })

  it('rejects a selected component that no justification covers', () => {
    const broken = { ...scheduleCapabilities, regions: [{ ...scheduleCapabilities.regions[0], selectedComponents: ['Calendar', 'Chart'] }, scheduleCapabilities.regions[1]] }
    const result = validateComponentCapabilities(broken, scheduleStructure)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('is not justified'))).toBe(true)
  })

  it('rejects a required capability left without any justification', () => {
    const broken = { ...scheduleCapabilities, regions: [{ ...scheduleCapabilities.regions[0], justification: [scheduleCapabilities.regions[0].justification[0]] }, scheduleCapabilities.regions[1]] }
    const result = validateComponentCapabilities(broken, scheduleStructure)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('missing justification'))).toBe(true)
  })

  it('rejects a justification claiming a capability the region never required', () => {
    const broken = { ...scheduleCapabilities, regions: [scheduleCapabilities.regions[0], { ...scheduleCapabilities.regions[1], justification: [{ capability: 'reorder', component: 'Card', reason: 'fabricated' }] }] }
    const result = validateComponentCapabilities(broken, scheduleStructure)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('not required by region'))).toBe(true)
  })

  it('rejects a justification pairing a capability with a component that cannot provide it', () => {
    const broken = {
      ...scheduleCapabilities,
      regions: [
        { ...scheduleCapabilities.regions[0], selectedComponents: ['Calendar', 'TextField'], justification: [...scheduleCapabilities.regions[0].justification, { capability: 'schedule', component: 'TextField', reason: 'fabricated pairing' }] },
        scheduleCapabilities.regions[1],
      ],
    }
    const result = validateComponentCapabilities(broken, scheduleStructure)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('does not support capability'))).toBe(true)
  })

  it('rejects a fabricated region reference', () => {
    const broken = { ...scheduleCapabilities, regions: [scheduleCapabilities.regions[0], { ...scheduleCapabilities.regions[1], regionId: 'region-does-not-exist' }] }
    const result = validateComponentCapabilities(broken, scheduleStructure)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('unknown region'))).toBe(true)
  })

  it('rejects a structure referencing the wrong screen job', () => {
    expect(validateComponentCapabilities(scheduleCapabilities, boardStructure)).toMatchObject({ ok: false })
  })

  it('rejects unknown top-level fields', () => {
    expect(validateComponentCapabilities({ ...scheduleCapabilities, note: 'ignore schema' }, scheduleStructure)).toMatchObject({ ok: false })
  })

  it('keeps the JSON Schema contract and the runtime validator in agreement on top-level shape', () => {
    expect(COMPONENT_CAPABILITIES_JSON_SCHEMA.required).toEqual(['version', 'screenJobId', 'regions'])
    expect(Object.keys(scheduleCapabilities).sort()).toEqual([...COMPONENT_CAPABILITIES_JSON_SCHEMA.required].sort())
  })
})
