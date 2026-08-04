# Risk Kaydı

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Yaşayan doküman |
| Doküman sahibi | Project Manager |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | İki haftalık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Skala

Olasılık ve etki 1–5; skor çarpımdır. 15+ yüksek, 8–14 orta, ≤7 düşük. Her yüksek risk owner ve azaltma tarihi taşır.

| ID | Risk | O | E | Skor | Azaltma |
|---|---|---:|---:|---:|---|
| R-01 | AI tasarım kalitesi tutarsız | 4 | 5 | 20 | Registry, eval, repair, human control |
| R-02 | Model maliyeti marjı bozar | 4 | 4 | 16 | Routing, budget, cache, kredi fiyatı |
| R-03 | Cross-tenant veri erişimi | 2 | 5 | 10 | Authz, RLS değerlendirme, IDOR test |
| R-04 | Figma export kayıplı | 4 | 4 | 16 | Export IR, capability report, fixture |
| R-05 | Sağlayıcı kesintisi/rate limit | 3 | 4 | 12 | Queue, fallback, circuit breaker |
| R-06 | Kullanıcı referans görsel hakkı | 3 | 4 | 12 | Şartlar, bildirim, taklit guardrail |
| R-07 | Editör performansı büyük projede düşer | 3 | 4 | 12 | Profil, virtualization, screen lazy load |
| R-08 | Kredi yarış koşulu/yanlış kesinti | 2 | 5 | 10 | Ledger, transaction, reconciliation |
| R-09 | Ürün yalnız demo, retention düşük | 4 | 5 | 20 | Export/iteration odaklı discovery |
| R-10 | Kapsam şişmesi MVP'yi geciktirir | 4 | 4 | 16 | Scope gate, outcome roadmap |

## Risk toplantısı

Yüksek riskler iki haftada bir; güvenlik ve finansal bütünlük sürekli. Gerçekleşen risk issue/incident'e bağlanır, kalan risk ve karar kaydedilir.
