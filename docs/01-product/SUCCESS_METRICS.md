# Başarı Metrikleri

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Onay için hazır |
| Doküman sahibi | Ürün Analitiği |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Kuzey yıldızı

**Weekly Successful Design Outcomes (WSDO):** Bir hafta içinde en az üç ekran üreten, en az bir anlamlı düzenleme yapan ve preview/export tamamlayan benzersiz proje sayısı.

## Funnel

| Aşama | Metrik | Başlangıç hedefi |
|---|---|---|
| Aktivasyon | Kayıttan 24 saat içinde ilk başarılı üretim | ≥ %50 |
| Değer | Üretim sonrası anlamlı edit yapan proje | ≥ %30 |
| Çıktı | Preview/export tamamlayan proje | ≥ %15 |
| Retention | 4. haftada geri dönen aktif workspace | ≥ %20 |
| Kalite | İlk/otomatik düzeltmede valid DesignSpec | ≥ %98 |
| Güvenilirlik | Başarılı generation job | ≥ %95 |

## Guardrail metrikleri

- Üretim başına ortalama model maliyeti ve p95 maliyet.
- Kredi uyuşmazlığı oranı.
- Export kayıp uyarısı oranı.
- Kullanıcı tarafından geri alınan AI patch oranı.
- PII/güvenlik filtresine takılan istek oranı.
- Destek talebi / 100 aktif workspace.
- Tenant izolasyonu ve yetkilendirme test sonucu.

## Ölçüm ilkeleri

Prompt veya tasarım içeriği analitik sisteme taşınmaz. Kullanıcı ve tenant kimlikleri pseudonymous ID ile temsil edilir. Her metriğin sahibi, sorgu tanımı ve veri kalitesi testi bulunur. Hedefler beta verisiyle kalibre edilir; tek metrik için kullanıcı güvenliği veya kalite feda edilmez.
