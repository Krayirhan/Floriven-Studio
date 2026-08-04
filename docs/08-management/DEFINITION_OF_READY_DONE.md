# Definition of Ready ve Done

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Bağlayıcı |
| Doküman sahibi | Product ve QA |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Üç aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Definition of Ready

- Problem ve hedef kullanıcı açık.
- Test edilebilir kabul kriteri var.
- Tasarım/akış veya teknik yaklaşım yeterli.
- Bağımlılıklar ve veri/güvenlik etkisi işaretli.
- Analitik/observability gereksinimi belli.
- Tahmin için yeterince küçük.
- Kırıcı karar varsa ADR başlatılmış.

## Definition of Done

- Kabul kriterleri sağlandı.
- Kod review ve CI geçti.
- Unit/integration/E2E uygun seviyede eklendi.
- Tenant, authz, hata ve idempotency ele alındı.
- Log/metrik/trace eklendi ve PII kontrol edildi.
- API/schema/docs güncel.
- Rollout/rollback planı var.
- Accessibility ve responsive davranış kontrol edildi.
- Feature flag temizleme işi planlandı.
- Product/QA onayı alındı.

## Tamamlanmayan iş

“Test sonra”, “doküman sonra” veya “refactor sonra” yalnız owner ve tarihli backlog kaydıyla kabul edilir; kritik doğruluk ve güvenlik işi ertelenmez.
