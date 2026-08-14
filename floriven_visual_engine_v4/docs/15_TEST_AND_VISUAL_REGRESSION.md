# 15 — Test & Visual Regression Strategy

## Unit

### Contracts
- profile validation
- PresentationSpecV2 validation
- RenderPlan validation

### Resolver
- each preset
- each archetype
- unknown/fallback

### Composer
- dashboard
- list
- form
- detail
- analytics
- settings

### Components
- cards
- fields
- controls
- charts
- navigation

## Integration

- ProductBlueprint → ScreenIntent
- ScreenIntent → semantic screen
- semantic screen → presentation
- presentation → RenderPlan
- RenderPlan → DOM

## Visual fixtures

Minimum:

```text
5 presets
× 6 core archetypes
× 2 content densities
= 60
```

Ek:
- Auto
- Deterministic

Toplam canonical set yaklaşık 84 screenshot.

## Screenshot rules

Her snapshot:
- fixed 390×844 viewport
- deterministic fonts
- deterministic data
- no random animation
- reduced motion or settled motion
- candidate hash metadata

## PR visual change contract

Snapshot update için PR'da:

```text
Expected visual change:
Reason:
Affected preset:
Affected archetype:
Before:
After:
```

zorunlu olmalıdır.

## Accessibility

- keyboard
- focus
- aria
- heading hierarchy
- contrast
- touch targets
- reduced motion
