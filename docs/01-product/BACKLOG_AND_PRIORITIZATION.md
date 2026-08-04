# Backlog ve Önceliklendirme

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Bağlayıcı |
| Doküman sahibi | Product Owner |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Her planlama |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Öncelik modeli

RICE kullanılır: `Reach × Impact × Confidence / Effort`. Güvenlik, mevzuat ve veri bütünlüğü işleri skor beklemeden zorunlu sınıfa alınabilir.

## İş türleri

- Outcome epic: ölçülebilir kullanıcı sonucu.
- Feature: uçtan uca kullanıcı yeteneği.
- Enabler: mimari, güvenlik veya operasyon kapasitesi.
- Defect: beklenen davranıştan sapma.
- Experiment: hipotez ve zaman kutulu öğrenme.
- Debt: ölçülmüş bakım/kalite riski.

## Zorunlu backlog alanları

Problem, hedef kullanıcı, beklenen sonuç, kabul kriterleri, analitik olay, bağımlılık, güvenlik/veri etkisi, tahmin, owner ve rollout/rollback notu.

## Öncelik sınıfları

- P0: güvenlik açığı, veri kaybı, faturalama doğruluğu, servis tamamen kesik.
- P1: ana akış ciddi bozuk veya beta çıkışını engeller.
- P2: önemli değer/kalite artışı.
- P3: optimizasyon veya keşif.

## Sprint kapasitesi

Kapasitenin önerilen dağılımı: %60 ürün sonucu, %20 kalite/borç, %10 güvenlik/operasyon, %10 keşif. P0/P1 olaylarında Product Owner ve Tech Lead yeniden dengeleyebilir.

## MVP Backlog — Başlangıç Listesi

Aşağıdaki epik ve feature'lar [MVP_SCOPE.md](MVP_SCOPE.md) kabul kriterlerinden türetilmiştir. RICE skoru tahminidir; sprint planlamasında güncellenir.

### Kimlik ve Workspace (Enabler — P0)

| # | Feature | Tür | Öncelik | RICE tahmini | Bağımlılık |
|---|---|---|---|---|---|
| B-001 | OIDC ile kullanıcı kaydı ve giriş | Enabler | P0 | — | IDP sağlayıcı seçimi |
| B-002 | Workspace oluşturma ve üye daveti | Feature | P0 | 80 | B-001 |
| B-003 | Tenant izolasyonu ve API güvence testi | Enabler | P0 | — | B-002 |

### Proje ve DesignSpec (Feature — P0)

| # | Feature | Tür | Öncelik | RICE tahmini | Bağımlılık |
|---|---|---|---|---|---|
| B-010 | Proje oluşturma ve listeleme | Feature | P0 | 90 | B-002 |
| B-011 | DesignSpec v1 şema uygulaması ve validasyon | Enabler | P0 | — | ADR-0002 onayı |
| B-012 | Patch endpoint'i ve revision çakışma yönetimi | Enabler | P0 | — | B-011 |
| B-013 | Snapshot oluşturma ve okuma | Feature | P1 | 60 | B-011 |

### AI Üretim (Outcome Epic — P0)

| # | Feature | Tür | Öncelik | RICE tahmini | Bağımlılık |
|---|---|---|---|---|---|
| B-020 | Doğal dil brief'ten ScreenGraph üretimi | Feature | P0 | 85 | B-011, AI worker |
| B-021 | ScreenGraph'tan DesignSpec üretimi | Feature | P0 | 85 | B-020 |
| B-022 | Pydantic validasyon ve düzeltme döngüsü | Enabler | P0 | — | B-021 |
| B-023 | Job durumu SSE ile izleme | Feature | P0 | 70 | B-020 |
| B-024 | Generation job iptali | Feature | P1 | 50 | B-023 |
| B-025 | Hata durumunda kredi iadesi | Feature | P0 | 75 | B-020, B-040 |

### Görsel Editör (Feature — P1)

| # | Feature | Tür | Öncelik | RICE tahmini | Bağımlılık |
|---|---|---|---|---|---|
| B-030 | DesignSpec DOM render (MVP bileşen seti) | Feature | P1 | 70 | B-011, ADR-0004 |
| B-031 | Düğüm seçimi ve prop düzenleme | Feature | P1 | 65 | B-030 |
| B-032 | Undo/redo (revision tabanlı) | Feature | P1 | 55 | B-012 |
| B-033 | Ekranlar arası geçiş ve flow görünümü | Feature | P2 | 40 | B-030 |

### Kredi Sistemi (Enabler — P0)

| # | Feature | Tür | Öncelik | RICE tahmini | Bağımlılık |
|---|---|---|---|---|---|
| B-040 | Kredi ledger ve rezervasyon | Enabler | P0 | — | [PRICING_AND_CREDITS.md](../07-business/PRICING_AND_CREDITS.md) |
| B-041 | Kredi bakiye görüntüleme | Feature | P0 | 80 | B-040 |
| B-042 | Kredi satın alma (ödeme entegrasyonu) | Feature | P1 | 60 | B-040, ödeme sağlayıcı |

### Export (Feature — P1)

| # | Feature | Tür | Öncelik | RICE tahmini | Bağımlılık |
|---|---|---|---|---|---|
| B-050 | Figma export paketi oluşturma | Feature | P1 | 55 | B-011 |
| B-051 | ZIP/kod iskelet export | Feature | P2 | 35 | B-011 |

### Güvenlik ve Uyum (Enabler — P0)

| # | Feature | Tür | Öncelik | RICE tahmini | Bağımlılık |
|---|---|---|---|---|---|
| B-060 | Audit log (tüm mutasyonlar) | Enabler | P0 | — | [SECURITY_AND_PRIVACY.md](../05-security/SECURITY_AND_PRIVACY.md) |
| B-061 | Rate limit uygulama | Enabler | P0 | — | B-001 |
| B-062 | Prompt injection savunması ve guardrail testi | Enabler | P0 | — | B-020 |

## Beklenen MVP çıkışı için P0 kapanma sırası

1. B-001, B-002, B-003 (kimlik ve tenant temeli)
2. B-010, B-011, B-012 (proje ve şema)
3. B-040, B-041 (kredi altyapısı)
4. B-020 → B-022 → B-023 → B-025 (AI üretim döngüsü)
5. B-060, B-061, B-062 (güvenlik kapıları)
6. B-030, B-031 (editör MVP)

P1 ve P2 işler beta sonrası planlamaya alınır. Sıra değişikliği Product Owner onayı gerektirir.
