import { describe, expect, it } from 'vitest'
import type { ComponentCapabilities } from './component-capabilities.ts'
import type { ContentPlan } from './content-plan.ts'
import { compileDesignSpecScreen, type DesignSpecScreen } from './design-spec-compiler.ts'
import type { LayoutPlan } from './layout-plan.ts'
import { runTargetedRepair } from './repair.ts'
import type { ScreenJob } from './screen-jobs.ts'
import { runStaticCritics } from './static-critics.ts'
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

describe('runTargetedRepair', () => {
  it('is a no-op when the static critics report already passed', () => {
    const passingReport = runStaticCritics(scheduleJob, scheduleStructure, scheduleScreen)
    const result = runTargetedRepair(scheduleJob, scheduleStructure, scheduleCapabilities, scheduleScreen, passingReport)
    expect(result).toEqual({ version: '1.0.0', screenJobId: 'weekly-schedule', screen: scheduleScreen, operations: [], unrepairable: [] })
  })

  it('patches a corrupted container a11y back from UXStructure without touching anything else', () => {
    const corrupted: DesignSpecScreen = { ...scheduleScreen, root: { ...scheduleScreen.root, children: [{ ...scheduleScreen.root.children[0], a11y: { role: '', label: '', hint: null, state: null, order: 1 } }, scheduleScreen.root.children[1]] } }
    const report = runStaticCritics(scheduleJob, scheduleStructure, corrupted)
    expect(report.passed).toBe(false)

    const result = runTargetedRepair(scheduleJob, scheduleStructure, scheduleCapabilities, corrupted, report)
    expect(result.unrepairable).toEqual([])
    expect(result.operations).toContainEqual({ op: 'replaceA11y', nodeId: corrupted.root.children[0].id })
    expect(result.screen.root.children[0].a11y).toEqual({ role: 'birincil etkileşim alanı', label: 'Haftalık takvim bölgesi odaklandı', hint: null, state: null, order: 1 })
    expect(result.screen.root.children[1]).toEqual(scheduleScreen.root.children[1])
    expect(runStaticCritics(scheduleJob, scheduleStructure, result.screen).passed).toBe(true)
  })

  it('recomputes and patches interactions that were dropped from a leaf node', () => {
    const corrupted: DesignSpecScreen = { ...scheduleScreen, root: { ...scheduleScreen.root, children: [{ ...scheduleScreen.root.children[0], children: [{ ...scheduleScreen.root.children[0].children[0], interactions: [] }] }, scheduleScreen.root.children[1]] } }
    const report = runStaticCritics(scheduleJob, scheduleStructure, corrupted)
    const result = runTargetedRepair(scheduleJob, scheduleStructure, scheduleCapabilities, corrupted, report)
    expect(result.unrepairable).toEqual([])
    const leafId = corrupted.root.children[0].children[0].id
    expect(result.operations).toContainEqual({ op: 'replaceInteractions', nodeId: leafId })
    expect(result.screen.root.children[0].children[0].interactions.map((e) => e.action.params.interaction).sort()).toEqual(['inspect', 'schedule'])
  })

  it('recomputes and patches bindings that were dropped from a leaf node', () => {
    const corrupted: DesignSpecScreen = { ...scheduleScreen, root: { ...scheduleScreen.root, children: [scheduleScreen.root.children[0], { ...scheduleScreen.root.children[1], children: [{ ...scheduleScreen.root.children[1].children[0], bindings: [] }] }] } }
    const report = runStaticCritics(scheduleJob, scheduleStructure, corrupted)
    const result = runTargetedRepair(scheduleJob, scheduleStructure, scheduleCapabilities, corrupted, report)
    expect(result.unrepairable).toEqual([])
    const leafId = corrupted.root.children[1].children[0].id
    expect(result.operations).toContainEqual({ op: 'replaceBindings', nodeId: leafId })
    expect(result.screen.root.children[1].children[0].bindings).toEqual([{ dataPath: 'proje adı' }])
  })

  it('produces zero new operations when repairing an already-repaired screen (idempotent)', () => {
    const corrupted: DesignSpecScreen = { ...scheduleScreen, root: { ...scheduleScreen.root, children: [{ ...scheduleScreen.root.children[0], a11y: { role: '', label: '', hint: null, state: null, order: 1 } }, scheduleScreen.root.children[1]] } }
    const firstReport = runStaticCritics(scheduleJob, scheduleStructure, corrupted)
    const first = runTargetedRepair(scheduleJob, scheduleStructure, scheduleCapabilities, corrupted, firstReport)
    expect(first.operations.length).toBeGreaterThan(0)

    const secondReport = runStaticCritics(scheduleJob, scheduleStructure, first.screen)
    expect(secondReport.passed).toBe(true)
    const second = runTargetedRepair(scheduleJob, scheduleStructure, scheduleCapabilities, first.screen, secondReport)
    expect(second.operations).toEqual([])
  })

  it('reports content gaps (empty region) as unrepairable instead of fabricating content', () => {
    const broken: DesignSpecScreen = { ...scheduleScreen, root: { ...scheduleScreen.root, children: [scheduleScreen.root.children[0], { ...scheduleScreen.root.children[1], children: [] }] } }
    const report = runStaticCritics(scheduleJob, scheduleStructure, broken)
    expect(report.passed).toBe(false)

    const result = runTargetedRepair(scheduleJob, scheduleStructure, scheduleCapabilities, broken, report)
    expect(result.unrepairable.some((v) => v.code === 'EMPTY_REGION')).toBe(true)
    expect(result.screen.root.children[1].children).toEqual([])
  })
})
