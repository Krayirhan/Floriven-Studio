# Floriven Studio — Tasarım Kod Dosyaları İlişki Raporu

| Alan | Değer |
|---|---|
| Tarih | 2026-08-09 |
| Amaç | Tasarımla ilgili kod dosyalarının ne yaptığını ve birbirine nasıl bağlandığını göstermek |
| Kapsam | Dashboard oluşturma, Templates, Studio editor, canvas renderer, inspector, state, shared DesignSpec ve Supabase generation |
| Kapsam dışı | Landing page pazarlama görselleri; üretim/editör tasarım ağacını değiştirmez |

## 1. Tek cümlelik mimari

Dashboard brief ve şablon seçer; generation service job başlatır; Supabase ekran ağacını üretir/normalize eder; Studio state bu ağacı tutar; Canvas ve PhoneScreen ağacı CSS stratejisiyle çizer; Inspector ve Sidebar aynı ağacı düzenler.

## 2. Ana ilişki diyagramı

DashboardPage
  → DashboardComposer
  → useDashboardComposer
  → generationService
  → Supabase generate/index.ts
  → generation_jobs.result_screens
  → StudioPage / useGenerationJob
  → useStudioState
  → StudioCanvas
  → PhoneScreen
  → StudioPage.module.css

Aynı anda:

useStudioState
  → useStudioDocument + useStudioHistory + useStudioSelection + useStudioUiState
  → Sidebar + InspectorPanel + StudioToolbar + AiCommandDock

## 3. Dashboard ve başlangıç dosyaları

| Dosya | Görevi | Bağlandığı yer |
|---|---|---|
| apps/web/src/features/app/DashboardPage.tsx | Dashboard sayfasını birleştirir | Dashboard composer, proje kartları, şablon bölümü |
| apps/web/src/features/app/dashboard/DashboardComposer.tsx | Prompt alanı, oluştur düğmesi ve seçim UI'ı | useDashboardComposer |
| apps/web/src/features/app/dashboard/useDashboardComposer.ts | Prompt, platform, şablon seçimi ve job başlatma | generationService, router |
| apps/web/src/features/app/dashboard/DashboardSections.tsx | Şablon/proje kartlarını listeler | dashboard.data, template seçimi |
| apps/web/src/features/app/dashboard/DashboardProjectHero.tsx | Dashboard üst görsel alanı | DashboardPage |
| apps/web/src/features/app/dashboard/RedesignWorkflow.tsx | Yeniden tasarım giriş akışı | useRedesignWorkflow |
| apps/web/src/features/app/dashboard/useRedesignWorkflow.ts | Redesign state'i | Dashboard UI |
| apps/web/src/features/app/dashboard-preview.tsx | Şablon ve proje için statik preview renderer | DashboardSections, test |
| apps/web/src/features/app/dashboard.data.ts | Dashboard örnek proje/şablon verisini taşır | DashboardSections, TemplatesPage |
| apps/web/src/features/app/templates/TemplatesPage.tsx | Tam şablon kataloğu sayfası | shared DESIGN_TEMPLATES |
| apps/web/src/features/app/useDashboardAdvancedOptions.ts | Platform, screen scope ve advanced seçenekler | useDashboardComposer |
| apps/web/src/features/app/DashboardPage.module.css | Dashboard görünümü | Yukarıdaki dashboard bileşenleri |

İlişki: Bir kullanıcı şablona tıklarsa useDashboardComposer selectedTemplateId set eder. Start generation çağrısında bu değer stylePresetId olarak generationService'e gider. Şablon seçilmemişse auto mod gider.

## 4. İstemci-Supabase job sınırı

| Dosya | Görevi | Girdi / çıktı |
|---|---|---|
| apps/web/src/services/generationService.ts | Edge Function HTTP istemcisi | brief, platform, stylePresetId → GenerationJob |
| apps/web/src/services/generationService.test.ts | Retry, idempotency ve final uygunluğu testi | generationService |
| apps/web/src/features/studio/state/useGenerationJob.ts | Studio URL'sindeki jobId'yi poll eder | GenerationJob |
| apps/web/src/features/studio/state/useStudioGeneration.ts | Studio içinden yeni üretim veya edit üretimi başlatır | mevcut screens → editScreens |
| apps/web/src/features/studio/StudioPage.tsx | Job sonucunu Studio state'ine koyar | resultScreens, runtimeQualityReport |

İlişki: generationService idempotency key ve job token üretir. Job token sessionStorage'da saklanır. StudioPage, job tamamlandığında resultScreens'i useStudioState'e verir. Runtime kalite kanıtı yoksa UI bunu preview olarak gösterir.

## 5. Supabase üretim katmanı

| Dosya | Görevi | Bağlı modüller |
|---|---|---|
| supabase/functions/generate/index.ts | Tüm generation orchestration | domain.ts, quality.ts, prompts.generated.ts, generation_jobs |
| supabase/functions/generate/domain.ts | ProductBlueprint, domain pack, screen role/archetype planlama | index.ts, domain.test.ts |
| supabase/functions/generate/quality.ts | Statik kalite metriği ve issue üretimi | index.ts, quality.test.ts |
| supabase/functions/generate/runtime-quality.ts | Runtime kanıt şeması ve final eligibility hesabı | runtime-quality test, record function |
| supabase/functions/record-generation-runtime-quality/index.ts | Güvenilir renderer/reviewer kanıtını DB'ye yazar | runtime-quality.ts, generation_jobs |
| supabase/functions/generate/prompts/planning.md | Ürün/ekran planlama prompt kaynağı | build edilmiş prompts |
| supabase/functions/generate/prompts/composition.md | Ekran kompozisyon prompt kaynağı | build edilmiş prompts |
| supabase/functions/generate/prompts/content.md | İçerik üretim prompt kaynağı | build edilmiş prompts |
| supabase/functions/generate/prompts/contract.md | Çıktı sözleşmesi prompt kaynağı | build edilmiş prompts |
| supabase/functions/generate/prompts/README.md | Prompt derleme kullanım notu | prompt bakım süreci |

İlişki: index.ts önce ProductBlueprint planlar, sonra ekranları batch halinde üretir, normalizeScreens ile canonical node ağacına yaklaştırır, quality.ts ile raporlar ve result_screens'i job'a yazar.

## 6. Shared DesignSpec katmanı

Bu klasör UI çizmez. Studio ve server'ın aynı tasarım dilini konuşması için tip, sözleşme ve saf validator sağlar.

| Dosya | Görevi | Kim kullanır |
|---|---|---|
| packages/design-spec/src/types.ts | DesignSpec, Screen, DesignNode temel tipleri | renderer, Studio state, generation service |
| packages/design-spec/src/index.ts | Tüm public export yüzeyi | web app ve diğer paketler |
| packages/design-spec/src/version.ts | Şema sürümü | DesignSpec consumers |
| packages/design-spec/src/strategy.ts | Şablon ID'leri, DesignStrategy, DESIGN_TEMPLATES | Dashboard, Templates, generation tipleri |
| packages/design-spec/src/presentation-spec.ts | Strategy → PresentationSpec dönüşümü | V2 stage contract |
| packages/design-spec/src/product-blueprint.ts | Ürün planı sözleşmesi | generation/domain |
| packages/design-spec/src/ux-spec.ts | Ekranın amacı, action ve bilgi önceliği sözleşmesi | V2 stage contract |
| packages/design-spec/src/archetype.ts | dashboard/form/detail/settings vb. kurallar | planner ve validation |
| packages/design-spec/src/pattern-registry.ts | TransactionRow, SettingsRow vb. yüksek seviye pattern sözleşmesi | composer/validation |
| packages/design-spec/src/surface-semantics.ts | Card, Section, Group, Surface ayrımı | structural validation |
| packages/design-spec/src/tree-simplifier.ts | Gereksiz wrapper sadeleştirme | normalization/repair |
| packages/design-spec/src/typography-budget.ts | Başlık ve viewport typography sınırları | quality |
| packages/design-spec/src/geometry-validator.ts | Render edilmiş bounds kontrolü | runtime renderer |
| packages/design-spec/src/action-semantics.ts | Typed action ve FAB kuralları | UX validation |
| packages/design-spec/src/typed-content.ts | Currency, Date, Percentage, FormField vb. typed content | renderer/composer |
| packages/design-spec/src/critic-gate.ts | Visual critic skor eşikleri | runtime quality |
| packages/design-spec/src/runtime-quality.ts | Geometry + critic → finalEligible | trusted runtime writer |
| packages/design-spec/src/patch-validator.ts | Identity tabanlı patch güvenliği | edit/repair |
| packages/design-spec/src/layout-candidates.ts | Layout alternatif değerlendirmesi | candidate planner |
| packages/design-spec/src/production-gates.ts | Schema/a11y/geometry/semantic/visual release kapıları | final release flow |
| packages/design-spec/src/metrics/structural.ts | Tree depth, card ratio, wrapper metriği | quality/benchmark |

Her .test.ts dosyası yanındaki sözleşmenin testidir; UI dosyası değildir ama tasarım kurallarının regress etmeme garantisini verir.

## 7. Studio editor giriş noktaları

| Dosya | Görevi | Doğrudan ilişkileri |
|---|---|---|
| apps/web/src/features/studio/StudioPage.tsx | Studio ekranının ana kompozisyonu | useStudioState, useGenerationJob, Canvas, Sidebar, Inspector, Toolbar |
| apps/web/src/features/studio/index.ts | Studio feature public export'u | router/app shell |
| apps/web/src/features/studio/studio.types.ts | Studio UI ve journal tipleri | state, panels, toolbar |
| apps/web/src/features/studio/studio.data.ts | Başlangıç/mock studio verisi | Studio state |
| apps/web/src/features/studio/studio.utils.ts | Node/tree yardımcıları | document/selection/editor işlemleri |
| apps/web/src/features/studio/StudioPage.module.css | Studio shell, phone renderer ve tüm strategy CSS | StudioPage, PhoneScreen, canvas |

## 8. Studio state dosyaları

| Dosya | Sorumluluk | Bağımlı UI |
|---|---|---|
| hooks/useStudioState.ts | Bütün Studio hook'larını bir facade altında birleştirir | StudioPage |
| state/useStudioDocument.ts | Ekran ekleme/silme/çoğaltma, node güncelleme | Sidebar, Inspector, Canvas |
| state/useStudioHistory.ts | Undo/redo ve revision | StudioToolbar |
| state/useStudioSelection.ts | Aktif ekran/node seçimi | Canvas, Sidebar, Inspector |
| state/useStudioUiState.ts | Sol/sağ panel, prompt, brief gibi UI state | StudioPage, panels |
| state/useStudioGeneration.ts | Studio içi generate/edit komutu ve journal | AiCommandDock, AiPanel |
| state/useGenerationJob.ts | URL job polling state'i | StudioPage |

İlişki: useStudioState veri sahibi facade'dır. Canvas seçim üretir; Inspector seçili node'u değiştirir; Sidebar ekran/node seçer; Toolbar history işlemlerini çağırır.

## 9. Canvas ve renderer dosyaları

| Dosya | Görevi | Ne ile konuşur |
|---|---|---|
| canvas/StudioCanvas.tsx | Birden fazla PhoneScreen, design/flow/compare görünümü | StudioPage, PhoneScreen, FlowConnections |
| canvas/PhoneScreen.tsx | DesignNode tipine göre gerçek preview componentlerini render eder | componentRegistry, CSS strategy sınıfları |
| canvas/componentRegistry.ts | İzinli canvas component tipleri ve tanımları | PhoneScreen, ComponentsPanel, tests |
| canvas/FlowConnections.tsx | Ekranlar arası flow okları/ilişkileri | StudioCanvas |
| canvas/PhoneScreen.test.ts | Strategy CSS class eşlemesini test eder | PhoneScreen |
| canvas/componentRegistry.test.ts | Registry sözleşmesini test eder | componentRegistry |

Kritik ilişki: PhoneScreen root.props.strategy değerini CSS class'a çevirir. Bu nedenle şablonun ekrandaki gerçek piksel etkisi esas olarak PhoneScreen.tsx + StudioPage.module.css ikilisindedir.

## 10. Sol panel / sidebar dosyaları

| Dosya | Görevi |
|---|---|
| sidebar/StudioSidebar.tsx | Ekranlar, layers, components, assets alt panellerini seçer |
| sidebar/ScreensPanel.tsx | Ekran listesi, seçme, oluşturma, silme, duplicate |
| sidebar/LayersPanel.tsx | Aktif ekranın node ağacını gösterir |
| sidebar/ComponentsPanel.tsx | componentRegistry üzerinden eklenebilir bileşenleri gösterir |
| sidebar/AssetsPanel.tsx | Tasarım varlıkları UI'ı |
| sidebar/AiPanel.tsx | Generation journal ve brief görünümü |

İlişki: Bu paneller kendi başına kalıcı veri sahibi değildir. Props/callback ile useStudioState'e bağlıdır.

## 11. Sağ panel / inspector dosyaları

| Dosya | Görevi |
|---|---|
| inspector/InspectorPanel.tsx | Seçili node için inspector sekmelerini birleştirir |
| inspector/DesignInspector.tsx | Props, layout ve görünüm düzenleme |
| inspector/ContentInspector.tsx | Metin ve içerik alanları |
| inspector/AccessibilityInspector.tsx | a11y role, label, hint ve state |
| inspector/PrototypeInspector.tsx | Node action/flow davranışları |
| inspector/AiInspector.tsx | Seçili node için AI ilişkili görünüm |

İlişki: InspectorPanel seçili node'u StudioPage'den alır; her düzenleme useStudioDocument üzerinden kanonik DesignSpec ağacına geri gider.

## 12. Toolbar ve AI komut yüzeyi

| Dosya | Görevi |
|---|---|
| toolbar/StudioToolbar.tsx | Design/flow/compare mode, undo/redo, composer focus |
| ai/AiCommandDock.tsx | Studio alt prompt alanı ve generation tetikleme |

İlişki: Toolbar history facade'ını; AiCommandDock useStudioGeneration.generate fonksiyonunu kullanır. Hiçbiri doğrudan Supabase çağrısı yapmaz.

## 13. CSS ve token katmanı

| Dosya | Görevi |
|---|---|
| apps/web/src/styles/tokens.css | Uygulama genel tokenları |
| apps/web/src/styles/globals.css | Global reset ve global stil |
| apps/web/src/features/studio/StudioPage.module.css | Studio layout + generated component temel stili + tüm strategy override'ları |
| apps/web/src/features/app/DashboardPage.module.css | Prompt/dashboard/template kart UI'ı |

CSS ilişkisi: tokens.css genel değerleri verir. StudioPage.module.css, generated node renderer'ının temelini ve palette/card/density/navigation varyasyonlarını taşır. PhoneScreen bu varyasyonları class olarak takar.

## 14. Şablon değişikliği hangi zinciri etkiler?

1. strategy.ts: şablon metadata, enum ve shared katalog.
2. generate/index.ts: server allowlist, template prompt composition.
3. PhoneScreen.tsx: yeni strategy alanı varsa class üretimi.
4. StudioPage.module.css: yeni preset veya varyasyonun gerçek CSS'i.
5. dashboard-preview.tsx ve dashboard UI: preview/galeri görünümü.
6. strategy.test.ts ve PhoneScreen.test.ts: sözleşme ve renderer regression testi.

Sadece CSS değişirse mevcut üretilmiş ekranların görünümü değişir. strategy/prompt değişirse yeni generation job'larının root.props.strategy değeri ve model yönlendirmesi değişir.

## 15. Şablonsuz auto tasarım hangi zinciri etkiler?

1. Dashboard composer selectedTemplateId boş bırakır.
2. generationService designMode auto gönderir.
3. generate/index.ts auto tasarım yönergesini generation aşamasına ekler.
4. resolveAutoStrategy() model kararını izinli strategy alanlarına indirger; eksik kararı sabit Obsidian fallback'i yerine brief ve ProductBlueprint tabanlı Auto Design Director ile tamamlar.
5. PhoneScreen + CSS sonucu çizer.

## 16. Design node değişikliği hangi zinciri etkiler?

Component tipi veya prop değişirse sırasıyla types.ts/registry → PhoneScreen renderer → ComponentsPanel → Inspector → CSS generated class kuralları → generation contract/prompt → testler incelenmelidir.

Örnek: Yeni Timeline componenti için yalnızca CSS yetmez. Registry, DesignSpec type, renderer switch'i, inspector desteği, generation allowlist/prompt ve a11y davranışı beraber ele alınmalıdır.

## 17. Kalite katmanı render'a nasıl bağlanır?

quality.ts, generation sonrası node ağacından statik metrik çıkarır. geometry-validator.ts renderer bounds ister. runtime-quality.ts bunları visual/cross-screen critic sonucu ile birleştirir. record-generation-runtime-quality Edge Function güvenilir kanıtı generation_jobs.runtime_quality_report alanına kaydeder. StudioPage bu alanla preview/final etiketini ayırır.

## 18. Mevcut mimaride kritik kırılma noktaları

1. Şablon katalog verisi strategy.ts ve generate/index.ts içinde çift tanımlı.
2. Şablonun UX'i değiştirmemesi hedefleniyor, ama style instruction hâlâ generation promptunda.
3. PhoneScreen renderer CSS Modules ile StudioPage.module.css'e sıkı bağlı; class adı değişirse preview bozulur.
4. Inspector'ın editleri DesignSpec'e döner; registry ile uyumsuz prop eklemek render sorununa yol açar.
5. API_SPEC.md kalite kapısının eski bloklayıcı davranışını anlatır; canlı kod preview davranışına göre güncellenmelidir.

## 19. Bu yapıdaki ondan fazla kesin cevap

1. Prompt ürün yapısının girdisidir.
2. Şablon seçimi stylePresetId ile taşınır.
3. Auto modda stylePresetId gönderilmez.
4. generationService job token ve idempotency sahibidir.
5. generate/index.ts server orchestration sahibidir.
6. domain.ts ekran/archetype plan sahibidir.
7. quality.ts statik kalite sahibidir.
8. DesignSpec tipleri packages/design-spec içindedir.
9. Studio state'in tek facade'ı useStudioState'tir.
10. PhoneScreen gerçek node renderer'dır.
11. componentRegistry izinli preview componentlerini tanımlar.
12. StudioPage.module.css hem Studio hem generated preview stilini taşır.
13. Sidebar seçim/navigasyon UI'ıdır; veri sahibi değildir.
14. Inspector seçili node'u düzenler; veri sahibi değildir.
15. runtime-quality preview/final ayrımının güvenlik sınırıdır.
16. Dashboard template kartları generation pipeline'ının girişi, Studio Canvas ise çıktısıdır.

## 20. İncelenen tasarım kodu listesi

Dashboard/Template: DashboardPage.tsx, DashboardComposer.tsx, DashboardProjectHero.tsx, DashboardSections.tsx, RedesignWorkflow.tsx, useDashboardComposer.ts, useRedesignWorkflow.ts, dashboard-preview.tsx, dashboard.data.ts, TemplatesPage.tsx, useDashboardAdvancedOptions.ts, DashboardPage.module.css.

Studio: StudioPage.tsx, StudioPage.module.css, index.ts, studio.types.ts, studio.data.ts, studio.utils.ts, hooks/useStudioState.ts, state/useStudioDocument.ts, state/useStudioHistory.ts, state/useStudioSelection.ts, state/useStudioUiState.ts, state/useStudioGeneration.ts, state/useGenerationJob.ts.

Canvas: StudioCanvas.tsx, PhoneScreen.tsx, componentRegistry.ts, FlowConnections.tsx, PhoneScreen.test.ts, componentRegistry.test.ts.

Sidebar/Inspector/Toolbar/AI: StudioSidebar.tsx, ScreensPanel.tsx, LayersPanel.tsx, ComponentsPanel.tsx, AssetsPanel.tsx, AiPanel.tsx, InspectorPanel.tsx, DesignInspector.tsx, ContentInspector.tsx, AccessibilityInspector.tsx, PrototypeInspector.tsx, AiInspector.tsx, StudioToolbar.tsx, AiCommandDock.tsx.

Shared contracts: types.ts, index.ts, version.ts, strategy.ts, presentation-spec.ts, product-blueprint.ts, ux-spec.ts, archetype.ts, pattern-registry.ts, surface-semantics.ts, tree-simplifier.ts, typography-budget.ts, geometry-validator.ts, action-semantics.ts, typed-content.ts, critic-gate.ts, runtime-quality.ts, patch-validator.ts, layout-candidates.ts, production-gates.ts, metrics/structural.ts ve bunların test dosyaları.

Backend: generate/index.ts, domain.ts, quality.ts, runtime-quality.ts, record-generation-runtime-quality/index.ts ve generate/prompts klasörü.

## 21. Sonuç

Tasarım sistemi üç ayrı ama bağlı bölgeden oluşur: shared tasarım sözleşmesi, Studio'nun renderer/editor yüzeyi ve Supabase generation orchestration. Dosya değişikliği yapılırken yalnızca “hangi ekranda görünüyor?” değil, “hangi katman bu verinin sahibi, renderer bunu nasıl tüketiyor, generation bunu nasıl üretiyor ve test hangi sözleşmeyi koruyor?” soruları birlikte cevaplanmalıdır.
