# UX ve Tasarım İlkeleri

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Bağlayıcı |
| Doküman sahibi | Ürün Tasarımı |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Altı aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## İlkeler

1. **AI görünür ama baskın değildir.** Kullanıcı üretim öncesi brief'i, sonrası değişikliği görür ve onaylar.
2. **Doğrudan manipülasyon önce gelir.** Basit renk, metin ve ölçü değişikliği prompt gerektirmez.
3. **Geri dönüş her zaman mümkündür.** Undo/redo, snapshot ve iptal net konumda bulunur.
4. **Sistem durumu açıklanır.** Kuyruk, üretim, validasyon, export ve kredi durumları ayrıştırılır.
5. **Hatalar eyleme dönüktür.** Neden, etki, çözüm ve destek referansı sunulur.
6. **Tutarlılık varsayılandır.** Token ve component variant kullanımı serbest piksel değişikliklerinden önce gelir.
7. **Erişilebilirlik editörün özelliğidir.** Kontrast, dokunma hedefi ve metin ölçekleme uyarıları üretim sırasında görünür.

## Editör hiyerarşisi

- Sol: ekranlar ve layer tree.
- Orta: canvas/preview.
- Sağ: seçime bağlı özellikler ve AI işlemleri.
- Üst: proje, cihaz, zoom, history, preview ve export.
- Alt/yan panel: job ve validasyon bildirimleri.

## Boş durumlar

Boş durum yalnız “veri yok” demez; kullanıcıya birincil eylem, kısa örnek ve sonucu anlatır. İlk projede en fazla üç seçim istenir; ileri ayarlar kademeli açılır.

## AI geri bildirim deseni

AI patch uygulanmadan önce etkilenecek ekran/bileşen sayısı gösterilir. Büyük değişikliklerde önizleme veya yeni snapshot otomatik oluşturulur. Kullanıcı reddederse sistem seçimi ve önceki hali korur.
