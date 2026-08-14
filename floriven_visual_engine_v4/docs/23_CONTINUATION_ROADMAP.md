# 23 — V4 Continuation Roadmap

## Durum

Sprint 01–13 için design-spec contract ve unit test katmanı tamamlandı. Sprint 18’in canonical viewport ve baseline manifest sözleşmesi tamamlandı; gerçek V2 renderer entegrasyonu Sprint 18B’den devam eder. Sprint 19–22 ise visual evidence, security bridge, migration/performance ve release kapılarıdır.

## Kalan işlerin tam listesi

### A. Gerçek runtime entegrasyonu

- `ScreenIntent` ve `PresentationSpecV2` çıktısını generation akışına bağlamak
- `PhoneScreen` ve `DesignNodeRenderer` içinde resolver/family kullanmak
- RenderPlan’i gerçek DOM/layout çıktısına bağlamak
- 390×844 inner viewport ve export renderer parity
- Deterministic compositor V2’yi mevcut Supabase generation fallback’ine bağlamak

### B. Baseline ve visual evidence

- 6 canonical archetype fixture
- 5 preset + Auto + Deterministic mode
- En az 42 canonical screenshot
- DOM bounds, tree signature ve baseline manifest
- Bilinen failure’ların versioned kaydı

### C. Quality V3

- Semantic, structural, presentation, geometry ve visual raporlarını ayırmak
- Touch target, font, clipping ve overflow gate’leri
- Screenshot critic contract
- Cross-screen ve cross-preset distance
- Static quality’nin tek başına final eligibility verememesi

### D. Runtime certification ve güvenlik

- Session endpoint
- Signed, short-lived, candidate-hash-bound, read-only token
- Wrong job/hash, expiry, replay, mutation ve write-attempt testleri
- Gerçek Studio hydration
- Normal job-token regresyonu

### E. Migration, performans ve Studio

- v1 → v2 compatibility adapter’ları
- `templateId` legacy okuma desteği
- Resolved system inspector
- Feature flag ve rollback hook’ları
- 6 ekran performance budget’ı
- Destructive olmayan migration

### F. RC ve production release

- 84 visual fixture
- Adversarial domain matrisi
- Full a11y, security, performance ve certification
- Rollback rehearsal
- Monitoring dashboard ve release report
- Server-side evidence-backed `FINAL_ELIGIBLE`

## Continuation sprint sırası

```text
Sprint 18B Runtime Wiring Completion
    → Sprint 19 Quality V3 & Visual Evidence
    → Sprint 20 Runtime Certification Security
    → Sprint 21 Migration, Performance & Studio
    → Sprint 22 Hardening, RC & Release
```

## Sprint kapsamı ve kalan çıktı sırası

| Sprint | Kalan ana iş | Somut çıktı |
|---|---|---|
| 18B | V2 sözleşmesini gerçek renderer’a bağlamak | PhoneScreen V2 adapter, family/chart resolver, DOM bounds, preview/export parity, ilk baseline fixture |
| 19 | Görsel kanıt ve Quality V3 kapıları | 6 archetype × 7 mode matrisi, screenshot/bounds/tree manifest, split quality reports |
| 20 | Certification session ve güvenlik | Hash-bound read-only token, hydration akışı, expiry/replay/mutation testleri |
| 21 | Legacy uyumluluk, Studio ve performans | v1→v2 adapter, legacy `templateId`, inspector, flags/rollback, 6 ekran budget raporu |
| 22 | RC ve production release | 84 fixture, adversarial matrix, full CI gates, monitoring, server-side `FINAL_ELIGIBLE`, rollout/rollback raporu |

### Sprint başlangıç kuralı

Her sprint bir öncekinin exit gate’i PASS olduktan sonra başlar. Sprint 18B tamamlanmadan Sprint 19’un görsel kanıt matrisi; Sprint 20 tamamlanmadan gerçek certification release’i; Sprint 21 tamamlanmadan RC rollout’u başlatılmaz.

Eski Sprint 00, 14, 15, 16 ve 17 dokümanları bu continuation sprintlerinin hedef sözleşmesi olarak korunur; yeni sprintler gerçek kod entegrasyonu için yürütme planıdır.

## Global release kapısı

Her continuation sprint sonunda type-check, lint, ilgili unit/integration testleri ve sprint evidence’ı bulunmalıdır. Bir sprintin exit gate’i geçmeden sonraki sprint başlatılamaz.
