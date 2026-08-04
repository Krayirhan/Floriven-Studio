# Git ve Pull Request Akışı

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Bağlayıcı |
| Doküman sahibi | Tech Lead |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Altı aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Model

Trunk-based development. `main` her zaman deploy edilebilir. Kısa ömürlü branch, zorunlu CI ve feature flag ile risk azaltılır.

## Branch adları

`feat/`, `fix/`, `chore/`, `docs/`, `sec/`, `spike/`. Issue numarası varsa eklenir.

## Commit

Conventional Commits. Commit, tek mantıksal değişiklik taşımalı; secret, generated binary veya kişisel dosya içermemeli. Generated contract çıktıları repo politikasına göre birlikte güncellenir.

## PR kapıları

- Lint, format, type-check.
- Unit/integration/contract test.
- Dependency ve secret scan.
- Migration doğrulama.
- Kritik alanda code owner onayı.
- Preview ortam smoke testi.

## Merge ve release

Squash merge varsayılan. PR başlığı changelog girdisine dönüşebilir. Kırıcı sözleşme değişikliği release note ve migrasyon rehberi ister.
