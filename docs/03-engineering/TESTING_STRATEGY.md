# Test Stratejisi

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Bağlayıcı |
| Doküman sahibi | QA Lead |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Üç aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Test piramidi

- Unit: domain, validator, mapper ve command.
- Component: UI component ve registry renderer.
- Integration: DB, queue, storage, provider fake.
- Contract: OpenAPI, DesignSpec, event ve adapter.
- E2E: kritik kullanıcı yolculukları.
- Visual regression: editör ve üretilen ekran fixture'ları.
- AI eval: kalite, güvenlik, maliyet ve şema başarısı.

## Kritik test senaryoları

1. Kayıt → workspace → proje → generation → edit → snapshot → export.
2. Aynı generation isteğinin iki kez gönderilmesi.
3. Kredi rezervasyonu sonrası provider timeout ve release.
4. Eşzamanlı edit revision conflict.
5. Workspace A kullanıcısının Workspace B kaynağına erişimi.
6. Zararlı/uygunsuz dosya ve prompt injection girdisi.
7. DesignSpec eski sürüm migrasyonu.
8. Payment webhook tekrar ve sırasız gelişi.

## Test verisi

Sentetik ve anonim fixture. Üretim verisi test ortamına kopyalanmaz. AI eval veri seti uygulama kategorisi, dil, ekran sayısı, erişilebilirlik ve adversarial örnekler açısından dengeli tutulur.

## CI katmanları

PR: hızlı unit, component, schema, lint, security.  
Merge: integration, Testcontainers, contract.  
Gecelik: E2E, visual, AI eval, dependency deep scan.  
Release: smoke, migration rehearsal, rollback doğrulama.

## Flaky test

Flaky test sessizce retry ile gizlenmez. Karantinaya alınır, owner ve son tarih atanır; kritik kapıdaki flaky test release riskidir.
