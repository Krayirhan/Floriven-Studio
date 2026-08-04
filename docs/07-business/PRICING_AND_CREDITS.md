# Fiyatlandırma ve Kredi Sistemi

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Hipotez |
| Doküman sahibi | Product ve Finance |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Tasarım ilkeleri

Basit, öngörülebilir ve maliyetle ilişkili. Kullanıcı işlem öncesi yaklaşık kredi görür; başarısız sistem/provider işi kredi tüketmez. Kredi para gibi işlem gördüğünden doğruluk ve audit zorunludur.

## Önerilen plan mantığı

| Plan | Hedef | Özellik |
|---|---|---|
| Free | Deneme | 1 workspace, sınırlı proje/kredi, watermark olabilir |
| Creator | Solo | Daha fazla kredi, export, private projects |
| Team | Küçük ekip | Üyeler, yorum, ortak marka kiti, daha yüksek limit |
| Enterprise | Kurumsal | SSO, audit, region, SLA, özel sözleşme |

Kesin fiyatlar pazar araştırması ve gerçek maliyet ölçümünden sonra belirlenir.

## Kredi olayları

- Başlangıç generation: ekran sayısı ve kalite profili.
- Ekran ekleme/yeniden üretme.
- Seçili AI patch: düşük kredi.
- Vision analizi.
- Premium export veya code generation.

Basit manuel edit, autosave, preview ve snapshot kredi tüketmemelidir.

## Ledger akışı

`RESERVE` işlem öncesi; `COMMIT` başarıda; `RELEASE` hata/iptalde. Aynı job reference için unique constraint. Admin adjustment iki kişi onayı ve gerekçe ister.

## Kötüye kullanım

Free hesap çoğaltma, webhook sahteciliği, concurrent overspend ve refund abuse. E-posta doğrulama, velocity limit, ledger transaction ve fraud signal uygulanır; haksız kullanıcı engellemesini azaltan itiraz süreci bulunur.
