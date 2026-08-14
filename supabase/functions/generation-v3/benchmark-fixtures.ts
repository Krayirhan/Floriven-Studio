/**
 * ADR-0009 acceptance-gate corpus: at least 25 distinct product briefs and a 100-screen target
 * (`targetScreenCount` sums to 100 across the corpus), with every one of the ten required
 * experience archetypes — calendar, board, map, gallery, timeline, form, detail, list, dashboard,
 * settings — represented by at least two briefs. `benchmark-fixtures.test.ts` enforces this shape
 * so the corpus can never silently shrink below the ADR's own gate.
 */
export type ExperienceArchetype = 'calendar' | 'board' | 'map' | 'gallery' | 'timeline' | 'form' | 'detail' | 'list' | 'dashboard' | 'settings'

export type V3PlanningBenchmark = {
  id: string
  brief: string
  expectedDomainTerms: string[]
  requiredInteraction: 'schedule' | 'reorder' | 'visualize' | 'create' | 'compare' | 'search' | 'select' | 'inspect' | 'edit'
  experiencePattern: ExperienceArchetype
  /** Planned screen count for this brief when the corpus is run end to end — sums to 100 across the corpus. */
  targetScreenCount: number
}

/** Stable corpus: additions are allowed; changing intent requires benchmark review. */
export const V3_PLANNING_BENCHMARKS: readonly V3PlanningBenchmark[] = [
  // calendar (3)
  { id: 'architecture-schedule', brief: 'Bağımsız mimarlar için proje, müşteri ve haftalık saha ziyareti planlama uygulaması.', expectedDomainTerms: ['proje', 'müşteri', 'saha ziyareti'], requiredInteraction: 'schedule', experiencePattern: 'calendar', targetScreenCount: 4 },
  { id: 'clinic-appointments', brief: 'Klinik çalışanlarının doktor takvimi, hasta randevuları ve müsait saatleri yönettiği sistem.', expectedDomainTerms: ['doktor', 'hasta', 'randevu'], requiredInteraction: 'schedule', experiencePattern: 'calendar', targetScreenCount: 4 },
  { id: 'conference-schedule', brief: 'Konferans organizatörlerinin oturumları, konuşmacıları ve salon takvimini planladığı uygulama.', expectedDomainTerms: ['oturum', 'konuşmacı', 'salon'], requiredInteraction: 'schedule', experiencePattern: 'calendar', targetScreenCount: 4 },

  // board (2)
  { id: 'restaurant-board', brief: 'Restoran mutfağında siparişleri hazırlanıyor, hazır ve servis edildi kolonlarında yöneten pano.', expectedDomainTerms: ['sipariş', 'mutfak', 'servis'], requiredInteraction: 'reorder', experiencePattern: 'board', targetScreenCount: 4 },
  { id: 'recruitment-board', brief: 'İnsan kaynakları ekibinin adayları başvurdu, mülakat ve teklif kolonlarında ilerlettiği işe alım panosu.', expectedDomainTerms: ['aday', 'mülakat', 'teklif'], requiredInteraction: 'reorder', experiencePattern: 'board', targetScreenCount: 4 },

  // map (2)
  { id: 'field-map', brief: 'Saha ekiplerinin arıza kayıtlarını haritada görüp en uygun rotayı seçtiği operasyon uygulaması.', expectedDomainTerms: ['arıza', 'saha ekibi', 'rota'], requiredInteraction: 'visualize', experiencePattern: 'map', targetScreenCount: 4 },
  { id: 'delivery-map', brief: 'Kurye şirketinin teslimat noktalarını haritada görüp en uygun rotayı planladığı uygulama.', expectedDomainTerms: ['kurye', 'teslimat', 'rota'], requiredInteraction: 'visualize', experiencePattern: 'map', targetScreenCount: 4 },

  // gallery (2)
  { id: 'photography-gallery', brief: 'Fotoğrafçıların müşteri çekimlerini albüm ve galeri halinde seçime sunduğu portal.', expectedDomainTerms: ['çekim', 'albüm', 'müşteri'], requiredInteraction: 'select', experiencePattern: 'gallery', targetScreenCount: 4 },
  { id: 'realestate-gallery', brief: 'Emlak danışmanlarının ilan fotoğraflarını galeri halinde müşteriye seçtirdiği uygulama.', expectedDomainTerms: ['emlak', 'ilan', 'fotoğraf'], requiredInteraction: 'select', experiencePattern: 'gallery', targetScreenCount: 4 },

  // timeline (2)
  { id: 'learning-roadmap', brief: 'Öğrencilerin ders yol haritasını, quiz sonuçlarını ve ilerlemesini takip ettiği öğrenme ürünü.', expectedDomainTerms: ['ders', 'quiz', 'ilerleme'], requiredInteraction: 'visualize', experiencePattern: 'timeline', targetScreenCount: 4 },
  { id: 'incident-timeline', brief: 'Operasyon ekiplerinin servis kesintilerini kronolojik olay akışı ve sorumlularla incelediği merkez.', expectedDomainTerms: ['kesinti', 'olay', 'sorumlu'], requiredInteraction: 'visualize', experiencePattern: 'timeline', targetScreenCount: 4 },

  // form (3)
  { id: 'invoice-form', brief: 'Freelancerların müşteriye kalemli fatura oluşturup ödeme tarihini takip ettiği uygulama.', expectedDomainTerms: ['fatura', 'müşteri', 'ödeme'], requiredInteraction: 'create', experiencePattern: 'form', targetScreenCount: 4 },
  { id: 'vet-intake-form', brief: 'Veteriner kliniğinin yeni hasta hayvan kaydını ve sahibi bilgilerini formla aldığı uygulama.', expectedDomainTerms: ['hasta', 'hayvan', 'sahip'], requiredInteraction: 'create', experiencePattern: 'form', targetScreenCount: 4 },
  { id: 'grant-application-form', brief: 'Sivil toplum kuruluşlarının hibe başvurusu ve bütçe kalemlerini formla doldurduğu uygulama.', expectedDomainTerms: ['hibe', 'başvuru', 'bütçe'], requiredInteraction: 'create', experiencePattern: 'form', targetScreenCount: 4 },

  // detail (2)
  { id: 'museum-artifact-detail', brief: 'Müze küratörlerinin eser detayını, köken bilgisini ve sergi geçmişini incelediği uygulama.', expectedDomainTerms: ['eser', 'köken', 'sergi'], requiredInteraction: 'inspect', experiencePattern: 'detail', targetScreenCount: 4 },
  { id: 'car-listing-detail', brief: 'İkinci el araç alıcılarının ilan detayını, hasar kaydını ve donanım listesini incelediği uygulama.', expectedDomainTerms: ['araç', 'hasar kaydı', 'donanım'], requiredInteraction: 'inspect', experiencePattern: 'detail', targetScreenCount: 4 },

  // list (3)
  { id: 'legal-search', brief: 'Hukuk bürosunun dava, müvekkil ve duruşma belgelerinde hızlı arama yaptığı çalışma alanı.', expectedDomainTerms: ['dava', 'müvekkil', 'duruşma'], requiredInteraction: 'search', experiencePattern: 'list', targetScreenCount: 4 },
  { id: 'podcast-episode-list', brief: 'Podcast prodüksiyon ekibinin bölümleri, konukları ve yayın tarihlerini aradığı uygulama.', expectedDomainTerms: ['bölüm', 'konuk', 'yayın tarihi'], requiredInteraction: 'search', experiencePattern: 'list', targetScreenCount: 4 },
  { id: 'donor-list', brief: 'Bağış derneğinin bağışçıları, bağış tutarlarını ve iletişim geçmişini aradığı uygulama.', expectedDomainTerms: ['bağışçı', 'bağış tutarı', 'iletişim'], requiredInteraction: 'search', experiencePattern: 'list', targetScreenCount: 4 },

  // dashboard (3)
  { id: 'inventory-compare', brief: 'Mağaza yöneticilerinin stok, tedarikçi fiyatı ve ürün varyantlarını karşılaştırdığı sistem.', expectedDomainTerms: ['stok', 'tedarikçi', 'varyant'], requiredInteraction: 'compare', experiencePattern: 'dashboard', targetScreenCount: 4 },
  { id: 'fitness-dashboard', brief: 'Kişisel antrenörlerin danışan antrenman metriklerini haftalık karşılaştırdığı uygulama.', expectedDomainTerms: ['antrenman', 'danışan', 'metrik'], requiredInteraction: 'compare', experiencePattern: 'dashboard', targetScreenCount: 4 },
  { id: 'subscriptionbox-dashboard', brief: 'Abonelik kutusu işletmecisinin aylık kutu performansını ve müşteri kaybını karşılaştırdığı uygulama.', expectedDomainTerms: ['abonelik kutusu', 'performans', 'müşteri kaybı'], requiredInteraction: 'compare', experiencePattern: 'dashboard', targetScreenCount: 4 },

  // settings (3)
  { id: 'coworking-settings', brief: 'Coworking alanı üyelerinin üyelik planı, oda erişimi ve bildirim tercihlerini düzenlediği uygulama.', expectedDomainTerms: ['üyelik', 'oda erişimi', 'bildirim'], requiredInteraction: 'edit', experiencePattern: 'settings', targetScreenCount: 4 },
  { id: 'petgrooming-settings', brief: 'Evcil hayvan bakım salonunun randevu hatırlatma ve çalışan izin ayarlarını düzenlediği uygulama.', expectedDomainTerms: ['randevu hatırlatma', 'çalışan', 'izin'], requiredInteraction: 'edit', experiencePattern: 'settings', targetScreenCount: 4 },
  { id: 'languageexchange-settings', brief: 'Dil değişim platformu kullanıcılarının profil görünürlüğü ve eşleşme tercihlerini düzenlediği uygulama.', expectedDomainTerms: ['profil', 'görünürlük', 'eşleşme'], requiredInteraction: 'edit', experiencePattern: 'settings', targetScreenCount: 4 },
] as const
