# Sprint 21 — Migration, Performance & Studio Integration

## Amaç

V4’ü legacy documents ve Studio UX ile güvenli, ölçülebilir ve geri alınabilir biçimde birleştirmek.

## İş paketleri

- v1 → v2 compatibility
- Legacy `templateId` okuma
- Resolved system inspector
- Feature flags
- Rollback hooks
- 6-screen render performance profiling
- Non-destructive migration fixtures

## Exit gate

Legacy fixture’lar render olur, Studio stabil kalır, performance budget geçilir ve flag rollback rehearsal PASS olur.

## Durum

**TAMAMLANDI — 2026-08-10**

- v1→v2 uyumluluk ve legacy `templateId` okuma sözleşmesi eklendi.
- Resolved system inspector çıktısı eklendi.
- V2 renderer, evidence ve deterministic fallback feature flag’leri eklendi.
- Rollback flag set’i eklendi.
- 6 ekran render performance budget değerlendirmesi eklendi.
- Migration/performance unit testleri ve type-check PASS.
