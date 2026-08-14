# DesignSpec v1 Sözleşmesi

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | P0 — onay gerekli |
| Doküman sahibi | Solution Architect |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Her şema sürümü |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## 1. Amaç

DesignSpec, AI üretimi ile editör, snapshot, preview ve export katmanları arasındaki kanonik sözleşmedir. Düz görsel veya sağlayıcı yanıtı değil, sürümlü domain modelidir.

## 2. Tasarım ilkeleri

- Her düğüm kalıcı ve benzersiz `id` taşır.
- Stil değerleri mümkün olduğunda token referansıdır.
- Layout, rastgele piksel koordinatından önce semantik constraint/flex modelini kullanır.
- Component türleri registry ile sürümlenir.
- Bilinmeyen property reddedilir veya `extensions` alanında ad alanlı tutulur.
- Snapshot immutable; çalışma kopyası revision kontrollüdür.

## 3. Üst seviye yapı

```json
{
  "schemaVersion": "1.0.0",
  "projectId": "prj_...",
  "platform": "ios",
  "locale": "tr-TR",
  "deviceProfile": "phone-default",
  "tokens": {},
  "assets": [],
  "components": {},
  "screens": [],
  "flows": [],
  "metadata": {}
}
```

## 4. Ekran ve düğüm

```json
{
  "id": "scr_home",
  "name": "Ana Sayfa",
  "route": "/home",
  "root": {
    "id": "node_root",
    "type": "Screen",
    "layout": {"mode": "column", "gap": "space.4"},
    "children": [
      {
        "id": "node_title",
        "type": "Text",
        "props": {"text": "Merhaba", "style": "typography.titleLarge"},
        "a11y": {"role": "heading", "label": "Merhaba"}
      }
    ]
  }
}
```

## 5. Zorunlu düğüm alanları

| Alan | Kural |
|---|---|
| id | Proje içinde benzersiz, stabil, URL-safe. |
| type | Component Registry'de kayıtlı tür. |
| props | Türün JSON Schema'sına uyan özellikler. |
| layout | Parent/child yerleşim sözleşmesi. |
| children | Yalnız container izin veriyorsa. |
| bindings | Veri/eylem bağları; çalıştırılabilir kod içermez. |
| a11y | Rol, label, hint, state ve order. |
| visibility | Boolean veya güvenli declarative expression. |

## 6. Layout modeli

MVP layout modları: `column`, `row`, `stack`, `grid`, `absolute` ve `scroll`. `absolute` yalnız kontrollü overlay/decoration için önerilir. Boyut: `hug`, `fill`, sabit dp veya min/max constraint. Birimler device-independent pixel olarak yorumlanır.

## 7. Token alanları

- `color.*`: semantic ve palette token'ları.
- `typography.*`: font family, size, weight, line-height, letter-spacing.
- `space.*`, `radius.*`, `shadow.*`, `border.*`, `motion.*`.
- Dark/light mode override.

Hard-coded stil, export edilebilirlik için uyarı üretir fakat ilk sürümde tamamen yasak olmayabilir.

## 8. Etkileşimler

```json
{
  "event": "press",
  "action": {
    "type": "navigate",
    "targetScreenId": "scr_detail",
    "params": {"itemId": "{{context.item.id}}"}
  }
}
```

İzinli action'lar: navigate, back, openModal, closeModal, setLocalState, submitForm, openUrl. Keyfi JavaScript veya shell kodu kabul edilmez.

## 9. Patch sözleşmesi

Patch hedefi node ID veya token path ile belirtilir. İzinli işlemler: addNode, removeNode, moveNode, replaceProps, replaceLayout, setToken, addScreen, removeScreen. Her patch `baseRevision` taşır; uyuşmazlıkta 409 conflict oluşur.

```json
{
  "baseRevision": 18,
  "operations": [
    {
      "op": "replaceProps",
      "nodeId": "node_title",
      "value": {"text": "Tekrar hoş geldin"}
    }
  ]
}
```

## 10. Validasyon katmanları

1. JSON syntax ve schema.
2. ID/referans bütünlüğü.
3. Registry contract.
4. Layout ve property limitleri.
5. Erişilebilirlik.
6. Platform uyumu.
7. Güvenli expression/action.
8. Export capability uyarıları.

## 11. Sürümleme

SemVer kullanılır. Patch: doğrulama/metadata genişlemesi; minor: geriye uyumlu yeni component/property; major: kırıcı değişiklik. Her major/minor için migrator ve fixture testleri zorunludur. Snapshot kendi `schemaVersion` değerini korur.

## 12. Sahiplik

Şema değişiklikleri Architecture, Frontend, Backend ve AI ekiplerinin ortak onayını gerektirir. Export ekipleri etki analizi verir. Tek taraflı property eklenmez.

## 13. Çapraz referanslar

### DesignStrategy üretim bağlamı

Her AI üretimi, DesignSpec somutlaştırılmadan önce doğrulanmış bir `DesignStrategy`
üretir. `mode=template` olduğunda sürümlü katalog profili değişmeden uygulanır;
`mode=auto` olduğunda model yalnızca izinli `palette`, `cardStyle`, `density` ve
`navigationStyle` enumları içinden seçim yapar. Strateji tüm ekranların
`root.props.strategy` alanında aynıdır. Kullanıcıya yalnızca kısa `rationale`
gerekçeleri gösterilir; ham model düşüncesi saklanmaz veya loglanmaz.

Sürümlü stil kataloğu v2 profilleri ayrıca `typography`, `colorIntent`,
`layoutRhythm`, `signatureComponents`, `avoid` ve dört adet nötr
`compositionPatterns` taşır. Bunlar galeri açıklaması değil, yalnızca görsel üretim
sözleşmesidir. Ürün alanı, varlıklar, ekran görevleri, metin sözlüğü ve capability
seçimi yalnızca doğrulanmış `ProductBlueprint` tarafından belirlenir. Stil profili
bu kararları değiştiremez; sağlık, ticaret, eğitim veya yayın terminolojisi taşıyamaz.
Aynı brief farklı iki stilde aynı node ağacının yalnızca renk varyasyonu olarak da
üretilmez: işlev aynı kalırken tipografik hiyerarşi, yoğunluk, gruplama ve bileşen
kompozisyonu stile göre değişir.

### Dinamik ekran mimarisi

`ProductBlueprint.screens` sabit uzunluk taşımaz. Ekranlar `role`, `priority`,
`parentId` ve `navigationPlacement` alanlarıyla ürün hiyerarşisini açıklar.
`screenPolicy` açık kullanıcı sayısını veya AI'nin güvenli min/max kararını;
`navigation` ise 3–5 birincil hedef ile utility girişlerini taşır. DesignSpec'teki
ekran sayısı blueprint ile birebir eşleşir. Ayrıntılar [ADR-0007](ADR-0007.md)'dedir.

| Konu | Doküman |
|---|---|
| Kanonik model kararı | [ADR-0002](ADR-0002.md) |
| DesignSpec endpoint'leri | [API_SPEC.md](../03-engineering/API_SPEC.md) — `GET/PATCH /projects/{id}/design-document` |
| Patch ve revision yönetimi | [API_SPEC.md](../03-engineering/API_SPEC.md) — Concurrency bölümü |
| AI üretim akışı | [AI_ARCHITECTURE.md](AI_ARCHITECTURE.md) |
| Editör render modeli | [EDITOR_ARCHITECTURE.md](EDITOR_ARCHITECTURE.md) · [ADR-0004](ADR-0004.md) |
| Component türleri | [COMPONENT_REGISTRY.md](../04-ai/COMPONENT_REGISTRY.md) |
| Erişilebilirlik gereksinimleri | [ACCESSIBILITY.md](../03-engineering/ACCESSIBILITY.md) |
| Token sistemi | [FLORIVEN_STUDIO.md](../00-brand/FLORIVEN_STUDIO.md) — tasarım tokenleri bölümü |
