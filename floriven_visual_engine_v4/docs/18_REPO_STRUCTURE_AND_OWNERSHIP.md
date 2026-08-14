# 18 — Proposed Repo Structure & Ownership

```text
packages/design-spec/
  presentation/
    contracts.ts
    validators.ts
  strategy.ts
  screen-intent.ts
  render-plan.ts

apps/studio/
  canvas/
    PhoneScreen.tsx

  presentation/
    resolvePresentation.ts
    tokenCompiler.ts

  composition/
    composeScreen.ts
    dashboard.ts
    managementList.ts
    detail.ts
    form.ts
    analytics.ts
    settings.ts

  layout/
    LayoutRenderer.tsx
    stacked.ts
    grid.ts
    bento.ts
    editorialAsymmetry.ts
    strictGrid.ts
    timeline.ts

  renderer/
    DesignNodeRenderer.tsx

  components/
    cards/
    charts/
    controls/
    fields/
    navigation/
    typography/
    media/

  quality/
    presentation.ts
    geometry.ts
    visual.ts

supabase/functions/
  generate/
    quality/
      semantic.ts
      structural.ts
    deterministic/
    certification/
```

## Ownership boundaries

### Design Spec
Owns:
- contracts
- enums
- validation

### Generation
Owns:
- semantic composition
- deterministic semantic baseline
- static quality

### Studio Visual Engine
Owns:
- resolved presentation
- RenderPlan
- DOM renderer
- geometry

### Certification
Owns:
- evidence
- runtime verdict
- final eligibility

## Dependency rule

Renderer → design-spec allowed.

design-spec → renderer forbidden.
