# ADR-001 — Separate Semantic UI From Visual Presentation

Status: Accepted

## Decision

Semantic DesignSpec product meaningini taşır; visual layout ve component family kararları
PresentationSpec + RenderPlan katmanlarında tutulur.

## Consequences

Positive:
- same semantic content can produce structurally different presets
- AI responsibility decreases
- deterministic rendering improves

Negative:
- additional compiler layer
- migration complexity

## Rejected alternative

Modelin doğrudan final visual tree üretmesi.

Reason:
Renderer vocabulary ve quality guarantees model output'una fazla bağımlı kalır.
