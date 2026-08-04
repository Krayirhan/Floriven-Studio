# Yerel Ortam ve Konfigürasyon Sözleşmesi

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Önerilen |
| Doküman sahibi | Platform Lead |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Servis portları — örnek

| Servis | Port |
|---|---:|
| Web | 3000 |
| Core API | 8080 |
| AI Worker API/health | 8090 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| RabbitMQ | 5672 / 15672 |
| MinIO | 9000 / 9001 |

## Environment grupları

- Kimlik: issuer, audience, client ID; secret yalnız server'da.
- DB/cache/queue: URL, pool, timeout.
- Storage: endpoint, bucket, KMS, signed URL TTL.
- AI: provider endpoint/key, model routing config, budget.
- Payment/email/Figma: ayrı scoped credential.
- Observability: OTLP endpoint, environment, release.

## Kurallar

`.env.example` değer içermez, açıklama ve güvenli default içerir. Secret validation startup'ta yapılır. Frontend'e yalnız `PUBLIC_` sınıfı ve gerçekten public config expose edilir. Local mock provider gerçek ücretli çağrıyı varsayılan olarak kapalı tutar.
