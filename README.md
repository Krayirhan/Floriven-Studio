# Dokümantasyon Paketi

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Onay için hazır |
| Doküman sahibi | Proje Yöneticisi |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Her sürüm |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Proje özeti

Floriven Studio; kullanıcının doğal dilde verdiği ürün fikrini, marka girdilerini veya referans görseli alarak mobil uygulama ekranları, tasarım sistemi ve etkileşim akışları oluşturan web tabanlı bir üründür. Kullanıcı oluşan ekranları görsel editörde düzenler, sürümler ve hedef formatlara dışa aktarır.

## Temel değer önerisi

- Fikirden düzenlenebilir mobil UI tasarımına geçen süreyi saatlerden dakikalara indirmek.
- Tasarım bilgisi sınırlı ekiplerin tutarlı ve erişilebilir ekranlar üretmesini sağlamak.
- Tasarım, ürün ve geliştirme ekipleri arasında ortak bir `DesignSpec` sözleşmesi kurmak.
- Figma ve kod dışa aktarımıyla yeniden çalışma maliyetini azaltmak.

## Önerilen teknoloji omurgası

- Web uygulaması: React + TypeScript tabanlı SSR/SPA çerçevesi.
- Ana backend: Java 21 ve Spring Boot 3.x.
- AI orkestrasyonu: Python ve FastAPI/Pydantic.
- Veri: PostgreSQL, Redis, S3 uyumlu nesne depolama.
- Asenkron işler: RabbitMQ veya yönetilen eşdeğeri.
- Gözlemlenebilirlik: OpenTelemetry, merkezi log, metrik ve hata izleme.
- Kimlik: OIDC/OAuth 2.1 uyumlu sağlayıcı.

## Klasörler

```text
.
├── AGENTS.md
├── PROJECT_ASSUMPTIONS.md
├── GLOSSARY.md
├── docs/
│   ├── 00-brand/
│   ├── 01-product/
│   ├── 02-architecture/
│   ├── 03-engineering/
│   ├── 04-ai/
│   ├── 05-security/
│   ├── 06-operations/
│   ├── 07-business/
│   ├── 08-management/
│   ├── 09-agents/
│   └── 10-templates/
└── MANIFEST.md
```

## Durum etiketleri

- **Taslak:** Çalışma belgesi; karar değildir.
- **Onay için hazır:** İlgili sahiplerin incelemesine hazırdır.
- **Onaylandı:** Uygulama için bağlayıcıdır.
- **Kullanımdan kaldırıldı:** Yerine geçen belgeye bağlantı içerir.

## Başarı tanımı

Paket başarılı sayılır; yeni bir ekip üyesi ürün kapsamını anlayabiliyor, bir agent güvenli biçimde görev alabiliyor, API ve DesignSpec sözleşmeleri çelişmiyor ve her sürüm kabul kriterleriyle doğrulanabiliyorsa.
