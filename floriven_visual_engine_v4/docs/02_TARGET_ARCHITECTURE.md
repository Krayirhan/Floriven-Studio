# 02 — Target Architecture

## Ana pipeline

```text
Brief
  ↓
Planning Intent
  ↓
ProductBlueprint
  ↓
ScreenIntent[]
  ↓
Semantic DesignSpec
  ↓
PresentationPolicy
  ↓
PresentationSpecV2
  ↓
Screen Composer
  ↓
RenderPlan
  ↓
Layout Engine
  ↓
Component Family Resolver
  ↓
React Runtime DOM
  ↓
Static + Geometry + Visual + A11y Evidence
  ↓
Runtime Certification
  ↓
Final Decision
```

## Katman sorumlulukları

### ProductBlueprint

Sadece ürün truth'u:

- domain
- audience
- entities
- capabilities
- screens
- navigation
- screen jobs

Stil taşımaz.

### ScreenIntent

Screen job ve UX restrictions:

- archetype
- primary task
- density
- hero policy
- FAB policy
- persistent navigation
- information priority
- primary action

### Semantic DesignSpec

Bilgi objeleri ve semantic components.

Bu katman:
- pixel geometry belirlemez,
- preset family seçmez,
- render-specific CSS taşımaz.

### PresentationSpecV2

Resolved visual grammar.

Bu katman:
- preset profile,
- auto design decision,
- platform constraints,
- accessibility constraints

üzerinden üretilir.

### RenderPlan

Semantic node'ların visual section ve layout bölgelerine mapping'i.

RenderPlan:
- section role
- emphasis
- span
- order
- grouping
- component family
- chart family
- layout pattern

taşır.

### Renderer

Renderer artık karar vermemeli; kararları uygulamalıdır.

Yasak:

```ts
if (presentation.palette === "editorial") ...
```

Doğru:

```ts
render(plan.chart.family)
```

## Boundary rules

1. Product domain preset'ten türetilemez.
2. Renderer preset ID bilmez.
3. Screen archetype screen isminden türetilemez.
4. Static quality final release veremez.
5. Visual critic semantic correctness'i değiştiremez.
6. Deterministic fallback production fallback'tır; debug fallback değildir.
7. Runtime certification read-only ve candidate-hash bound olmalıdır.
