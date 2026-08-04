# Tehdit Modeli

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Onay gerekli |
| Doküman sahibi | Security Owner |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Her mimari değişiklik |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Varlıklar

Müşteri prompt ve görselleri, DesignSpec, export paketleri, kullanıcı kimliği, OAuth token'ları, kredi/ödeme kayıtları, model API anahtarları ve audit log.

## Güven sınırları

Browser ↔ API, API ↔ DB/cache/storage/queue, worker ↔ model sağlayıcı, payment/Figma webhook, admin/support yüzeyi ve CI/CD.

## STRIDE özeti

| Tehdit | Örnek | Kontrol |
|---|---|---|
| Spoofing | Çalınmış token | OIDC, MFA, kısa ömür, anomaly |
| Tampering | DesignSpec veya kredi değişimi | revision, hash, transaction, ledger |
| Repudiation | Admin eylemini inkâr | immutable audit |
| Information disclosure | Cross-tenant IDOR | server authz, tenant tests |
| Denial of service | Çok sayıda pahalı generation | quota, queue, rate limit |
| Elevation | Viewer'ın export/admin yapması | RBAC + resource check |

## AI özel saldırılar

- Referans görsel OCR metniyle prompt injection.
- Modelin registry dışı URL/action üretmesi.
- Büyük prompt ile maliyet/timeout saldırısı.
- Model output'unda XSS payload.
- Provider callback veya tool parametre manipülasyonu.

Kontroller: content boundary, strict schema, sanitization, allowlist, budget, sandbox ve output encoding.

## Kritik kötüye kullanım senaryosu

Saldırgan başka tenant'ın snapshot ID'sini tahmin eder. Kontrol: UUID tek başına savunma değildir; her read/download isteği workspace ownership kontrolü, kısa süreli signed URL ve audit ile korunur.

## Kabul edilen riskler

MVP'de tek region kullanımı bölgesel kesintide downtime riski taşır; şifreli backup ve belgeli RTO ile kabul edilebilir. Gerçek zamanlı ortak çalışma olmadığı için presence saldırı yüzeyi ertelenir.
