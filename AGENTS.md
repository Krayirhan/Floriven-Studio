# AI Agent Çalışma Talimatları

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Bağlayıcı |
| Doküman sahibi | Mühendislik Lideri |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Her değişiklikte |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## 1. Amaç ve kapsam

Bu dosya; kod, test, şema, altyapı veya doküman üreten tüm AI agent'lar için proje kökündeki bağlayıcı talimattır. Alt klasörlerdeki agent dosyaları bu kuralları daraltabilir fakat gevşetemez.

## 2. Agent öncelik sırası

1. Kullanıcının açık görevi ve kabul kriterleri.
2. Güvenlik, gizlilik ve veri kaybını önleme kuralları.
3. Onaylı ADR'ler ve sözleşmeler (`DesignSpec`, API, veri modeli).
4. Bu `AGENTS.md` ve uzman agent talimatları.
5. Kod tabanındaki mevcut örüntüler.

Çelişki varsa agent tahminle karar vermez; `BLOCKED` notu üretir veya değişikliği sınırlı tutar.

## 3. Her görevde zorunlu akış

### Başlamadan önce

- Görevin amacını, kapsamını ve başarı ölçütünü çıkar.
- Etkilenen dosyaları ve servis sınırlarını belirle.
- İlgili dokümanları oku; özellikle `DESIGN_SPEC.md`, `API_SPEC.md` ve güvenlik dokümanları.
- Geri döndürülemez işlem, veri migrasyonu, silme, maliyetli API çağrısı veya güvenlik etkisi varsa açıkça işaretle.

### Uygulama sırasında

- Küçük, incelemeye uygun değişiklikler yap.
- Domain mantığını UI veya provider adapter içine gömme.
- Yeni davranış için test ekle; test eklenemiyorsa nedenini yaz.
- Loglara token, parola, kişisel veri, ham prompt veya müşteri tasarımı basma.
- Hata durumlarını ve timeout/idempotency davranışını ele al.
- Şema veya API değişikliğinde sürümleme ve geriye uyumluluğu değerlendir.

### Bitirirken

- Değişen dosyaları, davranışı ve test sonucunu özetle.
- Kabul kriterlerini tek tek doğrula.
- Bilinen riskleri, takip işlerini ve yapılmayanları açıkça yaz.
- Doküman-kod çelişkisi oluşturduysan aynı değişiklik içinde dokümanı güncelle.

## 4. Yasak davranışlar

- Gizli anahtar, gerçek müşteri verisi veya üretim credential'ı üretmek/commit etmek.
- Kullanıcı onayı olmadan üretim verisini silmek veya migrasyon çalıştırmak.
- Güvenlik kontrolünü test amacıyla kalıcı biçimde devre dışı bırakmak.
- `any`, kontrolsüz type cast, sessiz exception yutma veya belirsiz `TODO` ile kritik yolu geçmek.
- AI çıktısını şema doğrulaması olmadan kalıcılaştırmak veya render etmek.
- Sağlayıcıya özgü yanıt formatını domain sözleşmesi kabul etmek.
- Erişilebilirlik ve tenant filtrelerini isteğe bağlı görmek.

## 5. Kod kalitesi kuralları

- Fonksiyonlar tek sorumluluk taşımalı; isimler niyeti anlatmalı.
- Public API ve karmaşık domain kararları dokümante edilmeli.
- Tüm dış I/O sınırlarında timeout, retry politikası ve hata eşlemesi açık olmalı.
- Retry yalnızca idempotent işlemlerde veya idempotency anahtarıyla yapılmalı.
- Para/kredi hareketleri append-only ledger ile ve transaction içinde yürütülmeli.
- Tenant'a ait sorgular tenant kimliği olmadan çalışmamalı.
- Tarihler UTC saklanmalı; UI'da kullanıcının saat dilimine çevrilmeli.

## 6. AI üretim kuralları

- Model çıktısı önce Pydantic/JSON Schema ile doğrulanır.
- Üretim iki aşamalıdır: plan (`ScreenGraph`) ve somut tasarım (`DesignSpec`).
- Revizyonlar mümkün olduğunda tüm belgeyi değil, kimlikli düğümlere patch üretir.
- Prompt'larda kullanıcı içeriği talimattan ayrıştırılır; referans dosya içeriği güvenilmez kabul edilir.
- Model adı domain koduna gömülmez; capability ve maliyet profili üzerinden seçilir.
- Her çağrı için correlation ID, maliyet, gecikme ve sonuç durumu ölçülür; hassas içerik maskelenir.

## 7. Test kapıları

Bir görev tamamlandı sayılmaz:

- İlgili unit ve integration testleri geçmeden,
- Şema örnekleri validasyon testinden geçmeden,
- Lint/type-check başarısızken,
- Kritik akışlarda tenant izolasyonu ve yetkilendirme testi yokken,
- Görsel davranış değiştiyse en az bir görsel regresyon veya E2E senaryosu güncellenmeden.

## 8. Dosya sahipliği

| Alan | Birincil agent | Zorunlu inceleyen |
|---|---|---|
| Ürün gereksinimleri | Product Agent | Product Owner |
| DesignSpec/servis sınırları | Architecture Agent | Tech Lead + AI Lead |
| Web editörü | Frontend Agent | Frontend Lead + QA |
| API/domain/veri | Backend Agent | Backend Lead + Security |
| Prompt/model/eval | AI Agent | AI Lead + Security |
| CI/CD ve runtime | DevOps Agent | Platform/Security |
| Güvenlik kontrolleri | Security Agent | Human Security Owner |
| Dokümantasyon | Documentation Agent | Alan sahibi |

## 9. Görev teslim formatı

Her agent çıktısı şu başlıkları kullanır:

```text
Amaç
Yapılan değişiklikler
Doğrulama ve testler
Riskler / varsayımlar
Takip işleri
```

Detaylı handoff şablonu: `docs/09-agents/TASK_HANDOFF_TEMPLATE.md`.
