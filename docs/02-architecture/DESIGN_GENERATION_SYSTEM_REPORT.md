# Floriven Studio — Tasarım Üretim Sistemi Raporu

| Alan | Değer |
|---|---|
| Tarih | 2026-08-09 |
| Durum | Kod tabanı incelemesi |
| Kapsam | Dashboard, generation, DesignSpec, renderer, kalite ve Supabase job akışı |

## Yönetici özeti

Floriven, serbest kullanıcı brief'ini önce ürün planına, sonra kanonik ekran ağacına dönüştürür. Şablonun hedef sorumluluğu görsel dil; brief'in hedef sorumluluğu ürün alanı, ekranlar ve içeriktir. Bugün sistem çalışır durumdadır; ancak şablon stratejisi generation promptuna da girdiği için “style UX'i değiştiremez” kuralı henüz tamamen teknik olarak zorlanmamaktadır.

## Akış

Kullanıcı brief'i + isteğe bağlı şablon → Dashboard composer → generationService → Supabase generate Edge Function → ProductBlueprint → ekran üretimi/normalizasyonu → quality report + result screens → Studio polling → PhoneScreen renderer → preview veya final etiketi.

## Kesin sorular ve yanıtlar

### 1. Prompt nerede kullanılır?

Brief, istemciden GenerationRequest.brief olarak gider. Server bunu ProductBlueprint üretmek için kullanır. Ürün alanı, amaçlar, terminoloji, capability'ler ve ekran planı buradan türetilir.

### 2. Kısa prompt geçerli mi?

Evet. “Araba uygulaması” gibi tek cümlelik brief geçerli giriş olmalıdır. Şablon adı ürün alanını değiştirmemelidir.

### 3. Şablon seçildiğinde ne gönderilir?

İstemci designMode: template ve stylePresetId gönderir. Şablon yoksa designMode: auto gönderir. Eski templateId sunucuda geriye uyumlu alias olarak kabul edilir.

### 4. Şablon kataloğu nerede?

Birincil shared tanım packages/design-spec/src/strategy.ts içindedir. Beş preset vardır: Obsidian Precision, Serene Flow, Terracotta Atelier, Electric Pulse ve Editorial Grid.

### 5. Şablon neden backend'de de tanımlı?

supabase/functions/generate/index.ts içindeki TEMPLATE_STRATEGIES ve STYLE_COMPOSITIONS, serbest istemci stil nesnesine güvenmemek için server allowlist'idir. Sonuç olarak katalog şu an iki yerde tekrar etmektedir.

### 6. Şablon neyi değiştirir?

palette renk/yüzey dilini; cardStyle radius, border ve gölgeyi; density boşluk/padding'i; navigationStyle alt navigasyonun görünümünü etkiler.

### 7. Ortak tasarım sistemi nerede?

apps/web/src/features/studio/StudioPage.module.css içindeki .generatedCard, .generatedButton, .generatedText ve .generatedNavigation kuralları tüm şablonların ortak temelidir.

### 8. Şablon ekranda nasıl uygulanır?

apps/web/src/features/studio/canvas/PhoneScreen.tsx içindeki strategyClasses(), root.props.strategy içinden CSS sınıfı üretir. Örnek: palette serene → strategyPaletteSerene.

### 9. Auto modda stili kim seçer?

Auto modda üretim strategy değerleri döndürür. normalizeStrategy() bunları izinli enumlara indirger. Fallback: obsidian, crisp, comfortable ve solid.

### 10. Auto tasarımın görünümünü değiştirmek için nereler değişir?

supabase/functions/generate/index.ts içindeki auto yönlendirmesi ve normalizeStrategy() fallback'leri; ardından StudioPage.module.css içindeki karşılık CSS kuralları değişir. Yeni enum değeri için strategy.ts ve PhoneScreen.tsx de güncellenir.

### 11. Ürün yapısını kim belirler?

Hedef mimaride prompt → ProductBlueprint → UX/archetype; şablon → PresentationSpec olmalıdır. ADR-0008 bu sınırı kabul eder. Mevcut implementation bu sınırı tam derleme zamanı garantisiyle değil, prompt ve normalizasyonla uygular.

### 12. Normalizasyon ne yapar?

Server ID, route, root Screen, strategy, erişilebilirlik ve layout alanlarını normalize eder. Form/detail akışlarında persistent navigation; uygun olmayan ekranlarda FAB deterministik olarak temizlenir.

### 13. Kalite raporu kullanıcıyı engelliyor mu?

Hayır. Canlı generation akışında qualityReport preview teslimini engellemez. Bulgu job raporunda kalır. Bu, kullanıcıya iç denetim hatası göstermemek içindir.

### 14. Preview ile final farkı nedir?

Studio runtimeQualityReport yoksa sonucu preview gösterir. Geometry, visual ve cross-screen kanıtları güvenilir yazıcı tarafından kaydedilip finalEligible true olduğunda çıktı final olarak etiketlenir.

### 15. Runtime kalite kanıtını kim yazar?

record-generation-runtime-quality Edge Function, servis sırrı ile çağrılır. İstemci finalEligible değerini kendisi belirleyemez; server hesaplar.

### 16. Job erişimi nasıl korunur?

İstemci idempotency key ve X-Job-Token üretir. Aynı anahtar aynı işi tekrar döndürür; job token session kapsamındadır ve server yalnızca özetini doğrular.

### 17. Edit mode nasıl farklıdır?

Mevcut ekranlar varsa Studio editScreens gönderir. Server yeni ürün planlamak yerine mevcut ekran bağlamını kullanarak düzenleme üretir.

### 18. Kanonik veri modeli nedir?

DesignSpec; editor, preview, snapshot ve export katmanları arasındaki kanonik sözleşmedir. Her node stabil id, type, props, layout, children ve a11y alanlarını taşır.

### 19. Başlıca dosya sorumlulukları

| Katman | Dosya |
|---|---|
| Şablon sözleşmesi | packages/design-spec/src/strategy.ts |
| Presentation contract | packages/design-spec/src/presentation-spec.ts |
| Dashboard şablon seçimi | apps/web/src/features/app/dashboard/useDashboardComposer.ts |
| İstemci job iletişimi | apps/web/src/services/generationService.ts |
| Server orchestration | supabase/functions/generate/index.ts |
| Statik kalite | supabase/functions/generate/quality.ts |
| Runtime kalite yazıcısı | supabase/functions/record-generation-runtime-quality/index.ts |
| Renderer | apps/web/src/features/studio/canvas/PhoneScreen.tsx |
| Ortak/preset CSS | apps/web/src/features/studio/StudioPage.module.css |
| Preview/final UI | apps/web/src/features/studio/StudioPage.tsx |

### 20. Kritik teknik borçlar nelerdir?

1. Şablon kataloğu shared katmanda ve backend'de tekrar ediyor.
2. Şablon PresentationSpec resolver sonrasında değil generation promptu sırasında da etkili.
3. Güvenilir renderer/screenshot worker henüz runtime kanıtı yazmıyor.
4. docs/03-engineering/API_SPEC.md kalite raporunun eski bloklayıcı davranışını anlatıyor; canlı preview davranışıyla güncel değil.

## Bağımlılık haritası

strategy.ts → Dashboard/Templates UI, generationService tipleri, backend allowlist, PhoneScreen CSS sınıfları.

generate/index.ts → ProductBlueprint, quality.ts, generation_jobs, result_screens → StudioPage → PhoneScreen.

PhoneScreen.tsx → StudioPage.module.css.

## Önerilen sonraki kararlar

1. Şablon verisini tek kaynakta toplamak ve backend katalog dosyasını buradan üretmek.
2. Semantic UX ağacını style uygulanmadan önce freeze/hash etmek.
3. Auto style seçimini de aynı PresentationSpec resolver'ına geçirmek.
4. API_SPEC.md dosyasını preview/final davranışına göre güncellemek.
5. Güvenilir renderer worker eklendiğinde runtime kalite raporunu otomatik yazmak.

## İncelenen kaynaklar

- docs/02-architecture/DESIGN_SPEC.md
- docs/03-engineering/API_SPEC.md
- docs/02-architecture/ADR-0008.md
- packages/design-spec/src/strategy.ts
- apps/web/src/services/generationService.ts
- apps/web/src/features/app/dashboard/useDashboardComposer.ts
- supabase/functions/generate/index.ts
- supabase/functions/generate/quality.ts
- apps/web/src/features/studio/canvas/PhoneScreen.tsx
- apps/web/src/features/studio/StudioPage.module.css

