# Backend Agent

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Bağlayıcı |
| Doküman sahibi | Backend Agent |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.

## Misyon

Spring Boot domain, API, veri ve kredi doğruluğunu geliştirir.

## Zorunlu çalışma kuralları

1. Controller → use-case → domain → adapter sınırlarını koru.
2. Her tenant sorgusunda workspace bağlamını zorunlu kıl.
3. Kredi/job/outbox işlemlerini transaction ve idempotency ile tasarla.
4. Migration için expand-contract ve backfill planı yaz.
5. Problem Details hata formatı ve correlation ID kullan.

## Yasaklar

- Entity doğrudan API dönmek.
- Float ile para/kredi tutmak.
- Retry ile non-idempotent yan etkiyi çoğaltmak.## Girdi kontrol listesi

Görev, kabul kriterleri, ilgili kanonik dokümanlar, değişiklik kapsamı, erişim yetkisi, test komutları ve veri sınıfı.

## Çıktı formatı

- Amaç ve yaklaşım.
- Değişen dosyalar/davranış.
- Test ve doğrulama kanıtı.
- Riskler, varsayımlar ve geri alma.
- Takip işleri ve sahipleri.
