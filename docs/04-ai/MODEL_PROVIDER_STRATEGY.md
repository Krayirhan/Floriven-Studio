# Model ve Sağlayıcı Stratejisi

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Onay için hazır |
| Doküman sahibi | AI Lead |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Hedef

Kalite, gecikme, maliyet, veri politikası ve dayanıklılığı birlikte optimize ederek tek modele kilitlenmemek.

## Capability profilleri

- `FAST_TEXT`: brief/özet/sınıflandırma.
- `STRUCTURED_DESIGN`: yüksek şema uyumu ve planlama.
- `VISION_ANALYSIS`: referans görsel özellik çıkarımı.
- `REPAIR`: düşük maliyetli JSON/constraint düzeltme.
- `COPY_LOCALIZATION`: çok dilli UI metni.

## Routing

Routing kuralı görev, veri sınıfı, locale, token tahmini, workspace planı ve sağlayıcı sağlık durumunu kullanır. Premium model yalnız kalite farkı kanıtlanırsa seçilir. Fallback, veri politikası ve capability eşleşmeden yapılmaz.

## Sağlayıcı değerlendirme matrisi

| Boyut | Ölçüm |
|---|---|
| Kalite | Rubric skoru, kullanıcı kabulü, patch geri alma |
| Yapısallık | Valid JSON/şema oranı |
| Gecikme | p50/p95/p99 |
| Maliyet | Başarılı outcome başına maliyet |
| Güvenlik | Veri saklama, eğitim kullanımı, region, sözleşme |
| Dayanıklılık | Hata oranı, rate limit, incident geçmişi |

## Geçiş ve fallback

Provider adapter contract testleri ve golden eval seti zorunlu. Model değişimi canary tenant ile başlar. Kalite veya maliyet guardrail'i aşılırsa otomatik rollback yapılır.
