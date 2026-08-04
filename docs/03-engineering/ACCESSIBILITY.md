# Erişilebilirlik Standardı

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Bağlayıcı |
| Doküman sahibi | Ürün Tasarımı ve QA |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Her ana sürüm |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Hedef

Ürünün web arayüzü WCAG 2.2 AA hedefler. Ayrıca üretilen mobil tasarımlar için erişilebilirlik uyarıları ve önerileri sağlanır; otomatik kontrol yasal uygunluk garantisi olarak sunulmaz.

## Web uygulaması gereksinimleri

- Tam klavye erişimi ve görünür focus.
- Semantik HTML/ARIA; headless component testleri.
- Kontrast, zoom ve reflow.
- Screen reader ile onboarding, editör paneli ve export akışı.
- Drag/drop için klavye alternatifi.
- Hata mesajının yalnız renkle anlatılmaması.
- Hareket azaltma tercihi.

## Editör özel gereksinimleri

Canvas'taki seçimin layer tree ve inspector ile eşleşen erişilebilir temsili bulunur. Node seçme, taşıma ve property değiştirme klavyeyle yapılabilir. Kısayollar yardım panelinde listelenir ve çakışmalar yönetilir.

## Üretilen tasarım kontrolleri

- Metin/arka plan kontrastı.
- Minimum dokunma hedefi.
- Anlamlı label ve role.
- Renk dışında durum göstergesi.
- Dinamik metin büyütmede taşma riski.
- Form label, hata ve sıra.

## Doğrulama

Otomatik axe sınıfı tarama + klavye testi + screen reader manuel test. Kritik akışlar her release'te; tam denetim ana sürümlerde.
