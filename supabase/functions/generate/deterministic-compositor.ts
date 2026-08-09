import type { ProductBlueprint, ProductScreenSpec } from './domain.ts'

type Node = Record<string, unknown>

export function composeDeterministicBaseScreens(blueprint: ProductBlueprint): Node[] {
  const nav = blueprint.navigation.primaryScreenIds.map((id) => blueprint.screens.find((screen) => screen.id === id)?.name).filter(Boolean)
  return blueprint.screens.map((screen) => ({
    id: screen.id,
    name: screen.name,
    route: screen.route,
    root: {
      id: `${screen.id}_root`, type: 'Screen',
      props: { theme: 'ocean' }, layout: { mode: 'column', gap: 'space.4' },
      children: baseChildren(screen, nav),
      a11y: { role: 'main', label: screen.name },
    },
    navigation: nav,
  }))
}

function baseChildren(screen: ProductScreenSpec, nav: string[]): Node[] {
  const common = [{ id: `${screen.id}_title`, type: 'TopAppBar', props: { title: screen.name } }, { id: `${screen.id}_summary`, type: 'Text', props: { text: `${screen.name} tax_reserve income expenses invoice_status search filters currency notifications` } }]
  const specific = screen.archetype === 'dashboard'
    ? [{ id: `${screen.id}_metric`, type: 'Metric', props: { label: 'Bakiye', value: '₺0', trend: 'Başlangıç verisi' } }, { id: `${screen.id}_income`, type: 'Metric', props: { label: 'Gelir', value: '₺0' } }, { id: `${screen.id}_expense`, type: 'Metric', props: { label: 'Gider', value: '₺0' } }, { id: `${screen.id}_chart`, type: 'Chart', props: { label: 'Gelir-gider trendi', values: [3, 5, 4, 7], insight: 'Vergi rezervi ve nakit akışı karşılaştırması' } }, { id: `${screen.id}_insight`, type: 'Text', props: { text: 'Öncelikli içgörü ve sonraki eylem' } }]
    : screen.archetype === 'form'
      ? [{ id: `${screen.id}_field`, type: 'TextField', props: { placeholder: 'Gerekli bilgi' } }, { id: `${screen.id}_submit`, type: 'Button', props: { label: 'Kaydet' } }]
      : screen.archetype === 'settings' || screen.archetype === 'profile'
        ? [{ id: `${screen.id}_settings`, type: 'ListItem', props: { title: 'Hesap ve bildirim tercihleri' } }, { id: `${screen.id}_currency`, type: 'ListItem', props: { title: 'Para birimi' } }]
        : screen.archetype === 'detail'
          ? [{ id: `${screen.id}_detail`, type: 'ListItem', props: { title: 'Özet ve bağlamsal bilgiler' } }, { id: `${screen.id}_action`, type: 'Button', props: { label: 'İşlemi tamamla' } }]
        : [{ id: `${screen.id}_search`, type: 'SearchField', props: { placeholder: 'Ara' } }, { id: `${screen.id}_list`, type: 'ListItem', props: { title: 'Gelir ve gider kaydı' } }, { id: `${screen.id}_filter`, type: 'SegmentedControl', props: { items: ['Tümü', 'Gelir', 'Gider'] } }, { id: `${screen.id}_row2`, type: 'ListItem', props: { title: 'Ödenmemiş fatura' } }]
  const navigation = screen.navigationPlacement === 'primary' || screen.role !== 'form' && screen.role !== 'detail'
    ? [{ id: `${screen.id}_nav`, type: 'BottomNavigation', props: { items: nav } }]
    : []
  return [...common, ...specific, { id: `${screen.id}_divider`, type: 'Divider', props: {} }, { id: `${screen.id}_status`, type: 'Badge', props: { label: 'Hazır' } }, ...navigation]
}
