import type { ProductBlueprint, ProductScreenSpec } from './domain.ts'

type Node = Record<string, unknown>

/** Provider-independent, brief-aware safety net used only when a provider is unavailable. */
export function composeDeterministicBaseScreens(blueprint: ProductBlueprint, brief = ''): Node[] {
  const nav = blueprint.navigation.primaryScreenIds
    .map((id) => blueprint.screens.find((screen) => screen.id === id)?.name)
    .filter((name): name is string => !!name)

  return blueprint.screens.map((screen) => ({
    id: screen.id,
    name: screen.name,
    route: screen.route,
    root: {
      id: `${screen.id}_root`,
      type: 'Screen',
      props: { theme: 'ocean' },
      layout: { mode: 'column', gap: 'space.4' },
      children: baseChildren(screen, nav, blueprint, brief),
      a11y: { role: 'main', label: screen.name },
    },
    navigation: nav,
  }))
}

function node(id: string, type: string, props: Node): Node {
  return { id, type, props }
}

function rows(screen: ProductScreenSpec, entries: Array<[string, string, string]>): Node[] {
  return entries.map(([suffix, title, subtitle]) => node(`${screen.id}_${suffix}`, 'ListItem', { title, subtitle }))
}

function baseChildren(screen: ProductScreenSpec, nav: string[], blueprint: ProductBlueprint, brief: string): Node[] {
  const common = [
    node(`${screen.id}_title`, 'TopAppBar', { title: screen.name }),
    node(`${screen.id}_context`, 'Text', { text: `${blueprint.productDomain || 'Ürün'} için ${screen.purpose || brief || 'ana kullanıcı akışı'}`, variant: 'heading' }),
  ]
  const content = genericContent(screen, blueprint, brief)
  const experience = experienceContent(screen)
  const focusedFlow = screen.archetype === 'form' || screen.archetype === 'detail'
  const navigation = focusedFlow ? [] : [node(`${screen.id}_nav`, 'BottomNavigation', { items: nav })]

  return [
    ...common,
    ...experience,
    ...content,
    node(`${screen.id}_divider`, 'Divider', {}),
    ...navigation,
  ]
}

function experienceContent(screen: ProductScreenSpec): Node[] {
  const pattern = screen.experiencePattern ?? 'standard'
  if (pattern === 'standard') return []
  const data = screen.contract?.requiredData?.length ? screen.contract.requiredData : screen.sections
  if (pattern === 'calendar') return [node(`${screen.id}_calendar`, 'Calendar', { label: screen.name, days: ['Pzt 12', 'Sal 13', 'Çar 14', 'Per 15', 'Cum 16'], events: data.slice(0, 5) })]
  if (pattern === 'timeline') return [node(`${screen.id}_timeline`, 'Timeline', { label: screen.name, events: data.slice(0, 5) })]
  if (pattern === 'gallery') return [node(`${screen.id}_gallery`, 'Gallery', { label: screen.name, items: data.slice(0, 6) })]
  if (pattern === 'board') return [node(`${screen.id}_board`, 'KanbanBoard', { label: screen.name, columns: screen.sections.slice(0, 3), cards: data.slice(0, 6) })]
  if (pattern === 'map') return [node(`${screen.id}_map`, 'MapView', { label: screen.name, markers: data.slice(0, 5) })]
  return []
}

function genericContent(screen: ProductScreenSpec, blueprint: ProductBlueprint, brief: string): Node[] {
  if (hasUsableContract(screen)) return contractContent(screen, blueprint)
  const subject = brief.trim().replace(/[.!?].*$/, '').slice(0, 72) || blueprint.productDomain || 'ürün';
  const vocabulary = [...blueprint.entities, ...blueprint.contentVocabulary].filter(Boolean)
  const term = (index: number, fallback: string) => vocabulary[index % Math.max(1, vocabulary.length)] || fallback
  if (screen.archetype === 'form') return [
    node(`${screen.id}_intro`, 'Text', { text: `${subject} için yeni kayıt oluştur`, variant: 'body' }),
    node(`${screen.id}_field_one`, 'TextField', { label: 'Başlık', placeholder: 'Bir başlık girin' }),
    node(`${screen.id}_field_two`, 'TextField', { label: 'Açıklama', placeholder: 'Detayları yazın' }),
    node(`${screen.id}_field_three`, 'TextField', { label: term(0, 'Kategori'), placeholder: `${term(0, 'Kategori')} seçin` }),
    node(`${screen.id}_field_four`, 'TextField', { label: term(1, 'Konum'), placeholder: `${term(1, 'Konum')} girin` }),
    node(`${screen.id}_date`, 'TextField', { label: 'Tarih', placeholder: 'GG.AA.YYYY' }),
    node(`${screen.id}_options`, 'SegmentedControl', { items: ['Genel', 'Önemli', 'Daha sonra'] }),
    node(`${screen.id}_visibility`, 'SegmentedControl', { items: ['Kişisel', 'Ekip', 'Herkes'] }),
    node(`${screen.id}_notice`, 'Alert', { title: 'Kontrol et', message: `${subject} bilgilerini kaydetmeden önce doğrula` }),
    node(`${screen.id}_cancel`, 'Button', { label: 'Vazgeç', variant: 'secondary' }),
    node(`${screen.id}_save`, 'Button', { label: 'Kaydet' }),
  ];
  if (screen.archetype === 'settings' || screen.archetype === 'profile') return [
    node(`${screen.id}_profile`, 'ListItem', { title: 'Profil ve tercihler', subtitle: `${subject} ayarlarını yönet` }),
    node(`${screen.id}_notifications`, 'Switch', { label: 'Bildirimler', checked: true }),
    node(`${screen.id}_reminders`, 'Switch', { label: 'Hatırlatmalar', checked: true }),
    node(`${screen.id}_updates`, 'Switch', { label: `${term(0, 'İçerik')} güncellemeleri`, checked: false }),
    node(`${screen.id}_privacy`, 'ListItem', { title: 'Gizlilik ve erişim', subtitle: 'Hesap ve paylaşım ayarları' }),
    node(`${screen.id}_language`, 'ListItem', { title: 'Dil ve bölge', subtitle: 'Türkçe · Türkiye' }),
    node(`${screen.id}_team`, 'ListItem', { title: 'Ekip ve paylaşım', subtitle: `${subject} erişimlerini yönet` }),
    node(`${screen.id}_appearance`, 'SegmentedControl', { items: ['Sistem', 'Açık', 'Koyu'] }),
    node(`${screen.id}_security`, 'ListItem', { title: 'Güvenlik', subtitle: 'Oturum ve hesap güvenliği' }),
    node(`${screen.id}_export`, 'Button', { label: 'Verileri dışa aktar' }),
  ];
  if (screen.archetype === 'detail') return [
    node(`${screen.id}_hero`, 'Metric', { label: term(0, 'Ana değer'), value: '68', trend: `${subject} durumu` }),
    node(`${screen.id}_status`, 'Badge', { label: 'Aktif' }),
    node(`${screen.id}_progress`, 'Progress', { label: 'İlerleme', value: 68 }),
    ...rows(screen, [
      ['summary', term(1, 'Özet'), `${subject} için temel bilgiler`],
      ['context', term(2, 'Bağlam'), 'İlgili ayrıntılar ve güncel durum'],
      ['activity', 'Son hareket', 'Bugün güncellendi'],
      ['next', 'Sıradaki adım', `${term(3, 'Plan')} için devam et`],
      ['owner', 'Sorumlu', 'Ekip üyesi'],
    ]),
    node(`${screen.id}_secondary`, 'Button', { label: 'Paylaş', variant: 'secondary' }),
    node(`${screen.id}_action`, 'Button', { label: 'Güncelle' }),
  ];
  if (screen.archetype === 'management_list') return [
    node(`${screen.id}_search`, 'SearchField', { placeholder: `${subject} içinde ara` }),
    node(`${screen.id}_filter`, 'SegmentedControl', { items: ['Tümü', 'Yeni', 'Takipte'] }),
    node(`${screen.id}_sort`, 'Button', { label: 'Sırala ve filtrele', variant: 'secondary' }),
    ...rows(screen, Array.from({ length: 7 }, (_, index) => [
      `item_${index}`,
      term(index, `${subject} kaydı ${index + 1}`),
      `${subject} · ${index % 2 === 0 ? 'Güncel' : 'Planlandı'}`,
    ] as [string, string, string])),
    node(`${screen.id}_action`, 'Button', { label: `Yeni ${term(0, 'kayıt')} ekle` }),
  ];
  if (screen.archetype === 'analytics') return [
    node(`${screen.id}_period`, 'SegmentedControl', { items: ['Hafta', 'Ay', 'Yıl'] }),
    node(`${screen.id}_metric_one`, 'Metric', { label: term(0, 'Toplam'), value: '68', trend: '+12%' }),
    node(`${screen.id}_metric_two`, 'Metric', { label: term(1, 'Aktif'), value: '24', trend: '+4' }),
    node(`${screen.id}_metric_three`, 'Metric', { label: term(2, 'Başarı'), value: '%91', trend: '+3 puan' }),
    node(`${screen.id}_line`, 'Chart', { label: `${term(0, subject)} trendi`, chartType: 'line', values: [18, 24, 21, 31, 28, 36] }),
    node(`${screen.id}_bar`, 'Chart', { label: `${term(1, 'Dağılım')} karşılaştırması`, chartType: 'bar', values: [38, 24, 18, 20] }),
    ...rows(screen, [
      ['insight', 'Öne çıkan içgörü', `${subject} için anlamlı değişim tespit edildi`],
      ['comparison', 'Dönem karşılaştırması', `${term(2, 'Hedef')} önceki dönemin üzerinde`],
      ['recommendation', 'Önerilen adım', `${term(3, 'Plan')} ayrıntılarını incele`],
    ]),
  ];
  return [
    node(`${screen.id}_metric_one`, 'Metric', { label: 'Ana gösterge', value: '68', trend: '+12 bu dönem' }),
    node(`${screen.id}_metric_two`, 'Metric', { label: 'Aktif içerik', value: '24', trend: '+4 yeni' }),
    node(`${screen.id}_metric_three`, 'Metric', { label: term(0, 'Tamamlanan'), value: '91', trend: '+8' }),
    node(`${screen.id}_chart`, 'Chart', { label: `${subject} trendi`, chartType: 'line', values: [18, 24, 21, 31, 28, 36] }),
    ...rows(screen, [
      ['primary', term(0, 'Öne çıkan içerik'), `${subject} için ilk önemli gelişme`],
      ['secondary', term(1, 'Güncel kayıt'), `${subject} bağlamındaki son değişiklik`],
      ['activity', 'Son hareket', `${term(2, 'İçerik')} bugün güncellendi`],
      ['next', 'Sıradaki adım', `${term(3, 'Plan')} bağlamını inceleyip karar ver`],
    ]),
    node(`${screen.id}_action`, 'Button', { label: 'Yeni içerik ekle' }),
  ];
}

function hasUsableContract(screen: ProductScreenSpec): boolean {
  return !!screen.contract?.primaryAction?.trim()
    && (screen.contract.requiredSections?.length ?? 0) >= 2
    && (screen.contract.requiredData?.length ?? 0) >= 2
}

function contractContent(screen: ProductScreenSpec, blueprint: ProductBlueprint): Node[] {
  const contract = screen.contract
  const sections = contract.requiredSections.slice(0, 4)
  const data = contract.requiredData.slice(0, 6)
  const secondaryActions = contract.secondaryActions.slice(0, 2)
  const targetNames = contract.navigationTargetIds
    .map((id) => blueprint.screens.find((candidate) => candidate.id === id)?.name)
    .filter((name): name is string => !!name)
  const value = (index: number) => String(stableValue(`${screen.id}:${data[index % data.length]}`, index))
  const densityMinimum = contract.identityIntent?.densityProfile === 'focused' ? 3 : contract.identityIntent?.densityProfile === 'dense' ? 7 : 5
  const headings = sections.map((section, index) => node(`${screen.id}_section_${index}`, 'Text', { text: section, variant: 'heading' }))
  const actionNodes = [
    ...secondaryActions.map((action, index) => node(`${screen.id}_secondary_${index}`, 'Button', { label: action, variant: 'secondary' })),
    ...targetNames.map((name, index) => node(`${screen.id}_target_${index}`, 'Button', { label: `${name} ekranına git`, variant: 'secondary' })),
    node(`${screen.id}_primary_action`, 'Button', { label: contract.primaryAction }),
  ]

  if (screen.archetype === 'form') return [
    ...headings,
    ...data.map((field, index) => node(`${screen.id}_field_${index}`, 'TextField', { label: field, placeholder: `${field} bilgisini girin` })),
    node(`${screen.id}_form_mode`, 'SegmentedControl', { items: ['Taslak', 'Hazır', 'Onaylı'] }),
    node(`${screen.id}_form_progress`, 'Progress', { label: `${data.length} zorunlu alan`, value: Math.min(95, 35 + data.length * 10) }),
    node(`${screen.id}_form_status`, 'Badge', { label: 'Düzenleniyor' }),
    node(`${screen.id}_form_context`, 'Text', { text: contract.job, variant: 'body' }),
    ...actionNodes,
  ]

  const dataRows = Array.from({ length: Math.max(densityMinimum, data.length) }, (_, index) => {
    const field = data[index % data.length]
    return node(`${screen.id}_data_${index}`, 'ListItem', {
      title: `${field} ${index + 1}`,
      subtitle: `${sections[index % sections.length]} kapsamında doğrulanmış ${field}`,
      trailing: value(index),
    })
  })

  if (screen.archetype === 'settings' || screen.archetype === 'profile') return [
    ...headings,
    ...data.slice(0, 3).map((field, index) => node(`${screen.id}_setting_${index}`, 'Switch', { label: field, checked: index % 2 === 0 })),
    ...dataRows.slice(0, 4),
    node(`${screen.id}_setting_mode`, 'SegmentedControl', { items: ['Kişisel', 'Ekip', 'Kuruluş'] }),
    ...actionNodes,
  ]

  if (screen.archetype === 'detail') return [
    ...headings,
    node(`${screen.id}_detail_metric`, 'Metric', { label: data[0], value: value(0), caption: sections[0] }),
    node(`${screen.id}_detail_progress`, 'Progress', { label: data[1], value: stableValue(screen.id, 1) }),
    node(`${screen.id}_detail_status`, 'Badge', { label: 'Güncel' }),
    ...dataRows,
    ...actionNodes,
  ]

  if (screen.archetype === 'management_list') return [
    ...headings,
    node(`${screen.id}_search`, 'SearchField', { placeholder: `${data[0]} içinde ara` }),
    node(`${screen.id}_filter`, 'SegmentedControl', { items: ['Tümü', sections[0], sections[1]] }),
    ...dataRows,
    ...actionNodes,
  ]

  if (screen.archetype === 'analytics') return [
    ...headings,
    ...data.slice(0, 3).map((field, index) => node(`${screen.id}_metric_${index}`, 'Metric', { label: field, value: value(index), caption: sections[index % sections.length] })),
    node(`${screen.id}_trend`, 'Chart', { label: `${data[0]} eğilimi`, values: seriesFor(screen.id) }),
    node(`${screen.id}_distribution`, 'Chart', { label: `${data[1]} dağılımı`, values: seriesFor(`${screen.id}:distribution`).slice(0, 4) }),
    ...dataRows.slice(0, 3),
    ...actionNodes,
  ]

  return [
    ...headings,
    ...data.slice(0, 3).map((field, index) => node(`${screen.id}_metric_${index}`, 'Metric', { label: field, value: value(index), caption: sections[index % sections.length] })),
    node(`${screen.id}_trend`, 'Chart', { label: `${data[0]} eğilimi`, values: seriesFor(screen.id) }),
    ...dataRows.slice(0, 4),
    ...actionNodes,
  ]
}

function stableValue(seed: string, offset: number): number {
  let hash = 17 + offset * 31
  for (const character of seed) hash = (hash * 33 + character.charCodeAt(0)) % 997
  return 12 + (hash % 83)
}

function seriesFor(seed: string): number[] {
  return Array.from({ length: 6 }, (_, index) => stableValue(seed, index))
}
