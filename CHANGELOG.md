# Dokümantasyon Değişiklik Günlüğü

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Yaşayan doküman |
| Doküman sahibi | Dokümantasyon Agent |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Her sürüm |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## [1.1.0] - 2026-08-05

### Eklendi

- `docs/02-architecture/ADR-0001.md` — Core API modüler monolit kararı (bağlam, alternatifler, sonuçlar).
- `docs/02-architecture/ADR-0002.md` — DesignSpec kanonik ara model kararı.
- `docs/02-architecture/ADR-0003.md` — AI orkestrasyonu için ayrı Python worker kararı.
- `docs/02-architecture/ADR-0004.md` — Editörde DOM/SVG-first renderer kararı.

### Güncellendi

- `docs/02-architecture/ARCHITECTURE_DECISIONS.md` — ADR indeksi gerçek dosya linkleri ve çapraz referans tablosuyla genişletildi; statü "Önerilen" → "Kabul edildi" olarak güncellendi.
- `docs/02-architecture/DESIGN_SPEC.md` — Bölüm 13 eklendi: ilgili ADR, API, editör ve erişilebilirlik dokümanlarına çapraz referanslar.
- `docs/03-engineering/API_SPEC.md` — Çapraz referans bölümü eklendi: DesignSpec, ADR'ler, güvenlik ve kredi dokümanlarına bağlantılar.
- `docs/01-product/BACKLOG_AND_PRIORITIZATION.md` — MVP backlog başlangıç listesi eklendi: 62 feature/enabler, öncelik sınıfları, RICE tahminleri ve P0 kapanma sırası.
- `docs/04-ai/PROMPT_ENGINEERING.md` — Prompt örnekleri bölümü eklendi: ScreenGraph üretimi, DesignSpec patch ve node patch için açıklamalı örnek payload'lar ve eval kontrol listesi.

## [1.0.0] - 2026-08-05

### Eklendi

- Ürün vizyonu, PRD, MVP kapsamı ve yol haritası.
- Sistem, AI, editör, veri ve entegrasyon mimarisi.
- DesignSpec v1 sözleşmesi ve bileşen kayıt modeli.
- API, geliştirme, test, performans ve erişilebilirlik standartları.
- Güvenlik, tehdit modeli, veri saklama ve uyum yaklaşımı.
- Deployment, gözlemlenebilirlik, olay müdahalesi ve felaket kurtarma planları.
- İş modeli, kredi sistemi, pazara çıkış ve risk kaydı.
- Agent işletim modeli, uzman agent'lar ve çalışma şablonları.

## 2026-08-05 — Floriven Studio marka kesinleştirmesi

- Çalışma adı `MobileDesign AI`, resmî ürün adı `Floriven Studio` olarak güncellendi.
- `docs/00-brand/FLORIVEN_STUDIO.md` ürün ve marka kimliği dokümanı eklendi.
- Başlangıç rehberi, README, doküman indeksi ve proje varsayımları marka kararıyla uyumlu hâle getirildi.
