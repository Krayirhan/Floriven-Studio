# Veri Saklama ve Uyum

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Onay gerekli |
| Doküman sahibi | Privacy Owner |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Altı aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Veri sınıfları

| Sınıf | Örnek | Varsayılan saklama |
|---|---|---|
| Hesap | E-posta, üyelik | Hesap süresi + yasal gereklilik |
| Müşteri içeriği | Prompt, logo, DesignSpec | Kullanıcı silene/plan politikasına kadar |
| Geçici üretim | Provider ara çıktı | Saatler/günler; mümkün olan en kısa |
| Export | İndirilebilir paket | 7–30 gün yapılandırılabilir |
| Audit | Rol, admin, silme | 1–7 yıl risk/yasal politikaya göre |
| Operasyon logu | Metadata, hata | 30–90 gün |
| Finans | Fatura/ledger | Yasal mali saklama süresi |

Rakamlar hukuk ve pazar kararıyla kesinleşmelidir.

## İlkeler

Amaçla sınırlılık, veri minimizasyonu, doğruluk, erişim kontrolü, süre sınırı ve hesap verebilirlik. Her veri alanı için owner ve processing purpose kaydı tutulur.

## Kullanıcı hakları

Veri export'u, düzeltme, silme ve hesap kapatma akışları. Silme talebi asenkron takip numarası üretir; backup'ta silme doğal retention döngüsünde gerçekleşir ve yeniden yüklemede geri dönmemesi sağlanır.

## Alt işleyenler

Model, storage, email, analytics, payment ve error tracking sağlayıcıları listelenir; veri türü, region, saklama ve sözleşme bağlantısı kaydedilir. Değişiklik için privacy review gerekir.

## Veri bölgesi

Workspace region alanı geleceğe dönük tutulur. Tek region MVP kararı kullanıcıya şeffaf olmalı; region taşınması export/import ve anahtar rotasyonu planı gerektirir.
