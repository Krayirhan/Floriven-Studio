# Felaket Kurtarma

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Onay gerekli |
| Doküman sahibi | Platform Lead |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Altı aylık tatbikat |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Hedefler

MVP önerisi: kritik metadata için RPO ≤ 15 dakika, RTO ≤ 4 saat. Genel kullanımda hedefler iş etkisi ve maliyetle yeniden belirlenir.

## Kapsam

PostgreSQL, object storage, secret/config, container registry, IaC state, queue'daki yeniden oluşturulabilir işler ve audit kayıtları.

## Backup

PITR destekli DB backup, object versioning/lifecycle, ayrı hesap/region kopyası değerlendirmesi. Backup varlığı değil restore başarısı ölçülür. Şifreleme anahtarı erişimi backup'tan ayrı korunur.

## Kurtarma sırası

1. Kimlik/config/secrets.
2. Database ve tenant metadata.
3. Object storage snapshot/asset.
4. Core API read-only.
5. Worker ve queue.
6. Export/payment entegrasyonları.
7. Reconciliation ve tam trafik.

## Queue kaybı

Job tablosu doğruluk kaynağı olduğu için queued/running ve lease'i dolmuş işler yeniden publish edilebilir. İdempotency ikinci kredi veya snapshot oluşmasını engeller.

## Tatbikat

Altı ayda bir tam restore, üç ayda bir tabletop. Ölçülen RPO/RTO, eksik izin, runbook problemi ve iyileştirme owner'ı kaydedilir.
