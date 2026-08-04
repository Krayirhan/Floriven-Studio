# Proje Varsayımları

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Onay gerekli |
| Doküman sahibi | Ürün ve Mimari |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Karar değiştikçe |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Neden bu dosya var?

Ürün adı Floriven Studio olarak kesinleştirilmiştir. Kesin teknoloji seçimleri, bütçe, ekip büyüklüğü ve ticari domain henüz onaylanmadığı için paket kontrollü varsayımlarla hazırlanmıştır. Her varsayım ya onaylanmalı ya da bir ADR ile değiştirilmelidir.

## Ürün varsayımları

| No | Varsayım | Etki |
|---|---|---|
| A-01 | Ürün web tabanlı, çok kiracılı SaaS olacaktır. | Tenant izolasyonu ve abonelik gerekir. |
| A-02 | İlk hedef, iOS ve Android için tasarım üretmektir; native uygulama derlemek MVP dışıdır. | Dışa aktarım ilk aşamada tasarım/kod taslağıdır. |
| A-03 | Kullanıcı prompt, marka renkleri, logo ve isteğe bağlı referans görsel sağlayabilir. | Multimodal giriş ve dosya güvenliği gerekir. |
| A-04 | Sistem, sıfırdan üretim ve seçili alanı yeniden üretme akışlarını destekler. | Tam üretim ve patch tabanlı düzenleme ayrılır. |
| A-05 | Ücretlendirme abonelik + kredi karmasıdır. | Kullanım ölçümü ve atomik kredi defteri gerekir. |
| A-06 | Türkçe ve İngilizce ilk dillerdir. | i18n ve içerik güvenliği çok dilli tasarlanır. |

## Teknik varsayımlar

- Ana iş kuralları Spring Boot servisinde tutulur.
- AI'a özel hızlı iterasyon için ayrı Python servisi kullanılır.
- Frontend monorepo içinde TypeScript ile geliştirilir.
- İlk editör DOM/SVG tabanlıdır; karmaşık WebGL/canvas motoru MVP sonrasına bırakılır.
- PostgreSQL tek doğruluk kaynağıdır; Redis geçici durum ve hızlandırma içindir.
- Büyük dosyalar doğrudan API üzerinden taşınmaz; imzalı URL ile nesne depolamaya yüklenir.
- Model sağlayıcısı soyutlanır; tek sağlayıcıya bağımlı domain modeli oluşturulmaz.

## Ekip varsayımları

Başlangıç ekibi: 1 ürün sahibi, 1 ürün tasarımcısı, 2 frontend, 2 backend, 1 AI mühendisi, 1 QA/otomasyon ve yarı zamanlı DevOps/güvenlik desteği. Daha küçük ekiplerde roller birleştirilebilir fakat onay sorumlulukları kaybolmaz.

## Açık kararlar

- Ticari domain, marka tescili ve sosyal hesap kullanılabilirliği.
- Figma entegrasyonunun plugin mi REST tabanlı ara servis mi olacağı.
- Kod dışa aktarımında ilk hedefin React Native mi Flutter mı olacağı.
- Verinin hangi bölgede saklanacağı ve hedef mevzuat kapsamı.

## Ertelenmiş sağlayıcı kararları

Aşağıdaki kararlar bilinçli olarak ertelenmiştir. İlgili backlog işleri bu kararlar netleşene kadar başlatılamaz. Her karar netleştiğinde bir ADR oluşturulmalı ve bu tablo güncellenmelidir.

| No | Karar | Bağımlı işler | Durum |
|---|---|---|---|
| D-01 | **IDP sağlayıcısı** — Auth0, Keycloak, Supabase Auth veya başka bir OIDC uyumlu sağlayıcı | B-001 (kimlik), B-002 (workspace), B-003 (tenant testi) | ⏸ Ertelendi |
| D-02 | **AI model sağlayıcısı** — Anthropic, OpenAI, Google veya çoklu sağlayıcı stratejisi | B-020 (ScreenGraph), B-021 (DesignSpec üretimi), B-022 (validasyon döngüsü) | ⏸ Ertelendi |
| D-03 | **Object storage** — AWS S3, Supabase Storage, MinIO veya başka S3-uyumlu çözüm | B-013 (snapshot), B-050 (export), dosya yükleme akışları | ⏸ Ertelendi |
| D-04 | **Deployment hedefi** — Docker Compose (lokal), Kubernetes, Railway, Render veya başka platform | CI/CD pipeline kurulumu, DevOps Agent görevleri | ⏸ Ertelendi |
| D-05 | **Ödeme sağlayıcısı** — Stripe, Paddle veya alternatif | B-042 (kredi satın alma), abonelik yönetimi | ⏸ Ertelendi |

> Bu kararlar netleşene kadar ilgili servisler için soyut interface ve stub implementasyon kullanılır; gerçek sağlayıcı adapter'ı karar sonrası eklenir.

## Varsayım değiştirme yöntemi

1. Değişiklik motivasyonunu yazın.
2. Etkilenen dokümanları ve veri migrasyonlarını belirleyin.
3. ADR oluşturun.
4. Güvenlik, maliyet ve kullanıcı deneyimi etkisini inceleyin.
5. Onay sonrası bu tabloyu ve ilgili dokümanları aynı PR içinde güncelleyin.
