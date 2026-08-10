# 06 — Composition Engine Specification

## Amaç

Screen archetype ve presentation grammar'a göre semantic content'i production-grade hierarchy'ye dönüştürmek.

## API

```ts
composeScreen({
  screen,
  intent,
  presentation
}): ScreenRenderPlan
```

## Dashboard recipe

Required roles:

1. primary state
2. supporting context
3. secondary metrics
4. trend/progress
5. actionable content

Hard rules:
- 4+ equal-weight metric vertical stack yasak
- hero tek dominant bilgi taşımalı
- secondary metrics hero ile aynı visual weight'te olmamalı
- chart bağlamsız dekorasyon olamaz

## Management list recipe

Required:

1. context
2. search
3. filter toolbar
4. optional summary
5. dense list
6. scoped action

Hard rules:
- filter button primary screen action'tan daha dominant olamaz
- list item status görünür olmalı
- her row anlamlı primary + secondary bilgi taşımalı

## Form recipe

Required:

1. context
2. sectioned field groups
3. helper/validation
4. optional live summary
5. exactly one dominant completion action

Hard rules:
- hero yok
- FAB yok
- focused flow'da persistent nav default olarak yok
- input affordance görsel olarak belirgin

## Detail recipe

Required:

1. entity identity
2. primary state
3. metadata
4. content/timeline
5. secondary action group

## Analytics recipe

Required:

1. KPI context
2. period/comparison control
3. dominant chart
4. breakdown
5. decision insight

## Settings recipe

Required:

1. section labels
2. rows
3. controls
4. dividers/grouping

Hard rules:
- generic dashboard hero yok
- global product summary copy yok
- primary CTA ancak gerçek settings action varsa

## Preset modifiers

Composer iki aşamalı çalışır:

```text
Archetype recipe
    +
Preset composition grammar
    =
RenderPlan
```

Örnek:
- dashboard + editorial-asymmetry
- dashboard + bento
- dashboard + stacked
