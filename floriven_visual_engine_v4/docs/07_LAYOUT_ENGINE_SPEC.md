# 07 — Layout Engine Specification

## Hedef

`column / row / 2-column grid` seviyesinden gerçek mobile layout grammar'a geçmek.

## LayoutPattern

```ts
type LayoutPattern =
  | "stacked"
  | "grid"
  | "strict-grid"
  | "bento"
  | "editorial-asymmetry"
  | "split"
  | "timeline"
  | "dense-table";
```

## Required primitives

- explicit tracks
- column span
- row span
- intrinsic width
- content bleed
- full-width region
- baseline alignment
- sticky region
- min/max content width
- safe-area padding
- section gap
- overlap prohibition
- scroll-aware reserved areas

## Bento

- 2–4 logical columns
- primary section > secondary section area
- explicit spans
- deterministic placement

## Editorial asymmetry

- unequal columns
- large typographic or media anchor
- controlled negative/positive whitespace
- divider-led secondary content

## Strict grid

- repeatable column baseline
- dense metrics
- predictable scanning
- aligned numbers

## Device coordinate model

Runtime layout canonical viewport:

```text
390 × 844 logical px
```

Studio preview:
- inner viewport 390×844
- outer wrapper scaled visually

Export/certification:
- same inner renderer
- no alternate layout path

## Geometry invariants

- touch target ≥ 44×44
- no critical clipping
- no nav collision
- no FAB collision
- no offscreen primary CTA
- minimum readable typography
