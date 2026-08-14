# FLORIVEN VISUAL ENGINE V4 — VISUAL CHAMPIONSHIP RESULT

## Executive verdict

```text
REVISION: 6e65c9f5872d3c594692c0ee147146d68e65130c
VALID RUNTIME SCREENS: 42/42
OVERALL VISUAL SCORE: 58.0/100
NAMED PRESET AVERAGE: 58.6/100
AUTO SCORE: 57/100
DETERMINISTIC SCORE: 56/100
CROSS-ARCHETYPE: FAIL
CROSS-PRESET: FAIL
GEOMETRY: PASS
A11Y: PASS WITH 35 WARNINGS
FINAL VISUAL VERDICT: NOT READY
```

The canonical viewport P0 is fixed and runtime evidence is complete. Visual quality is not production-ready. The same semantic content is readable, but most modes remain the same vertical composition with color, radius, surface and typography substitutions. Titles frequently appear after the primary content because unassigned nodes are appended after composer-owned sections. Forms remain wireframe-like. Analytics has real line/bar/donut renderers but insufficient unit, target, comparison and insight context.

## Preset ranking

1. Obsidian Precision — 62
2. Serene Flow — 60
3. Electric Pulse — 59
4. Terracotta Atelier — 58
5. Editorial Grid — 54
Auto — 57
Deterministic — 56

## Preset score table

| Mode | Composition | Hierarchy | Archetype | Components | Type | Charts | Identity | Geometry | Interaction | Polish | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| obsidian | 10 | 10 | 5 | 7 | 6 | 5 | 7 | 4 | 4 | 4 | 62 |
| serene | 11 | 10 | 5 | 7 | 6 | 5 | 6 | 4 | 3 | 3 | 60 |
| terracotta | 10 | 9 | 5 | 6 | 6 | 5 | 6 | 4 | 3 | 4 | 58 |
| electric | 10 | 9 | 5 | 7 | 6 | 5 | 6 | 4 | 3 | 4 | 59 |
| editorial | 9 | 9 | 5 | 5 | 7 | 4 | 6 | 4 | 2 | 3 | 54 |
| auto | 10 | 9 | 5 | 6 | 6 | 5 | 5 | 4 | 3 | 4 | 57 |
| deterministic | 9 | 9 | 5 | 6 | 6 | 5 | 5 | 4 | 3 | 4 | 56 |

## Archetype averages

| Archetype | Avg /10 | Best mode | Worst mode |
|---|---:|---|---|
| dashboard | 5.8 | obsidian | editorial |
| management-list | 6.1 | obsidian | editorial |
| detail | 5.8 | obsidian | editorial |
| form | 4.9 | obsidian | editorial |
| analytics | 4.8 | obsidian | editorial |
| settings | 5.0 | obsidian | editorial |

## Best 5 screens

Management-list screens rank highest because their rows and signed amounts are immediately scannable. This is still generic list quality, not distinctive championship quality. Exact entries are in `screen-scores.json`.

## Worst 5 screens

Forms, analytics and settings rank lowest. Forms look like field stacks, analytics lacks decision context, and settings leaves large unused regions. Exact entries are in `screen-scores.json`.

## Preset collisions

All 60 measured named-preset/archetype pairs fall below the recommended `0.40` color-excluded structural threshold. Grayscale review also marks all ten named preset pairs as `COLLISION`.

## Archetype collisions

70 of 105 measured pairs fall below `0.45`. Structural differentiation is therefore insufficient across the matrix.

## Geometry failures

None. All 42 roots and LayoutEngine inputs are logical `390×844`; horizontal overflow and navigation containment gates pass.

## Accessibility failures

Critical issues: 0. Warnings: 35. Warnings are primarily touch targets below 44px and text below 11px.

## Four partial-family impact

```text
chartRules: Real chart shapes render, but missing tooltip/context materially reduces analytics usefulness.
controlTypes: Generic toggle/segmented rendering contributes to cross-preset collision.
formFieldStyles: Variant collapse is obvious; forms differ mostly by surface/radius.
emptyStateStyle: Canonical matrix has no true empty-state family; policy remains visually unproven.
```

## P0

None. Canonical viewport remediation passed.

## P1

- Cross-archetype structural collisions.
- Cross-preset structural collisions and grayscale identity collisions.
- Form field variant collapse.
- Analytics lacks units, target/comparison explanation and useful insight.
- Deterministic score is 56, below the required 60.

## P2

- Correct title/section ordering.
- Resolve touch-target and small-text warnings.
- Reduce unused lower-screen space.

## Previous comparison

No comparable old 390×844 42-screen baseline exists. Improvement is not claimed.
