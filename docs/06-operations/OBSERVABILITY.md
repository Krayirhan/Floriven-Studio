# Gözlemlenebilirlik

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Bağlayıcı |
| Doküman sahibi | Platform Lead |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Üç sütun

Yapılandırılmış log, metrik ve distributed trace ortak correlation ID ile bağlanır. Kullanıcı içeriği yerine güvenli metadata kullanılır.

## Golden signals

- Latency: API, job aşamaları, model/provider, export.
- Traffic: request, active editor, job, token ve asset.
- Errors: HTTP sınıfı, job failure, schema failure, provider.
- Saturation: CPU/memory, DB pool, queue depth, rate limit.

## Ürün/AI metrikleri

Generation success, repair count, DesignSpec validation, model cost, patch acceptance, export success ve credit reconciliation.

## SLO örnekleri

- Core read API başarı %99,9.
- Generation kabul endpoint'i %99,9.
- Generation tamamlanma %95 iş hedefi; sağlayıcı ve kullanıcı iptali ayrı sınıflandırılır.
- Kredi ledger doğruluğu %100 finansal kontrol hedefi.

## Alarm ilkeleri

Alarm eyleme dönük, owner'lı ve runbook bağlantılıdır. Tekil kullanıcı hatası pager oluşturmaz. Multi-window burn-rate SLO alarmı, queue backlog, kredi reconciliation ve cross-tenant security sinyali kritik sınıftır.

## Dashboard'lar

Executive, product funnel, API health, AI pipeline, queue/worker, database, storage, billing/credit ve security. Her dashboard ölçüm tanımına bağlantı taşır.
