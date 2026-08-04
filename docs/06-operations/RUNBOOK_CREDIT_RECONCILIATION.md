# Runbook — Kredi Uzlaştırma

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Operasyonel |
| Doküman sahibi | Backend/Finance On-call |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Amaç

Ledger toplamı, hesap projeksiyonu ve job durumları arasındaki farkı güvenli şekilde tespit ve düzeltmek.

## Kontroller

- Account balance vs ledger sum.
- RESERVE olup terminal job/COMMIT/RELEASE olmayan kayıt.
- Aynı reference için birden fazla yan etki.
- Payment event ile grant/purchase uyuşması.

## Düzeltme

Ledger satırı değiştirilmez veya silinmez. Yeni `ADJUSTMENT`/`RELEASE` kaydı, incident/ticket referansı ve iki kişi onayıyla eklenir. Büyük etki varsa generation geçici durdurulur.

## Sonuç

Etkilenen workspace, miktar, kök neden, kullanıcı iletişimi ve kalıcı aksiyon raporlanır.
