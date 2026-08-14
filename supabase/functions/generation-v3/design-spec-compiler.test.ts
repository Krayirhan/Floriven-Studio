import { describe, expect, it } from 'vitest'
import type { ComponentCapabilities } from './component-capabilities.ts'
import type { ContentPlan } from './content-plan.ts'
import { compileDesignSpecScreen, DesignSpecCompileError } from './design-spec-compiler.ts'
import type { LayoutPlan } from './layout-plan.ts'
import type { ScreenJob } from './screen-jobs.ts'
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

describe('DesignSpec compiler (deterministic, no LLM)', () => {
  it('compiles regions in information-hierarchy order into Stack containers', () => {
    const screen = compileDesignSpecScreen(scheduleJob, scheduleStructure, scheduleCapabilities, scheduleLayout, scheduleContent)
    expect(screen.id).toBe('scr_weekly-schedule')
    expect(screen.route).toBe('/weekly-schedule')
    expect(screen.root.type).toBe('Screen')
    expect(screen.root.children.map((container) => container.type)).toEqual(['Stack', 'Stack'])
    expect(screen.root.children[0].id).not.toBe(screen.root.children[1].id)
  })

  it('carries the selected component type and layout mode onto each leaf and container', () => {
    const screen = compileDesignSpecScreen(scheduleJob, scheduleStructure, scheduleCapabilities, scheduleLayout, scheduleContent)
    const calendarContainer = screen.root.children[0]
    expect(calendarContainer.layout.mode).toBe('column')
    expect(calendarContainer.children).toHaveLength(1)
    expect(calendarContainer.children[0].type).toBe('Calendar')
    expect(calendarContainer.children[0].layout.size).toBe('fill')
  })

  it('translates ContentPlan typed props into node props verbatim', () => {
    const screen = compileDesignSpecScreen(scheduleJob, scheduleStructure, scheduleCapabilities, scheduleLayout, scheduleContent)
    const calendarLeaf = screen.root.children[0].children[0]
    expect(calendarLeaf.props.label).toBe('Haftalık Saha Ziyaret Takvimi')
    expect(calendarLeaf.props.events).toEqual(['Salı 14:00 Ahşap Villa saha ziyaret zamanı'])
  })

  it('binds data paths only for terms the node content actually reflects', () => {
    const screen = compileDesignSpecScreen(scheduleJob, scheduleStructure, scheduleCapabilities, scheduleLayout, scheduleContent)
    const calendarLeaf = screen.root.children[0].children[0]
    expect(calendarLeaf.bindings).toEqual([{ dataPath: 'ziyaret zamanı' }])
    const cardLeaf = screen.root.children[1].children[0]
    expect(cardLeaf.bindings).toEqual([{ dataPath: 'proje adı' }])
  })

  it('attaches an interaction event only to the component justified for that capability', () => {
    const screen = compileDesignSpecScreen(scheduleJob, scheduleStructure, scheduleCapabilities, scheduleLayout, scheduleContent)
    const calendarLeaf = screen.root.children[0].children[0]
    expect(calendarLeaf.interactions.map((event) => event.action.params.interaction).sort()).toEqual(['inspect', 'schedule'])
    const cardLeaf = screen.root.children[1].children[0]
    expect(cardLeaf.interactions).toEqual([])
  })

  it('propagates region-level accessibility onto the container node', () => {
    const screen = compileDesignSpecScreen(scheduleJob, scheduleStructure, scheduleCapabilities, scheduleLayout, scheduleContent)
    expect(screen.root.children[0].a11y).toEqual({ role: 'birincil etkileşim alanı', label: 'Haftalık takvim bölgesi odaklandı', hint: null, state: null, order: 1 })
  })

  it('maps density to a space token gap', () => {
    const screen = compileDesignSpecScreen(scheduleJob, scheduleStructure, scheduleCapabilities, scheduleLayout, scheduleContent)
    expect(screen.root.children[0].layout.gap).toBe('space.4')
    expect(screen.root.children[1].layout.gap).toBe('space.2')
  })

  it('produces the same node ids on a second compile (deterministic, idempotent)', () => {
    const first = compileDesignSpecScreen(scheduleJob, scheduleStructure, scheduleCapabilities, scheduleLayout, scheduleContent)
    const second = compileDesignSpecScreen(scheduleJob, scheduleStructure, scheduleCapabilities, scheduleLayout, scheduleContent)
    expect(first).toEqual(second)
  })

  it('throws when the inputs reference different screen jobs', () => {
    const mismatched = { ...scheduleCapabilities, screenJobId: 'kitchen-board' }
    expect(() => compileDesignSpecScreen(scheduleJob, scheduleStructure, mismatched, scheduleLayout, scheduleContent)).toThrow(DesignSpecCompileError)
  })
})
