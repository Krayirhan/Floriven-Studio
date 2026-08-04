# Mimari Karar İndeksi

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Yaşayan doküman |
| Doküman sahibi | Solution Architect |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Her ADR |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Karar süreci

Önemli, uzun ömürlü veya geri dönüş maliyetli kararlar ADR ile kaydedilir. ADR kısa, bağlamı ve alternatifleri gösteren, kararın sonucunu açıkça yazan belgedir.

## ADR gerektiren örnekler

- Modüler monolit/mikroservis sınırı.
- Editör renderer teknolojisi.
- DesignSpec major değişikliği.
- Kimlik, ödeme, model veya queue sağlayıcısı.
- Veri bölgesi, şifreleme ve saklama politikası.
- Kod export hedefi.
- Multi-region veya Kubernetes geçişi.

## İndeks

| ADR | Başlık | Durum | Tarih | Dosya |
|---|---|---|---|---|
| ADR-0001 | Core API için modüler monolit | Kabul edildi | 2026-08-05 | [ADR-0001.md](ADR-0001.md) |
| ADR-0002 | DesignSpec kanonik ara model | Kabul edildi | 2026-08-05 | [ADR-0002.md](ADR-0002.md) |
| ADR-0003 | AI orchestration için ayrı Python worker | Kabul edildi | 2026-08-05 | [ADR-0003.md](ADR-0003.md) |
| ADR-0004 | Editörde DOM/SVG-first renderer | Kabul edildi | 2026-08-05 | [ADR-0004.md](ADR-0004.md) |

Yeni ADR'ler `docs/10-templates/ADR_TEMPLATE.md` ile oluşturulur ve bu indeks güncellenir.

## Çapraz referanslar

| ADR | Etkileyen dokümanlar |
|---|---|
| ADR-0001 | [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [TECHNOLOGY_STACK.md](../03-engineering/TECHNOLOGY_STACK.md), [DEPLOYMENT_AND_OPERATIONS.md](../06-operations/DEPLOYMENT_AND_OPERATIONS.md) |
| ADR-0002 | [DESIGN_SPEC.md](DESIGN_SPEC.md), [AI_ARCHITECTURE.md](AI_ARCHITECTURE.md), [API_SPEC.md](../03-engineering/API_SPEC.md) |
| ADR-0003 | [AI_ARCHITECTURE.md](AI_ARCHITECTURE.md), [PROMPT_ENGINEERING.md](../04-ai/PROMPT_ENGINEERING.md), [OBSERVABILITY.md](../06-operations/OBSERVABILITY.md) |
| ADR-0004 | [EDITOR_ARCHITECTURE.md](EDITOR_ARCHITECTURE.md), [DESIGN_SPEC.md](DESIGN_SPEC.md), [ACCESSIBILITY.md](../03-engineering/ACCESSIBILITY.md) |
