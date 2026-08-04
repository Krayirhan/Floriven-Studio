# Deployment ve Operasyon

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Bağlayıcı |
| Doküman sahibi | Platform Lead |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Ortam topolojisi

Local → Preview → Staging → Production. Her ortam ayrı DB, queue, storage, secret ve provider credential kullanır. Production'a doğrudan manuel dosya kopyalanmaz.

## CI/CD

1. Build, lint, unit, schema ve security scan.
2. İmzalı immutable container image.
3. Preview deploy ve smoke.
4. Staging integration/E2E ve migration rehearsal.
5. Production canary/rolling deploy.
6. SLO/error guardrail gözlemi.
7. Otomatik veya tek komut rollback.

## Konfigürasyon

12-factor yaklaşımı; secret manager. Config şeması startup'ta doğrulanır. Feature flag ve secret farklı sistemlerdir. Production config değişikliği audit edilir.

## Database deploy

Expand-contract. Destructive migration aynı release'te yapılmaz. Backup doğrulaması, lock süresi analizi ve rollback/roll-forward planı zorunlu.

## Worker deploy

Eski ve yeni event/schema sürümü geçişte birlikte işleyebilmelidir. Consumer drain, visibility timeout ve retry budget kontrol edilir. Uzun job deploy sırasında güvenli tamamlanır veya tekrar alınır.

## Operasyon görevleri

Günlük: alarm ve DLQ. Haftalık: maliyet, kapasite, backup sonucu, dependency. Aylık: erişim review, restore testi örneği, SLO/error budget ve secret rotasyon planı.
