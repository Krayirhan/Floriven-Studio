# Runbook — AI Üretim Hataları

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Operasyonel |
| Doküman sahibi | AI/Platform On-call |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Tetikleyiciler

Generation success düşüşü, queue backlog, provider error/rate-limit, schema failure artışı, maliyet spike veya repair loop artışı.

## İlk kontroller

1. Son model/prompt/config/deploy değişimi.
2. Provider status ve rate limit.
3. Queue depth, oldest message, worker health.
4. Şema hata kodu dağılımı.
5. Kredi reserve/commit/release metriği.
6. Belirli tenant/locale/category yoğunlaşması.

## Müdahale

- Yeni modeli/prompt'u rollback.
- Trafiği sağlıklı fallback'e yönlendir.
- Workspace concurrency azalt veya generation'ı geçici durdur.
- Poison message'ı DLQ'ya taşı; toplu retry yapma.
- Kredi release/reconciliation çalıştır.

## Doğrulama

Canary brief seti, job success, p95 latency, schema pass ve kredi ledger. Kullanıcı iletişiminde veri/kredi etkisi net belirtilir.
