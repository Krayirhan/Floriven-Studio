import { describe, expect, it } from 'vitest'
import type { ScreenJob } from './screen-jobs.ts'
import { UX_STRUCTURE_JSON_SCHEMA, validateUXStructure, type UXStructure } from './ux-structure.ts'

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

describe('UXStructure@1 validator', () => {
  it('accepts a fully covered schedule screen structure', () => {
    expect(validateUXStructure(scheduleStructure, scheduleJob)).toMatchObject({ ok: true })
  })

  it('accepts a fully covered board screen structure with a distinct region layout', () => {
    expect(validateUXStructure(boardStructure, boardJob)).toMatchObject({ ok: true })
  })

  it('rejects a structure missing a required interaction', () => {
    const broken: UXStructure = { ...scheduleStructure, actions: [scheduleStructure.actions[0]], flow: [scheduleStructure.flow[0]] }
    const result = validateUXStructure(broken, scheduleJob)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('missing interaction "schedule"'))).toBe(true)
  })

  it('rejects a structure missing a required data binding', () => {
    const broken: UXStructure = { ...scheduleStructure, regions: [{ ...scheduleStructure.regions[0] }, { ...scheduleStructure.regions[1], dataBindings: ['ziyaret zamanı'] }] }
    const result = validateUXStructure(broken, scheduleJob)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('missing data binding for "proje adı"'))).toBe(true)
  })

  it('rejects a fabricated region reference', () => {
    const broken: UXStructure = { ...scheduleStructure, actions: [{ ...scheduleStructure.actions[0], regionId: 'region-does-not-exist' }, scheduleStructure.actions[1]] }
    const result = validateUXStructure(broken, scheduleJob)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('unknown region'))).toBe(true)
  })

  it('rejects duplicate regions carrying the same purpose', () => {
    const broken: UXStructure = { ...scheduleStructure, regions: [scheduleStructure.regions[0], { ...scheduleStructure.regions[1], task: scheduleStructure.regions[0].task }] }
    const result = validateUXStructure(broken, scheduleJob)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('must be distinct'))).toBe(true)
  })

  it('rejects component and style leakage in narrative fields', () => {
    const broken: UXStructure = { ...scheduleStructure, regions: [{ ...scheduleStructure.regions[0], task: 'Bir buton ile #ffffff renkli 16px başlık göster' }, scheduleStructure.regions[1]] }
    const result = validateUXStructure(broken, scheduleJob)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('visual or component leakage'))).toBe(true)
  })

  it('rejects unknown top-level fields', () => {
    const result = validateUXStructure({ ...scheduleStructure, componentName: 'Calendar' }, scheduleJob)
    expect(result).toMatchObject({ ok: false })
  })

  it('rejects an information hierarchy that omits a region', () => {
    const broken: UXStructure = { ...scheduleStructure, informationHierarchy: ['region-calendar'] }
    const result = validateUXStructure(broken, scheduleJob)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('informationHierarchy'))).toBe(true)
  })

  it('rejects an information hierarchy referencing an unknown region', () => {
    const broken: UXStructure = { ...scheduleStructure, informationHierarchy: ['region-calendar', 'region-nonexistent'] }
    const result = validateUXStructure(broken, scheduleJob)
    expect(result).toMatchObject({ ok: false })
    if (!result.ok) expect(result.issues.some((issue) => issue.includes('unknown region'))).toBe(true)
  })

  it('rejects an information hierarchy that repeats a region', () => {
    const broken: UXStructure = { ...scheduleStructure, informationHierarchy: ['region-calendar', 'region-calendar'] }
    const result = validateUXStructure(broken, scheduleJob)
    expect(result).toMatchObject({ ok: false })
  })

  it('rejects a structure referencing the wrong screen job', () => {
    expect(validateUXStructure(scheduleStructure, boardJob)).toMatchObject({ ok: false })
  })

  it('keeps the JSON Schema contract and the runtime validator in agreement on top-level shape', () => {
    expect(UX_STRUCTURE_JSON_SCHEMA.required).toEqual(['version', 'screenJobId', 'regions', 'informationHierarchy', 'actions', 'flow', 'completionEvidence', 'navigation', 'responsive', 'accessibility'])
    expect(Object.keys(scheduleStructure).sort()).toEqual([...UX_STRUCTURE_JSON_SCHEMA.required].sort())
  })
})
