# MVP Kapsamı

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Onay gerekli |
| Doküman sahibi | Product Owner |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Her sprint planı |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## MVP hedefi

Tek bir kurucunun veya küçük ekibin, ürün fikrinden üç ila on düzenlenebilir mobil ekrana ulaşıp bunları paylaşılabilir preview veya Figma uyumlu çıktıya dönüştürmesini kanıtlamak.

## Dahil

- E-posta/OIDC giriş ve tek workspace.
- Proje sihirbazı ve doğal dil brief.
- Logo/renk/referans görsel yükleme.
- iOS ve Android görsel profilleri; tek projede birincil profil.
- ScreenGraph ve DesignSpec üretimi.
- 15–20 doğrulanmış temel mobil bileşen.
- Layer tree, özellik paneli, taşıma/resize, metin ve token düzenleme.
- Undo/redo ve otomatik kaydetme.
- Seçili bileşen veya ekran için AI patch.
- Snapshot ve temel versiyon geri yükleme.
- HTML preview paketi ve Figma aktarım yolu.
- Abonelik + kredi ledger altyapısı; bir ücretsiz ve bir ücretli plan.
- Temel admin, audit log, job izleme ve destek araçları.

## MVP dışında

- Gerçek zamanlı çok kullanıcılı düzenleme.
- Tam native uygulama build ve mağazaya gönderim.
- Kullanıcının özel component kütüphanesini otomatik koddan içe aktarma.
- Gelişmiş animasyon timeline'ı ve prototip mikro etkileşimleri.
- Masaüstü/tablet/web responsive tasarım üretimi.
- Marketplace, topluluk şablon satışı ve gelir paylaşımı.
- Offline editör.
- Kurumsal SSO/SCIM, özel VPC ve müşteri anahtarlı şifreleme.

## Kapsam koruma kuralları

Bir özellik MVP'ye eklenmek için şu üç koşulun tamamını sağlamalıdır: ana akışı bloke ediyor, mevcut bileşenlerle iki sprint içinde üretilebilir ve başarı metriğine doğrudan etki ediyor. Aksi hâlde roadmap'e alınır.

## MVP kalite eşiği

- Veri kaybına yol açan bilinen P0/P1 hata yok.
- Kritik güvenlik bulgusu yok.
- Üretim ve export akışlarında en az %95 job başarı oranı.
- Kredi/ödeme tutarsızlığı için otomatik reconciliation mevcut.
- 25 örnek brief'te uzman incelemesinden ortalama 3,5/5 üzeri tasarım kullanılabilirliği.

## Çıkış kararı

Product Owner, Tech Lead, Security Owner ve QA Lead birlikte go/no-go kararı verir. Büyüme metriği eksikliği beta çıkışını engellemeyebilir; veri güvenliği, tenant izolasyonu veya kredi doğruluğu eksikliği engeller.
