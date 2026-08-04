# Teknoloji Yığını

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Önerilen |
| Doküman sahibi | Tech Lead |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Üç aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Seçim kriterleri

Ekip yetkinliği, uzun dönem destek, type safety, observability, test edilebilirlik, sağlayıcı bağımsızlığı ve toplam işletim maliyeti.

## Önerilen stack

| Katman | Teknoloji | Gerekçe |
|---|---|---|
| Web | React, TypeScript, Next.js sınıfı framework | Dashboard + editör, güçlü ekosistem |
| UI | Tailwind CSS, headless accessible primitives | Hızlı ve tutarlı geliştirme |
| State | Zustand/Redux Toolkit sınıfı + TanStack Query | Yerel document ve server state ayrımı |
| Core API | Java 21, Spring Boot 3.x | Domain, transaction, güvenlik |
| AI service | Python 3.12+, FastAPI, Pydantic | Structured AI ve hızlı iterasyon |
| DB | PostgreSQL | Transaction, JSONB, güvenilirlik |
| Cache | Redis | Rate limit, lock, geçici state |
| Queue | RabbitMQ veya yönetilen eşdeğer | İş kuyruğu, DLQ, routing |
| Storage | S3 uyumlu | Büyük asset ve export |
| Schema | JSON Schema + OpenAPI | Sözleşme ve code generation |
| Test | JUnit, Testcontainers, pytest, Playwright | Katmanlı test |
| Observability | OpenTelemetry, Prometheus/Grafana, Sentry sınıfı | İz, metrik, hata |
| IaC | Terraform/OpenTofu | Tekrarlanabilir altyapı |

## Sürüm politikası

Bu doküman major ürün sürümü belirtmez; gerçek repo lockfile ve build dosyaları kesin sürümü tutar. LTS/stable kanallar tercih edilir. Güvenlik güncellemeleri otomatik PR ve kontrollü rollout ile alınır.

## Kaçınılacak seçimler

- MVP'de gereksiz mikroservis çoğaltma.
- Provider SDK tiplerini domain'e sızdırma.
- Kritik veriyi yalnız Redis'te tutma.
- Editör document state'ini React component local state'ine dağıtma.
- Şemasız model yanıtı ve keyfi kod çalıştırma.
