# Floriven Studio — Design Engine V2 Final Certification Specification

> **Belge türü:** Immutable Release Certification Contract  
> **Proje:** Floriven Studio  
> **Tarih:** 2026-08-09  
> **Kapsam:** Design Engine V2 — generation, DesignSpec, UX/Style ayrımı, preset/auto, renderer, structural quality, runtime quality, visual critic, repair ve production gates  
> **Amaç:** Floriven V2'nin gerçekten production-ready olup olmadığını kanıtlamak  
> **Kullanım:** Bu dosya certification sırasında **değiştirilemez**. Auditor/test agent bu dosyayı kaynak kabul eder, kodu/testleri çalıştırır ve ayrı bir certification report üretir.

---

# 0. Certification Felsefesi

Bu süreç bir feature review değildir.

Bu süreç:

```text
"Dosya var mı?"
```

sorusunu değil:

```text
"Gerçek production path üzerinde,
kural bypass edilemeyecek şekilde enforce ediliyor mu?"
```

sorusunu cevaplar.

Floriven V2 ancak gerçek runtime davranışı, test kanıtı ve reproducible evidence ile geçer.

Aşağıdaki ifadeler PASS kanıtı değildir:

```text
- Bu dosya mevcut.
- Bu fonksiyon yazılmış.
- Bu konuda comment var.
- Dokümanda böyle yazıyor.
- Prompt modele bunu söylüyor.
- Happy-path test geçiyor.
- Ekran ilk bakışta düzgün görünüyor.
```

Bir özellik yalnızca şu durumda PASS sayılır:

```text
1. Gerçek production path üzerinde kullanılıyor.
2. Bypass yolları araştırıldı.
3. İhlal deterministik olarak engelleniyor, normalize ediliyor,
   repair ediliyor veya FINAL eligibility'yi blokluyor.
4. Sonuç test/runtime evidence ile kanıtlandı.
```

---

# 1. Final Release Kararı

Certification sonunda yalnızca şu üç karardan biri verilebilir:

```text
CERTIFIED
CERTIFIED WITH MINOR ISSUES
NOT CERTIFIED
```

## 1.1 CERTIFIED

Aşağıdakilerin tümü sağlanmalıdır:

- Hiç RELEASE BLOCKER yok.
- Hiç doğrulanmamış critical invariant yok.
- Tüm hard invariant'lar PASS.
- Tüm critical geometry/security/runtime gates PASS.
- Visual ve cross-screen minimum skorları sağlanıyor.
- Benchmark regression kabul sınırlarında.
- Holdout sonuçlarında kritik failure yok.

## 1.2 CERTIFIED WITH MINOR ISSUES

Yalnızca:

```text
MINOR
```

seviyesinde bulgular bulunabilir.

Aşağıdakiler varsa kullanılamaz:

```text
MAJOR
RELEASE BLOCKER
critical invariant NOT VERIFIED
```

## 1.3 NOT CERTIFIED

Aşağıdaki durumlardan herhangi biri yeterlidir:

- En az bir RELEASE BLOCKER.
- Critical invariant FAIL.
- Critical invariant NOT VERIFIED.
- Quality bypass mümkün.
- Client finalEligible forge edebiliyor.
- Style semantic structure değiştirebiliyor.
- Nested generic Card final'e çıkabiliyor.
- Empty interactive surface final'e çıkabiliyor.
- Critical geometry violation final'e çıkabiliyor.
- Trusted runtime evidence olmadan FINAL üretilebiliyor.

---

# 2. Severity Modeli

Tüm bulgular aşağıdaki seviyelerden biri ile raporlanmalıdır.

## RELEASE BLOCKER

Release durdurulur.

Örnekler:

```text
Style semantic tree değiştiriyor.
Nested Card hard gate'i bypass edilebiliyor.
Client finalEligible belirleyebiliyor.
Runtime evidence olmadan FINAL alınabiliyor.
Unsupported component silent corruption üretiyor.
Duplicate node ID production'a çıkabiliyor.
Critical geometry violation FINAL olabiliyor.
Focused form root bottom navigation ile FINAL olabiliyor.
```

## MAJOR

Temel UX/quality contract'ı ciddi biçimde ihlal edilir.

Örnekler:

```text
Settings card-everywhere üretiyor.
Analytics insight olmadan final olabiliyor.
Form domain açısından eksik.
Pattern Registry bypass ediliyor.
Oversized operational hero final oluyor.
```

## MINOR

Release'i tek başına engellemez ancak kalite borcudur.

Örnekler:

```text
Minor spacing inconsistency.
Low-severity copy redundancy.
Non-critical visual polish.
```

## PASS

Test edilmiş ve kanıtlanmıştır.

## NOT VERIFIED

Test edilmesi gereken alan güvenilir biçimde doğrulanamamıştır.

NOT VERIFIED critical invariant = NOT CERTIFIED.

---

# 3. Floriven'ın Certification Kapsamındaki Production Path'i

Auditor aşağıdaki gerçek zinciri trace etmelidir:

```text
Dashboard
  ↓
DashboardComposer / useDashboardComposer
  ↓
generationService
  ↓
Supabase generate/index.ts
  ↓
ProductBlueprint
  ↓
UX / role / archetype planning
  ↓
semantic composition
  ↓
normalization
  ↓
tree/surface/action/typography quality
  ↓
PresentationSpec resolution
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
rendered geometry
  ↓
trusted runtime quality
  ↓
record-generation-runtime-quality
  ↓
finalEligible
```

Auditor gerçek kodda bu zincir farklıysa **gerçek production path'i esas almalıdır** ve farkı report'a yazmalıdır.

---

# 4. Bilinen Ana Dosyalar

Certification sırasında özellikle aşağıdaki dosyalar trace edilmelidir.

## Shared Design Contracts

```text
packages/design-spec/src/types.ts
packages/design-spec/src/index.ts
packages/design-spec/src/version.ts
packages/design-spec/src/strategy.ts
packages/design-spec/src/presentation-spec.ts
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

## Generation Backend

```text
supabase/functions/generate/index.ts
supabase/functions/generate/domain.ts
supabase/functions/generate/quality.ts
supabase/functions/generate/runtime-quality.ts
supabase/functions/record-generation-runtime-quality/index.ts
```

## Prompts

```text
supabase/functions/generate/prompts/planning.md
supabase/functions/generate/prompts/composition.md
supabase/functions/generate/prompts/content.md
supabase/functions/generate/prompts/contract.md
```

## Web Generation / Job

```text
apps/web/src/services/generationService.ts
apps/web/src/features/app/dashboard/useDashboardComposer.ts
apps/web/src/features/studio/state/useGenerationJob.ts
apps/web/src/features/studio/state/useStudioGeneration.ts
```

## Renderer

```text
apps/web/src/features/studio/canvas/PhoneScreen.tsx
apps/web/src/features/studio/canvas/componentRegistry.ts
apps/web/src/features/studio/canvas/PhoneScreen.test.ts
apps/web/src/features/studio/canvas/componentRegistry.test.ts
```

## Studio

```text
apps/web/src/features/studio/StudioPage.tsx
apps/web/src/features/studio/StudioPage.module.css
apps/web/src/features/studio/hooks/useStudioState.ts
apps/web/src/features/studio/state/useStudioDocument.ts
apps/web/src/features/studio/state/useStudioHistory.ts
apps/web/src/features/studio/state/useStudioSelection.ts
apps/web/src/features/studio/state/useStudioUiState.ts
```

## Template UI

```text
apps/web/src/features/app/dashboard/DashboardSections.tsx
apps/web/src/features/app/templates/TemplatesPage.tsx
apps/web/src/features/app/dashboard.data.ts
```

---

# 5. Floriven Design Engine'in Değişmez Yasaları

Aşağıdaki kurallar release-level invariant'tır.

```text
I-001 STYLE MUST NOT DECIDE UX.

I-002 PRESET MUST NOT MUTATE SEMANTIC STRUCTURE.

I-003 AUTO MUST NOT MUTATE SEMANTIC STRUCTURE.

I-004 PRESET AND AUTO MUST RESOLVE THROUGH A COMMON PRESENTATION CONTRACT.

I-005 RENDERER MUST NOT REQUIRE PRESET IDENTITY TO DECIDE SEMANTIC STRUCTURE.

I-006 CARD IS NOT A GENERIC CONTAINER.

I-007 GENERIC CARD NESTING IS FORBIDDEN.

I-008 STRUCTURAL REDUNDANCY MUST BE NORMALIZED OR REJECTED.

I-009 ARCHETYPE RULES MUST CONSTRAIN COMPOSITION.

I-010 PATTERN REGISTRY MUST BE AUTHORITATIVE OVER AD-HOC PRIMITIVE COMPOSITION.

I-011 ACTION INTENT MUST CONTROL ACTION EMPHASIS.

I-012 FOCUSED FLOWS MUST NOT RETAIN ROOT NAVIGATION.

I-013 OPERATIONAL SCREENS MUST NOT BE DOMINATED BY MARKETING HERO TYPOGRAPHY.

I-014 EMPTY INTERACTIVE SURFACES ARE FORBIDDEN.

I-015 UNSUPPORTED RENDERER NODES MUST NOT FAIL SILENTLY.

I-016 DUPLICATE NODE IDS ARE FORBIDDEN.

I-017 GEOMETRY-CRITICAL FAILURES MUST BLOCK FINAL.

I-018 CRITICAL STATIC QUALITY FAILURES MUST BLOCK FINAL.

I-019 TRUSTED RUNTIME EVIDENCE MUST BE REQUIRED FOR FINAL.

I-020 CLIENT MUST NOT BE ABLE TO FORGE FINAL ELIGIBILITY.

I-021 REPAIR MUST BE TARGETED AND IDENTITY SAFE.

I-022 CRITIC REPAIR MUST NOT SILENTLY ALTER UNRELATED SCREENS.

I-023 SCHEMA VALID DOES NOT IMPLY DESIGN VALID.

I-024 PRESET IDENTITY MUST REMAIN VISUAL, NOT PRODUCT SEMANTIC.

I-025 QUALITY GATES MUST BE EXECUTABLE, NOT DOCUMENTATION-ONLY.
```

---

# 6. Hard Invariant Acceptance Matrix

Aşağıdaki invariant'lar **%100** geçmelidir.

| ID | Invariant | Beklenen |
|---|---|---:|
| H-001 | Style semanticHash'i değiştiremez | %100 PASS |
| H-002 | 5 preset semantic parity | %100 PASS |
| H-003 | Auto semantic parity | %100 PASS |
| H-004 | Nested generic Card | 0 |
| H-005 | Empty interactive surface | 0 |
| H-006 | Invalid FAB | 0 |
| H-007 | Focused flow root bottom nav | 0 |
| H-008 | Duplicate page heading | 0 |
| H-009 | Unsupported renderer silent failure | 0 |
| H-010 | Duplicate node IDs | 0 |
| H-011 | Critical geometry issue in FINAL | 0 |
| H-012 | Critical static issue in FINAL | 0 |
| H-013 | Client-forged finalEligible | impossible |
| H-014 | Missing trusted runtime evidence → FINAL | impossible |
| H-015 | Repair unrelated semantic mutation | 0 |

Bir tanesi bile FAIL ise:

```text
NOT CERTIFIED
```

---

# 7. Phase 0 — Environment ve Test Discovery

Auditor hiçbir package command'ını varsaymamalıdır.

Önce gerçek repo içinden şunları bulmalıdır:

```text
package manager
workspace manager
test commands
build commands
lint commands
typecheck commands
Supabase local test commands
integration test commands
e2e commands
benchmark commands
```

Kaynaklar:

```text
package.json
workspace config
pnpm/yarn/npm scripts
Supabase config
README
CI workflows
```

Auditor report'a exact command'ları yazmalıdır.

## Minimum

- Unit test
- Typecheck
- Build
- DesignSpec contract testleri
- Renderer testleri
- Generation quality testleri

çalıştırılabiliyorsa çalıştırılmalıdır.

Çalıştırılamayan critical test:

```text
NOT VERIFIED
```

olur.

---

# 8. Phase 1 — Architecture Trace

Her production stage için tablo çıkarılmalıdır:

| Stage | Source file | Input | Output | Validation | Tests | Bypass |
|---|---|---|---|---|---|---|
| Dashboard selection | | | | | | |
| generationService | | | | | | |
| ProductBlueprint | | | | | | |
| UX/archetype | | | | | | |
| composition | | | | | | |
| normalize | | | | | | |
| quality | | | | | | |
| PresentationSpec | | | | | | |
| persistence | | | | | | |
| renderer | | | | | | |
| runtime quality | | | | | | |
| finalEligible | | | | | | |

Aşağıdaki soru her stage için cevaplanmalı:

```text
Bu stage gerçekten production path üzerinde mi?
Yoksa yalnızca dosya/test seviyesinde mi var?
```

---

# 9. Phase 2 — Semantic / Presentation Isolation Certification

## 9.1 Semantic Freeze

Semantic composition tamamlandıktan sonra semantic tree freeze/hash edilmelidir.

Hash en az:

```text
screen IDs
node IDs
node types
semantic roles
pattern IDs
children order
action semantics
navigation relationships
information relationships
```

içermelidir.

Presentation-only alanlar hash dışında kalabilir:

```text
color
font
radius
border
shadow
visual token
surface visual treatment
```

## 9.2 Preset Parity Test

Aynı SemanticDesignSpec'e:

```text
Obsidian Precision
Serene Flow
Terracotta Atelier
Electric Pulse
Editorial Grid
```

uygulanır.

Beklenen:

```text
semanticHash(obsidian)
=
semanticHash(serene)
=
semanticHash(terracotta)
=
semanticHash(electric)
=
semanticHash(editorial)
```

## 9.3 Auto Parity

Aynı SemanticDesignSpec'e Auto presentation uygulanır.

Beklenen:

```text
semanticHash(auto)
=
semanticHash(presets)
```

## 9.4 Release Blocker

Aşağıdakilerden herhangi biri RELEASE BLOCKER:

- Style node ekliyor.
- Style node siliyor.
- Style child order değiştiriyor.
- Style action değiştiriyor.
- Style navigation değiştiriyor.
- Style screen archetype değiştiriyor.
- Style content hierarchy değiştiriyor.

---

# 10. Phase 3 — Preset Single Source of Truth Certification

Auditor aşağıdakileri araştırmalıdır:

```text
strategy.ts
backend allowlist
template page metadata
dashboard metadata
CSS mapping
generated strategy artifacts
```

Beklenen:

```text
canonical preset owner = shared strategy catalog
```

Backend güvenlik allowlist'i shared catalogdan türemelidir.

## Fail durumları

```text
Aynı preset ID manuel olarak 2+ source'ta tanımlı.
Backend ile frontend preset listesi drift edebilir.
Dashboard farklı metadata source kullanıyor.
Preset rename birden fazla bağımsız manuel değişiklik gerektiriyor.
```

Manuel duplicate source:

```text
MAJOR
```

Eğer bu duplication semantic generation farkına sebep olabiliyorsa:

```text
RELEASE BLOCKER
```

---

# 11. Phase 4 — Structural Red-Team Certification

Bu bölümde sistem kasıtlı malformed yapılarla test edilir.

---

## 11.1 Nested Card Direct

Fixture:

```text
Card
└── Card
```

Beklenen:

```text
reject / normalize / hard quality fail
```

FINAL olamaz.

Issue:

```text
NESTED_CARD
```

---

## 11.2 Nested Card Indirect

Fixture:

```text
Card
└── Column
    └── Group
        └── Card
```

Beklenen:

```text
NESTED_CARD
```

Ancestor traversal ile yakalanmalıdır.

---

## 11.3 Excessive Surface Depth

Fixture:

```text
Surface(elevated)
└── Group
    └── Surface(elevated)
        └── Surface(elevated)
```

Beklenen:

```text
EXCESSIVE_SURFACE_DEPTH
```

---

## 11.4 Redundant Wrappers

Fixture:

```text
Column
└── Column
    └── Column
```

Beklenen:

```text
tree simplifier collapse
```

---

## 11.5 Single Child Groups

Fixture:

```text
Group
└── Group
    └── Text
```

Semantik rol yoksa collapse edilmelidir.

---

## 11.6 Excessive Tree Depth

Test derinliği kontrollü olarak artır.

Expected:

```text
warning/fail threshold
```

Production target:

```text
maxTreeDepth <= project threshold
```

Threshold gerçek koddan doğrulanmalı.

---

## 11.7 Duplicate Node IDs

İki node aynı ID ile inject edilir.

Expected:

```text
hard fail
```

FINAL impossible.

---

# 12. Phase 5 — Card / Surface Semantics Certification

Her Card için auditor şu soruyu sormalıdır:

```text
Bu Card bağımsız semantic entity mi?
```

Allowed örnekler:

```text
independent entity
selectable entity
summary entity
self-contained action object
```

Forbidden kullanım:

```text
section wrapper
spacing tool
form grouping
settings grouping
generic list wrapper
chart wrapper solely for decoration
```

## Metrics

Her screen için:

```json
{
  "cardCount": 0,
  "surfaceCount": 0,
  "nestedCardCount": 0,
  "maxSurfaceDepth": 0,
  "semanticBlockCount": 0,
  "cardRatio": 0.0
}
```

## Certification Rule

```text
nestedCardCount must equal 0
```

`cardRatio` tek başına hard threshold olmak zorunda değildir; archetype bağlamıyla değerlendirilmelidir.

---

# 13. Phase 6 — Archetype Certification

Her archetype ayrı certify edilir.

---

## 13.1 Dashboard

Beklenen:

```text
concise summary
prioritized metrics
useful status
clear primary next step if relevant
```

Fail sinyalleri:

```text
Card/Card/Card/Card as default
hero blocks useful content
all metrics equal visual weight
```

---

## 13.2 Dense List

Beklenen:

```text
scanability
compact/appropriate row density
search/filter when relevant
semantic repeated rows
```

Fail:

```text
each row = oversized card
low information density
repeated 100–150px blocks for simple data
```

---

## 13.3 Detail

Beklenen:

```text
identity
critical facts
supporting information
contextual actions
```

Fail:

```text
marketing hero
unrelated FAB
all details isolated in decorative cards
```

---

## 13.4 Form

Required:

```text
real task-completion fields
logical field sections
valid completion action
field validation model
```

Forbidden:

```text
hero
FAB
root bottom navigation
decorative card-based form architecture
```

Form domain completeness test edilmelidir.

Örneğin invoice form domain'i:

```text
customer
items
quantity
price
tax
due date
notes
total
```

gibi gerekli verileri kaybetmemelidir.

---

## 13.5 Settings

Required:

```text
grouped settings
SettingsRow semantics
real controls
switch/select/navigation rows
compact hierarchy
```

Forbidden:

```text
hero
FAB
every setting = Card
empty selector
empty visual control
```

Expected example:

```text
Görünüm

Tema                         Koyu >
Para Birimi                   TRY >

Bildirimler

Fiyat uyarıları                ●
Haber bildirimleri             ●
```

---

## 13.6 Analytics

Required chain:

```text
Question
↓
Metric
↓
Visualization
↓
Insight
```

Her chart minimum:

```text
dimension
measure
unit/context
series
insight
```

taşımalıdır.

Fail:

```text
Aylık Trend
[chart]

```

gibi anlam taşımayan placeholder analytics.

---

# 14. Phase 7 — Typography Certification

## Semantic Roles

Renderer/generation aşağıdaki veya eşdeğer semantic typography rollerini desteklemelidir:

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

## Hard Expectations

Operational screens:

```text
display hero forbidden unless explicitly justified
page title max practical line count
```

Form:

```text
hero forbidden
```

Settings:

```text
hero forbidden
```

Analytics:

```text
long explanatory hero discouraged/forbidden
```

Dashboard:

```text
limited display usage
```

## Duplicate Heading

Örnek:

```text
PİYASA ÖZETİ
Piyasa Özeti
```

Expected:

```text
DUPLICATE_PAGE_HEADING
```

## Turkish Torture Strings

Aşağıdaki içerikler farklı typography rolleri üzerinde test edilmelidir:

```text
Uluslararası Para Transferleri ve Döviz İşlemleri

Otomatik Yenilenen Aboneliklerin Yönetimi

Bekleyen Fatura Hatırlatmalarını Etkinleştir

Kurumsal Müşteri İletişim Tercihleri

Uzun Vadeli Bireysel Emeklilik ve Yatırım Planlaması
```

Kontrol:

```text
unexpected overflow
4–6 line operational title
button overflow
nav label break
settings row destruction
```

---

# 15. Phase 8 — Action Semantics Certification

Her action semantic intent taşımalıdır.

Beklenen intent ailesi:

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

## FAB

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

## Sabotage Fixtures

```text
Settings + FAB(edit)
Analytics + FAB(filter)
Form + FAB(save)
Detail + duplicate primary action
```

Expected:

```text
INVALID_FAB
WRONG_ACTION_EMPHASIS
DUPLICATE_PRIMARY_ACTION
```

---

# 16. Phase 9 — Navigation Certification

Navigation existence UX concern'dür.

Navigation appearance presentation concern'dür.

## Navigation Modes

```text
root
focused
modal
wizard
```

## Focused Flow Fixtures

```text
New Invoice
Edit Profile
Checkout
Wizard Step
Onboarding
```

Expected:

```text
root bottom navigation absent
```

Violation:

```text
FOCUSED_FLOW_BOTTOM_NAV
```

## Active State

Child screen root destination altında ise relationship explicit olmalıdır.

Ambiguous active nav state:

```text
MAJOR
```

---

# 17. Phase 10 — Renderer Certification

Trace:

```text
DesignSpec
↓
componentRegistry
↓
PhoneScreen
↓
generated CSS/presentation
```

Her supported component/pattern için:

```text
input props
visible output
typed content
action
a11y
fallback behavior
```

kontrol edilmelidir.

## Critical Renderer Failures

### Empty Interactive Surface

Fixture:

```text
Theme selector exists semantically
but renders empty box
```

Expected:

```text
EMPTY_INTERACTIVE_SURFACE
```

FINAL impossible.

### Unsupported Component

Unknown type inject edilir.

Renderer:

```text
silent empty box
```

çizemez.

Beklenen:

```text
explicit failure / quality issue / safe diagnostic
```

### Missing Props

Required prop eksik.

Beklenen:

```text
validation/quality fail
```

Silent corruption yok.

---

# 18. Phase 11 — Geometry Certification

Trusted rendered bounds üzerinden kontrol:

```text
text overflow
horizontal overflow
overlap
clipping
safe area
FAB collision
bottom-nav collision
sticky collision
hidden content
oversized block
huge empty region
empty interactive surface
```

## Critical Geometry

Aşağıdakiler FINAL'i bloklamalıdır:

```text
component overlap
unreadable clipping
empty primary control
horizontal overflow
content hidden under navigation
critical safe area violation
```

## Viewport Budget

Her screen için minimum:

```text
header viewport ratio
first useful content offset
largest block ratio
above-fold primary task visibility
```

Operational screen'de ilk viewport'un çoğunu sadece explanation/hero tüketmesi MAJOR veya BLOCKER olabilir.

---

# 19. Phase 12 — Content Certification

Content UI implementation terminology sızdırmamalıdır.

Forbidden veya flagged örnekler:

```text
KPI Kartları
Bilgi Kartı
Liste Kartı
İçerik Bölümü
Ana CTA
Secondary Action
```

Issue:

```text
IMPLEMENTATION_TERMINOLOGY
```

## Screen Goal vs Content

Örnek:

```text
Screen: Piyasa Özeti

Content:
personal portfolio total
personal daily gain
personal risk score
```

Screen goal/content mismatch test edilmelidir.

Issue:

```text
SCREEN_CONTENT_GOAL_MISMATCH
```

---

# 20. Phase 13 — Typed Content / Locale Certification

Typed content contract production path üzerinde doğrulanmalıdır.

Minimum:

```text
Currency
Date
Percentage
numeric values
form values
```

## Extreme Values

Test:

```text
₺999.999.999.999,99
+%1.284,32
999999999999
```

## Long Entity Names

```text
Muhammed Abdulrahman Al-Khatib Yılmaz

Uluslararası Dijital Teknoloji Çözümleri Sanayi ve Ticaret A.Ş.
```

## Requirements

```text
amount must not silently truncate
locale formatting consistent
data type must remain semantic
renderer owns formatting where architecture requires
```

---

# 21. Phase 14 — Auto Mode Certification

Auto named preset fallback gibi davranmamalıdır.

Auditor şunları kanıtlamalıdır:

```text
Auto UX structure değiştirmez.
Auto PresentationSpec üretir.
Auto named preset identity seçmek zorunda değildir.
Auto failure neutral internal fallback kullanır.
```

## Visual Diversity Test

En az 12 unrelated domain üzerinde Auto çalıştırılır.

Aşağıdaki tekrarlayan house-style paterni aranır:

```text
light background
white rounded cards
teal accent
same typography
same radius
same surface hierarchy
```

Auto her domain'de aynı görsel konsepte snap ediyorsa:

```text
MAJOR
```

Auto UX farklılaştırıyorsa:

```text
RELEASE BLOCKER
```

---

# 22. Phase 15 — Preset Identity Certification

Presetler yalnızca palette skin olmamalıdır.

Her preset için şu test uygulanır:

```text
Renkleri grayscale yapsak bile
tasarım karakteri hissediliyor mu?
```

## Obsidian Precision

Beklenen karakter:

```text
technical
precise
data-oriented
controlled density
fine dividers
restrained cyan/accent
tabular emphasis
selective elevation
```

Fail örneği:

```text
dark + navy cards + cyan everywhere
```

## Serene Flow

Beklenen:

```text
calm
human
soft
restrained
comfortable
```

Fail:

```text
wellness template
giant rows
card everywhere
```

## Terracotta Atelier

Beklenen:

```text
warm
crafted
editorial accents
controlled serif
tactile
```

Fail:

```text
operational screen = magazine cover
all secondary actions orange CTA
```

## Electric Pulse

Beklenen:

```text
energetic
expressive
modern
controlled accent budget
```

Fail:

```text
everything purple
everything primary
```

## Editorial Grid

Beklenen:

```text
flat
structured
divider-driven
typography-led
clear density
```

Fail:

```text
6-line serif form titles
poster layout on operational screens
```

---

# 23. Phase 16 — Quality Pipeline Certification

Gerçek chain trace edilmelidir:

```text
static quality
↓
trusted renderer
↓
geometry
↓
visual critic
↓
cross-screen critic
↓
runtime quality
↓
finalEligible
```

## Required Guarantees

```text
client finalEligible belirleyemez
missing trusted runtime evidence FINAL olamaz
critical static issue average visual score ile gizlenemez
critical geometry issue FINAL olamaz
```

## Quality Bypass Test

Kasıtlı:

```text
finalEligible = true
```

client tarafından gönderilmeye çalışılır.

Expected:

```text
ignored/rejected/server-derived
```

---

# 24. Phase 17 — Visual Critic Certification

Visual critic screenshot/rendered output üzerinden çalışmalıdır.

Sadece JSON tree incelemesi yeterli değildir.

## Required Rubric

Her screen:

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
contentRealism
```

Cross-screen:

```text
crossScreenConsistency
screenDifferentiation
```

## Minimum Final Thresholds

Release certification için önerilen minimum:

```text
overall >= 8.2

taskClarity >= 8.0
patternSuitability >= 8.0
visualHierarchy >= 8.0
navigation >= 8.0
surfaceUsage >= 7.5
typography >= 7.5
informationDensity >= 7.5
crossScreenConsistency >= 8.0
screenDifferentiation >= 7.5
```

Critical issue varsa score ne olursa olsun FAIL.

---

# 25. Phase 18 — Repair Loop Certification

Bir design'a aynı anda birkaç defect inject edilmelidir.

Örnek:

```text
nested card
oversized title
invalid FAB
```

Critic beklenen issue'ları bulmalıdır.

Repair sonrası:

```text
target issues removed
unrelated semantic structure unchanged
node IDs stable
navigation unchanged unless targeted
no new high/critical issue
```

## Required Identity Rule

Repair success:

```text
Target issue resolved
+
Unrelated semantic hash unchanged
+
No new critical/high issue
```

## Loop Bound

Repair sonsuz olamaz.

Gerçek code threshold trace edilmeli.

Beklenen:

```text
max 2–3 cycles
```

veya projedeki explicit bound.

---

# 26. Phase 19 — Cross-Screen Certification

Aynı uygulamanın tüm screen set'i birlikte değerlendirilmelidir.

İki metrik aynı anda önemlidir:

```text
CONSISTENCY
+
DIFFERENTIATION
```

## Consistency

```text
typography roles
spacing language
navigation language
action semantics
entity representation
visual tokens
```

## Differentiation

```text
dashboard != settings
settings != analytics
analytics != form
form != dense list
```

Aynı:

```text
Header → Huge Title → Card → Card → FAB
```

signature çoğu screen'de tekrar ediyorsa MAJOR.

---

# 27. Phase 20 — Benchmark Suite

## Minimum Known Benchmark Set

Aşağıdaki 12 domain mandatory'dir:

```text
01 Finance
02 Restaurant Operations
03 E-commerce
04 Project Management
05 Fitness
06 Travel
07 CRM
08 Inventory
09 Education
10 Booking
11 Subscription Management
12 Logistics
```

Her benchmark en az:

```text
dashboard
dense list
detail
form
settings
analytics
```

archetype çeşitliliği sağlamalıdır.

---

# 28. Known Benchmark Promptları

Aşağıdaki promptlar audit için kullanılabilir. Auditor production generation'ın kabul ettiği dile/format'a göre aynı intent'i koruyarak çağırmalıdır.

---

## B-01 Finance

```text
Freelancerlar ve bağımsız çalışanlar için kişisel finans ve fatura yönetimi mobil uygulaması tasarla.

Kullanıcı bu ayki gelirini, giderini, toplam bakiyesini, ödenmemiş faturalarını ve vergi için ayırması gereken miktarı görebilmeli.

İşlemler ekranında çok sayıda gelir ve gider kaydını tarayabilmeli, arayabilmeli ve filtreleyebilmeli.

Faturalar taslak, gönderildi, gecikti ve ödendi durumlarını desteklemeli.

Yeni fatura oluşturma ekranında müşteri, hizmet kalemleri, miktar, fiyat, vergi, son ödeme tarihi ve not alanları bulunmalı.

Analiz ekranı yalnızca dekoratif grafik değil, gelir-gider trendleri ve karar vermeye yardımcı insight'lar sunmalı.

Profil ve ayarlar bölümü para birimi, bildirim ve hesap tercihlerini içermeli.
```

---

## B-02 Restaurant Operations

```text
Bir restoran yöneticisinin günlük operasyonlarını yöneteceği mobil uygulama tasarla.

Rezervasyonlar, masa doluluğu, bekleyen misafirler, menü yönetimi, stokta azalan ürünler, sipariş takibi ve personel durumları olmalı.

Rezervasyon ekranında saat, müşteri, kişi sayısı, masa ve durum bilgileri hızlı taranabilmeli.

Menü yönetiminde ürün adı, kategori, fiyat, stok durumu ve düzenleme aksiyonları bulunmalı.

Ayarlar gerçek grouped settings yapısında olmalı.

Her ekran kendi operasyonel görevine uygun bilgi yoğunluğuna sahip olmalı.
```

---

## B-03 E-commerce

```text
Küçük bir e-ticaret işletmesinin mobil yönetim uygulamasını tasarla.

Dashboard'da günlük ciro, sipariş sayısı, iade, bekleyen kargo ve kritik stok bilgileri olmalı.

Siparişler yoğun liste şeklinde aranabilir ve durum filtreli olmalı.

Ürün detayında stok, varyant, fiyat, satış performansı ve düzenleme aksiyonları bulunmalı.

Yeni ürün oluşturma gerçek bir form flow olmalı.

Analytics en çok satan ürünleri, dönüşümü ve gelir trendini insight ile göstermeli.

Ayarlar grouped settings row yapısında olmalı.
```

---

## B-04 Project Management

```text
Yazılım ekipleri için mobil proje ve görev yönetimi uygulaması tasarla.

Projeler, sprintler, görevlar, ekip üyeleri, deadline'lar ve aktivite akışı bulunmalı.

Görev listesi yüksek taranabilirliğe sahip olmalı.

Görev detayında durum, assignee, priority, tarih, açıklama ve yorumlar yer almalı.

Yeni görev oluşturma bir form olmalı.

Analytics tamamlanan işler, geciken görevler ve velocity hakkında anlamlı insight vermeli.
```

---

## B-05 Fitness

```text
Kişisel antrenman ve gelişim takibi için mobil fitness uygulaması tasarla.

Dashboard günlük planı, haftalık ilerlemeyi ve önemli metrikleri göstermeli.

Antrenman listesi yoğun ve taranabilir olmalı.

Antrenman detayında hareketler, setler, tekrarlar ve dinlenme bilgileri bulunmalı.

Yeni antrenman programı oluşturma gerçek bir form/wizard olmalı.

Analytics performans trendlerini ve anlamlı gelişim insight'larını göstermeli.
```

---

## B-06 Travel

```text
Kullanıcının seyahat planlarını, rezervasyonlarını ve günlük rotasını yöneteceği mobil uygulama tasarla.

Seyahat özeti, uçuş, otel, yapılacaklar ve günlük plan bulunmalı.

Rezervasyon listeleri taranabilir olmalı.

Rezervasyon detayları gerçek bilgi hiyerarşisiyle gösterilmeli.

Yeni gezi oluşturma form/wizard olmalı.

Ayarlar grouped row yapısında olmalı.
```

---

## B-07 CRM

```text
Küçük satış ekipleri için mobil CRM tasarla.

Dashboard pipeline değeri, açık fırsatlar, bugünkü görevler ve riskli fırsatları göstermeli.

Müşteriler ve fırsatlar yoğun liste olarak aranabilir ve filtrelenebilir olmalı.

Fırsat detayında şirket, değer, aşama, olasılık, owner, aktiviteler ve next action bulunmalı.

Yeni fırsat oluşturma gerçek form olmalı.

Analytics pipeline dönüşümü ve satış trendleri için insight vermeli.
```

---

## B-08 Inventory

```text
Depo ve stok yönetimi için mobil operasyon uygulaması tasarla.

Dashboard kritik stok, bekleyen girişler, bekleyen çıkışlar ve stok değerini göstermeli.

Ürün/stok listesi yoğun olmalı ve kategori, depo ve stok seviyesi ile filtrelenebilmeli.

Ürün detayında stok hareketleri, minimum stok, depolar ve son hareketler yer almalı.

Yeni stok hareketi bir form olmalı.

Analytics stok devir hızı ve kritik ürünler hakkında insight vermeli.
```

---

## B-09 Education

```text
Öğrenciler için ders ve çalışma planlama mobil uygulaması tasarla.

Dashboard bugünkü dersleri, yaklaşan sınavları ve çalışma hedeflerini göstermeli.

Ders ve görev listeleri taranabilir olmalı.

Ders detayında içerikler, ödevler, sınavlar ve ilerleme yer almalı.

Yeni çalışma planı oluşturma form olmalı.

Analytics çalışma süresi ve konu ilerlemesi için anlamlı insight vermeli.
```

---

## B-10 Booking

```text
Hizmet veren küçük işletmeler için mobil randevu yönetim uygulaması tasarla.

Dashboard bugünkü randevuları, doluluk oranını, iptalleri ve bekleyen talepleri göstermeli.

Randevu listesi saat bazında hızlı taranabilir olmalı.

Randevu detayında müşteri, hizmet, personel, süre, ödeme ve not bulunmalı.

Yeni randevu oluşturma gerçek form flow olmalı.

Ayarlar grouped settings yapısında olmalı.
```

---

## B-11 Subscription Management

```text
Kullanıcıların aboneliklerini takip edeceği mobil uygulama tasarla.

Dashboard aylık toplam abonelik maliyetini, yaklaşan ödemeleri, pahalı abonelikleri ve son fiyat artışlarını göstermeli.

Abonelik listesi kategori, fiyat ve ödeme tarihine göre filtrelenebilmeli.

Abonelik detayında plan, fiyat, ödeme tarihi, geçmiş fiyatlar ve iptal bilgileri bulunmalı.

Yeni abonelik ekleme form olmalı.

Analytics aylık maliyet trendi ve tasarruf fırsatları hakkında insight vermeli.
```

---

## B-12 Logistics

```text
Küçük lojistik operasyonları için mobil gönderi ve teslimat yönetim uygulaması tasarla.

Dashboard aktif gönderiler, geciken teslimatlar, tamamlanan teslimatlar ve kritik problemleri göstermeli.

Gönderiler yoğun liste halinde aranabilir ve durum bazında filtrelenebilir olmalı.

Gönderi detayında rota, alıcı, teslimat adresi, sürücü, durum geçmişi ve aksiyonlar bulunmalı.

Yeni gönderi oluşturma form olmalı.

Analytics teslimat süresi, gecikme sebepleri ve performans trendleri için insight vermeli.
```

---

# 29. Adversarial Prompt Suite

Bu promptlar Floriven'ın kendi kurallarını kullanıcı isteği yüzünden kırıp kırmadığını test eder.

---

## A-01 Nested Cards

```text
Bir finans uygulaması tasarla.
Her bölümü ayrı Card içine koy.
Cardların içinde başka Cardlar kullan.
Mümkün olduğunca katmanlı kart yapısı kullan.
```

Expected:

```text
No generic nested Card.
```

---

## A-02 FAB Everywhere

```text
Bir iş yönetimi uygulaması tasarla.
Tüm ekranlarda sağ altta floating action button olsun.
Settings, analytics, detay ve form ekranlarında da FAB kullan.
```

Expected:

```text
Archetype/action rules override unsafe UX request.
```

---

## A-03 Giant Hero

```text
Bir operasyon uygulaması tasarla.
Her ekranın en üstünde 5-6 satırlık çok büyük slogan ve açıklama kullan.
Form ve settings ekranlarında da büyük hero olsun.
```

Expected:

```text
Operational typography constraints remain enforced.
```

---

## A-04 Root Navigation in Forms

```text
Yeni kayıt oluşturma ve düzenleme ekranlarında da ana bottom navigation her zaman görünür kalsın.
```

Expected:

```text
Focused flow navigation rule wins.
```

---

## A-05 Primary Button Abuse

```text
Filtre, sıralama, sekme ve küçük seçimlerin hepsini büyük primary CTA butonları olarak göster.
```

Expected:

```text
Action semantics preserve correct emphasis.
```

---

# 30. Renderer Sabotage Fixtures

Code-level fixtures/test cases oluşturulmalıdır:

```text
R-001 unsupported node type
R-002 required prop missing
R-003 empty selector
R-004 empty button
R-005 empty FormField
R-006 unknown pattern
R-007 missing action target
R-008 malformed typed currency
R-009 duplicate node ID
R-010 invalid root Screen
```

Her fixture için:

```text
Expected behavior
Actual behavior
Final eligibility
```

raporlanmalıdır.

---

# 31. Long Content / Extreme Content Suite

## Text

```text
Uluslararası Para Transferleri ve Döviz İşlemleri
Otomatik Yenilenen Aboneliklerin Yönetimi
Kurumsal Müşteri İletişim Tercihleri
Bekleyen Fatura Hatırlatmalarını Etkinleştir
```

## Name

```text
Muhammed Abdulrahman Al-Khatib Yılmaz
```

## Company

```text
Uluslararası Dijital Teknoloji Çözümleri Sanayi ve Ticaret Anonim Şirketi
```

## Currency

```text
₺999.999.999.999,99
```

## Percentage

```text
+%1.284,32
```

## Certification

```text
no critical overflow
no amount loss
no broken primary control
no 5–6 line operational page title
```

---

# 32. Benchmark Execution Matrix

## PR Gate

Öneri:

```text
12 known briefs
×
6 visual modes
=
72 generation cases
```

Gerekirse fixture/cached semantic stage ile maliyet düşürülebilir.

## Nightly

```text
30 briefs
×
6 modes
×
3 runs
=
540 generation cases
```

## Release Candidate

```text
nightly suite
+
human blind review
+
holdout set
```

---

# 33. Holdout Protokolü

Gerçek holdout promptlar repo içinde saklanmamalıdır.

Kurallar:

```text
1. Development sırasında görülmez.
2. Prompt tuning için kullanılmaz.
3. Release günü ilk kez çalıştırılır.
4. Bad result reroll edilmez.
5. İlk generation değerlendirilir.
6. Manual screen editing yapılmaz.
```

Minimum:

```text
10 unseen product briefs
×
6 visual modes
=
60 unseen generations
```

Holdout'ta RELEASE BLOCKER:

```text
NOT CERTIFIED
```

---

# 34. Human Blind Review

Screenshotlar preset adı olmadan reviewer'a gösterilir.

Reviewer aşağıdakileri cevaplar:

```text
1. Bu gerçek bir production app gibi mi?
2. AI template gibi mi görünüyor?
3. Primary task açık mı?
4. Primary information açık mı?
5. Primary action açık mı?
6. Gereksiz Card var mı?
7. Gereksiz boşluk var mı?
8. Component içerdiği bilgiye göre aşırı büyük mü?
9. Navigation doğal mı?
10. Bunu ship eder miydin?
```

Son soru:

```text
SHIP: YES / NO
```

Reviewers mümkünse en az 2 bağımsız kişi olmalıdır.

---

# 35. Performance Certification

Her generation için:

```text
total latency
planning latency
composition latency
render latency
critic latency
LLM call count
input tokens
output tokens
repair count
estimated cost
```

ölçülmelidir.

## Suggested Regression Limits

Baseline'a göre:

```text
p95 latency regression <= 20%
token/cost regression <= 25%
average repair cycles <= 1
max repair cycles <= configured hard limit
```

Kalite kazanımı bilinçli olarak daha yüksek maliyet gerektiriyorsa report'ta açıkça belgelenmelidir.

---

# 36. Required Quality Issue Registry

Aşağıdaki code'lar veya eşdeğer canonical issue'lar bulunmalıdır.

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

UNSUPPORTED_RENDERER_COMPONENT
DUPLICATE_NODE_ID
PRESENTATION_MUTATED_SEMANTICS
RUNTIME_QUALITY_MISSING
FINAL_ELIGIBILITY_BYPASS
```

Auditor mevcut project naming farklıysa mapping tablosu oluşturmalıdır.

---

# 37. Final Metrics Dashboard

Certification report minimum aşağıdaki metrikleri içermelidir.

```text
semanticParityPassRate
nestedCardCount
emptyInteractiveSurfaceCount
invalidFabCount
focusedFlowBottomNavViolationCount
duplicateHeadingCount
unsupportedRendererCount
duplicateNodeIdCount

maxTreeDepth
singleChildWrapperRatio
cardRatio
surfaceDepth

overflowCount
overlapCount
safeAreaViolationCount
oversizedHeadingCount
oversizedBlockCount

taskClarityAverage
patternSuitabilityAverage
visualHierarchyAverage
surfaceUsageAverage
typographyAverage
informationDensityAverage
crossScreenConsistencyAverage
screenDifferentiationAverage

repairSuccessRate
repairRegressionCount

generationLatencyP50
generationLatencyP95
averageTokenCost
averageRepairCycles
```

---

# 38. Final Certification Thresholds

## Hard Zero Targets

```text
nestedCardCount = 0
emptyInteractiveSurfaceCount = 0
invalidFabCount = 0
focusedFlowBottomNavViolationCount = 0
duplicateHeadingCount = 0
unsupportedRendererSilentFailure = 0
duplicateNodeIdCount = 0
criticalGeometryInFinal = 0
criticalStaticIssueInFinal = 0
repairRegressionCritical = 0
qualityBypass = 0
```

## Semantic

```text
preset semantic parity = 100%
auto semantic parity = 100%
```

## Visual

```text
overall >= 8.2
taskClarity >= 8.0
patternSuitability >= 8.0
visualHierarchy >= 8.0
navigation >= 8.0
surfaceUsage >= 7.5
typography >= 7.5
informationDensity >= 7.5
crossScreenConsistency >= 8.0
screenDifferentiation >= 7.5
```

## Structural

```text
singleChildWrapperRatio target < 5%
```

Bu oran hard blocker değilse bile regression olarak raporlanmalıdır.

---

# 39. Report Output Contract

Auditor şu dosyayı oluşturmalıdır:

```text
docs/certification/FLORIVEN_V2_CERTIFICATION_REPORT.md
```

Bu certification spec **değiştirilemez**.

---

# 40. Certification Report Yapısı

Report tam olarak şu ana bölümleri içermelidir:

```text
# Floriven Studio — Design Engine V2 Certification Report

## 1. Executive Verdict

## 2. Environment and Commands

## 3. Production Architecture Trace

## 4. Release Blockers

## 5. Hard Invariant Results

## 6. Semantic / Presentation Isolation

## 7. Preset Single Source of Truth

## 8. Surface / Card Certification

## 9. Structural Tree Certification

## 10. Archetype Certification

### Dashboard
### Dense List
### Detail
### Form
### Settings
### Analytics

## 11. Typography and Viewport Certification

## 12. Action and Navigation Certification

## 13. Renderer Certification

## 14. Geometry Certification

## 15. Typed Content / Locale

## 16. Preset Parity

## 17. Auto Mode Certification

## 18. Runtime Quality / finalEligible Security

## 19. Visual Critic Certification

## 20. Repair Loop Certification

## 21. Cross-Screen Certification

## 22. Known Benchmark Results

## 23. Holdout Results

## 24. Performance Regression

## 25. Security / Bypass Attempts

## 26. Major Issues

## 27. Minor Issues

## 28. Metrics Dashboard

## 29. Final Release Decision
```

---

# 41. Finding Format

Her finding şu formatta olmalıdır:

```markdown
### F-001 — <Title>

- **Classification:** RELEASE BLOCKER / MAJOR / MINOR / PASS / NOT VERIFIED
- **Subsystem:** ...
- **Files:** ...
- **Production path:** ...
- **Invariant / Rule:** ...
- **Reproduction:** ...
- **Expected:** ...
- **Actual:** ...
- **Evidence:** ...
- **Why it matters:** ...
- **Recommended fix:** ...
- **Blocks release:** Yes / No
```

---

# 42. Evidence Standardı

PASS claim evidence içermelidir.

Acceptable evidence:

```text
unit test output
integration test output
reproducible runtime output
quality JSON
semantic hash comparison
screenshot
rendered bounds
database/runtime quality record
code path with exact execution connection
```

Sadece source code presence:

```text
insufficient
```

---

# 43. Certification Anti-Patterns

Auditor bunları yapmamalıdır:

```text
- "Bu kod doğru görünüyor, PASS."
- Test çalıştırmadan PASS.
- Failed test için "muhtemelen ortam sorunu" deyip PASS.
- Spec threshold azaltmak.
- Certification spec'i değiştirmek.
- Promptu benchmark sonucuna göre tuning etmek.
- Bad generation'ı reroll edip iyisini seçmek.
- Runtime evidence eksikken FINAL kabul etmek.
- Average score ile critical issue gizlemek.
```

---

# 44. Release Blocker Quick Checklist

Final kararından önce:

```text
[ ] semantic style isolation %100
[ ] preset parity %100
[ ] auto parity %100
[ ] nested cards 0
[ ] empty interactive surfaces 0
[ ] invalid FAB 0
[ ] focused root-nav violation 0
[ ] duplicate headings 0
[ ] duplicate node IDs 0
[ ] unsupported renderer silent failure 0
[ ] critical geometry in FINAL 0
[ ] client finalEligible bypass impossible
[ ] missing trusted runtime evidence cannot FINAL
[ ] repair unrelated mutation 0
[ ] holdout critical failures 0
```

Bir checkbox boşsa:

```text
NOT CERTIFIED
```

veya critical olmayan alanlarda açık NOT VERIFIED gerekçesi verilmelidir.

---

# 45. Certification Tamamlanma Tanımı

Floriven Design Engine V2 ancak şu durumda tamamlanmış sayılır:

```text
The engine does not merely contain design rules.

The engine makes invalid design states difficult or impossible
to ship as FINAL.

Semantic UX is protected from presentation.

Presentation is isolated and deterministic enough to audit.

Structural quality is enforced before rendering.

Rendered geometry is validated.

Visual quality is judged from actual rendered output.

Critical failures cannot be hidden by aggregate scores.

Repair is targeted and identity-safe.

Release quality is reproducible through benchmarks and gates.
```

---

# 46. Nihai Hedef

```text
USER BRIEF
    │
    ▼
ProductBlueprint
    │
    ▼
UXSpec / Screen Intent
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
Semantic Freeze / Hash
    │
    ├──────────────┐
    │              │
    ▼              ▼
Preset         Auto VisualConcept
    │              │
    └──────┬───────┘
           ▼
    PresentationSpec
           │
           ▼
       Renderer
           │
           ▼
 Structural / Geometry Evidence
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
    FINAL   Targeted Repair
                │
                ▼
             Re-render
```

Certification'ın görevi bu pipeline'ın yalnızca var olduğunu değil, **gerçekten böyle çalıştığını** kanıtlamaktır.
