# AI Değerlendirme Sistemi

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Bağlayıcı |
| Doküman sahibi | AI Lead ve QA |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Her model/prompt değişikliği |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Eval katmanları

### Deterministic

Şema, ID, referans, registry, property sınırı, kontrast, taşma, action güvenliği ve export capability.

### Rubric tabanlı

- Brief'e uygunluk.
- Ekran akışının bütünlüğü.
- Görsel hiyerarşi.
- Tasarım sistemi tutarlılığı.
- Mobil platform uygunluğu.
- Metin kalitesi.
- Düzenlenebilirlik ve export edilebilirlik.

Her boyut 1–5 puan; otomatik hakem insan örnekleriyle kalibre edilir ve tek başına release kararı vermez.

## Veri seti

En az 100 başlangıç örneği: e-ticaret, fintech, sağlık, eğitim, sosyal, üretkenlik, seyahat ve içerik. Türkçe/İngilizce, kısa/uzun brief, logo/renk/referans görsel ve adversarial girişler. Lisansı ve kaynağı kayda alınır.

## Release kapısı

- Şema başarı oranı gerilememeli.
- Kritik güvenlik testlerinde sıfır başarısızlık.
- Ortalama kalite mevcut üretim modelinden anlamlı derecede düşük olmamalı.
- Maliyet/outcome bütçeyi aşmamalı.
- En az %5 canary trafiğinde online guardrail sağlanmalı.

## Online sinyaller

Patch kabulü, undo, tekrar üretim, export, kullanıcı puanı, job hata ve destek bildirimi. İçerik tutulmadan event/aggregate ölçülür.

## Eval raporu

Model/prompt sürümü, veri seti hash'i, metrikler, örnek hatalar, riskler, karar ve rollback koşulu.
