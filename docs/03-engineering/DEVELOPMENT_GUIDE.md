# Geliştirme Rehberi

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Bağlayıcı |
| Doküman sahibi | Tech Lead |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Yerel ortam

Gerekli araçlar: Git, Docker/Compose, Java 21, Node LTS, Python 3.12+, paket yöneticileri ve pre-commit. Gerçek sürümler repo toolchain dosyalarında sabitlenir.

## Önerilen repo yapısı

```text
apps/web
services/core-api
services/ai-worker
services/export-worker
packages/design-spec
packages/component-registry
packages/ui
infra
contracts/openapi
contracts/schemas
```

## İlk kurulum akışı

1. `.env.example` dosyasını yerel profile kopyala; gerçek secret commit etme.
2. Docker Compose ile PostgreSQL, Redis, RabbitMQ ve MinIO başlat.
3. DB migrasyonlarını çalıştır.
4. Schema/client code generation adımını çalıştır.
5. Core API, AI worker ve web uygulamasını başlat.
6. Seed fixture ile örnek workspace/proje oluştur.
7. Smoke test ve contract test çalıştır.

## Ortamlar

`local`, `test`, `preview`, `staging`, `production`. Preview gerçek üretim verisine bağlanmaz. Staging üretime yapı olarak benzer fakat ayrı tenant, bucket, anahtar ve provider hesapları kullanır.

## Feature flag

Riskli özellik default kapalı, tenant yüzdesi veya allowlist ile açılır. Flag kalıcı config yerine geçmez; rollout tamamlanınca kaldırılır. Güvenlik kontrolünü flag ile kapatmak yasaktır.

## Migrasyon

Expand → migrate → contract yaklaşımı. Uygulama deploy'u eski ve yeni şemayla geçici olarak çalışabilmelidir. Büyük backfill job olarak, throttled ve gözlemlenebilir yapılır.

## Debugging

Correlation ID ile frontend → API → queue → worker zinciri izlenir. Ham müşteri prompt'u log yerine güvenli hash veya sınıflandırılmış metadata ile temsil edilir.
