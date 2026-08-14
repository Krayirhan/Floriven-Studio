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
  const finance = /fatura|gelir|gider|vergi|bakiye|finans|finance/i.test(`${brief} ${blueprint.productDomain} ${blueprint.contentVocabulary.join(' ')}`)
  const content = finance ? financeContent(screen) : genericContent(screen, blueprint, brief)
  const focusedFlow = screen.archetype === 'form' || screen.archetype === 'detail'
  const navigation = focusedFlow ? [] : [node(`${screen.id}_nav`, 'BottomNavigation', { items: nav })]

  return [
    ...common,
    ...content,
    node(`${screen.id}_divider`, 'Divider', {}),
    ...navigation,
  ]
}

function genericContent(screen: ProductScreenSpec, blueprint: ProductBlueprint, brief: string): Node[] {
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
  if (screen.archetype === 'settings') return [
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
  if (screen.archetype === 'list') return [
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

function financeContent(screen: ProductScreenSpec): Node[] {
  switch (screen.id) {
    case 'overview':
      return [
        node('overview_balance', 'Metric', { label: 'Toplam bakiye', value: '₺124.500', trend: '+%8 bu ay' }),
        node('overview_income', 'Metric', { label: 'Bu ay gelir', value: '₺48.200', trend: '+%12' }),
        node('overview_expense', 'Metric', { label: 'Bu ay gider', value: '₺19.860', trend: '-%4' }),
        node('overview_unpaid', 'Metric', { label: 'Bekleyen tahsilat', value: '₺16.400', trend: '3 fatura' }),
        node('overview_tax', 'Metric', { label: 'Vergi rezervi', value: '₺8.740', trend: 'Son tarih 25 Ağustos' }),
        node('overview_chart', 'Chart', { label: 'Gelir / gider trendi', chartType: 'line', values: [18, 24, 21, 31, 28, 36] }),
        ...rows(screen, [['activity', 'Son hareket: Atlas Ltd.', '₺7.800 tahsil edildi'], ['insight', 'Nakit akışı içgörüsü', 'Tahsilat hedefi planın üzerinde']]),
      ]
    case 'transactions':
      return [
        node('transactions_search', 'SearchField', { placeholder: 'İşlem, kategori veya kişi ara' }),
        node('transactions_filter', 'SegmentedControl', { items: ['Tümü', 'Gelir', 'Gider'] }),
        node('transactions_period', 'Button', { label: 'Bu ay · Tarih filtresi' }),
        ...rows(screen, [
          ['income', 'Nova Tasarım', 'Bugün · Danışmanlık geliri · +₺12.500'],
          ['expense', 'Ofis kirası', 'Dün · İşletme gideri · -₺8.400'],
          ['merchant', 'Cloud servisleri', '12 Ağustos · Yazılım · -₺1.250'],
          ['transfer', 'Atlas Ltd.', '10 Ağustos · Tahsilat · +₺7.800'],
          ['category', 'Kategori özeti', 'Gelir ₺48.200 · Gider ₺19.860'],
        ]),
      ]
    case 'invoices':
      return [
        node('invoices_search', 'SearchField', { placeholder: 'Müşteri veya fatura numarası ara' }),
        node('invoices_status', 'SegmentedControl', { items: ['Tümü', 'Taslak', 'Gönderildi', 'Gecikmiş', 'Ödendi'] }),
        node('invoices_create', 'Button', { label: 'Yeni fatura oluştur' }),
        ...rows(screen, [
          ['draft', 'FTR-1048 · Nova Tasarım', 'Taslak · ₺6.500 · Kaydetme bekliyor'],
          ['sent', 'FTR-1047 · Atlas Ltd.', 'Gönderildi · ₺7.800 · Vade 18 Ağustos'],
          ['overdue', 'FTR-1042 · Ada Medya', 'Gecikmiş · ₺4.300 · Hatırlatma gönder'],
          ['paid', 'FTR-1039 · Koru Yapı', 'Ödendi · ₺9.600 · 5 Ağustos'],
          ['summary', 'Tahsilat özeti', 'Açık ₺16.400 · Gecikmiş ₺4.300'],
        ]),
      ]
    case 'invoice_form':
      return [
        node('invoice_form_customer', 'TextField', { label: 'Müşteri', placeholder: 'Müşteri seçin' }),
        node('invoice_form_item', 'TextField', { label: 'Hizmet veya ürün', placeholder: 'Satır açıklaması' }),
        node('invoice_form_quantity', 'TextField', { label: 'Miktar', value: '1' }),
        node('invoice_form_price', 'TextField', { label: 'Birim fiyat', value: '₺0' }),
        node('invoice_form_tax', 'SegmentedControl', { items: ['%0', '%10', '%20'] }),
        node('invoice_form_due', 'TextField', { label: 'Vade tarihi', placeholder: 'GG.AA.YYYY' }),
        node('invoice_form_notes', 'TextField', { label: 'Notlar', placeholder: 'Müşteriye görünecek not' }),
        node('invoice_form_total', 'Metric', { label: 'Fatura toplamı', value: '₺0,00', trend: 'Vergi dahil' }),
        node('invoice_form_preview', 'Button', { label: 'Önizle ve kaydet' }),
      ]
    case 'analytics':
      return [
        node('analytics_revenue', 'Metric', { label: 'Gelir karşılaştırması', value: '₺48.200', trend: 'Geçen aya göre +%12' }),
        node('analytics_margin', 'Metric', { label: 'Net marj', value: '%58,8', trend: '+3,2 puan' }),
        node('analytics_collection', 'Metric', { label: 'Tahsilat oranı', value: '%91', trend: 'Hedef %95' }),
        node('analytics_period', 'SegmentedControl', { items: ['Hafta', 'Ay', 'Çeyrek'] }),
        node('analytics_trend', 'Chart', { label: 'Nakit akışı trendi', chartType: 'area', values: [12, 18, 17, 25, 29, 34] }),
        node('analytics_category', 'Chart', { label: 'Gider dağılımı', chartType: 'bar', values: [38, 24, 18, 20] }),
        ...rows(screen, [['decision', 'Karar içgörüsü', 'Yazılım gideri artıyor; yıllık paketi değerlendirin'], ['comparison', 'Dönem karşılaştırması', 'Gelir hedefinin %104’ü tamamlandı']]),
      ]
    case 'detail':
      return [
        node(`${screen.id}_hero`, 'Metric', { label: 'Proje toplamı', value: '₺12.500', trend: 'Devam ediyor' }),
        node(`${screen.id}_customer`, 'ListItem', { title: 'Nova Tasarım', subtitle: 'Müşteri · Son güncelleme bugün' }),
        node(`${screen.id}_progress`, 'Progress', { label: 'Görev ilerlemesi', value: 68 }),
        node(`${screen.id}_timeline`, 'ListItem', { title: 'Sıradaki adım', subtitle: 'Teslim dosyalarını incele' }),
        node(`${screen.id}_action`, 'Button', { label: 'Görevi güncelle' }),
      ]
    case 'form':
      return [
        node(`${screen.id}_name`, 'TextField', { label: 'Görev adı', placeholder: 'Yeni görev adı' }),
        node(`${screen.id}_description`, 'TextField', { label: 'Açıklama', placeholder: 'Kısa bir açıklama yaz' }),
        node(`${screen.id}_project`, 'SegmentedControl', { items: ['Proje seç', 'Kişisel'] }),
        node(`${screen.id}_date`, 'TextField', { label: 'Teslim tarihi', placeholder: 'GG.AA.YYYY' }),
        node(`${screen.id}_priority`, 'SegmentedControl', { items: ['Düşük', 'Orta', 'Yüksek'] }),
        node(`${screen.id}_save`, 'Button', { label: 'Görevi kaydet' }),
      ]
    case 'settings':
      return [
        node('settings_profile', 'ListItem', { title: 'Hesap profili', subtitle: 'Şirket bilgileri ve vergi numarası' }),
        node('settings_currency', 'ListItem', { title: 'Para birimi', subtitle: 'Türk lirası (₺)' }),
        node('settings_tax', 'ListItem', { title: 'Vergi tercihleri', subtitle: 'KDV oranı ve rezerv kuralları' }),
        node('settings_notifications', 'Switch', { label: 'Vade bildirimleri', checked: true }),
        node('settings_weekly', 'Switch', { label: 'Haftalık finans özeti', checked: true }),
        node('settings_access', 'ListItem', { title: 'Ekip ve erişim', subtitle: 'Roller, onaylar ve paylaşım' }),
        node('settings_security', 'ListItem', { title: 'Güvenlik', subtitle: 'Oturumlar ve iki aşamalı doğrulama' }),
        node('settings_export', 'Button', { label: 'Verileri dışa aktar' }),
      ]
    default:
      return [
        node(`${screen.id}_search`, 'SearchField', { placeholder: 'Ara' }),
        node(`${screen.id}_filter`, 'SegmentedControl', { items: ['Tümü', 'Yeni', 'Tamamlandı'] }),
        ...rows(screen, [['row1', 'İlk kayıt', 'Bağlam ve durum'], ['row2', 'İkinci kayıt', 'Bağlam ve sonraki adım'], ['row3', 'Özet', 'İçgörü ve karar']]),
        node(`${screen.id}_action`, 'Button', { label: 'Devam et' }),
        node(`${screen.id}_metric`, 'Metric', { label: 'Özet', value: '0' }),
      ]
  }
}
