# Entegrasyon Mimarisi

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Onay için hazır |
| Doküman sahibi | Solution Architect |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Üç aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Entegrasyon ilkeleri

Dış sağlayıcılar adapter arkasında tutulur, tüm çağrılar timeout ve correlation ID taşır, webhook'lar imza + replay korumasıyla işlenir, domain modeli sağlayıcı ID'sini tek anahtar olarak kullanmaz.

## Entegrasyonlar

| Sistem | Yön | Amaç | Dayanıklılık |
|---|---|---|---|
| OIDC IdP | Gidiş/dönüş | Kimlik | JWKS cache, clock skew |
| Model provider | Gidiş | LLM/vision | timeout, retry, circuit breaker |
| Object storage | Gidiş | Asset/export | signed URL, checksum |
| Payment | Çift yön | Abonelik/kredi | signed webhook, idempotency |
| Email | Gidiş | Davet/bildirim | queue, suppression |
| Figma | Gidiş | Tasarım aktarımı | OAuth scope, job retry |
| Error tracking | Gidiş | Hata izleme | PII redaction |

## Webhook işleme

Webhook endpoint hızlıca doğrular ve ham olayın güvenli özetini inbox tablosuna yazar; işleme asenkron yapılır. Aynı provider event ID ikinci kez yan etki oluşturmaz. İşleme başarısızlıkları DLQ ve admin retry ile yönetilir.

## Figma dışa aktarım

DesignSpec → export IR → Figma node mapping. Desteklenmeyen özellikler fallback veya warning üretir. Token'lar styles/variables'a, bileşenler mümkün olduğunda component instance'a map edilir. OAuth token şifreli tutulur ve en az scope istenir.

## Sağlayıcı değişimi

Her adapter için contract test ve fake implementation bulunur. Sağlayıcıya özgü hata kodları domain hata sınıflarına eşlenir. Çıkış planı: veri export'u, token iptali, config değişimi ve rollback.
