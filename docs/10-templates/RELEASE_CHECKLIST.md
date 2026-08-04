# Release Kontrol Listesi

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Şablon |
| Doküman sahibi | Release Manager |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Her sürüm |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Ürün

- [ ] Kabul kriterleri ve scope onaylandı.
- [ ] Release note hazır.
- [ ] Analytics event doğrulandı.

## Mühendislik

- [ ] CI, contract, schema ve E2E geçti.
- [ ] Migration rehearsal tamamlandı.
- [ ] Feature flag ve rollback hazır.
- [ ] API/DesignSpec geriye uyumluluk kontrol edildi.

## Güvenlik ve gizlilik

- [ ] Dependency/secret/security scan temiz.
- [ ] Authz/tenant testleri geçti.
- [ ] Veri saklama veya alt işleyen etkisi incelendi.

## Operasyon

- [ ] Dashboard, alarm ve runbook güncel.
- [ ] Kapasite ve provider limit kontrol edildi.
- [ ] Backup/restore durumu sağlıklı.
- [ ] Support bilgilendirildi.

## Rollout

- [ ] Canary metrikleri tanımlı.
- [ ] Go/no-go sahipleri hazır.
- [ ] Rollback tetik eşiği belirli.
