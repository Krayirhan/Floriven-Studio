# Sprint 18 — Runtime Wiring & Visual Baseline

## Amaç

V4 design-spec katmanını gerçek Studio renderer’a bağlamak ve Sprint 00 baseline’ını üretmek.

## İş paketleri

- ScreenIntent/PresentationSpec generation akışına bağla
- PhoneScreen ve DesignNodeRenderer’da family resolver kullan
- RenderPlan → layout engine → DOM coordinates bağlantısı
- Deterministic compositor V2’yi fallback akışına bağla
- 390×844 inner viewport parity
- 6 archetype × 7 mode baseline capture
- Bounds, tree signature ve manifest

## Exit gate

42+ screenshot, versioned manifest, same-input same-hash ve renderer/export parity PASS.
