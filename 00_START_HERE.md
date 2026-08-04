# Başlangıç Rehberi

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Onay için hazır |
| Doküman sahibi | Proje Yöneticisi |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Her sürüm |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Paketin amacı

Bu paket, yapay zekâ ile mobil uygulama ekranları üreten, düzenleyen ve dışa aktaran çok kiracılı bir SaaS ürününün ürün, tasarım, mühendislik, güvenlik, operasyon ve ticari çalışma esaslarını tek yerde toplar. Dokümanlar, kod yazmaya başlamadan önce kararları görünür kılmak ve insanlarla AI agent'ların aynı kurallarla çalışmasını sağlamak için hazırlanmıştır.

## İlk okunacak dokümanlar

1. `docs/00-brand/FLORIVEN_STUDIO.md` — ürünün resmî adını, tanımını ve marka kullanımını sabitler.
2. `PROJECT_ASSUMPTIONS.md` — hangi varsayımlarla hazırlandığını açıklar.
3. `docs/01-product/PRODUCT_VISION.md` — ürünün neden var olduğunu tanımlar.
4. `docs/01-product/PRD.md` — uçtan uca ürün gereksinimlerini tanımlar.
5. `docs/01-product/MVP_SCOPE.md` — ilk sürümün sınırlarını belirler.
6. `docs/02-architecture/SYSTEM_ARCHITECTURE.md` — servisleri ve veri akışını açıklar.
7. `docs/02-architecture/DESIGN_SPEC.md` — sistemin merkezindeki tasarım veri sözleşmesini tanımlar.
8. `AGENTS.md` — kod üreten veya doküman değiştiren tüm agent'ların bağlayıcı çalışma kurallarıdır.

## Paketi projeye uyarlama sırası

- Marka kimliğini `docs/00-brand/FLORIVEN_STUDIO.md` ile tutarlı kullanın; hedef pazarları doğrulayın.
- `PROJECT_ASSUMPTIONS.md` içindeki teknoloji ve iş modeli varsayımlarını onaylayın veya değiştirin.
- Her önemli değişiklik için `docs/10-templates/ADR_TEMPLATE.md` kullanarak ADR oluşturun.
- PRD ile MVP kapsamındaki kabul kriterlerini backlog öğelerine dönüştürün.
- `DESIGN_SPEC.md` içindeki şema v1'i uygulamadan önce backend, frontend ve AI ekipleri birlikte onaylasın.
- Güvenlik ve KVKK/GDPR değerlendirmesini gerçek veri akışları belli olduğunda hukuk danışmanıyla doğrulayın.

## Doküman öncelik seviyeleri

| Seviye | Anlamı | Örnekler |
|---|---|---|
| P0 | Kod başlamadan onaylanmalı | PRD, MVP_SCOPE, DESIGN_SPEC, SYSTEM_ARCHITECTURE |
| P1 | İlk sprintlerde kesinleştirilmeli | DATA_MODEL, API_SPEC, SECURITY_AND_PRIVACY |
| P2 | Beta öncesi tamamlanmalı | OPERATIONS, INCIDENT_RESPONSE, BUSINESS_MODEL |
| P3 | Ölçekleme döneminde olgunlaştırılmalı | DISASTER_RECOVERY, GO_TO_MARKET, PROJECT_GOVERNANCE |

## Değişiklik kuralı

Bir dokümanın içeriği kod veya başka bir dokümanla çelişirse sıralama şöyledir: onaylanmış ADR → API/şema sözleşmesi → PRD kabul kriteri → mimari doküman → uygulama notu. Çelişki sessizce çözülmez; karar kayda alınır.
