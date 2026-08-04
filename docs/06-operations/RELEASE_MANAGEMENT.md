# Sürüm Yönetimi

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Bağlayıcı |
| Doküman sahibi | Release Manager |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Her sürüm |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Sürüm türleri

Patch: hata/güvenlik ve geriye uyumlu. Minor: yeni özellik. Major: kırıcı API/DesignSpec veya davranış. Web sürekli teslim edilebilir; public API ve schema ayrıca semver taşır.

## Çıkış kapıları

- Kabul kriterleri ve testler.
- Açık P0/P1 yok.
- Güvenlik taraması ve dependency review.
- Migrasyon rehearsal.
- Observability/runbook.
- Feature flag rollout ve rollback.
- Release note ve support bilgilendirmesi.

## Rollout

Internal → %1 canary → %10 → %50 → %100. Guardrail: error, latency, job success, schema failure, kredi uyuşmazlığı ve support signal. Kritik eşik aşılırsa otomatik durdur/rollback.

## Hotfix

Dar kapsam, incident bağlantısı, hızlı test, iki kişi onayı ve sonrasında normal branch'e back-merge. Hotfix kalite kontrolünü kalıcı olarak atlamaz.
