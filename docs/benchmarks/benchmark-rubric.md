# Floriven Studio V1 baseline rubric

This rubric records deterministic structural measurements before V2 quality
stages are introduced. It is intentionally renderer-independent: visual
geometry, screenshot scoring, and token costs are collected by their owning
runtime stages once those stages are approved.

## Required baseline inputs

- One fixed brief per benchmark domain.
- A persisted generated DesignSpec for each selected style preset.
- The generation ID, source revision, style preset, and UTC timestamp.

## Structural measurements

Every production generation persists these structural values in
`generation_jobs.quality_report.metrics`. Use
`calculateStructuralMetrics` from `@floriven/design-spec` when evaluating a
stored DesignSpec outside the generation service.

| Metric | Definition | V1 use |
| --- | --- | --- |
| `maxTreeDepth` | Deepest node depth, with each screen root at depth 1. | Baseline only |
| `nestedCardCount` | Cards that have another Card as an ancestor. | Baseline only |
| `singleChildWrapperCount` | Structural wrappers with exactly one node child. | Baseline only |
| `cardRatio` | `cardCount / semanticBlockCount`. | Baseline only |
| `surfaceRatio` | `(Card + Surface) / semanticBlockCount`. | Baseline only |

`semanticBlockCount` excludes structural wrappers (`Screen`, `SafeArea`,
`ScrollView`, `Stack`, `Row`, `Grid`, `Group`, and `Section`). A zero denominator
produces a zero ratio.

## Benchmark domains

The fixed briefs, style matrix, and required coverage live in
[`catalog.json`](catalog.json). Validate the catalog with:

```text
pnpm benchmarks:validate
```

Preview the complete matrix without contacting a generation service:

```text
pnpm benchmarks:run
```

Running the matrix creates 42 model generations and can consume credits. It is
therefore opt-in and requires `BENCHMARK_GENERATE_URL`, `BENCHMARK_ANON_KEY`,
and `BENCHMARK_PROJECT_ID`:

```text
pnpm benchmarks:run --execute
```

Generated results must be stored by benchmark ID, style variant, and source
revision outside the catalog so a baseline is immutable once recorded.

Each benchmark must cover dashboard, list, detail, form, analytics, and settings
where the product domain supports them. This document does not define a release
gate; V2 threshold enforcement requires an approved ADR and renderer-backed
geometry/visual validators.
