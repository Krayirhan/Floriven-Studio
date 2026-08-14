# 13 — Quality Model V3

## Quality dört ayrı rapora bölünür

### 1. SemanticQualityReport

- blueprint alignment
- routes
- names
- vocabulary
- foreign domain components
- navigation reachability

### 2. StructuralQualityReport

- tree depth
- wrapper quality
- nested cards
- structural diversity
- archetype validity
- FAB policy
- navigation policy

### 3. PresentationQualityReport

- hierarchy budget
- component family correctness
- chart family correctness
- excessive surfaces
- CTA dominance
- typography role correctness
- preset grammar conformity
- layout recipe conformity

### 4. RuntimeQualityReport

- geometry
- visibility
- clipping
- overlap
- touch targets
- real font metrics
- screenshot visual critic
- cross-screen critic
- cross-preset critic
- accessibility

## Final rule

```ts
finalEligible =
  semantic.passed &&
  structural.passed &&
  presentation.passed &&
  runtime.geometryPassed &&
  runtime.visualPassed &&
  runtime.crossScreenPassed &&
  runtime.accessibilityPassed;
```

## Static score policy

Tek bir birleşik “70/100” score final karar vermemelidir.

Her gate ayrı PASS olmalıdır.

## Structural distance

### Screen Job Distance

Farklı archetype pair:

```text
minimum >= 0.45
```

### Preset Structural Distance

Aynı semantic screen'in farklı preset pair'i:

```text
minimum >= 0.40
```

Renk bu hesaplamaya dahil edilmez.
