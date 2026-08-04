# İş Modeli

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Hipotez |
| Doküman sahibi | CEO/Product |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Model

Self-service SaaS + kullanım kredisi. Abonelik workspace özelliklerini ve aylık krediyi sağlar; yüksek maliyetli üretim/export ek kredi tüketebilir. Kurumsal plan güvenlik, yönetişim ve destek değerine dayanır.

## Müşteri segmentleri

- Solo geliştirici/kurucu.
- Küçük startup ürün ekibi.
- Freelancer ve ajans.
- Orta ölçek ürün/inovasyon ekibi.
- Kurumsal tasarım sistemi ekibi (sonraki faz).

## Gelir kaynakları

Aylık/yıllık abonelik, ek kredi, ekip koltuğu veya workspace bazlı plan, kurumsal sözleşme, ileride marketplace komisyonu ve özel entegrasyon.

## Maliyet sürücüleri

Model token/görsel maliyeti, compute/queue, storage/egress, payment fee, support ve Figma/export işlemleri. En kritik metrik: başarılı tasarım outcome'u başına değişken maliyet.

## Birim ekonomi formülleri

- Gross margin = (Gelir − değişken maliyet) / Gelir.
- CAC payback = CAC / aylık brüt kâr katkısı.
- Credit cost coverage = kredi geliri / krediye bağlı provider maliyeti.
- Expansion = ek kredi + ekip/plan yükseltmesi.

## Ticari varsayım testleri

Kullanıcı değer algısı generation değil export/iş akışı başarısına bağlı mı? Ajans daha fazla varyasyon için mi, kurucu hız için mi öder? Kredi görünürlüğü güveni artırıyor mu? Yıllık plan churn'ü azaltıyor mu?
