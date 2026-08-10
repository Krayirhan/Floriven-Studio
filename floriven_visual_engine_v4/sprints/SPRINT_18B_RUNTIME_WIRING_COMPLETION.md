# Sprint 18B — Runtime Wiring Completion

## Amaç

Floriven Studio’nun V4 design-spec çıktısını gerçek Studio renderer’ına bağlamak ve baseline capture için tek, deterministik bir runtime yolu oluşturmak.

## Kapsam

- `PresentationSpecV2` için PhoneScreen adapter’ı.
- Component family resolver’ın `DesignNodeRenderer` DOM akışına bağlanması.
- Chart resolver ve chart node renderer entegrasyonu.
- `RenderPlan` ve Layout Engine V2 çıktılarının gerçek DOM koordinatlarına çevrilmesi.
- Canonical 390×844 inner viewport ile dış zoom/container ayrımının korunması.
- Preview ve export akışlarının aynı renderer sözleşmesini kullanması.
- Deterministic Compositor V2’nin Supabase generation fallback akışına bağlanması.
- Runtime baseline manifest’e gerçek screenshot, bounds ve tree fixture’ı yazan capture akışı.

## Doğrulama

- PhoneScreen V2 adapter unit/integration smoke testleri.
- Family ve chart resolver’ın gerçek DOM çıktısı testleri.
- DOM bounds → baseline manifest dönüşüm testi.
- Preview/export parity testi.
- Deterministic fallback entegrasyon testi; timeout, idempotency ve hata eşleme kontrolleri.
- En az bir archetype ve visual mode için gerçek baseline fixture üretimi.

## Çıkış kriterleri

- PhoneScreen gerçek `PresentationSpecV2` sözleşmesini tüketiyor.
- DOM bounds canonical viewport koordinatlarında deterministik.
- Preview ve export aynı renderer yolundan geçiyor.
- Baseline capture bir archetype/mode fixture’ını manifest, bounds ve screenshot ile üretebiliyor.
- İlgili unit, integration ve type-check kapıları geçiyor.

## Bağımlılıklar

- Sprint 18 runtime baseline metadata sözleşmesi.
- `PhoneScreen` renderer ve mevcut V1 uyumluluk katmanı.
- Sprint 19 visual evidence capture ve Quality V3 raporları.

## Durum

**TAMAMLANDI — 2026-08-10**

- V2 presentation adapter gerçek PhoneScreen renderer’ına bağlandı.
- Component family ve chart tercihleri DOM metadata’sına bağlandı.
- Canonical DOM bounds ve tree signature capture tamamlandı.
- Screenshot + capture + baseline entry akışı Studio PNG export’a bağlandı.
- Design-spec ve web type-check ile ilgili unit/smoke testleri PASS.
