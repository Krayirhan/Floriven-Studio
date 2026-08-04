# Performans ve Ölçeklenebilirlik

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Hedef doküman |
| Doküman sahibi | Platform Lead |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Performans bütçeleri

| Akış | Hedef |
|---|---|
| Dashboard API read p95 | < 400 ms |
| Document autosave p95 | < 700 ms |
| Editör yerel input yanıtı | < 100 ms |
| İlk canvas görünümü | < 2,5 s orta proje |
| Generation job p95 | < 120 s MVP |
| Export job p95 | < 90 s orta proje |

## Kapasite modeli

Ana birimler: aktif workspace, eşzamanlı editör, dakikadaki generation job, ortalama DesignSpec boyutu, asset GB ve model token maliyeti. Aylık kapasite planı bu sürücülerle güncellenir.

## Ölçekleme yaklaşımı

Core API stateless yatay ölçeklenir. Worker concurrency queue ve provider rate limit'e göre otomatik ayarlanır. Workspace başına concurrent generation sınırı backpressure sağlar. Redis cache miss sistem doğruluğunu bozmamalıdır.

## Büyük proje stratejisi

DesignSpec node index, ekran bazlı lazy load, thumbnail cache ve incremental patch kullanılır. 1.000+ node için performans testi ayrı profil oluşturur. Export ekran bazında paralelleşebilir fakat final paketleme tek job koordinasyonuna bağlıdır.

## Yük testleri

API read/write, autosave burst, queue backlog, provider latency, object storage ve webhook storm senaryoları. Test sonucunda saturation point, hata oranı ve maliyet raporlanır.
