# Archetype topology remediation

Baseline revision: `6e65c9f5872d3c594692c0ee147146d68e65130c`

| Metric | Before | After | Gate |
|---|---:|---:|---:|
| Cross-archetype collisions | 70/105 | 0/105 | <= 15 |

The production path now emits explicit semantic roles, spans, emphasis, resolved families and layout patterns. PhoneScreen uses those spans as CSS grid geometry; LayoutEngine consumes the same RenderPlan topology.

## Required pair evidence

| Pair | Minimum distance | Result |
|---|---:|---|
| dashboard vs form | 0.6899 | PASS |
| dashboard vs settings | 0.5044 | PASS |
| dashboard vs analytics | 0.6426 | PASS |
| management-list vs form | 0.6779 | PASS |
| detail vs settings | 0.5383 | PASS |

## Scope

No preset styling or preset-specific grammar remediation was performed. Cross-preset evidence remains out of scope for this sprint.
