# Agent İşletim Modeli

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Bağlayıcı |
| Doküman sahibi | AI Platform Owner |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Amaç

AI agent'ların hızlı fakat kontrollü katkı yapmasını; görev, bağlam, yetki, doğrulama ve teslim formatının standart olmasını sağlar.

## Agent türleri

- Planlayıcı: işi böler, dosya/bağımlılık çıkarır; kod yazmayabilir.
- Uygulayıcı: dar alanda kod/doküman değiştirir.
- İnceleyici: hata, güvenlik ve sözleşme çelişkisi arar; uygulayıcıdan bağımsız olmalıdır.
- Test agent'ı: test tasarımı, fixture ve failure triage.
- Operasyon agent'ı: runbook ve deployment; üretim write yetkisi varsayılan yoktur.

## Yetki modeli

Read-only varsayılan. Repo write görevle sınırlı. Production, secret, ödeme, kullanıcı verisi ve destructive DB erişimi insan onayı gerektirir. Agent'ın tool yetkisi görev bitince kaldırılır.

## Context pack

Her görevde: görev/acceptance criteria, ilgili AGENTS, mimari sözleşme, değişecek dosyalar, test komutları, yasaklar ve çıktı formatı. Gereksiz tüm repo veya müşteri verisi bağlama eklenmez.

## Kontrol döngüsü

Plan → küçük değişiklik → local validation → self-review → uzman review → CI → insan onayı. Agent “test geçti” iddiasını gerçek komut sonucu olmadan yapmaz.

## Değerlendirme

Doğruluk, kapsam disiplini, test, güvenlik, doküman tutarlılığı, diff boyutu ve hallucination/uydurma oranı. Tek görev başarısı kalıcı güven anlamına gelmez.
