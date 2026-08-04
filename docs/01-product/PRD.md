# Ürün Gereksinimleri Dokümanı (PRD)

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Onay gerekli |
| Doküman sahibi | Product Owner |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Her ana sürüm |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## 1. Amaç

Kullanıcıların doğal dil veya referans görselle mobil uygulama ekran seti üretmesini, görsel olarak düzenlemesini, sürümlemesini ve dışa aktarmasını sağlayan SaaS ürününün fonksiyonel ve fonksiyonel olmayan gereksinimlerini tanımlar.

## 2. Başarı ölçütleri

- Yeni kullanıcıların en az %60'ı ilk oturumda bir proje ve en az üç ekran oluşturabilmeli.
- Başarılı üretim işlerinin p95 tamamlanma süresi MVP'de 120 saniyenin altında olmalı.
- AI çıktılarının en az %98'i otomatik şema validasyonundan ilk veya otomatik düzeltme turunda geçmeli.
- Kullanıcıların en az %30'u oluşturduğu projede manuel düzenleme yapmalı; en az %15'i dışa aktarım tamamlamalı.
- Yetkisiz tenant erişimi için doğrulanmış sıfır kritik olay hedeflenir.

## 3. Ana kullanıcı akışı

1. Kullanıcı kayıt olur ve workspace oluşturur.
2. Proje sihirbazında uygulama türünü, hedef kullanıcıyı, platformu, ekran sayısını ve stil tercihlerini belirtir.
3. İsteğe bağlı logo, renk paleti veya referans görsel yükler.
4. Sistem brief'i özetler; kullanıcı onaylar.
5. AI önce ScreenGraph, ardından DesignSpec üretir.
6. Validasyon katmanı yapısal, erişilebilirlik ve platform kontrollerini çalıştırır.
7. Kullanıcı editörde ekranları inceler, bileşenleri düzenler veya seçili alanı AI ile yeniler.
8. Kullanıcı snapshot oluşturur ve Figma/HTML/kod taslağı dışa aktarımı başlatır.
9. Kullanım kredi defterine yansır ve geçmişten izlenebilir.

## 4. Fonksiyonel gereksinimler

### FR-01 Kimlik ve workspace

- E-posta ve desteklenen sosyal/OIDC sağlayıcılarla giriş.
- Workspace oluşturma, ad değiştirme, üye daveti ve rol atama.
- Roller: Owner, Admin, Editor, Viewer, Billing.
- Her kaynak workspace ile ilişkilendirilir; tüm erişim sunucu tarafında doğrulanır.

### FR-02 Proje yönetimi

- Proje oluşturma, arşivleme, çoğaltma ve kalıcı silme talebi.
- Proje ayarları: platform, dil, cihaz profili, tema, marka kiti.
- Son güncellenen, favori ve durum filtreleri.

### FR-03 Brief ve girdi

- Serbest metin prompt, yapılandırılmış form ve referans görsel.
- Girdi boyutu/türü validasyonu ve zararlı dosya taraması.
- AI'ın üretimden önce anladığı brief'in kullanıcıya gösterilmesi.
- Hassas veri girilmemesi için açık uyarı.

### FR-04 Üretim

- 3–10 ekranlık başlangıç seti.
- İş durumu: queued, planning, generating, validating, completed, failed, cancelled.
- İş iptali ve güvenli retry.
- Aynı idempotency anahtarıyla yinelenen ücretlendirme yapılmaması.
- Hata durumunda tüketilmeyen kredi iadesi veya rezervasyonun bırakılması.

### FR-05 Editör

- Ekran listesi, layer tree, properties panel ve canlı preview.
- Seçme, taşıma, yeniden boyutlandırma, kopyalama, silme ve gruplayabilme.
- Metin, renk, boşluk, hizalama, radius, görünürlük ve component variant düzenleme.
- Undo/redo; klavye kısayolları; otomatik kaydetme.
- Çoklu seçim, zoom ve cihaz çerçevesi.
- AI komutları: seçimi yeniden tasarla, metni değiştir, stil uygula, ekran ekle.

### FR-06 Sürümleme

- Otomatik draft revizyonları ve kullanıcı tarafından isimlendirilmiş snapshot'lar.
- İki snapshot arasında özet fark gösterimi.
- Snapshot'tan yeni çalışma kopyası oluşturma.

### FR-07 Dışa aktarım

- MVP: Figma'ya aktarılabilir yapı ve HTML/React preview paketi.
- Sonraki faz: React Native ve Flutter component taslakları.
- Export job geçmişi, süreli indirme bağlantısı ve hata raporu.
- Desteklenmeyen özellikler için kayıp/uyarı raporu.

### FR-08 Kredi ve faturalama

- Plan, dönem, kalan kredi ve ledger görüntüleme.
- Kredi rezervasyonu → işlem tamamlama/iptal modeli.
- Owner/Billing rolü dışında ödeme ayarı değiştirilemez.
- Webhook'lar imza doğrulaması ve idempotency ile işlenir.

### FR-09 Yönetim

- Kullanıcı/tenant destek araması, job inceleme ve güvenli yeniden deneme.
- İçeriğe erişim varsayılan kapalı; destek erişimi açık gerekçe, süre ve audit log ister.
- Model sağlayıcı, maliyet limiti ve feature flag yönetimi.

## 5. Fonksiyonel olmayan gereksinimler

| Alan | Gereksinim |
|---|---|
| Kullanılabilirlik | Aylık kullanıcıya dönük SLO beta için %99,5; genel kullanım için %99,9 hedefi. |
| Performans | Editör yerel etkileşimleri 100 ms altında hissettirmeli; API read p95 400 ms altında hedeflenmeli. |
| Güvenlik | OWASP kontrolleri, tenant izolasyonu, şifreli taşıma/saklama, audit trail. |
| Erişilebilirlik | Web arayüzü WCAG 2.2 AA hedefiyle geliştirilir. |
| Ölçeklenebilirlik | API ve worker katmanı yatay ölçeklenebilir; job kuyruğu backpressure uygular. |
| Dayanıklılık | Kritik işlerde idempotency, retry bütçesi, dead-letter queue ve manuel yeniden işleme. |
| Gizlilik | Veri minimizasyonu, amaçla sınırlılık, silme/export talepleri ve saklama süresi. |
| Gözlemlenebilirlik | Her istekte correlation ID; servis, job, model ve tenant düzeyinde metrikler. |

## 6. Kabul kriterleri — MVP çıkışı

- Yeni kullanıcı tek oturumda kayıt → proje → 3 ekran → düzenleme → export akışını tamamlayabiliyor.
- DesignSpec v1 şema ve migrasyon testleri geçiyor.
- Kredi yarış koşulu ve webhook tekrar testleri başarılı.
- Tenant izolasyon test paketi kritik endpoint'lerin tamamını kapsıyor.
- Başarısız AI job'ları kredi kaybına yol açmıyor ve anlaşılır hata sunuyor.
- Kritik kullanıcı akışlarının E2E ve görsel regresyon testleri çalışıyor.
- Üretim runbook'u, olay müdahale planı ve geri alma prosedürü doğrulanmış.

## 7. Bağımlılıklar

Model sağlayıcı sözleşmesi, nesne depolama, OIDC kimlik, ödeme sağlayıcısı, e-posta servisi, Figma export yöntemi ve içerik güvenliği hizmeti.

## 8. Analitik olaylar

`workspace_created`, `project_created`, `generation_started`, `generation_completed`, `generation_failed`, `editor_action`, `ai_patch_applied`, `snapshot_created`, `export_started`, `export_completed`, `credit_debited`, `subscription_changed`.

Analitik payload'larında prompt metni, müşteri tasarım içeriği ve doğrudan PII bulunmaz.
