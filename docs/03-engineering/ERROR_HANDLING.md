# Hata Yönetimi Standardı

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Bağlayıcı |
| Doküman sahibi | Tech Lead |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Üç aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Hata sınıfları

Validation, authentication, authorization, not-found, conflict, quota, rate-limit, dependency, transient ve internal. Her sınıf HTTP/job davranışı, retry ve kullanıcı mesajı taşır.

## Kullanıcı mesajı

Teknik ayrıntı yerine ne oldu, etkisi nedir, kredi/veri durumu ve güvenli sonraki adım. Correlation ID destek için sunulur.

## Retry

Exponential backoff + jitter. Yalnız transient ve idempotent iş. Retry bütçesi ve maksimum süre. Permanent schema/policy hatası retry edilmez; repair veya kullanıcı girdisi gerekir.

## Job hatası

`failureCode`, safeMessage, retryable, stage, providerCategory ve creditDisposition. Ham provider body saklanmaz; güvenli debug metadata sınırlı retention ile tutulabilir.

## UI

Optimistic update başarısızsa state geri alınır veya conflict ekranı açılır. Sessiz başarısızlık yok. Toast, kalıcı banner ve inline hata önem derecesine göre seçilir.
