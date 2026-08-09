# Floriven Studio — V2 Certification Recovery Sprint Plan

> **Proje:** Floriven Studio  
> **Belge türü:** Certification Recovery Roadmap  
> **Kaynak:** `FLORIVEN_V2_CERTIFICATION_REPORT.md` sonucu — **NOT CERTIFIED**  
> **Amaç:** Certification raporundaki release blocker ve doğrulanmamış production-path enforcement noktalarını kapatmak, ardından Floriven Design Engine V2'yi yeniden sertifikasyona sokmak  
> **Önerilen sprint süresi:** 1–2 hafta / sprint  
> **Toplam:** 6 sprint  
> **Kural:** Bu roadmap tamamlanana kadar yeni preset, yeni görsel tema veya kozmetik tuning ana öncelik değildir

---

# 1. Mevcut Certification Sonucu

Certification sonucu:

```text
NOT CERTIFIED
```

Ana nedenler:

```text
F-001 Runtime quality generation finalization'a bağlı değil.
F-002 Trusted rendered-output visual critic doğrulanmamış.
F-003 Unsupported renderer component sessizce null dönüyor.
F-004 Duplicate node ID için document-wide hard gate doğrulanmamış.
```

Buna ek olarak çok sayıda V2 contract:

```text
PARTIAL
NOT VERIFIED
```

durumunda.

Ana recovery hedefi:

```text
IMPLEMENTED
   ↓
INTEGRATED
   ↓
ENFORCED
   ↓
EVIDENCED
   ↓
CERTIFIED
```

---

# 2. Recovery Programının Ana Kuralları

Bu program boyunca:

```text
1. Yeni feature eklenmez.
2. Yeni preset eklenmez.
3. Cosmetic tuning ana iş değildir.
4. Certification spec değiştirilmez.
5. Release blocker kapanmadan sonraki aşamaya geçilmez.
6. Her fix production-path test ile kanıtlanır.
7. Unit test tek başına yeterli değildir.
8. Critical quality gate bypass edilememelidir.
9. Runtime evidence FINAL için zorunlu olmalıdır.
10. Recertification tamamen ayrı audit olarak tekrar çalıştırılır.
```

---

# 3. Sprint Haritası

| Sprint | Başlık | Öncelik | Ana hedef |
|---|---|---:|---|
| Sprint R0 | Recovery Baseline & Repo Traceability | P0 | Certification source-of-truth ve test ortamını sabitle |
| Sprint R1 | Runtime Finalization Gate | P0 | F-001'i kapat |
| Sprint R2 | Trusted Renderer + Visual Evidence | P0 | F-002'yi kapat |
| Sprint R3 | Renderer Fail-Closed + Identity Integrity | P0 | F-003 ve F-004'ü kapat |
| Sprint R4 | Enforcement Integration Sweep | P1 | PARTIAL/NOT VERIFIED V2 contract'larını production'a bağla |
| Sprint R5 | Full Benchmark + Security + Recertification | P0 | 12-domain audit ve final certification |

---

# Sprint R0 — Recovery Baseline & Repo Traceability

## Amaç

Certification ortamını yeniden üretilebilir hale getirmek ve bir sonraki audit'in aynı eksikleri “NOT VERIFIED” olarak bırakmasını önlemek.

## Sorun

Certification raporunda:

```text
type-check not run
lint not verified
E2E not verified
Supabase integration not verified
benchmark execution not verified
certification spec repo path'te yok
```

bulunuyor.

## Yapılacaklar

### 1. Certification spec'i gerçek repo path'ine koy

```text
docs/certification/
├── FLORIVEN_V2_CERTIFICATION_SPEC.md
└── FLORIVEN_V2_CERTIFICATION_REPORT.md
```

Certification spec immutable kabul edilmeli.

### 2. Certification command set'i doğrula

Gerçek repo scriptlerinden:

```text
build
type-check
lint
unit tests
E2E
generation architecture
benchmark validate
benchmark execute
```

komutlarını çıkar.

### 3. Tek certification script

Önerilen:

```text
scripts/certification/run-certification-preflight.*
```

Amaç:

```text
pnpm build
pnpm type-check
pnpm lint
pnpm test
pnpm test:e2e
pnpm test:generation-architecture
pnpm benchmarks:validate
```

gibi gerçek command set'i tek entrypoint altında toplamak.

### 4. Evidence klasörü

```text
docs/certification/evidence/
├── commands/
├── unit/
├── integration/
├── runtime/
├── benchmark/
└── screenshots/
```

### 5. Source revision

Her certification:

```text
git commit SHA
branch
dirty/clean status
date
```

ile kayıt edilmeli.

`local-uncommitted` final benchmark kabul edilmemeli.

## Acceptance Criteria

- [ ] Certification spec repo içinde doğru path'te.
- [ ] Build PASS.
- [ ] Type-check PASS.
- [ ] Lint PASS.
- [ ] Unit tests PASS.
- [ ] E2E command en azından çalıştırılabilir durumda.
- [ ] Supabase integration command doğrulandı.
- [ ] Certification evidence revision'a bağlı.
- [ ] Final audit dirty workspace üzerinde yapılmıyor.

## Definition of Done

```text
Certification environment reproducible.
```

---

# Sprint R1 — Runtime Finalization Gate

## Amaç

**F-001 — Runtime quality is not part of generation finalization** blocker'ını tamamen kapatmak.

## Kritik Problem

Mevcut akışta:

```text
generate/index.ts
↓
static qualityReport
↓
job complete
```

olabiliyor.

Ancak certification mimarisinde:

```text
generation candidate
↓
static quality
↓
trusted runtime evidence
↓
geometry
↓
visual critic
↓
cross-screen critic
↓
evaluateRuntimeQuality()
↓
finalEligible
```

zorunlu olmalı.

## Ana Dosyalar

```text
supabase/functions/generate/index.ts
supabase/functions/generate/runtime-quality.ts
supabase/functions/record-generation-runtime-quality/index.ts
packages/design-spec/src/runtime-quality.ts
packages/design-spec/src/production-gates.ts
packages/design-spec/src/critic-gate.ts
```

## Yapılacaklar

### 1. Disabled quality gate kaldır

Şu sınıftaki kod:

```ts
if (false && !qualityReport.passed) {
  ...
}
```

tamamen kaldırılmalı.

Quality gate gerçek condition ile çalışmalı.

### 2. Job state modelini ayır

Önerilen lifecycle:

```text
queued
↓
generating
↓
candidate_ready
↓
runtime_review_pending
↓
runtime_review_complete
↓
final / preview / failed
```

`generation completed` ile `finalEligible` aynı kavram olmamalı.

### 3. Runtime evidence olmadan FINAL yasak

Server-side:

```ts
if (!runtimeQualityReport) {
  finalEligible = false;
}
```

hard invariant.

### 4. Static critical issue FINAL bloklasın

```text
critical static issue
→ finalEligible false
```

Average critic score bunu override edemez.

### 5. Geometry critical issue FINAL bloklasın

```text
critical geometry issue
→ finalEligible false
```

### 6. Runtime evaluator final source olsun

Final kararının canonical sahibi:

```text
evaluateRuntimeQuality(...)
```

veya projedeki eşdeğer tek server-side function olmalı.

### 7. Job persistence

Persist:

```text
static_quality_report
runtime_quality_report
final_eligible
final_decision_reason
quality_version
```

### 8. Client davranışı

Client:

```text
finalEligible
```

hesaplamaz.

Yalnız server sonucunu okur.

## Testler

### T-R1-01

Runtime evidence yok:

```text
Expected: PREVIEW / NOT FINAL
```

### T-R1-02

Static critical issue var:

```text
Expected: finalEligible false
```

### T-R1-03

Geometry critical issue var:

```text
Expected: finalEligible false
```

### T-R1-04

Visual average yüksek ama critical issue var:

```text
Expected: finalEligible false
```

### T-R1-05

All gates pass:

```text
Expected: finalEligible true
```

### T-R1-06

Client `finalEligible=true` gönderir:

```text
Expected: ignored/rejected
```

## Acceptance Criteria

- [ ] `generate/index.ts` runtime quality sistemini bypass ederek FINAL üretemiyor.
- [ ] Missing runtime evidence FINAL olamıyor.
- [ ] Static critical issue FINAL olamıyor.
- [ ] Geometry critical issue FINAL olamıyor.
- [ ] Client finalEligible forge edemiyor.
- [ ] Final decision server-derived.
- [ ] Integration test gerçek generation/job flow üzerinden geçiyor.

## Definition of Done

```text
F-001 = CLOSED
```

---

# Sprint R2 — Trusted Renderer + Visual Evidence Pipeline

## Amaç

**F-002 — Actual rendered-output visual critic is not verified** blocker'ını kapatmak.

## Kritik Problem

Contract'lar mevcut olsa da:

```text
DesignSpec
↓
gerçek renderer
↓
screenshot
↓
DOM bounds
↓
visual critic
```

production evidence producer zinciri doğrulanmamış.

## Hedef Akış

```text
candidate_ready
↓
Trusted Render Worker
↓
actual PhoneScreen/render implementation
↓
screen screenshots
↓
node bounds
↓
geometry report
↓
visual critic
↓
cross-screen critic
↓
runtime quality writer
```

## Ana Dosyalar

```text
apps/web/src/features/studio/canvas/PhoneScreen.tsx
apps/web/src/features/studio/canvas/componentRegistry.ts
packages/design-spec/src/geometry-validator.ts
packages/design-spec/src/critic-gate.ts
packages/design-spec/src/runtime-quality.ts
supabase/functions/record-generation-runtime-quality/index.ts
```

## Yeni Katman

Projeye uygun bir trusted runtime renderer.

Örnek sorumluluk:

```text
load DesignSpec
load PresentationSpec
render exact production components
wait for fonts/layout
capture screenshot
collect node bounds
emit evidence
```

## Evidence Contract

Her screen için:

```json
{
  "screenId": "...",
  "viewport": {
    "width": 390,
    "height": 844
  },
  "screenshot": "...",
  "nodeBounds": [],
  "geometryIssues": [],
  "visualCritic": {},
  "renderVersion": "..."
}
```

## Geometry Evidence

Minimum:

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

## Visual Critic Rubric

Minimum:

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

## Kritik Kural

Visual critic:

```text
JSON tree only
```

ile çalışmış sayılmaz.

Gerçek rendered screenshot evidence zorunlu.

## Testler

### T-R2-01

Normal screen render.

Expected:

```text
screenshot exists
node bounds exists
geometry report exists
critic score exists
```

### T-R2-02

Text overflow fixture.

Expected:

```text
geometry issue detected
```

### T-R2-03

Overlap fixture.

Expected:

```text
COMPONENT_OVERLAP
```

### T-R2-04

Empty interactive surface.

Expected:

```text
EMPTY_INTERACTIVE_SURFACE
```

### T-R2-05

Cross-screen repeated layout.

Expected:

```text
differentiation penalty
```

## Acceptance Criteria

- [ ] Trusted renderer gerçek production renderer'ı kullanıyor.
- [ ] Screenshot evidence var.
- [ ] Node bounds evidence var.
- [ ] Geometry report var.
- [ ] Visual critic actual screenshot kullanıyor.
- [ ] Cross-screen critic actual screen set kullanıyor.
- [ ] Evidence runtime quality writer'a server-trusted yolla gidiyor.
- [ ] Missing evidence final'i blokluyor.

## Definition of Done

```text
F-002 = CLOSED
```

---

# Sprint R3 — Renderer Fail-Closed + DesignSpec Identity Integrity

## Amaç

**F-003** ve **F-004** release blocker'larını kapatmak.

---

# R3.A — Unsupported Renderer Fail-Closed

## Problem

Mevcut davranış:

```ts
if (!isComponentType(node.type)) return null;
```

Silent corruption oluşturuyor.

## Hedef

Unknown component:

```text
UNSUPPORTED_RENDERER_COMPONENT
↓
quality issue
↓
finalEligible false
```

Preview/debug environment'ta kontrollü diagnostic placeholder gösterilebilir.

Örnek:

```text
Unsupported component: TimelineFoo
```

Ancak sessizce kaybolamaz.

## Ana Dosyalar

```text
apps/web/src/features/studio/canvas/PhoneScreen.tsx
apps/web/src/features/studio/canvas/componentRegistry.ts
apps/web/src/features/studio/canvas/PhoneScreen.test.ts
packages/design-spec/src/production-gates.ts
```

## Testler

```text
unknown node type
missing renderer branch
unsupported pattern output
required prop missing
```

Expected:

```text
deterministic issue
+
no silent null
+
FINAL impossible
```

---

# R3.B — Duplicate Node ID Hard Gate

## Problem

Document-wide duplicate ID validator doğrulanmamış.

## Hedef

Her DesignSpec:

```text
screen IDs unique
node IDs globally/contract-scope unique
action targets valid
references valid
```

olmalı.

## Yeni / Güncellenecek Validator

Öneri:

```text
packages/design-spec/src/identity-validator.ts
```

veya mevcut validator altyapısına ekleme.

## Kontroller

```text
duplicate node id
duplicate screen id
invalid action target
orphan node reference
invalid patch target
```

## Pipeline

```text
generation
↓
normalization
↓
identity validation
↓
static quality
```

ve ayrıca:

```text
before final
→ identity gate
```

Defense-in-depth.

## Testler

### T-R3-01

Aynı ID iki farklı branch'te.

Expected:

```text
DUPLICATE_NODE_ID
hard fail
```

### T-R3-02

Duplicate screen ID.

Expected:

```text
hard fail
```

### T-R3-03

Action nonexistent target'a gidiyor.

Expected:

```text
invalid reference
```

### T-R3-04

Patch duplicate node ekliyor.

Expected:

```text
reject
```

## Acceptance Criteria

- [ ] Unsupported component silent return yok.
- [ ] Unknown component quality issue üretir.
- [ ] Unknown component FINAL olamaz.
- [ ] Duplicate node ID document-wide yakalanıyor.
- [ ] Duplicate screen ID yakalanıyor.
- [ ] Invalid target/reference yakalanıyor.
- [ ] Identity validator generation ve final gate'e bağlı.

## Definition of Done

```text
F-003 = CLOSED
F-004 = CLOSED
```

---

# Sprint R4 — Enforcement Integration Sweep

## Amaç

Certification raporundaki:

```text
PARTIAL
NOT VERIFIED
```

V2 contract'larını production path üzerinde gerçek enforcement'a dönüştürmek.

Bu sprint release blocker kapanmış görünse bile kritik; aksi halde recertification tekrar çok sayıda NOT VERIFIED üretir.

---

## R4.1 Surface Semantics Production Integration

### Dosyalar

```text
packages/design-spec/src/surface-semantics.ts
supabase/functions/generate/quality.ts
supabase/functions/generate/index.ts
```

### Hedef

```text
validateSurfaceSemantics()
```

veya eşdeğer canonical validator gerçek generation quality pipeline'ında çağrılmalı.

### Hard

```text
nestedCardCount = 0
```

---

## R4.2 Tree Simplifier Production Integration

### Dosyalar

```text
packages/design-spec/src/tree-simplifier.ts
supabase/functions/generate/index.ts
```

### Hedef

```text
normalizeScreens()
↓
treeSimplifier
↓
structural lint
```

zorunlu.

---

## R4.3 Archetype Hardening Production Integration

Certification report özellikle:

```text
Form validator exists but production path does not call it
Settings partial
Analytics partial
```

diyor.

### Hedef

Her screen:

```text
archetype
↓
validateArchetype()
```

veya canonical eşdeğer.

### Form

Hard:

```text
no hero
no FAB
no root bottom nav
required form pattern
```

### Settings

Hard:

```text
no FAB
no empty selector
grouped settings pattern
no card-everywhere
```

### Analytics

Hard:

```text
insight metadata required
meaningless chart-only structure reject
```

---

## R4.4 Typography / Viewport Integration

### Hedef

```text
duplicate headings
oversized operational titles
above-fold task missing
oversized blocks
```

production static/runtime quality'ye bağlı.

---

## R4.5 Action / Navigation Integration

Hard:

```text
invalid FAB
duplicate primary action
focused flow bottom nav
wrong action emphasis
invalid active state
```

---

## R4.6 Typed Content Runtime Tests

Türkçe:

```text
currency
percentage
date
long labels
long company name
```

production renderer'dan geçirilir.

Expected:

```text
no critical overflow
locale consistency
amount not lost
```

---

## R4.7 Semantic Parity Matrix

Aynı SemanticDesignSpec:

```text
Auto
Obsidian
Serene
Terracotta
Electric
Editorial
```

Expected:

```text
same semanticHash
```

Minimum:

```text
12 semantic fixtures × 6 modes
```

---

## R4.8 Repair Red-Team

Inject:

```text
nested Card
oversized heading
invalid FAB
```

Repair sonrası:

```text
target issues fixed
unrelated semantic hash same
node IDs stable
new high/critical issue = 0
```

---

## Acceptance Criteria

- [ ] Surface semantics real generation path'te.
- [ ] Tree simplifier real generation path'te.
- [ ] Archetype hardening real generation path'te.
- [ ] Typography budget real quality path'te.
- [ ] Action semantics final gate'e bağlı.
- [ ] Navigation semantics final gate'e bağlı.
- [ ] Typed content renderer evidence PASS.
- [ ] Six-mode semantic parity %100 PASS.
- [ ] Repair semantic identity test PASS.
- [ ] Critical V2 rules artık “unit-level only” değil.

## Definition of Done

Certification raporundaki PARTIAL/NOT VERIFIED enforcement alanlarının critical kısmı kapanmış olur.

---

# Sprint R5 — Full Benchmark, Security Audit & Recertification

## Amaç

Floriven'ı yeniden certification'a sokmak ve gerçekten:

```text
CERTIFIED
```

veya

```text
CERTIFIED WITH MINOR ISSUES
```

sonucu alıp alamadığını kanıtlamak.

---

# R5.1 Clean Release Candidate

Şart:

```text
clean git revision
all recovery commits merged
no uncommitted production changes
```

Certification report revision'a bağlı olmalı.

---

# R5.2 Full Command Suite

Run:

```text
build
type-check
lint
unit tests
E2E
Supabase integration
generation architecture
benchmark validation
benchmark generation
```

Gerçek repo command'ları kullanılacak.

---

# R5.3 Known Benchmark Matrix

Minimum certification set:

```text
12 domain
×
6 visual mode
=
72 primary cases
```

Domain:

```text
Finance
Restaurant Operations
E-commerce
Project Management
Fitness
Travel
CRM
Inventory
Education
Booking
Subscription Management
Logistics
```

Modes:

```text
Auto
Obsidian
Serene
Terracotta
Electric
Editorial
```

Bad generation:

```text
reroll yok
```

Teknik provider failure retry olarak ayrıca loglanabilir.

---

# R5.4 Adversarial Prompt Suite

Çalıştır:

```text
nested cards isteyen brief
every-screen FAB isteyen brief
giant hero isteyen brief
forms with root nav isteyen brief
every control primary CTA isteyen brief
```

Beklenen:

```text
hard invariant wins
```

---

# R5.5 Security / Bypass Suite

### S-001

Client:

```text
finalEligible = true
```

Expected:

```text
no effect
```

### S-002

Runtime evidence missing.

Expected:

```text
FINAL impossible
```

### S-003

Critical static issue + high visual average.

Expected:

```text
FINAL impossible
```

### S-004

Critical geometry issue + good critic score.

Expected:

```text
FINAL impossible
```

### S-005

Unsupported component.

Expected:

```text
FINAL impossible
```

### S-006

Duplicate ID.

Expected:

```text
FINAL impossible
```

---

# R5.6 Visual Certification

Minimum threshold:

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

Critical issue:

```text
score ne olursa olsun FAIL
```

---

# R5.7 Performance

Ölç:

```text
generation p50
generation p95
render latency
critic latency
token cost
repair cycles
```

Baseline comparison.

Suggested:

```text
p95 regression <= 20%
token/cost regression <= 25%
average repair cycles <= 1
```

---

# R5.8 External Holdout

Repo dışında tutulan:

```text
10 unseen briefs
×
6 modes
=
60 generations
```

Kurallar:

```text
no reroll
no manual fix
no prompt tuning
first result counts
```

---

# R5.9 Independent Audit

Yeni certification run:

```text
FLORIVEN_V2_CERTIFICATION_SPEC.md
↓
fresh audit
↓
FLORIVEN_V2_CERTIFICATION_REPORT.md
```

Eski report üzerine edit yapılmamalı.

Öneri:

```text
FLORIVEN_V2_CERTIFICATION_REPORT_RECOVERY_01.md
```

ve final pass olduğunda canonical report güncellenebilir.

---

## Final Hard Zero Targets

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
qualityBypass = 0
repairRegressionCritical = 0
```

## Semantic

```text
preset semantic parity = 100%
auto semantic parity = 100%
```

---

## Definition of Done

Final verdict:

```text
CERTIFIED
```

veya yalnız minor bulgular varsa:

```text
CERTIFIED WITH MINOR ISSUES
```

Aşağıdakiler varsa release yapılmaz:

```text
RELEASE BLOCKER
MAJOR
critical NOT VERIFIED
```

---

# 4. Recovery Sprint Bağımlılıkları

```text
R0
↓
R1
↓
R2
↓
R3
↓
R4
↓
R5
```

R1–R3 içindeki bazı implementation işleri paralel yapılabilir.

Ancak:

```text
R5 recertification
```

öncesinde R1–R4 complete olmalıdır.

---

# 5. Release Blocker Mapping

| Certification Finding | Recovery Sprint |
|---|---|
| F-001 Runtime quality finalization'a bağlı değil | R1 |
| F-002 Trusted screenshot/visual critic yok | R2 |
| F-003 Unsupported renderer silent null | R3 |
| F-004 Duplicate node ID hard gate yok | R3 |
| Surface semantics production integration partial | R4 |
| Tree simplifier production integration partial | R4 |
| Archetype enforcement partial | R4 |
| Typography runtime evidence missing | R4 |
| Typed content runtime evidence missing | R4 |
| Preset parity not verified | R4 |
| Auto parity/diversity not verified | R4/R5 |
| Repair full pipeline not verified | R4 |
| Cross-screen critic not verified | R2/R5 |
| 12-domain benchmark not executed | R5 |
| Performance not verified | R5 |
| Security bypass not verified | R5 |
| Holdout absent | R5 |

---

# 6. Her Recovery Sprint İçin Ortak DoD

Bir sprint:

```text
kod yazıldı
```

diye tamamlanmaz.

Şunların tamamı gerekir:

```text
implementation
+
unit tests
+
integration test
+
real production-path trace
+
negative/sabotage test
+
quality evidence
+
docs update
```

Critical rule için:

```text
unit test only
```

yeterli değildir.

---

# 7. Recovery Boyunca Yasaklı Yaklaşımlar

```text
1. CSS ile structural problemi gizlemek.
2. Prompt'a kural yazıp enforcement kabul etmek.
3. Critical issue'yu warning'e çevirmek.
4. Certification threshold düşürmek.
5. Empty component'i display:none yapıp PASS saymak.
6. Unsupported component'i null render etmek.
7. Runtime evidence eksikken finalEligible true yapmak.
8. Duplicate ID'yi sadece patch path'inde kontrol etmek.
9. Bad benchmark result'u reroll edip silmek.
10. Release audit sırasında production kodunu düzeltmek.
```

---

# 8. Önerilen Commit Sırası

```text
1. chore(certification): restore in-repo certification source of truth

2. refactor(runtime-quality): make final eligibility server-gated

3. fix(generation): remove disabled static quality bypass

4. feat(runtime-renderer): produce trusted screenshot and geometry evidence

5. feat(visual-critic): evaluate actual rendered output

6. fix(renderer): fail closed on unsupported component types

7. feat(design-spec): add document-wide identity validator

8. feat(generation): enforce identity validation in normalize/final gate

9. feat(surface): wire surface semantics into production quality

10. feat(structure): wire tree simplifier into normalization

11. feat(archetypes): enforce form/settings/analytics hardening

12. feat(typography): wire typography and viewport gates

13. feat(actions): wire action/navigation gates into final eligibility

14. test(presentation): add six-mode semantic parity matrix

15. test(runtime): add Turkish/extreme-content render suite

16. test(repair): add full targeted-repair red-team

17. test(security): add finalEligible and missing-evidence bypass tests

18. test(certification): execute 12-domain six-mode matrix

19. chore(certification): run clean-revision final audit
```

---

# 9. Final Recovery Success Definition

Floriven Recovery tamamlanmıştır ancak şu cümle doğruysa:

```text
The V2 contracts are not merely present.

They are connected to the real production path,
violations are deterministically detected,
critical failures cannot become FINAL,
rendered output produces trusted evidence,
and a clean release candidate passes the full
certification suite without bypasses.
```

---

# 10. Nihai Hedef Akış

```text
User Brief
   │
   ▼
ProductBlueprint
   │
   ▼
UXSpec / Archetype
   │
   ▼
Pattern Plan
   │
   ▼
Semantic DesignSpec
   │
   ▼
Identity + Structural Validation
   │
   ▼
Semantic Freeze / Hash
   │
   ├───────────────┐
   ▼               ▼
Preset         Auto VisualConcept
   │               │
   └───────┬───────┘
           ▼
    PresentationSpec
           │
           ▼
     Candidate Persist
           │
           ▼
    Trusted Renderer
           │
     ┌─────┴──────┐
     ▼            ▼
Geometry       Screenshot
     │            │
     └─────┬──────┘
           ▼
      Visual Critic
           │
           ▼
   Cross-Screen Critic
           │
           ▼
  evaluateRuntimeQuality
           │
      ┌────┴─────┐
      ▼          ▼
    FINAL      PREVIEW/FAIL
                   │
                   ▼
             Targeted Repair
```

Bu recovery roadmap'in amacı Floriven'ı yeniden geliştirmek değil, certification raporunda bulunan production-path boşluklarını kapatıp Design Engine V2'yi gerçekten sertifikalandırmaktır.
