# Floriven Visual Engine V4 — Master Documentation Pack

Bu paket, Floriven Studio'nun generated-design motorunu **generic semantic tree + CSS preset**
yaklaşımından, production-grade bir **semantic UI → visual compiler → runtime certification**
mimarisine taşımak için hazırlanmıştır.

## Bu paketin amacı

Mevcut kod tabanında güçlü bir `StyleSystemProfile v3` fikri bulunmasına rağmen runtime renderer
bu görsel grammar'ın küçük bir bölümünü tüketmektedir. Screen composition, layout, chart family,
typography, image treatment, interaction ve runtime visual quality katmanları production kalitesine
ulaşmamıştır.

Bu doküman seti aşağıdaki hedefi kontrat haline getirir:

```text
User Brief
  → ProductBlueprint
  → ScreenIntent
  → Semantic DesignSpec
  → Presentation Resolver
  → Composition Engine
  → RenderPlan
  → Layout + Component Families
  → Real Device Runtime
  → Static + Geometry + Visual + A11y Quality
  → Runtime Certification
  → FINAL_ELIGIBLE
```

## Mevcut koddan korunan güçlü parçalar

- ProductBlueprint / planning separation
- StyleSystemProfile v3 alanları
- Domain capability pack yaklaşımı
- Unsupported renderer node için explicit diagnostic
- Candidate hash / runtime evidence yaklaşımı
- Static structural quality gate
- Fixed navigation separation
- Deterministic fallback fikri

## Yeniden kurulması gereken ana alanlar

1. PresentationSpec
2. Preset → runtime resolver
3. Screen archetype metadata
4. Composition engine
5. Layout engine
6. Component families
7. Chart engine
8. Deterministic compositor
9. Visual quality model
10. Runtime certification bridge

## Dizin

### Mimari ve ürün dokümanları

- `docs/00_EXECUTIVE_SUMMARY.md`
- `docs/01_CURRENT_STATE_AND_GAPS.md`
- `docs/02_TARGET_ARCHITECTURE.md`
- `docs/03_ENGINEERING_PRINCIPLES.md`
- `docs/04_PRESENTATION_SPEC_V2.md`
- `docs/05_SCREEN_INTENT_AND_RENDER_PLAN.md`
- `docs/06_COMPOSITION_ENGINE_SPEC.md`
- `docs/07_LAYOUT_ENGINE_SPEC.md`
- `docs/08_COMPONENT_FAMILY_SPEC.md`
- `docs/09_CHART_ENGINE_SPEC.md`
- `docs/10_PRESET_RUNTIME_SPEC.md`
- `docs/11_AUTO_DESIGN_DIRECTOR.md`
- `docs/12_DETERMINISTIC_COMPOSITOR_V2.md`
- `docs/13_QUALITY_MODEL.md`
- `docs/14_RUNTIME_CERTIFICATION_SECURITY.md`
- `docs/15_TEST_AND_VISUAL_REGRESSION.md`
- `docs/16_MIGRATION_AND_ROLLOUT.md`
- `docs/17_OBSERVABILITY_AND_METRICS.md`
- `docs/18_REPO_STRUCTURE_AND_OWNERSHIP.md`
- `docs/19_DEFINITION_OF_DONE.md`
- `docs/20_RISK_REGISTER.md`
- `docs/21_RC_CERTIFICATION_RUNBOOK.md`
- `docs/22_ENGINEERING_BACKLOG.md`

### Sprintler

`SPRINT_00` ile `SPRINT_17` arasındaki 18 sprint ayrı dosyalardır.

### ADR'ler

Ana mimari kararlar `adrs/` altında sabitlenmiştir.

### Checklist'ler

PR, visual review ve release candidate checklist'leri `checklists/` altındadır.

## Program release standardı

Floriven Visual Engine V4 release edilemez; eğer:

- preset farkı yalnız renk/stil seviyesinde kalıyorsa,
- farklı archetype'lar aynı geometry'yi üretiyorsa,
- deterministic fallback wireframe kalitesindeyse,
- static quality tek başına final kararı verebiliyorsa,
- runtime geometry ve screenshot evidence yoksa,
- real device coordinate space kullanılmıyorsa,
- unsupported component sessizce düşüyorsa.

## Önerilen yürütme

Önce:

`Sprint 00 → 01 → 02 → 03 → 04`

Daha sonra:

`05 → 06 → 07 → 08 → 09 → 10`

Preset polish ancak bu foundation tamamlandıktan sonra:

`Sprint 11`

Quality ve certification:

`Sprint 14 → 15`

Final rollout:

`Sprint 16 → 17`
