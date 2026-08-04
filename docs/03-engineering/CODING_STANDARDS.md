# Kodlama Standartları

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Bağlayıcı |
| Doküman sahibi | Tech Lead |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Üç aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Genel

- Domain dili dosya ve sınıf adlarında tutarlı kullanılır.
- Public sözleşmeler explicit type taşır.
- Yan etkiler adapter sınırında; saf domain fonksiyonları tercih edilir.
- Hata yutulmaz; beklenen domain hatası typed, beklenmeyen hata izlenebilir olmalıdır.
- Magic number/string config veya isimlendirilmiş sabite taşınır.

## TypeScript

Strict mode zorunlu. `any` yalnız belgeli adapter sınırında ve hızlı validasyon sonrası. React component'leri presentational/container ayrımına dikkat eder. API server state'i query cache, DesignSpec document state'i ayrı store içinde tutulur. Güvensiz HTML render edilmez.

## Java/Spring

Controller ince, application service use-case odaklı, domain katmanı framework bağımsız olmalıdır. Transaction sınırı service/use-case düzeyinde. Entity doğrudan API DTO olarak dönmez. Repository sorguları tenant bağlamını zorunlu alır. `Optional` alan/parametre yerine dönüş değeri için kullanılır.

## Python/AI

Type hint, Pydantic model ve strict validation zorunlu. Provider adapter ile domain model ayrılır. Notebook kodu üretim modülüne doğrudan taşınmaz. Prompt'lar kod içinde dağınık string değil, sürümlü template/registry olarak tutulur.

## SQL

Migrasyonlar ileri yönlü ve geri alma planlıdır. Para/kredi için floating point kullanılmaz. Timestamp UTC. Foreign key, check constraint ve unique constraint uygulama kontrolünün yerine geçmez; onu tamamlar.

## Log

Yapılandırılmış log: timestamp, level, service, environment, correlationId, jobId, workspace pseudonym, event. Secret, access token, tam e-posta, ham prompt veya DesignSpec body loglanmaz.
