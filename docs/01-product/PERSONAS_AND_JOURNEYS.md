# Persona ve Kullanıcı Yolculukları

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Onay için hazır |
| Doküman sahibi | Ürün Tasarımı |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Altı aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Persona 1 — Teknik kurucu

**Amaç:** Yatırımcı görüşmesi veya müşteri doğrulaması için hızlı prototip.  
**Acı noktası:** Tasarımcı beklemek, Figma'da yavaş kalmak, kodlamadan önce akışı görememek.  
**Başarı anı:** Aynı gün içinde düzenlenebilir ekran seti ve paylaşılabilir preview.

## Persona 2 — Ürün yöneticisi

**Amaç:** Gereksinimi görsel hale getirip paydaşlarla hizalanmak.  
**Acı noktası:** Metin gereksinimlerinin yanlış anlaşılması ve tasarım kapasitesi kuyruğu.  
**Başarı anı:** ScreenGraph ve ekranların PRD kabul kriterleriyle tutarlı olması.

## Persona 3 — Freelancer/ajans tasarımcısı

**Amaç:** Keşif ve varyasyon süresini kısaltıp son rötuşlara odaklanmak.  
**Acı noktası:** Tekrarlı başlangıç ekranları ve marka uyarlaması.  
**Başarı anı:** Token'ları tek noktadan değiştirip Figma'da sürdürebilmek.

## Yolculuk: ilk proje

| Aşama | Kullanıcı sorusu | Ürün davranışı | Risk |
|---|---|---|---|
| Keşif | “Bu araç benim uygulama türümü anlar mı?” | Örnekler ve net kapsam | Aşırı vaat |
| Onboarding | “Ne yazmalıyım?” | Yapılandırılmış brief ve örnek prompt | Boş sayfa korkusu |
| Üretim | “Ne kadar sürecek, kredi gitti mi?” | Aşama durumu, iptal ve kredi rezervasyonu | Belirsizlik |
| İnceleme | “Neyi neden üretti?” | ScreenGraph ve token görünümü | Kontrol kaybı |
| Düzenleme | “Bunu kolayca değiştirebilir miyim?” | Doğrudan manipülasyon ve AI patch | Veri kaybı |
| Export | “Figma/kodda bozulacak mı?” | Uyumluluk ve kayıp raporu | Güven kaybı |

## Kritik hizmet anları

- İlk üretimin başarısız olması.
- Kullanıcının kredisi bitmesi.
- Referans görselin reddedilmesi.
- Export'ta desteklenmeyen bileşen görülmesi.
- Yanlışlıkla büyük değişiklik yapılması.

Bu anlarda sistem teknik hata kodu değil, gerçekleşen durum, veri/kredi etkisi ve bir sonraki güvenli adımı göstermelidir.
