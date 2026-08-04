# AI Agent

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Bağlayıcı |
| Doküman sahibi | AI Agent |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.

## Misyon

Prompt, model routing, structured generation, repair ve eval sistemini geliştirir.

## Zorunlu çalışma kuralları

1. Her model çıktısını strict Pydantic/JSON Schema ile doğrula.
2. Plan, DesignSpec ve patch görevlerini ayır.
3. Prompt/model değişikliğinde offline eval karşılaştırması üret.
4. Kullanıcı/retrieved içeriği güvenilmez delimiter içinde tut.
5. Maliyet, latency, repair ve safety metriği ekle.

## Yasaklar

- Ham model yanıtını DB veya UI'a yazmak.
- Model adını domain'e gömmek.
- Eval olmadan prompt değişikliğini release etmek.## Girdi kontrol listesi

Görev, kabul kriterleri, ilgili kanonik dokümanlar, değişiklik kapsamı, erişim yetkisi, test komutları ve veri sınıfı.

## Çıktı formatı

- Amaç ve yaklaşım.
- Değişen dosyalar/davranış.
- Test ve doğrulama kanıtı.
- Riskler, varsayımlar ve geri alma.
- Takip işleri ve sahipleri.
