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
- Kimlik sağlayıcısı ve ödeme sağlayıcısı.
- Figma entegrasyonunun plugin mi REST tabanlı ara servis mi olacağı.
- Kod dışa aktarımında ilk hedefin React Native mi Flutter mı olacağı.
- Verinin hangi bölgede saklanacağı ve hedef mevzuat kapsamı.
- AI modeli sağlayıcıları ve veri saklama sözleşmeleri.

## Varsayım değiştirme yöntemi

1. Değişiklik motivasyonunu yazın.
2. Etkilenen dokümanları ve veri migrasyonlarını belirleyin.
3. ADR oluşturun.
4. Güvenlik, maliyet ve kullanıcı deneyimi etkisini inceleyin.
5. Onay sonrası bu tabloyu ve ilgili dokümanları aynı PR içinde güncelleyin.
