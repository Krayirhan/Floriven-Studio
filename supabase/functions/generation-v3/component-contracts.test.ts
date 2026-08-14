import { describe, expect, it } from 'vitest'
import {
  COMPONENT_CONTRACTS_VERSION,
  COMPONENT_REGISTRY,
  validateComponentProps,
  type AllComponentType,
  type ComponentPropsMap,
} from './component-contracts.ts'

const VALID_FIXTURES: { [K in AllComponentType]: ComponentPropsMap[K] } = {
  Screen: {},
  SafeArea: {},
  ScrollView: {},
  Stack: {},
  Row: {},
  Grid: {},
  Divider: {},
  Modal: {},
  Form: {},

  Text: { text: 'Hoş Geldiniz', variant: 'heading', tone: 'primary' },
  Image: { alt: 'Ürün Görseli', src: 'https://example.com/img.png' },
  Icon: { name: 'heart' },
  Button: { label: 'Devam Et', icon: 'arrow', variant: 'filled', tone: 'primary' },
  IconButton: { icon: 'search', label: 'Ara' },
  TextField: { label: 'E-posta', placeholder: 'ornek@alanadi.com', value: '' },
  SearchField: { placeholder: 'Ürün veya kategori ara', label: 'Arama' },
  Checkbox: { label: 'Kullanım koşullarını kabul ediyorum', checked: true },
  Switch: { label: 'Bildirimleri aç', checked: false },
  Card: { variant: 'elevated', tone: 'neutral' },
  ListItem: { title: 'Ahşap Sandalye', subtitle: 'Stokta 4 adet kaldı', trailing: '₺1.250', icon: 'tag', tone: 'neutral' },
  Badge: { label: 'Yeni', tone: 'positive' },
  Avatar: { initials: 'AY', src: 'https://example.com/avatar.png', alt: 'Ahmet Yılmaz' },
  TabBar: { items: ['Genel Bakış', 'Detaylar', 'Yorumlar'] },
  BottomNavigation: { items: ['Ana Sayfa', 'Arama', 'Sepetim', 'Profil'] },
  TopAppBar: { title: 'Sipariş Detayı', action: 'Paylaş' },
  Progress: { value: 65, label: 'Tamamlanma Oranı', tone: 'primary' },
  Metric: { label: 'Aylık Gelir', value: '₺142.500', caption: '+%14 geçen aya göre', tone: 'positive' },
  Chart: { label: 'Haftalık Ziyaret', values: [12, 19, 15, 25, 32, 28, 40], chartType: 'line', tone: 'primary' },
  SegmentedControl: { items: ['Günlük', 'Haftalık', 'Aylık'], selected: 'Haftalık' },
  FloatingActionButton: { icon: 'plus', label: 'Yeni Ekle' },

  Calendar: {
    label: 'Ağustos 2026',
    days: ['Pzt 10', 'Sal 11', 'Çar 12', 'Per 13', 'Cum 14'],
    events: ['09:00 Ekip Toplantısı', '14:00 Müşteri Görüşmesi'],
    timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
  },
  Timeline: {
    label: 'Sipariş Geçmişi',
    events: ['Sipariş Alındı', 'Hazırlanıyor', 'Kargoya Verildi', 'Teslim Edildi'],
  },
  Gallery: {
    label: 'Proje Fotoğrafları',
    items: ['Salon Görünümü', 'Mutfak Detayı', 'Balkon', 'Dış Cephe'],
  },
  KanbanBoard: {
    label: 'Görev Panosu',
    columns: ['Yapılacak', 'Sürüyor', 'Tamamlandı'],
    cards: ['Login ekranı tasarla', 'API entegrasyonu yap', 'Unit testleri yaz'],
  },
  MapView: {
    label: 'Şube Konumları',
    markers: ['Kadıköy Şubesi', 'Beşiktaş Şubesi', 'Levent Ofis'],
    routes: ['Kadıköy -> Beşiktaş'],
  },

  CareSummary: { title: 'Günlük İlaç Planı', subtitle: '4 dozdan 3 tanesi tamamlandı', progress: 75, status: 'normal' },
  MedicationTimeline: { label: 'Bugünkü İlaçlar', items: ['08:00 Aspirin', '13:00 Vitamin C', '20:00 Magnezyum'] },
  MedicationDoseRow: { name: 'Aspirin', dose: '100mg', instruction: 'Yemekten sonra', time: '08:00', status: 'taken' },
  HealthMetric: { label: 'Nabız', value: '72', unit: 'bpm', caption: 'Dinlenme halinde', status: 'normal' },
  UnitInput: { label: 'Kan Şekeri', value: '110', unit: 'mg/dL', hint: 'Açlık ölçümü' },
  RangeChart: { label: 'Kan Basıncı Takibi', unit: 'mmHg', values: [118, 122, 120, 125, 119], minimum: 80, maximum: 160, targetMinimum: 110, targetMaximum: 130 },
  TargetRange: { label: 'Günlük Su Hedefi', value: 2.4, unit: 'L', minimum: 1.5, maximum: 3.0 },
  StatusAlert: { title: 'Doz Hatırlatması', message: 'Akşam dozu saatiniz yaklaştı', severity: 'attention' },
  SafetyNotice: { title: 'Önemli Uyarı', message: 'İlacınızı bol su ile alınız' },
  SuccessFeedback: { title: 'Tebrikler', message: 'Haftalık hedefinize ulaştınız' },

  EditorialHero: { kicker: 'ÖZEL DOSYA', headline: 'Yapay Zeka ve Tasarımın Geleceği', dek: 'Üretken modeller stüdyo deneyimini nasıl dönüştürüyor?', issue: 'Sayı 42', date: 'Ağustos 2026' },
  FeatureStory: { category: 'Teknoloji', title: 'Yeni Nesil Mobil Arayüzler', summary: 'Kullanıcı alışkanlıkları ve dinamik düzenler üzerine kapsamlı analiz.' },
  StoryCard: { index: '01', category: 'Mimari', title: 'Sürdürülebilir Yapılar', summary: 'Ahşap kompozit malzemelerle çevre dostu konut projeleri.' },
  Byline: { author: 'Zeynep Kaya', role: 'Kıdemli Tasarım Editörü' },
  MetadataStrip: { date: '14 Ağustos 2026', readingTime: '6 dk okuma', edition: 'Dijital Baskı' },
  PullQuote: { quote: 'Tasarım sadece nasıl göründüğü değil, nasıl çalıştığıdır.', attribution: 'Steve Jobs' },
  SectionIndex: { items: ['Giriş ve Metodoloji', 'Piyasa Analizi', 'Vaka İncelemeleri', 'Sonuç'] },
  ArchiveEntry: { number: '#108', date: 'Temmuz 2026', title: 'Tipografi Sanatı', theme: 'Yazı Tipleri ve Hiyerarşi' },

  CommerceHero: { eyebrow: 'YENİ SEZON', title: 'Minimalist Koleksiyon', subtitle: 'Doğal malzemelerle üretilmiş premium ürünler.', cta: 'Keşfet' },
  ProductCard: { name: 'Deri Sırt Çantası', price: '₺2.850', description: 'El yapımı hakiki deri iş çantası.', badge: 'Bestseller', maker: 'Atölye İstanbul', status: 'Stokta' },
  PriceBlock: { label: 'Özel Fiyat', price: '₺1.990', compareAt: '₺2.490', taxNote: 'KDV dahildir' },
  ProductGallery: { alt: 'Çanta ön ve yan görünüm', current: 1, total: 4 },
  VariantSelector: { label: 'Renk Seçimi', options: ['Taba', 'Siyah', 'Haki'] },
  CartLine: { name: 'Deri Sırt Çantası', variant: 'Taba / Standart', price: '₺2.850', quantity: 1 },
  OrderSummary: { title: 'Sipariş Özeti', subtotal: '₺2.850', shipping: 'Ücretsiz', total: '₺2.850' },
  DeliveryPromise: { title: 'Aynı Gün Kargo', detail: 'Saat 15:00\'e kadar verilen siparişler bugün yola çıkar.' },

  LearningHero: { eyebrow: 'GÜNLÜK GÖREV', title: 'TypeScript Temelleri', mission: 'Discriminated union tiplerini tamamla', reward: '+50 XP' },
  XpProgress: { label: 'Seviye 4', current: '350', target: '500', value: 70, nextReward: 'Gümüş Rozet' },
  StreakBadge: { days: 12, message: 'Harika gidiyorsun! 12 günlük serin bozulmadı.' },
  LessonCard: { level: 'Orta Seviye', topic: 'Tip Güvenliği', title: 'JSON Schema Doğrulaması', duration: '15 dk', status: 'Başlamadı' },
  RoadmapStep: { order: '03', title: 'Bileşen Sözleşmeleri', description: 'Merkezi registry entegrasyonu', state: 'current' },
  QuizChoice: { key: 'B', label: 'discriminated union', state: 'selected' },
  AnswerFeedback: { result: 'correct', title: 'Harika Cevap!', explanation: 'Union tipleri runtime doğrulaması için en güvenli yoldur.' },
  AchievementBadge: { title: 'Kod Mimarı', description: '100 test başarıyla tamamlandı', icon: 'trophy', earnedAt: 'Bugün' },

  CommandSummary: { eyebrow: 'SİSTEM DURUMU', status: 'NOMINAL', value: '%99.98', title: 'Cluster Sağlığı', detail: 'Tüm podlar sağlıklı çalışıyor.' },
  SignalChart: { label: 'CPU Kullanımı', window: 'Son 1 saat', unit: '%', values: [32, 35, 41, 38, 45, 40], annotation: 'Tepe noktası: %45' },
  RiskIndicator: { label: 'Bellek Baskısı', value: '%68', explanation: 'Eşik değerin altında, stabil', severity: 'low' },
  OperationRow: { name: 'DB Backup', owner: 'DevOps Bot', updatedAt: '5 dk önce', status: 'Tamamlandı', metric: '1.2 GB' },
  IncidentTimeline: { label: 'Olay Kayıtları', events: ['09:00 Alarm tetiklendi', '09:02 Otomatik ölçekleme devreye girdi', '09:05 Normale dönüldü'] },
  DataMatrix: { columns: ['Servis', 'Bölge', 'Durum'], rows: ['Auth API', 'eu-central-1', 'Aktif', 'Payment Gateway', 'eu-west-1', 'Aktif'] },
  ControlToggle: { label: 'Bakım Modu', description: 'Kullanıcı trafiğini beklemeye al', state: 'KAPALI', guard: '2FA Gerekli' },
  AuditEntry: { time: '14:22', actor: 'admin@floriven.com', action: 'DEPLOY_V3', target: 'production-cluster' },
}

describe('Component Contracts Registry (Sprint 1)', () => {
  it('defines version 1.0.0', () => {
    expect(COMPONENT_CONTRACTS_VERSION).toBe('1.0.0')
  })

  it('validates all 77 canonical component fixtures successfully', () => {
    const allTypes = Object.keys(VALID_FIXTURES) as AllComponentType[]
    expect(allTypes.length).toBe(77)
    for (const type of allTypes) {
      const fixture = VALID_FIXTURES[type]
      const result = validateComponentProps(type, fixture)
      expect(result.ok, `Component ${type} failed fixture validation: ${result.issues?.join(', ')}`).toBe(true)
    }
  })

  it('rejects unknown component types fail-closed', () => {
    const result = validateComponentProps('NonExistentComponent' as AllComponentType, {})
    expect(result.ok).toBe(false)
    expect(result.issues?.some((i) => i.includes('unknown component type'))).toBe(true)
  })

  it('rejects extra unexpected properties fail-closed (additionalProperties: false)', () => {
    const result = validateComponentProps('Text', {
      text: 'Merhaba',
      unsupportedProperty: 'hacker_payload',
    })
    expect(result.ok).toBe(false)
    expect(result.issues?.some((i) => i.includes('unknown field') || i.includes('unknown key'))).toBe(true)
  })

  it('rejects missing required props on Calendar (missing events & days)', () => {
    const result = validateComponentProps('Calendar', { label: 'Takvim' })
    expect(result.ok).toBe(false)
    expect(result.issues?.some((i) => i.includes('array of strings required'))).toBe(true)
  })

  it('rejects KanbanBoard with a single string instead of string[] for columns', () => {
    const result = validateComponentProps('KanbanBoard', {
      label: 'Pano',
      columns: 'Yapılacak, Sürüyor', // invalid string instead of array
      cards: ['Kart 1'],
    })
    expect(result.ok).toBe(false)
    expect(result.issues?.some((i) => i.includes('columns: array of strings required'))).toBe(true)
  })

  it('rejects Progress with value exceeding 100 or negative', () => {
    const over = validateComponentProps('Progress', { value: 150 })
    expect(over.ok).toBe(false)
    expect(over.issues?.some((i) => i.includes('between 0 and 100 required'))).toBe(true)

    const neg = validateComponentProps('Progress', { value: -5 })
    expect(neg.ok).toBe(false)
    expect(neg.issues?.some((i) => i.includes('between 0 and 100 required'))).toBe(true)
  })

  it('rejects invalid enum values for StatusAlert.severity', () => {
    const result = validateComponentProps('StatusAlert', {
      title: 'Hata',
      message: 'Detay',
      severity: 'ultra-critical', // invalid enum
    })
    expect(result.ok).toBe(false)
    expect(result.issues?.some((i) => i.includes('severity: must be one of normal, attention, critical'))).toBe(true)
  })

  it('rejects Chart with fewer than 2 data values or non-numbers', () => {
    const tooFew = validateComponentProps('Chart', { label: 'Grafik', values: [10] })
    expect(tooFew.ok).toBe(false)
    expect(tooFew.issues?.some((i) => i.includes('must contain between 2 and 24 items'))).toBe(true)

    const nonNumber = validateComponentProps('Chart', { label: 'Grafik', values: [10, 'yirmi' as unknown as number] })
    expect(nonNumber.ok).toBe(false)
    expect(nonNumber.issues?.some((i) => i.includes('finite number required'))).toBe(true)
  })

  it('rejects MapView with invalid marker types', () => {
    const result = validateComponentProps('MapView', {
      label: 'Harita',
      markers: ['', '  '], // empty strings
    })
    expect(result.ok).toBe(false)
    expect(result.issues?.some((i) => i.includes('non-empty string required'))).toBe(true)
  })

  it('validates a11y rules exist for every component in registry', () => {
    for (const [type, def] of Object.entries(COMPONENT_REGISTRY)) {
      expect(def.a11yRules, `Component ${type} missing a11yRules`).toBeDefined()
      expect(typeof def.a11yRules.role).toBe('string')
      expect(def.a11yRules.role.length).toBeGreaterThan(0)
    }
  })
})
