# Generation V3 Production Readiness Planı

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Aktif uygulama planı |
| Mimari dayanak | [ADR-0009](ADR-0009.md) |
| Doküman sahibi | Architecture + AI Lead |
| Son güncelleme | 2026-08-14 |
| Gözden geçirme | Her sprint kapanışında |

## 1. Amaç

Generation V3'ü çalışan bir geliştirme prototipinden güvenli, ölçülebilir ve varsayılan
production üretim motoruna dönüştürmek. Kapsam, kullanıcı brief'inin alınmasından gerçek
browser render kanıtına, edit/revision akışına ve V2'nin kontrollü emekliliğine kadar tüm
üretim yoludur.

```text
UserBrief
→ ProductModel
→ ScreenJobs
→ UXStructure
→ ComponentCapabilities
→ LayoutPlan
→ ContentPlan
→ DesignSpec compiler
→ Static critics
→ Render critics
→ Targeted repair
→ Accepted DesignSpec
→ API/job
→ Studio state
→ Canvas renderer
→ Runtime evidence
```

## 2. Başlangıç durumu

Mevcut V3; stage sözleşmeleri, validator'lar, compiler, static critic, repair, provider,
HTTP job adaptörü, Studio istemcisi ve benchmark kataloğu içerir. Son doğrulamada:

- Generation V3 testleri: 134/134 geçti.
- DesignSpec testleri: 168/168 geçti.
- Web testleri: 56/56 geçti.
- Type-check geçti.
- Lint hata vermedi; `StudioPage.tsx` içinde bir `console` uyarısı var.
- Benchmark kataloğu en az 25 brief ve toplam 100 hedef ekran taşıyor.

Bu sonuç production readiness kanıtı değildir. Bilinen bloklayıcılar:

1. Component props hâlâ serbest `Record<string,string>` biçiminde.
2. ContentPlan component'e özgü typed payload üretmiyor.
3. Frontend caption synonym/synthetic child ile uyumluluk taklidi yapıyor.
4. V3 yalnız `?engine=v3` ile opt-in; varsayılan yol V2.
5. Edit/revision istekleri V2'ye düşüyor.
6. Runtime capture final acceptance'a bağlı değil; `NOT_VERIFIED` job tamamlanabiliyor.
7. Edge Function JWT, proje sahipliği ve tenant üyeliğini doğrulamıyor.
8. Gerçek provider ile 25 brief/100 ekran screenshot benchmark kanıtı yok.
9. Shadow comparison ve promotion raporu yok.
10. V3 deploy/smoke/rollback otomasyonu tamamlanmış değil.

## 3. Evrensel tamamlanma kuralları

- Bir sprintin kabul kapısı geçmeden sprint tamamlandı işaretlenmez.
- Mock test gerçek provider, browser veya production kanıtı yerine geçmez.
- Her yeni davranış unit ve integration testi taşır.
- Görsel değişiklik screenshot/E2E testi olmadan kabul edilmez.
- Tenant'a ait hiçbir sorgu tenant ve kullanıcı yetkisi olmadan çalışmaz.
- Model çıktısı runtime schema validation geçmeden saklanmaz veya render edilmez.
- Ham prompt, müşteri tasarımı, token ve kişisel veri loglanmaz.
- V2, V3 tüm final kapıları geçmeden silinmez.

## 4. Sprint planı

### Sprint 1 — Typed component prop sözleşmeleri

**Öncelik:** P0 · **Başlangıç puanı:** 2/10

Amaç: Her V3 component'in veri şekli, capability'si ve render beklentisini tek merkezi,
sürümlü sözleşmeye bağlamak.

İşler:

- `Record<string,string>` component prop modelini kaldır.
- Merkezi `ComponentDefinition` registry oluştur.
- Component başına TypeScript discriminated union ve JSON Schema tanımla.
- Required/optional prop, enum, min/max, array/object ve a11y kurallarını tanımla.
- `Calendar.days/events/timeSlots`, `KanbanBoard.columns/cards`, `MapView.markers/routes`,
  `Gallery.items`, `Timeline.events`, `Chart.series`, `Form.fields/actions` yapılarını typed yap.
- V3 registry ile Studio renderer registry arasında çift yönlü drift testi ekle.
- Bilinmeyen property ve yanlış veri tiplerini fail-closed reddet.

Kabul kapısı:

- V3 leaf props içinde `Record<string,string>` kalmaz.
- Eksik `Calendar.events` ve string `KanbanBoard.columns` reddedilir.
- Registry–renderer drift sayısı sıfırdır.
- Schema fixtures, unit test, type-check ve lint geçer.

### Sprint 2 — Typed ContentPlan ve DesignSpec compiler

**Öncelik:** P0 · **Bağımlılık:** Sprint 1 · **Başlangıç puanı:** 3/10

İşler:

- Serbest `field/value` ContentPlan'i component'e özgü payload union'ıyla değiştir.
- Model çağrısına seçilen component'in gerçek JSON Schema'sını ver.
- İçeriği ProductModel, ScreenJob, UXStructure ve data binding kaynaklarına izlenebilir yap.
- Compiler'ın yalnız validated typed props kabul etmesini sağla.
- Placeholder, domain dışı içerik ve ekranlar arası içerik kopyası critic'leri ekle.
- Locale, tarih, sayı ve para değerlerini typed tut.

Kabul kapısı:

- Compiler property tahmin etmez veya isim eş anlamlısı üretmez.
- Her requiredData gerçek binding'e bağlıdır.
- Calendar gerçek gün/saat/event; Kanban gerçek column/card payload'ı üretir.
- Genel başlık/metin ikamesi validation'dan geçemez.

### Sprint 3 — Renderer adapter ve defining-component render doğrulaması

**Öncelik:** P0 · **Bağımlılık:** Sprint 1–2 · **Başlangıç puanı:** 4/10

İşler:

- `withPrimaryCaptionSynonyms` ve synthetic caption child yaklaşımını kaldır.
- V3 DesignSpec'i renderer'a kayıpsız ve typed aktar.
- Unsupported component'i görünür ve fail-closed hata yap.
- Empty/loading/error/ready state'lerini render et.
- Calendar, board, map, gallery, timeline, form, detail, list, dashboard ve settings için
  yapısal DOM + screenshot testleri ekle.
- Etkileşimleri gerçek UI davranışına bağla; yalnız metadata olarak bırakma.

Kabul kapısı:

- Test yalnız bir metnin görünmesini defining-component başarısı saymaz.
- Calendar gün/saat/event; Kanban column/card; Map marker/route DOM kanıtı taşır.
- Unsupported renderer component sayısı sıfırdır.
- Görsel regresyon testleri geçer.

### Sprint 4 — JWT, tenant, job ve kredi güvenliği

**Öncelik:** P0 Security · **Başlangıç puanı:** 2/10

İşler:

- Authorization header ve Supabase JWT doğrulaması ekle.
- Proje sahipliği/workspace üyeliği ve rol bazlı üretim yetkisini doğrula.
- Service role kullanımını repository sınırına kapat.
- Tüm job sorgularını tenant + project + user bağlamına al.
- Job token'ı ana yetki değil ek capability olarak kullan.
- Idempotency kapsamını tenant/project/user ile sınırla.
- Rate limit, kredi rezervasyonu, append-only ledger ve hata halinde iade davranışını bağla.
- CORS allowlist'i daralt; güvenli hata eşlemesi uygula.

Kabul kapısı:

- Token yok, geçersiz JWT, başka tenant, üye olmayan kullanıcı ve başka kullanıcının job
  token'ı negatif testleri geçer.
- Yetkisiz istek provider çağrısından önce reddedilir.
- Tenant izolasyonu ve authorization testleri %100 geçer.

### Sprint 5 — Browser runtime evidence ve fail-closed acceptance

**Öncelik:** P0 · **Bağımlılık:** Sprint 3–4 · **Başlangıç puanı:** 3/10

İşler:

- Gerçek Studio DOM geometry ve screenshot capture üret.
- Kanıtı job, screen, renderer version ve content hash'e bağla.
- Kanıt yükleme endpoint'inde kullanıcı/tenant doğrulaması yap.
- Backend render critics'i gerçek capture üzerinde çalıştır.
- Replay, eksik ekran, sahte hash ve canonical olmayan viewport'u reddet.
- Job state machine'i `awaiting_render` ve `render_verifying` aşamalarıyla genişlet.
- `NOT_VERIFIED` sonucu final/completed kullanıcı çıktısı olmaktan çıkar.

Kabul kapısı:

- Screenshot/geometry olmadan `releaseEligible=true` ve final completion mümkün değildir.
- Başarısız runtime critic job'ı completed yapamaz.
- Her ekran için VERIFIED kanıt zorunludur.

### Sprint 6 — V3 edit/revision ve typed patch zinciri

**Öncelik:** P1 · **Başlangıç puanı:** 0/10

İşler:

- `GenerationV3EditRequest`, edit intent ve hedef resolution sözleşmelerini oluştur.
- Kimlikli typed patch operasyonları tanımla: replace props/content/layout/interaction,
  insert/remove/move node.
- Revision ve optimistic concurrency uygula.
- Etkilenmeyen node ve ekran kimliklerini koru.
- Patch sonrası aynı schema/static/runtime kapılarını yeniden çalıştır.
- Undo/redo uyumluluğunu doğrula.
- Edit isteklerinin V2'ye düşmesini kaldır.

Kabul kapısı:

- Lokal edit yalnız hedef düğümleri değiştirir.
- Style edit'i ScreenJobs/UXStructure değiştirmez.
- Eski revision 409 alır.
- V3 edit yolunda V2 fallback kalmaz.

### Sprint 7 — Canlı 25 brief / 100 ekran benchmarkı

**Öncelik:** P1 · **Bağımlılık:** Sprint 1–6 · **Başlangıç puanı:** 3/10

İşler:

- Sabit corpus'u gerçek provider ile çalıştır.
- 100 ekran için schema, critic, screenshot, runtime, maliyet, gecikme ve repair kanıtı sakla.
- Her davranış sınıfında pozitif/negatif senaryoları çalıştır.
- Placeholder, domain dışı içerik, structural duplicate ve prop completeness ölç.
- İnsan değerlendirme rubric'i ve kör karşılaştırma oluştur.

Zorunlu eşikler:

- Required interaction coverage: %100.
- Required data coverage: %100.
- Defining component completeness: %100.
- Unsupported component ve placeholder: 0.
- Aynı ürün içi yapısal kopya: en fazla %10.
- Runtime VERIFIED ekran: %100.

### Sprint 8 — Shadow mode ve observability

**Öncelik:** P1 · **Bağımlılık:** Sprint 7 · **Başlangıç puanı:** 1/10

İşler:

- Aynı brief'i V2/V3 ile shadow mode'da çalıştır.
- Görev başarısı, tekrar, kalite, maliyet ve gecikme karşılaştırması üret.
- Correlation ID, operation, provider capability, latency, cost, retry, validation ve repair
  telemetrisi ekle; hassas içeriği maskele.
- Dashboard'u doğrudan V3 job endpoint'ine bağla.
- Workspace/user yüzdeli feature flag ve kill switch ekle.

Kabul kapısı:

- V3 görev başarısında V2'den düşük değildir.
- V3 tekrar ve placeholder oranında V2'den ölçülebilir biçimde iyidir.
- Kill switch ve telemetry privacy testleri geçer.

### Sprint 9 — Deployment ve operasyon

**Öncelik:** P0 Release · **Başlangıç puanı:** 2/10

İşler:

- V3 deploy script'i, migration ve secret preflight oluştur.
- CI'a test, type-check, lint, schema drift, migration, security ve benchmark smoke ekle.
- Staging deploy ve gerçek provider smoke çalıştır.
- Stuck-job recovery, provider outage, alarm/SLO ve runbook oluştur.
- Rollback prosedürünü otomatik ve testli hale getir.

Kabul kapısı:

- Tek komutla staging deploy ve smoke geçer.
- Migration/rollback kanıtı vardır.
- Provider outage doğru terminal hata durumuna gider.
- Secret eksikliği deploy öncesi yakalanır.

### Sprint 10 — V3 promotion, V2 emekliliği ve final sertifikasyon

**Öncelik:** P0 Final · **Bağımlılık:** Sprint 1–9 · **Başlangıç puanı:** 0/10

İşler:

- V3'ü Studio ve Dashboard'da varsayılan yap.
- Yeni üretim ve edit akışlarında V2 kullanımını sıfıra indir.
- V2 endpoint'i yeni üretimlere kapat; kısa geri dönüş penceresinde read-only rollback tut.
- Eski prompt/compositor/fallback kodunu ayrı, geri alınabilir değişiklikte kaldır.
- API, DesignSpec, AI architecture ve operasyon dokümanlarını son durumla güncelle.
- Final production certification çalıştır.

Final kabul kapısı:

- Normal kullanıcı akışı yalnız V3 kullanır.
- Yeni üretim/edit V2 çağrısı sıfırdır.
- 100/100 benchmark ekranı runtime VERIFIED'dır.
- Kritik/yüksek güvenlik bulgusu sıfırdır.
- Staging ve production smoke ile rollback testi geçmiştir.

## 5. Bağımlılık sırası

```text
Sprint 1 → Sprint 2 → Sprint 3
                    ↘
Sprint 4 ───────────→ Sprint 5 → Sprint 6 → Sprint 7 → Sprint 8 → Sprint 9 → Sprint 10
```

Sprint 4, Sprint 1–3 ile paralel geliştirilebilir; ancak Sprint 5 kapanışı ikisinin de
tamamlanmasına bağlıdır.

## 6. Zorunlu sprint teslim formatı

Her sprint kapanışında şu kanıtlar dokümana eklenir:

```text
Amaç
Yapılan değişiklikler
Doğrulama ve testler
Riskler / varsayımlar
Takip işleri
```

Ayrıca değişen dosyalar, komutlar, test sayıları, canlı kanıt yolları, yapılmayan işler ve
geri alma adımı açıkça yazılır. “Kod yazıldı” veya “unit test geçti” tek başına sprint
tamamlanma kanıtı değildir.

## 7. Production tamamlanma tanımı

Generation V3 yalnız Sprint 1–10 kabul kapılarının tamamı geçtiğinde bitmiş sayılır. V3'ün
opt-in çalışması, mock benchmark geçmesi, `NOT_VERIFIED` DesignSpec üretmesi veya V2 edit
fallback'i taşıması production completion değildir.

