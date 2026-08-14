# Component Registry Standardı

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | P0 — onay gerekli |
| Doküman sahibi | Design Systems Lead |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Her component sürümü |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Amaç

AI'ın ve editörün üretebileceği component türlerini, property şemalarını, varsayılanları, erişilebilirlik ve export mapping'lerini tek kaynaktan yönetmek.

## Kayıt alanları

```yaml
name: Button
version: 1.2.0
category: input
container: false
propsSchema: ...
defaults: ...
a11yRules: ...
platformMappings:
  figma: ...
  reactNative: ...
  flutter: ...
examples: ...
```

## MVP component'leri

Kanonik temel allowlist: `Screen`, `SafeArea`, `ScrollView`, `Stack`, `Row`, `Grid`, `Text`, `Image`, `Icon`, `Button`, `IconButton`, `TextField`, `SearchField`, `Checkbox`, `Switch`, `Card`, `ListItem`, `Divider`, `Badge`, `Avatar`, `TabBar`, `BottomNavigation`, `TopAppBar`, `Modal`, `Form`, `Progress`, `Metric`, `Chart`, `SegmentedControl`, `FloatingActionButton`.

Serene Health domain ailesi: `CareSummary`, `MedicationTimeline`, `MedicationDoseRow`, `HealthMetric`, `UnitInput`, `RangeChart`, `TargetRange`, `StatusAlert`, `SafetyNotice`, `SuccessFeedback`.

Editorial Culture domain ailesi: `EditorialHero`, `FeatureStory`, `StoryCard`, `Byline`, `MetadataStrip`, `PullQuote`, `SectionIndex`, `ArchiveEntry`.

Terracotta Market domain ailesi: `CommerceHero`, `ProductCard`, `PriceBlock`, `ProductGallery`, `VariantSelector`, `CartLine`, `OrderSummary`, `DeliveryPromise`.

Electric Learning domain ailesi: `LearningHero`, `XpProgress`, `StreakBadge`, `LessonCard`, `RoadmapStep`, `QuizChoice`, `AnswerFeedback`, `AchievementBadge`.

Obsidian Precision domain ailesi: `CommandSummary`, `SignalChart`, `RiskIndicator`, `OperationRow`, `IncidentTimeline`, `DataMatrix`, `ControlToggle`, `AuditEntry`.

AI üretim endpoint'i registry dışındaki tipleri reddeder. Web editörü aynı allowlist'i `apps/web/src/features/studio/canvas/componentRegistry.ts` üzerinden render eder; böylece sağlayıcı yanıtı, validator ve görsel çıktı aynı sözleşmeye bağlı kalır.

## Kabul kriteri

Her component için JSON Schema, renderer, inspector form, default fixture, accessibility test, visual snapshot ve en az bir export mapping bulunur. Eksik mapping varsa capability açıkça `unsupported` olarak işaretlenir.

## Sürümleme

Property ekleme minor; anlam değiştirme veya silme major. DesignSpec migrator ve deprecated süre gerekir. AI prompt registry'nin makine tarafından üretilen kısa sözleşmesini kullanır; manuel kopya tutulmaz.

## Güvenlik

Component property hiçbir zaman raw executable code kabul etmez. URL, rich text ve expression özel validator kullanır. Asset yalnız doğrulanmış `assetId` ile referanslanır.
