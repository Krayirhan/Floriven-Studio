# Prompt Mühendisliği Standardı

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Bağlayıcı |
| Doküman sahibi | AI Lead |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Aylık |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Prompt katmanları

1. Sistem politikası: rol, güvenlik ve kesin yasaklar.
2. Görev sözleşmesi: beklenen şema ve başarı kriteri.
3. Registry bağlamı: izinli component ve property'ler.
4. Proje bağlamı: brief, token, ilgili ekran alt kümesi.
5. Kullanıcı içeriği: açık delimiter içinde güvenilmez veri.
6. Çıktı talimatı: structured output, örnek ve limit.

## Kurallar

- Prompt sürümlenir: `task/version/locale`.
- Model adı prompt kimliği değildir.
- Tek prompt çok farklı görev yapmaz; planlama, kompozisyon ve patch ayrıdır.
- Negatif talimat yerine izinli alanlar ve validasyon hataları kullanılır.
- Örnekler gerçek müşteri verisi içermez.
- Prompt değişikliği eval koşmadan üretime çıkmaz.

## Patch prompt'u

Yalnız hedef node alt ağacı, gerekli parent context, token ve kullanıcı niyeti verilir. Modelin node ID değiştirmesi yasaktır; yeni node ID'leri belirli prefix/formatla üretir. Çıktı patch schema'sına uyar.

## Çok dil

Talimat dili sabit olabilir; kullanıcı metni locale'e göre üretilir. Tasarım terimleri ve enum'lar çevrilmez. Ton, uzunluk ve kültürel uyum ayrı parametrelerle taşınır.

## Prompt injection savunması

Yüklenen dosyadan çıkarılan metin “referans içerik” olarak işaretlenir. İçindeki talimatlar yürütülmez. Tool erişimi ayrı allowlist ve server-side parametrelerle sınırlıdır. Modelin “policy override” talebi yok sayılır ve güvenlik metriğine yazılır.

## Prompt örnekleri

Aşağıdaki örnekler gerçek payload şemasını göstermek için hazırlanmıştır. Gerçek müşteri verisi içermez; isimler ve metinler kurgusaldır.

### Örnek 1 — ScreenGraph üretimi (plan aşaması)

```json
{
  “promptId”: “screen-graph/v1/tr”,
  “messages”: [
    {
      “role”: “system”,
      “content”: “Sen bir mobil UX mimarısın. Görevin: kullanıcının ürün briefinden ekranları ve aralarındaki geçişleri ScreenGraph formatında çıkarmak. DesignSpec üretme; yalnızca ekran listesi, ekran türleri ve navigasyon bağları. Çıktı JSON'dır; şemadan sapma yasaktır.”
    },
    {
      “role”: “user”,
      “content”: “## Ürün brief\n\n<brief>\nBir yemek tarifi uygulaması. Kullanıcı tarif arar, malzeme listesini kaydeder ve adım adım pişirme modunu başlatır.\n</brief>\n\n## Token bilgisi\n\nWorkspace: ws_demo | Proje: prj_demo | Dil: tr-TR | Platform: ios\n\n## Beklenen çıktı\n\nScreenGraph JSON. Şema: {screens: [{id, name, type, description}], flows: [{from, to, trigger}]}”
    }
  ]
}
```

**Beklenen çıktı (kısaltılmış):**

```json
{
  “screens”: [
    {“id”: “scr_home”, “name”: “Ana Sayfa”, “type”: “feed”, “description”: “Tarif keşif ekranı”},
    {“id”: “scr_search”, “name”: “Arama”, “type”: “search”, “description”: “Tarif ve malzeme arama”},
    {“id”: “scr_detail”, “name”: “Tarif Detayı”, “type”: “detail”, “description”: “Tarif adımları ve malzeme listesi”},
    {“id”: “scr_cook”, “name”: “Pişirme Modu”, “type”: “step-flow”, “description”: “Adım adım rehber”}
  ],
  “flows”: [
    {“from”: “scr_home”, “to”: “scr_search”, “trigger”: “search_tap”},
    {“from”: “scr_home”, “to”: “scr_detail”, “trigger”: “card_tap”},
    {“from”: “scr_detail”, “to”: “scr_cook”, “trigger”: “start_cooking_tap”}
  ]
}
```

---

### Örnek 2 — DesignSpec patch üretimi (kompozisyon aşaması)

```json
{
  “promptId”: “design-patch/v1/tr”,
  “messages”: [
    {
      “role”: “system”,
      “content”: “Sen bir UI tasarım sistemi motorusun. Görevin: verilen ScreenGraph ve component registry'den bir ekranın DesignSpec patch'ini üretmek. Kural: node ID üretme; sadece type, props, layout, a11y ve children döndür. Çıktı DesignSpec patch şemasına uymalıdır.”
    },
    {
      “role”: “user”,
      “content”: “## Hedef ekran\n\nid: scr_home | name: Ana Sayfa | type: feed\n\n## Marka tokenları\n\n<tokens>\ncolor.primary: #2D7DD2\ntypography.titleLarge: {size: 22, weight: 700}\nspace.4: 16dp\n</tokens>\n\n## İzinli component türleri\n\n<registry>\nScreen, ScrollView, Column, Row, Text, Image, Card, Button, Icon\n</registry>\n\n## Kullanıcı niyeti\n\n<user_intent>\nAna sayfa tarif kartları ve arama butonu içermeli.\n</user_intent>\n\n## Çıktı\n\nDesignSpec patch JSON. baseRevision: 0”
    }
  ]
}
```

---

### Örnek 3 — Düğüm patch'i (revizyonlu güncelleme)

```json
{
  “promptId”: “node-patch/v1/tr”,
  “messages”: [
    {
      “role”: “system”,
      “content”: “Yalnız hedef düğümün alt ağacını güncelle. Node ID değiştirme. Yeni node gerektirirse belirlenen prefix ile üret. Çıktı: {baseRevision, operations[]} şeması.”
    },
    {
      “role”: “user”,
      “content”: “## Hedef node\n\nnodeId: node_title | mevcut props: {text: 'Merhaba', style: 'typography.titleLarge'}\n\n## baseRevision: 18\n\n## Kullanıcı isteği\n\n<user_intent>\nBaşlık metni 'Bugün ne pişirelim?' olarak değişsin.\n</user_intent>”
    }
  ]
}
```

**Beklenen çıktı:**

```json
{
  “baseRevision”: 18,
  “operations”: [
    {
      “op”: “replaceProps”,
      “nodeId”: “node_title”,
      “value”: {“text”: “Bugün ne pişirelim?”}
    }
  ]
}
```

---

### Eval kontrol listesi (her prompt değişikliğinde)

| Kontrol | Yöntem |
|---|---|
| Çıktı şemaya uyuyor mu? | Pydantic otomatik validasyon |
| Node ID'ler sabit mi? | Fixture diff testi |
| Kullanıcı içeriği talimat olarak yürütülüyor mu? | Injection test suite |
| Token referansları gerçek mi? | Registry doğrulama |
| Erişilebilirlik alanları eksiksiz mi? | a11y fixture |

Eval geçmeden prompt değişikliği üretime çıkmaz. Bkz. [AI_EVALUATION.md](AI_EVALUATION.md).
