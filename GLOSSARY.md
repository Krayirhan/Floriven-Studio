# Terimler Sözlüğü

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Yaşayan doküman |
| Doküman sahibi | Ürün ve Mimari |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Ürün ve tasarım terimleri

| Terim | Tanım |
|---|---|
| DesignSpec | Ekranları, bileşen ağacını, token'ları, etkileşimleri ve meta veriyi taşıyan sürümlü JSON domain modeli. |
| ScreenGraph | Ekranlar arası amaç ve navigasyon ilişkisini tanımlayan üretim planı. |
| Design token | Renk, tipografi, boşluk, radius, gölge ve hareket gibi tasarım kararının isimlendirilmiş değeri. |
| Component Registry | AI ve editörün kullanmasına izin verilen doğrulanmış bileşen kataloğu. |
| Patch | Mevcut DesignSpec'in sınırlı bölümüne uygulanan kimlikli değişiklik seti. |
| Generation job | AI üretim veya revizyon işinin asenkron çalışma kaydı. |
| Export job | Figma, HTML, React Native veya Flutter çıktısı hazırlayan iş. |
| Workspace | Bir veya daha fazla kullanıcı ile projeyi, üyeliği ve faturalamayı kapsayan tenant. |
| Project | Aynı ürün fikrine ait ekranlar, varlıklar, sürümler ve ayarlar bütünü. |
| Snapshot | Belirli andaki değiştirilemez DesignSpec sürümü. |

## Operasyon ve güvenlik terimleri

| Terim | Tanım |
|---|---|
| RPO | Felakette kabul edilebilir en fazla veri kaybı süresi. |
| RTO | Hizmetin geri dönmesi için hedeflenen azami süre. |
| SLO | Kullanıcıya dönük güvenilirlik hedefi. |
| OIDC | Kimlik doğrulama katmanı sağlayan OpenID Connect standardı. |
| RBAC | Rol tabanlı yetkilendirme. |
| Tenant isolation | Bir workspace verisinin başka workspace tarafından erişilememesi garantisi. |
| PII | Kişisel olarak tanımlanabilir bilgi. |
| Prompt injection | Modeli sistem talimatlarından saptırmaya çalışan güvenilmez içerik. |
| Idempotency | Aynı isteğin tekrarında yan etkinin bir kez oluşması özelliği. |
| Ledger | Kredi ve para hareketlerinin değiştirilemez, eklemeli kayıt defteri. |
