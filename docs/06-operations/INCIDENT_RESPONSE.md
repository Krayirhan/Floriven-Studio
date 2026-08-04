# Olay Müdahale Planı

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Bağlayıcı |
| Doküman sahibi | Incident Commander |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Üç aylık tatbikat |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Seviye

- SEV-1: Veri sızıntısı, yaygın kesinti, kredi/ödeme bütünlüğü veya veri kaybı.
- SEV-2: Ana akış ciddi etkilenmiş, workaround sınırlı.
- SEV-3: Kısmi bozulma veya sınırlı tenant.
- SEV-4: Düşük etkili operasyon sorunu.

## Roller

Incident Commander, Technical Lead, Communications Lead, Scribe ve alan uzmanı. Aynı kişi küçük olayda rol birleştirebilir; karar ve zaman çizelgesi kaydı korunur.

## Akış

1. Algıla ve olay kanalı/kaydı aç.
2. Etki, kapsam ve veri sınıfını değerlendir.
3. Containment: feature kapatma, provider kesme, token iptali veya rollback.
4. Kullanıcı iletişimi ve durum güncellemesi.
5. Kalıcı düzeltme ve doğrulama.
6. 2–5 iş günü içinde suçlayıcı olmayan postmortem.

## İlk 15 dakika kontrolü

- Olay kimliği ve komutan.
- Başlangıç zamanı ve etkilenen hizmet.
- Son deploy/config/provider değişimi.
- Güvenlik/veri etkisi şüphesi.
- Rollback veya kill switch kararı.
- Kanıtların korunması.

## İletişim

Kesinleşmemiş kök neden tahmin olarak sunulmaz. Bilinen etki, başlama zamanı, alınan aksiyon ve sonraki güncelleme zamanı paylaşılır. Mevzuat bildirim süreleri privacy/legal owner ile yönetilir.
