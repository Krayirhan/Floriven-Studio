# Floriven Studio — Design Engine V2 Sprint Planı

> **Proje:** Floriven Studio  
> **Kapsam:** AI destekli UI üretim motoru, DesignSpec, UX/Style ayrımı, renderer, preset/auto sistemi, kalite kapıları ve runtime critic  
> **Plan tipi:** Projeye özel teknik sprint roadmap  
> **Başlangıç durumu:** Mevcut V2 contract'ları kod tabanında büyük ölçüde mevcut; ana hedef bunları production pipeline içerisinde zorunlu hale getirmek  
> **Önerilen sprint süresi:** Sprint 0 için 3–5 gün, Sprint 1–15 için 2 hafta  
> **Ana hedef:** Floriven'ı “prompt → güzel ekran” sisteminden, kurallı ve kendi çıktısını doğrulayan bir **UI generation engine / design compiler** seviyesine taşımak

---

## 1. Mevcut Mimari Özeti

Floriven'ın mevcut üretim hattı:

```text
Dashboard
  ↓
useDashboardComposer
  ↓
generationService
  ↓
Supabase generate/index.ts
  ↓
ProductBlueprint
  ↓
Screen generation / normalization
  ↓
quality.ts
  ↓
generation_jobs.result_screens
  ↓
StudioPage / useGenerationJob
  ↓
useStudioState
  ↓
StudioCanvas
  ↓
PhoneScreen
  ↓
StudioPage.module.css
```

Mevcut shared tasarım sözleşmeleri:

```text
packages/design-spec/src/

types.ts
strategy.ts
presentation-spec.ts
product-blueprint.ts
ux-spec.ts
archetype.ts
pattern-registry.ts
surface-semantics.ts
tree-simplifier.ts
typography-budget.ts
geometry-validator.ts
action-semantics.ts
typed-content.ts
critic-gate.ts
runtime-quality.ts
patch-validator.ts
layout-candidates.ts
production-gates.ts
metrics/structural.ts
```

Mevcut generation katmanı:

```text
supabase/functions/generate/

index.ts
domain.ts
quality.ts
runtime-quality.ts

prompts/
  planning.md
  composition.md
  content.md
  contract.md
```

Ana renderer:

```text
apps/web/src/features/studio/canvas/PhoneScreen.tsx
```

Ana generated UI CSS katmanı:

```text
apps/web/src/features/studio/StudioPage.module.css
```

---

# 2. Design Engine V2'nin Ana Yasaları

Aşağıdaki kurallar proje seviyesinde değişmez mimari prensip kabul edilmelidir:

```text
1. STYLE MUST NOT DECIDE UX.

2. CARD IS NOT A GENERIC CONTAINER.

3. PATTERN > PRIMITIVE COMPOSITION.

4. LLM MUST EXPRESS INTENT, NOT PIXELS.

5. SCHEMA VALID DOES NOT MEAN DESIGN VALID.

6. PRESET AND AUTO MUST RESOLVE TO THE SAME PRESENTATION CONTRACT.

7. RENDERER MUST NOT KNOW PRESET IDENTITIES.

8. STATIC RULES MUST BE DETERMINISTICALLY ENFORCED.

9. VISUAL QUALITY MUST BE VERIFIED FROM RENDERED OUTPUT.

10. FAILED QUALITY MUST PRODUCE TARGETED PATCHES, NOT FULL REGENERATION.
```

---

# 3. Ana Başarı Kriterleri

Design Engine V2 tamamlandığında:

- Preset değişimi semantic UI ağacını değiştirmemeli.
- Auto mode UX üretmemeli; yalnızca art direction / presentation üretmeli.
- Nested generic Card oluşmamalı.
- Settings, form, analytics, dense-list gibi screen archetype'ları kendi pattern sistemlerini kullanmalı.
- Operational ekranlarda dev hero başlık oluşmamalı.
- Semantic action intent renderer'a kadar korunmalı.
- Settings ekranında boş selector/surface gibi renderer-contract problemleri final'e çıkmamalı.
- Focused task flow'larda bottom navigation bulunmamalı.
- PhoneScreen preset ID bilmemeli.
- CSS preset-specific class kombinasyonlarına bağımlı olmamalı.
- Runtime trusted renderer screenshot + geometry + visual critic üretmeli.
- Quality fail'leri node-level patch ile düzeltilmeli.
- Production release CI benchmark gate'lerinden geçmeli.

---

# 4. Sprint Haritası

| Sprint | Başlık | Öncelik | Ana sonuç |
|---|---|---:|---|
| Sprint 0 | Baseline & Contract Audit | P0 | Mevcut durum ölçülür |
| Sprint 1 | UX / Style Hard Separation | P0 | Preset UX'i değiştiremez |
| Sprint 2 | Preset Single Source of Truth | P0 | Katalog duplication kaldırılır |
| Sprint 3 | PresentationSpec Runtime Contract | P0 | Renderer preset bağımsız olur |
| Sprint 4 | Auto Style Engine V2 | P0 | Auto gerçek art direction üretir |
| Sprint 5 | Surface / Card Semantics | P0 | Card-in-card ve card-everywhere çözülür |
| Sprint 6 | Tree Simplifier & Structural Lint | P0 | Gereksiz wrapper/derin tree temizlenir |
| Sprint 7 | Archetype & Pattern Enforcement | P0 | Primitive Lego üretimi azaltılır |
| Sprint 8 | Typography / Density / Viewport | P1 | Dev başlık ve büyük bloklar çözülür |
| Sprint 9 | Runtime Geometry Validation | P1 | Overflow, clipping, boş surface çözülür |
| Sprint 10 | Action & Navigation Semantics | P1 | Saçma FAB/sort CTA/nav problemleri çözülür |
| Sprint 11 | Forms / Settings / Analytics | P1 | Zayıf archetype'lar production seviyesine çıkar |
| Sprint 12 | Renderer & CSS Token Refactor | P1 | PhoneScreen/CSS coupling çözülür |
| Sprint 13 | Preset Redesign | P1 | 5 preset sıfırdan doğru grammar ile yazılır |
| Sprint 14 | Trusted Visual Critic & Repair | P1 | Rendered quality self-correcting olur |
| Sprint 15 | Layout Candidates & CI Gates | P2 | Regression ve first-answer bias kontrol edilir |

---

# Sprint 0 — Baseline & Contract Audit

## Amaç

Yeni sistem yazmadan önce mevcut V2 contract'larının gerçekten production pipeline tarafından ne kadar kullanıldığını tespit etmek ve V1 kalite baseline'ı oluşturmak.

## Problem

Kod tabanında birçok V2 contract mevcut ancak:

```text
dosya var
≠
production pipeline bunu enforce ediyor
```

## İncelenecek dosyalar

```text
packages/design-spec/src/product-blueprint.ts
packages/design-spec/src/ux-spec.ts
packages/design-spec/src/archetype.ts
packages/design-spec/src/pattern-registry.ts
packages/design-spec/src/surface-semantics.ts
packages/design-spec/src/tree-simplifier.ts
packages/design-spec/src/typography-budget.ts
packages/design-spec/src/geometry-validator.ts
packages/design-spec/src/action-semantics.ts
packages/design-spec/src/typed-content.ts
packages/design-spec/src/critic-gate.ts
packages/design-spec/src/runtime-quality.ts
packages/design-spec/src/patch-validator.ts
packages/design-spec/src/layout-candidates.ts
packages/design-spec/src/production-gates.ts
packages/design-spec/src/metrics/structural.ts
```

## Yapılacaklar

Her contract için aşağıdaki matris çıkarılacak:

| Contract | Generation | Normalize | Quality | Renderer | Final Gate | Durum |
|---|---|---|---|---|---|---|
| UXSpec |  |  |  |  |  | ACTIVE/PARTIAL/DEAD/FUTURE |
| Archetype |  |  |  |  |  |  |
| Pattern Registry |  |  |  |  |  |  |
| Surface Semantics |  |  |  |  |  |  |
| Typography Budget |  |  |  |  |  |  |
| Geometry Validator |  |  |  |  |  |  |
| Action Semantics |  |  |  |  |  |  |
| Typed Content |  |  |  |  |  |  |
| Critic Gate |  |  |  |  |  |  |

## Benchmark Suite

En az şu ürünler hazırlanmalı:

```text
01-finance
02-restaurant-operations
03-ecommerce
04-project-management
05-fitness
06-travel
```

Her benchmark minimum şu ekranları içermeli:

```text
dashboard
dense list
detail
form
settings
analytics
```

## Baseline metrikleri

```text
nestedCardCount
cardRatio
surfaceRatio
maxTreeDepth
singleChildWrapperCount
decorativeWrapperCount

oversizedHeadingCount
duplicateHeadingCount
oversizedBlockCount

invalidFabCount
duplicatePrimaryActionCount
navigationViolationCount

emptyInteractiveSurfaceCount
overflowCount
overlapCount

generationDurationMs
inputTokens
outputTokens
repairCount
```

## Önerilen klasör

```text
docs/benchmarks/
  README.md
  finance/
  restaurant/
  ecommerce/
  project-management/
  fitness/
  travel/
```

## Definition of Done

- [ ] V1 baseline freeze edildi.
- [ ] 6 benchmark prompt hazır.
- [ ] Contract kullanım matrisi tamamlandı.
- [ ] Her V2 contract ACTIVE / PARTIAL / DEAD / FUTURE olarak işaretlendi.
- [ ] Structural metrics generation başına kaydediliyor.
- [ ] Sonraki sprintler için before/after karşılaştırması mümkün.

---

# Sprint 1 — UX / Style Hard Separation

## Amaç

Preset veya Auto style seçiminin semantic UI structure üzerinde herhangi bir etkisini teknik olarak engellemek.

## Problem

Mevcut durumda style instruction generation promptuna girebildiği için:

```text
aynı brief
+
farklı preset
=
farklı UX tree
```

oluşabiliyor.

## Hedef mimari

```text
Brief
  ↓
ProductBlueprint
  ↓
UXSpec
  ↓
Semantic UI
  ↓
FREEZE
  ├── Obsidian
  ├── Serene
  ├── Terracotta
  ├── Electric
  ├── Editorial
  └── Auto
       ↓
PresentationSpec
```

## Ana dosyalar

```text
supabase/functions/generate/index.ts
supabase/functions/generate/domain.ts
supabase/functions/generate/prompts/planning.md
supabase/functions/generate/prompts/composition.md
packages/design-spec/src/presentation-spec.ts
packages/design-spec/src/stage-contracts.test.ts
```

## Yapılacaklar

### 1. Composition promptundan preset kimliğini çıkar

Semantic composition aşaması artık şunları görmemeli:

```text
stylePresetId
preset name
palette
cardStyle
navigationStyle
densityStyle
visual style description
```

### 2. Semantic composer guardrail

```text
DO NOT decide colors.
DO NOT decide fonts.
DO NOT decide shadows.
DO NOT decide gradients.
DO NOT alter screen structure based on visual style.
DO NOT add/remove/reorder semantic components because of presentation.
```

### 3. Semantic hash sistemi

Yeni helper:

```text
packages/design-spec/src/semantic-hash.ts
```

Hash'e dahil:

```text
screen ids
node ids
node types
roles
children order
pattern ids
action semantics
navigation relationships
semantic content relationships
```

Hash dışında:

```text
colors
fonts
radius
border
shadow
visual spacing tokens
accent
surface treatment
```

### 4. Presentation mutation gate

```text
semanticHashBefore
==
semanticHashAfter
```

zorunlu.

## Testler

```text
same semantic spec
+ obsidian
+ serene
+ editorial
+ terracotta
+ electric
=
same semantic hash
```

## Definition of Done

- [ ] Preset composer promptuna ulaşmıyor.
- [ ] Semantic tree style uygulanmadan freeze ediliyor.
- [ ] Semantic hash üretilebiliyor.
- [ ] Presentation semantic tree değiştirirse hard fail.
- [ ] 5 preset semantic parity testini geçiyor.

---

# Sprint 2 — Preset Single Source of Truth

## Amaç

Preset katalogu duplication'ını kaldırmak.

## Problem

Şablon bilgisi birden fazla yerde tekrar ediyor:

```text
packages/design-spec/src/strategy.ts
supabase/functions/generate/index.ts
TEMPLATE_STRATEGIES
STYLE_COMPOSITIONS
dashboard/template metadata
```

## Canonical source

```text
packages/design-spec/src/strategy.ts
```

## Ana dosyalar

```text
packages/design-spec/src/strategy.ts
packages/design-spec/src/strategy.test.ts
supabase/functions/generate/index.ts
apps/web/src/features/app/dashboard.data.ts
apps/web/src/features/app/dashboard/DashboardSections.tsx
apps/web/src/features/app/templates/TemplatesPage.tsx
```

## Yapılacaklar

### 1. Preset katalogunu canonical yap

Her preset minimum:

```ts
{
  id,
  name,
  description,
  personality,
  previewMetadata
}
```

### 2. Backend allowlist'i katalogdan üret

Öneri:

```text
strategy.ts
  ↓ build
strategies.generated.json
  ↓
Supabase Edge Function
```

### 3. Duplicate metadata kaldır

Dashboard/Templates tarafı katalogdan okuyacak.

### 4. Güvenlik korunacak

Client unknown preset gönderirse:

```text
INVALID_STYLE_PRESET
```

ile reject.

## Testler

- Frontend IDs = backend allowlist.
- Dashboard IDs = shared catalog.
- TemplatesPage IDs = shared catalog.
- Duplicate preset tanımı bulunursa CI fail.

## Definition of Done

- [ ] Preset tanımı tek yerde.
- [ ] Backend allowlist shared katalogdan türetiliyor.
- [ ] TEMPLATE_STRATEGIES manuel duplicate değil.
- [ ] STYLE_COMPOSITIONS semantic layout tanımlamıyor.
- [ ] Dashboard/Templates aynı katalogdan besleniyor.

---

# Sprint 3 — PresentationSpec Runtime Contract

## Amaç

Preset ve Auto'nun aynı visual contract üzerinden renderer'a ulaşması.

## Ana dosyalar

```text
packages/design-spec/src/presentation-spec.ts
packages/design-spec/src/strategy.ts
packages/design-spec/src/index.ts
apps/web/src/features/studio/canvas/PhoneScreen.tsx
```

## Yeni dosyalar

```text
packages/design-spec/src/style/style-grammar.ts
packages/design-spec/src/style/style-resolver.ts
packages/design-spec/src/style/semantic-tokens.ts
```

## PresentationSpec kapsamı

```text
colors
typography roles
spacing
radius
surface
border
shadow
buttons
inputs
navigation presentation
chart presentation
accent policy
```

## Kritik kural

PresentationSpec:

```text
navigation looks like what?
```

sorusuna cevap verebilir.

Ancak:

```text
navigation exists or not?
```

sorusuna cevap veremez.

## Renderer hedefi

```tsx
<PhoneScreen
  screen={screen}
  presentation={presentationSpec}
/>
```

PhoneScreen şunları bilmemeli:

```text
serene
obsidian
terracotta
electric
editorial
```

## Definition of Done

- [ ] PresentationSpec complete runtime contract.
- [ ] Preset resolver PresentationSpec üretiyor.
- [ ] PhoneScreen preset kimliğine ihtiyaç duymadan render edebiliyor.
- [ ] Yeni visual grammar eklemek PhoneScreen değişikliği gerektirmiyor.

---

# Sprint 4 — Auto Style Engine V2

## Amaç

Auto mode'u gerçek brief-driven art-direction sistemi haline getirmek.

## Problem

Auto fallback veya generated strategy generic/gizli preset gibi davranabiliyor.

## Yeni contract

```text
packages/design-spec/src/style/visual-concept.ts
```

Örnek:

```ts
interface VisualConcept {
  personality: string[];
  surfacePhilosophy:
    | "flat"
    | "mostly-flat"
    | "layered"
    | "elevated";

  density:
    | "compact"
    | "balanced"
    | "spacious";

  typographyCharacter:
    | "neutral"
    | "technical"
    | "editorial"
    | "human"
    | "playful";

  accentStrategy:
    | "restrained"
    | "functional"
    | "expressive";

  contrast:
    | "soft"
    | "balanced"
    | "strong";

  radiusCharacter:
    | "sharp"
    | "restrained"
    | "soft"
    | "expressive";
}
```

## Yeni akış

```text
Brief
  ↓
VisualConcept
  ↓
Auto Style Resolver
  ↓
PresentationSpec
```

## Auto style agent yasakları

Auto:

- screen structure değiştiremez.
- Card ekleyemez.
- FAB ekleyemez.
- Bottom nav ekleyemez.
- content sırasını değiştiremez.
- pattern değiştiremez.
- UXSpec'i değiştiremez.

## Auto fallback

Yeni internal fallback:

```text
auto-safe-neutral
```

Özellik:

```text
neutral sans
mostly flat
balanced density
low elevation
restrained accent
moderate radius
```

## Definition of Done

- [ ] Auto preset fallback'e snap etmiyor.
- [ ] Auto VisualConcept üretiyor.
- [ ] VisualConcept PresentationSpec'e resolve ediliyor.
- [ ] Auto ve preset aynı renderer hattını kullanıyor.
- [ ] Auto semanticHash değiştiremiyor.

---

# Sprint 5 — Surface / Card / Section / Group Hard Semantics

## Amaç

Card-in-card, card-everywhere ve anlamsız surface problemlerini bitirmek.

## Ana dosyalar

```text
packages/design-spec/src/surface-semantics.ts
packages/design-spec/src/pattern-registry.ts
supabase/functions/generate/quality.ts
supabase/functions/generate/index.ts
```

## Ana kural

```text
CARD IS NOT A GENERIC CONTAINER.
```

## Semantik ayrım

### Section

İçerik bölümüdür.

```text
Section
  ├─ SectionHeader
  └─ Content
```

### Group

Layout grouping.

### Surface

Sadece visual background/elevation.

### Card

Bağımsız semantic entity.

## Hard rules

### Nested Card

```text
Card
└─ Card
```

FAIL.

Dolaylı:

```text
Card
└─ Column
   └─ Card
```

FAIL.

### Elevated Surface Depth

```text
maxElevatedSurfaceDepth = 1
```

### Card kullanım sebepleri

Allowed:

```text
independent entity
selectable entity
summary entity
self-contained action object
```

Forbidden:

```text
generic wrapper
spacing tool
section grouping
form grouping
settings grouping
```

## Static issue codes

```text
NESTED_CARD
EXCESSIVE_CARDIZATION
CARD_USED_AS_SECTION
REDUNDANT_SURFACE
EXCESSIVE_SURFACE_DEPTH
```

## Definition of Done

- [ ] nestedCardCount = 0.
- [ ] Generic Card başka Card ancestor altında bulunamıyor.
- [ ] Settings section'ları generic Card olmak zorunda değil.
- [ ] KPI outer-card + inner-card yapıları eliminate edildi.
- [ ] Card ratio metriği quality report'a giriyor.

---

# Sprint 6 — Tree Simplifier & Structural Lint

## Amaç

Gereksiz tree derinliği, wrapper zincirleri ve inspector node gürültüsünü azaltmak.

## Ana dosyalar

```text
packages/design-spec/src/tree-simplifier.ts
packages/design-spec/src/metrics/structural.ts
supabase/functions/generate/quality.ts
supabase/functions/generate/index.ts
```

## Collapse edilecek yapılar

```text
Column → single child Column
Row → single child Row
Group → single child Group
Surface → identical Surface
```

Semantik anlamı olmayan wrapper kaldırılacak.

## Yeni metrikler

```text
maxTreeDepth
singleChildWrapperCount
decorativeWrapperCount
surfaceDepth
```

## Threshold önerisi

```text
nestedCardCount > 0
→ hard fail

maxTreeDepth > 10
→ warning/fail

singleChildWrapper ratio > threshold
→ warning
```

## normalizeScreens entegrasyonu

```text
generation
↓
normalize
↓
treeSimplifier
↓
structuralLint
↓
quality
```

## Definition of Done

- [ ] treeSimplifier zorunlu stage.
- [ ] Tek child wrapper'lar otomatik collapse.
- [ ] maxTreeDepth ölçülüyor.
- [ ] Inspector'daki anlamsız wrapper sayısı belirgin azalıyor.
- [ ] Structural regressions test ile korunuyor.

---

# Sprint 7 — Archetype & Pattern Registry Enforcement

## Amaç

LLM'nin primitive Lego ile her ekranı sıfırdan kurmasını engellemek.

## Ana dosyalar

```text
packages/design-spec/src/archetype.ts
packages/design-spec/src/pattern-registry.ts
packages/design-spec/src/ux-spec.ts
supabase/functions/generate/domain.ts
supabase/functions/generate/prompts/composition.md
```

## Pipeline

```text
Screen
  ↓
Archetype
  ↓
Allowed Pattern Set
  ↓
Pattern Plan
  ↓
Semantic Composition
  ↓
Primitive compilation
```

## Archetype örnekleri

```text
dashboard
dense_list
collection
detail
form
wizard
analytics
settings
profile
search
calendar
timeline
onboarding
management
```

## Pattern örnekleri

```text
TransactionRow
InvoiceRow
SettingsRow
KeyValueRow
SearchBar
FilterBar
SegmentedControl
SummaryMetric
StatStrip
FormField
FormSection
DetailSection
ChartSection
InsightBlock
StickyActionBar
ProfileHeader
```

## Örnek mapping

### Transactions

```text
dense_list
→ SearchBar
→ SegmentedControl
→ TransactionList
→ TransactionRow
```

### Settings

```text
settings
→ SettingsGroup
→ SettingsRow
```

### Form

```text
form
→ FormSection
→ FormField
→ StickyActionBar
```

## Definition of Done

- [ ] Composer archetype'a göre allowed pattern listesi alıyor.
- [ ] Primitive-only composition oranı düşüyor.
- [ ] SettingsRow/FormField/TransactionRow gerçek generation'da kullanılıyor.
- [ ] Pattern suitability quality metriği ekleniyor.
- [ ] Benchmark'larda %90+ doğru pattern kullanımı.

---

# Sprint 8 — Typography / Density / Viewport Budget

## Amaç

Dev başlık, gereksiz hero, aşırı boşluk ve büyük blok problemlerini çözmek.

## Ana dosyalar

```text
packages/design-spec/src/typography-budget.ts
packages/design-spec/src/archetype.ts
supabase/functions/generate/quality.ts
apps/web/src/features/studio/canvas/PhoneScreen.tsx
```

## Semantic typography roles

```text
display
pageTitle
sectionTitle
cardTitle
body
label
caption
dataLarge
dataMedium
numericTabular
```

## Hard rules

### Operational screens

```text
pageTitle.maxLines = 2
display = forbidden
```

### Forms

```text
hero = forbidden
display = forbidden
pageTitle.maxLines = 2
```

### Settings

```text
hero = forbidden
```

### Analytics

```text
description.maxLines = 2
```

### Dashboard

```text
display.maxLines = 3
```

## Duplicate heading detector

Örnek:

```text
PİYASA ÖZETİ
Piyasa Özeti
```

Issue:

```text
DUPLICATE_PAGE_HEADING
```

## Viewport budget

Ölçülecek:

```text
header viewport ratio
first useful content offset
largest block viewport ratio
above-fold primary content
```

## Hard / warning önerileri

```text
operational header > 25% viewport
→ fail

generic block > 40% viewport
→ warning/fail

primary task content not above-fold
→ quality penalty
```

## Definition of Done

- [ ] duplicateHeadingCount = 0.
- [ ] oversizedOperationalHeadingCount = 0.
- [ ] Hero yanlış archetype'ta üretilemiyor.
- [ ] Density screen archetype tarafından constrain ediliyor.
- [ ] Above-the-fold usefulness metriği mevcut.

---

# Sprint 9 — Runtime Geometry Validation

## Amaç

Schema-valid fakat render'da bozuk UI'yı engellemek.

## Ana dosyalar

```text
packages/design-spec/src/geometry-validator.ts
packages/design-spec/src/runtime-quality.ts
supabase/functions/generate/runtime-quality.ts
supabase/functions/record-generation-runtime-quality/index.ts
apps/web/src/features/studio/canvas/PhoneScreen.tsx
```

## Kontroller

```text
text overflow
horizontal overflow
component overlap
clipping
safe-area violation
FAB collision
bottom-nav collision
sticky element collision
hidden content
oversized block
huge empty region
empty interactive surface
```

## Content sizing policy

Default:

```text
Card → content-sized
Section → content-sized
Group → content-sized
```

Fixed height yalnızca:

```text
button
input
avatar
image
chart viewport
tab bar
```

gibi controlled component'lerde.

## Empty interactive surface

Örnek problem:

```text
Tema Seçimi
[               ]

Para Birimi
[               ]
```

Issue:

```text
EMPTY_INTERACTIVE_SURFACE
```

Severity:

```text
critical
```

## Definition of Done

- [ ] geometry validator trusted bounds ile çalışıyor.
- [ ] overflowCount = 0 final gate.
- [ ] overlapCount = 0 final gate.
- [ ] emptyInteractiveSurfaceCount = 0 final gate.
- [ ] safeAreaViolationCount = 0 final gate.

---

# Sprint 10 — Action & Navigation Semantics

## Amaç

Saçma FAB, yanlış CTA emphasis, duplicate action ve focused-flow navigation sorunlarını çözmek.

## Ana dosyalar

```text
packages/design-spec/src/action-semantics.ts
packages/design-spec/src/archetype.ts
supabase/functions/generate/quality.ts
apps/web/src/features/studio/canvas/PhoneScreen.tsx
```

## Typed action

```ts
{
  intent: "sort",
  importance: "tertiary",
  scope: "screen"
}
```

## Intent türleri

```text
create
add
compose
edit
delete
save
cancel
search
filter
sort
select
navigate
share
confirm
```

## FAB policy

Allowed:

```text
create
add
compose
```

Forbidden:

```text
sort
filter
edit
save
settings
search
analytics
```

## Screen rules

```text
settings → FAB forbidden
analytics → FAB forbidden
form → FAB forbidden
focused detail → normally no FAB
```

## Navigation modes

```text
root
focused
modal
wizard
```

Focused flow:

```text
New Invoice
Edit Profile
Checkout
Wizard
```

→ root bottom navigation yok.

## Static issues

```text
INVALID_FAB
DUPLICATE_PRIMARY_ACTION
FOCUSED_FLOW_BOTTOM_NAV
WRONG_ACTION_EMPHASIS
INVALID_NAV_ACTIVE_STATE
```

## Definition of Done

- [ ] invalidFabCount = 0.
- [ ] duplicatePrimaryActionCount = 0.
- [ ] focusedFlowBottomNavViolation = 0.
- [ ] Sort controls primary CTA olarak render olmuyor.
- [ ] Action importance renderer tarafından korunuyor.

---

# Sprint 11 — Forms / Settings / Analytics Archetype Hardening

## Amaç

Mevcut generation'da en zayıf üç ekran tipini production UX seviyesine taşımak.

---

## 11.1 Forms

### Required structure

```text
Header
Customer / entity selection
Metadata
Main fields
Line items
Tax / discount
Notes
Summary
Sticky primary action
```

### Yasaklar

```text
no hero
no FAB
no root bottom navigation
no giant CTA for ordinary selection
```

### Pattern'ler

```text
FormSection
FormField
EntitySelector
LineItemEditor
SummaryBlock
StickyActionBar
```

---

## 11.2 Settings

### Required structure

```text
Section
  ├─ SettingsRow
  ├─ Divider
  └─ SettingsRow
```

### Örnek

```text
Görünüm

Tema                          Koyu >
Para Birimi                    TRY >

Bildirimler

Fiyat uyarıları                 ●
Haber bildirimleri              ●
```

### Yasak

```text
every setting = Card
```

---

## 11.3 Analytics

### Required semantic chain

```text
Question
↓
Metric
↓
Visual
↓
Insight
```

### Chart sadece var olmak için olmamalı

Her chart:

```text
dimension
measure
unit
series
insight
```

taşımalı.

## Definition of Done

- [ ] Form completeness checker aktif.
- [ ] Settings grouped-row pattern kullanıyor.
- [ ] Boş selector render edilemiyor.
- [ ] Analytics chart'larının tamamında insight metadata var.
- [ ] Analytics FAB yok.
- [ ] Form bottom nav yok.

---

# Sprint 12 — Renderer & CSS Token Refactor

## Amaç

PhoneScreen ile strategy CSS class coupling'ini kaldırmak.

## Ana dosyalar

```text
apps/web/src/features/studio/canvas/PhoneScreen.tsx
apps/web/src/features/studio/canvas/PhoneScreen.test.ts
apps/web/src/features/studio/StudioPage.module.css
packages/design-spec/src/presentation-spec.ts
```

## Kaldırılacak yaklaşım

```text
strategyPaletteSerene
strategyCardsSerene
strategyDensitySerene
strategyNavigationSerene
```

ve benzeri preset-specific class mapping.

## Yeni yaklaşım

```text
PresentationSpec
↓
CSS Variables
↓
Generated Base Components
```

Örnek:

```css
.generatedCard {
  background: var(--fl-card-background);
  border: var(--fl-card-border);
  border-radius: var(--fl-card-radius);
  box-shadow: var(--fl-card-shadow);
}
```

## CSS organizasyonu

Öneri:

```text
apps/web/src/features/studio/styles/

studio-shell.module.css

generated/
  base.module.css
  layout.module.css
  typography.module.css
  components.module.css
  navigation.module.css
```

## Renderer contract

PhoneScreen:

```text
DesignSpec
+
PresentationSpec
=
Rendered UI
```

## Definition of Done

- [ ] PhoneScreen preset ID bilmiyor.
- [ ] strategyClasses() kaldırıldı veya legacy-only kaldı.
- [ ] Generated components semantic CSS variables kullanıyor.
- [ ] Yeni preset eklemek CSS class duplication gerektirmiyor.
- [ ] PhoneScreen tests semantic/presentation isolation test ediyor.

---

# Sprint 13 — Preset Redesign

## Amaç

Mimari güvenlik kurulduktan sonra 5 Floriven preset'ini sıfırdan gerçek StyleGrammar olarak yeniden tasarlamak.

---

## 13.1 Obsidian Precision

### Hedef

```text
technical
compact
precise
data-first
high contrast
restrained accent
selective elevation
fine dividers
tabular numbers
```

### Yasak

```text
dark + card + cyan everywhere
```

### Accent

Cyan yalnızca:

```text
selected state
primary create action
important positive/active state
```

---

## 13.2 Serene Flow

### Hedef

```text
calm
human
soft
restrained
comfortable
```

### Yasak

```text
giant spacing
giant list rows
card everywhere
wellness look on dense financial UI
```

---

## 13.3 Terracotta Atelier

### Hedef

```text
warm
crafted
editorial accent
tactile
human
```

### Typography

```text
display → serif allowed
operational headings → compact
numeric data → sans/tabular
body → sans
```

### Yasak

```text
6-line serif operational headings
secondary action = bright orange CTA
```

---

## 13.4 Electric Pulse

### Hedef

```text
energetic
expressive
youthful
modern
```

### Guardrail

Strict accent budget.

### Yasak

```text
everything purple
every control primary
glow everywhere
```

---

## 13.5 Editorial Grid

### Hedef

```text
flat
structured
divider-driven
typography-led
high clarity
```

### Yasak

```text
form screen = magazine cover
operational screen = huge serif poster
```

## Preset parity test

```text
same SemanticDesignSpec
+
all presets
=
same semantic hash
```

## Definition of Done

- [ ] 5 preset yeni StyleGrammar contract'ına geçti.
- [ ] Semantic parity testlerini geçiyor.
- [ ] Preset-specific guardrails mevcut.
- [ ] Presetler UX structure değiştirmiyor.
- [ ] Benchmark görsel skorları baseline üstünde.

---

# Sprint 14 — Trusted Visual Critic & Targeted Repair

## Amaç

Schema-valid fakat kötü ekranların final'e çıkmasını engellemek ve otomatik lokal düzeltme yapmak.

## Ana dosyalar

```text
packages/design-spec/src/critic-gate.ts
packages/design-spec/src/runtime-quality.ts
packages/design-spec/src/patch-validator.ts
supabase/functions/generate/runtime-quality.ts
supabase/functions/record-generation-runtime-quality/index.ts
```

## Trusted pipeline

```text
generation completed
↓
trusted renderer
↓
screenshots
↓
geometry report
↓
visual critic
↓
cross-screen critic
↓
runtime quality
↓
finalEligible
```

## Visual critic rubric

```text
taskClarity
visualHierarchy
informationDensity
surfaceUsage
patternSuitability
typography
spacingRhythm
actionClarity
navigation
screenDifferentiation
crossScreenConsistency
contentRealism
```

## Hard gates

Öneri:

```text
taskClarity >= 7
navigation >= 7
patternSuitability >= 7
surfaceUsage >= 6
overall >= 7.5
```

Critical static issue varsa overall score bypass edemez.

## Repair flow

```text
issue
↓
target node id
↓
structured patch
↓
patch-validator
↓
apply
↓
re-render
↓
re-critic
```

## Full regeneration yok

Örnek:

```json
{
  "code": "OVERSIZED_HEADING",
  "nodeId": "title-new-invoice"
}
```

Patch yalnızca ilgili node'u değiştirir.

## Repair cycle

```text
maxRepairCycles = 2 veya 3
```

## Definition of Done

- [ ] Trusted renderer screenshot üretiyor.
- [ ] Visual critic structured score üretiyor.
- [ ] Cross-screen critic aktif.
- [ ] runtimeQualityReport otomatik yazılıyor.
- [ ] finalEligible server tarafından hesaplanıyor.
- [ ] Repair target node patch ile yapılıyor.
- [ ] Full-screen regeneration default repair değil.

---

# Sprint 15 — Layout Candidate Ranking & Production CI Gates

## Amaç

First-answer bias'ı azaltmak ve design-engine regression'larını CI seviyesinde engellemek.

## Ana dosyalar

```text
packages/design-spec/src/layout-candidates.ts
packages/design-spec/src/production-gates.ts
packages/design-spec/src/metrics/structural.ts
```

## Candidate generation

Full UI üretmeden önce 2–3 düşük maliyetli structural candidate:

```text
Candidate A
Search
Segment
Dense List

Candidate B
Summary Strip
Search
Grouped List

Candidate C
Search
Filters
Timeline
```

## Ranking kriterleri

```text
task fit
scanability
information priority
above-fold usefulness
density fit
pattern suitability
navigation suitability
```

## Diversity

Şunlar farklı candidate sayılmamalı:

```text
aynı layout
+
farklı gap
```

Diversity signature:

```text
pattern sequence
region order
surface ratio
content density
navigation mode
```

## CI benchmark gate

Her design-engine PR:

```text
benchmark generation
↓
metrics
↓
comparison
↓
gate
```

## Final V2 target metrics

```text
nestedCardCount = 0
invalidFabCount = 0
emptyInteractiveSurfaceCount = 0
focusedFlowBottomNavViolation = 0

overflowCount = 0
overlapCount = 0

oversizedOperationalHeadingCount = 0
duplicateHeadingCount = 0

singleChildWrapperRatio < 5%

visualScore >= 7.8
taskClarity >= 8.0
patternSuitability >= 8.0
crossScreenConsistency >= 7.5
screenDifferentiation >= 7.5
```

## Definition of Done

- [ ] Candidate generation active.
- [ ] Diversity gate active.
- [ ] Candidate scorer human benchmark ile ölçülüyor.
- [ ] CI design benchmark çalıştırıyor.
- [ ] Production gates regression'da release'i durduruyor.

---

# 5. Sprintler Arası Bağımlılık

```text
Sprint 0
  ↓
Sprint 1
  ↓
Sprint 2
  ↓
Sprint 3
  ↓
Sprint 4
  ↓
Sprint 5
  ↓
Sprint 6
  ↓
Sprint 7
  ↓
Sprint 8
  ↓
Sprint 9
  ↓
Sprint 10
  ↓
Sprint 11
  ↓
Sprint 12
  ↓
Sprint 13
  ↓
Sprint 14
  ↓
Sprint 15
```

Kritik kural:

```text
Sprint 1–3 tamamlanmadan
Sprint 13 preset redesign'a başlanmamalı.
```

---

# 6. Milestone Planı

## Milestone A — Architectural Safety

**Sprint 0–4**

Sonuç:

```text
UX != Style
Preset single source
PresentationSpec runtime contract
Auto correct pipeline
semantic freeze/hash
```

---

## Milestone B — Structural Quality

**Sprint 5–9**

Sonuç:

```text
nested card yok
tree temiz
pattern sistemi aktif
dev başlık yok
viewport kontrollü
geometry valid
```

---

## Milestone C — Product UX

**Sprint 10–11**

Sonuç:

```text
actions doğru
navigation doğru
forms task-oriented
settings grouped-row
analytics insight-driven
```

---

## Milestone D — Visual System

**Sprint 12–13**

Sonuç:

```text
PhoneScreen preset-independent
CSS token-driven
5 preset yeniden tasarlanmış
```

---

## Milestone E — Self-Correcting Design Engine

**Sprint 14–15**

Sonuç:

```text
trusted render
visual critic
cross-screen critic
targeted repair
candidate ranking
production CI gates
```

---

# 7. Proje Dosya Sorumluluklarının Hedef Hali

| Dosya / Katman | Hedef sorumluluk |
|---|---|
| `strategy.ts` | Canonical preset catalog |
| `presentation-spec.ts` | Runtime visual contract |
| `product-blueprint.ts` | Ürün/domain contract |
| `ux-spec.ts` | Screen UX intent contract |
| `archetype.ts` | Screen archetype hard rules |
| `pattern-registry.ts` | High-level semantic UI patterns |
| `surface-semantics.ts` | Card/Surface/Section/Group contract |
| `tree-simplifier.ts` | Redundant wrapper cleanup |
| `typography-budget.ts` | Role/line/viewport typography constraints |
| `geometry-validator.ts` | Rendered geometry validation |
| `action-semantics.ts` | Typed action + FAB/navigation semantics |
| `typed-content.ts` | Currency/date/percentage/form typed data |
| `critic-gate.ts` | Visual critic thresholds |
| `patch-validator.ts` | Targeted repair safety |
| `layout-candidates.ts` | Structural candidate generation/ranking |
| `production-gates.ts` | Final release gates |
| `generate/index.ts` | Orchestration only |
| `domain.ts` | ProductBlueprint + archetype/role planning |
| `quality.ts` | Deterministic static lint / structural quality |
| `PhoneScreen.tsx` | DesignSpec + PresentationSpec renderer |
| `StudioPage.module.css` | Legacy azaltılacak; generated CSS token-driven olacak |
| `record-generation-runtime-quality` | Trusted runtime quality writer |

---

# 8. Yeni Quality Issue Registry

Aşağıdaki issue code'ları standartlaştırılmalıdır:

```text
DUPLICATE_PAGE_HEADING
IMPLEMENTATION_TERMINOLOGY
NESTED_CARD
EXCESSIVE_CARDIZATION
CARD_USED_AS_SECTION
REDUNDANT_SURFACE
EXCESSIVE_SURFACE_DEPTH

SINGLE_CHILD_WRAPPER
EXCESSIVE_TREE_DEPTH

OVERSIZED_HEADING
OVERSIZED_BLOCK
ABOVE_FOLD_TASK_MISSING

INVALID_FAB
DUPLICATE_PRIMARY_ACTION
WRONG_ACTION_EMPHASIS
FOCUSED_FLOW_BOTTOM_NAV
INVALID_NAV_ACTIVE_STATE

EMPTY_INTERACTIVE_SURFACE
TEXT_OVERFLOW
HORIZONTAL_OVERFLOW
COMPONENT_OVERLAP
SAFE_AREA_VIOLATION

SCREEN_CONTENT_GOAL_MISMATCH
PATTERN_ARCHETYPE_MISMATCH
FORM_INCOMPLETE
ANALYTICS_WITHOUT_INSIGHT
INVALID_TYPED_CONTENT
LOCALE_FORMATTING_VIOLATION
```

Severity:

```text
critical
high
medium
low
```

---

# 9. Release Gate Modeli

## Technical Valid

```text
schema PASS
a11y PASS
structural PASS
geometry PASS
```

## Product Valid

```text
semantic PASS
pattern PASS
navigation PASS
visual PASS
cross-screen PASS
```

Final eligibility:

```text
Technical Valid
+
Product Valid
=
FINAL
```

Aksi durumda:

```text
PREVIEW
```

veya repair loop.

---

# 10. Genel Definition of Done

Her sprint ticket'ı aşağıdakiler olmadan tamamlanmış sayılmaz:

```text
implementation complete
+
unit tests
+
contract tests
+
benchmark before/after
+
metrics comparison
+
documentation update
+
no critical regression
```

Generation tarafında ayrıca:

```text
before screenshot
after screenshot
quality report diff
```

saklanmalıdır.

---

# 11. Kod Review Checklist

Her design-engine PR'ında aşağıdaki checklist kullanılmalıdır:

- [ ] Bu karar UX'e mi, presentation'a mı ait?
- [ ] Style stage semantic structure değiştiriyor mu?
- [ ] Bu Card gerçekten semantic Card mı?
- [ ] Aynı grouping Section/Group ile yapılabilir mi?
- [ ] Nested elevated surface var mı?
- [ ] Pattern yerine primitive composition mı kullanılmış?
- [ ] Action typed intent taşıyor mu?
- [ ] FAB semantik olarak gerekli mi?
- [ ] Focused flow'da root bottom nav var mı?
- [ ] Page title max-line kuralını geçiyor mu?
- [ ] İlk viewport primary task'ı gösteriyor mu?
- [ ] Generic component raw fixed height kullanıyor mu?
- [ ] Renderer preset identity biliyor mu?
- [ ] Auto UX structure'a dokunuyor mu?
- [ ] Static lint ile deterministic çözülebilecek problem critic'e bırakılmış mı?
- [ ] Schema valid olsa bile UI kötü olabilir mi?
- [ ] Yeni değişiklik benchmark regression yaratıyor mu?

---

# 12. İlk Uygulama Sırası

Bugün geliştirmeye başlanacaksa commit sırası:

```text
1. chore(design-engine): establish V1 benchmark baseline

2. refactor(generation): separate semantic composition from presentation

3. feat(design-spec): add semantic structure hash guard

4. refactor(strategy): make preset catalog single source of truth

5. refactor(presentation): make PresentationSpec runtime contract

6. feat(auto-style): add VisualConcept and auto style resolver

7. feat(surface): enforce Card/Surface/Section/Group semantics

8. feat(structure): enforce tree simplifier and structural lint

9. feat(patterns): enforce archetype-driven Pattern Registry

10. feat(typography): enforce role-based typography and viewport budgets

11. feat(geometry): integrate runtime geometry validation

12. feat(actions): enforce semantic FAB/action/navigation rules

13. feat(archetypes): harden forms, settings and analytics

14. refactor(renderer): make PhoneScreen presentation-token driven

15. feat(presets): rebuild Floriven preset grammars

16. feat(runtime-quality): add trusted screenshot critic and repair loop

17. feat(layout): activate candidate ranking and production gates
```

---

# 13. Özellikle Şimdilik Yapılmayacaklar

Sprint 1–3 tamamlanmadan şu işler yapılmamalı:

```text
Obsidian renk tuning
Serene radius tuning
Terracotta serif tuning
Electric gradient tuning
Editorial border tuning
```

Çünkü bu noktada sorun palette değil; mimari ownership sınırlarıdır.

---

# 14. V2 Tamamlanma Tanımı

```text
FLORIVEN DESIGN ENGINE V2 IS COMPLETE WHEN:

1. Style cannot mutate semantic UI structure.
2. Preset definitions have one source of truth.
3. Preset and Auto both resolve to PresentationSpec.
4. PhoneScreen does not know preset identities.
5. Generic Card cannot contain another generic Card.
6. Surface semantics are statically enforced.
7. Redundant containers are automatically simplified.
8. Screen archetypes constrain composition.
9. Pattern Registry is preferred over primitive composition.
10. Typography budget is enforced.
11. Operational screens cannot create giant hero text.
12. Geometry is checked from rendered output.
13. FAB/action/navigation semantics are deterministic.
14. Focused flows cannot retain root bottom navigation.
15. Auto cannot modify UX structure.
16. Renderer produces trusted runtime evidence.
17. Visual critic participates in final eligibility.
18. Critic failures create targeted patches, not full regeneration.
19. Cross-screen consistency and differentiation are measured.
20. Regression benchmark gates every design-engine release.
```

---

# 15. Nihai Hedef Pipeline

```text
USER BRIEF
    │
    ▼
ProductBlueprint
    │
    ▼
ScreenGraph / UXSpec
    │
    ▼
Archetype
    │
    ▼
Pattern Plan
    │
    ▼
Semantic DesignSpec
    │
    ▼
Semantic Freeze + Hash
    │
    ├───────────────┐
    │               │
    ▼               ▼
Preset          Auto VisualConcept
    │               │
    └───────┬───────┘
            ▼
     PresentationSpec
            │
            ▼
      Styled Rendering
            │
            ▼
   Structural / Geometry
            │
            ▼
      Trusted Screenshot
            │
            ▼
        Visual Critic
            │
            ▼
    Cross-Screen Critic
            │
       ┌────┴────┐
       │         │
      PASS      FAIL
       │         │
       ▼         ▼
     FINAL    Targeted Patch
                 │
                 ▼
              Re-render
```

---

## Sonuç

Floriven Studio'da ana hedef yeni bir “prompt seti” yazmak değildir. Mevcut DesignSpec ve V2 sözleşmelerini production generation hattının **bypass edilemeyen kuralları** haline getirmektir.

Design Engine V2'nin ürün seviyesi tanımı:

> Floriven; brief'i anlayan, UX'i planlayan, archetype ve pattern kurallarıyla semantic UI üreten, presentation'ı ayrı uygulayan, render edilmiş çıktısını ölçen, kendi tasarımını eleştiren ve yalnızca gerekli node'ları patch ederek kendini düzelten bir UI generation engine olmalıdır.
