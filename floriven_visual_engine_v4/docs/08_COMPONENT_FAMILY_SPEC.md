# 08 — Component Family Specification

## Problem

Tek `Card` primitive'i design system değildir.

## Card families

- MetricCard
- HeroCard
- ListCard
- SplitCard
- TimelineCard
- MediaCard
- GlassCard
- EditorialBlock

## Resolver

```ts
resolveCardFamily(node, presentation, sectionRole)
```

## Validity contract

Her family:
- allowed children
- semantic role
- min/max density
- geometry
- hierarchy
- state behavior

tanımlar.

## Controls

- Switch
- Checkbox
- Toggle
- Segmented
- Accordion
- Disclosure

States:
- default
- hover
- pressed
- focus
- selected
- disabled
- loading
- error

## Pills

- Status
- Filter
- Category
- Tag
- Notification

## Fields

- underline
- filled
- outlined
- soft
- compact
- touch-large

Fields gerçek visual state taşımalıdır:
- label
- value
- placeholder
- helper
- error
- success
- unit
- disabled

## Media

Image component aşağıdaki source'ları desteklemeli:

- asset
- generated asset
- gradient placeholder
- editorial crop
- masked
- full bleed

Sadece alt metin gösteren placeholder production renderer sayılmaz.
