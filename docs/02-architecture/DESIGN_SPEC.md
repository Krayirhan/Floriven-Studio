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

Her yeni üretim ekranı ayrıca sürümlü bir `ScreenContract` taşır. Bu sözleşme ekranın
tekil kullanıcı görevini (`job`), zorunlu bölümlerini, birincil/ikincil aksiyonlarını,
görünür veri yükümlülüklerini ve izinli ekran hedeflerini planlama aşamasında sabitler.
Composition aşaması bu alanları değiştiremez veya yalnız başlıkla karşılayamaz.
Birincil aksiyonun ya da gerekli verilerin görünür içerikte `%50` altında temsil
edilmesi statik kalite kapısını bloke eder.

Provider kullanılamadığında deterministic fallback de aynı `ScreenContract` üzerinden
derlenir. Zorunlu bölümler başlık gruplarına, `requiredData` arketipe uygun alan/satır/
metriklere, aksiyonlar gerçek Button düğümlerine ve navigation hedefleri planlı ekran
geçişlerine dönüşür. Sayısal değerler ekran kimliği ve veri alanından deterministik
türetilir; ürünler arasında sabit bir metrik seti veya jenerik placeholder kullanılmaz.
Sözleşmesiz eski edit belgeleri geriye uyumlu legacy fallback yolunda kalır.

AI composition adayı normalize edildikten sonra `ScreenContract` için hedefli repair
çalışır. Motor mevcut node ağacını yeniden üretmez: yalnız görünür içerikte tam token
kapsamıyla bulunmayan bölüm, veri, aksiyon ve planlı ekran hedeflerini benzersiz node
kimlikleriyle `add` operasyonu olarak `BottomNavigation` öncesine ekler. Aynı adayda
ikinci çalıştırma sıfır operasyon üretmelidir. Uygulanan operasyon özeti ekran kökünde
`contractRepair.version`, `operationCount` ve hassas içerik taşımayan yükümlülük tipleri
olarak saklanır.

`ScreenContract.sectionRoles` her planlı bölümü kararlı bir ürün-topolojisi rolüne
bağlar: `summary`, `filters`, `entity-list`, `form-fields`, `actions`, `analytics`,
`details` veya `settings`. Bu roller render-plan implementation isimlerinden bağımsızdır
ve arketip allowlist'iyle doğrulanır. Her bölümün tam bir rolü, her ekranın en az iki
farklı rolü olmalıdır. Bölüm başlığı tek başına kanıt değildir; rol ancak Metric/Progress,
SearchField/SegmentedControl, ListItem, TextField, Button, Chart veya Switch gibi uygun
component ailesi görünürse karşılanır. Eksik rol hedefli repair ile tamamlanamazsa aday
statik kalite kapısında reddedilir.

Her topology gereksinimi benzersiz bir top-level semantic node sahibi olur; aynı node
iki ayrı bölümü karşılayamaz. Normalizasyon, sahip node'un `props.contractSection` ve
`props.contractSectionRole` metadata'sını yazar ve arketip sırasını mekanik uygular:
örneğin management list `filters → entity-list → summary → actions`, form ise
`form-fields → summary → actions` yönünde ilerler. `TopAppBar` başta,
`BottomNavigation/TabBar` sonda ve sahiplik dışındaki node'ların göreli sırası korunur.
Eksik benzersiz sahiplik veya ters sıra `SECTION_OWNERSHIP_INVALID` kalite ihlalidir.

Ownership atamasından sonra her bölüm gerçek bir `Stack` semantic container'ına
dönüştürülür. Container `semanticContainer=true`, `contractSection` ve
`contractSectionRole` metadata'sını taşır; ilk çocuğu bölüm heading'i, diğer çocuğu
benzersiz rol sahibi component'tir. Var olan eşleşen heading taşınır, yoksa deterministik
olarak eklenir. İşlem idempotenttir ve TopAppBar/BottomNavigation kabuğunu değiştirmez.
Container eklemek 60-node bütçesini aşacaksa mevcut içerik kesilmez; sahip node açıkta
bırakılır ve kalite kapısı `SECTION_CONTAINER_INVALID` üretir.

Container üretiminden sonra shell dışındaki kalan top-level semantic node'lar bölüm
üyeliğine atanır. Önceden verilmiş geçerli `contractSection/contractSectionRole`
eşleşmesi korunur; diğer node'lar component ailesi en güçlü eşleşen container'a taşınır
(SegmentedControl→filters, ListItem→entity-list, Button→actions gibi). Eşleşme kanıtı
olmayan yardımcı içerik ilk geçerli semantic container'a bağlanır; hiçbir içerik
silinmez ve node kimliği değişmez. Taşınan node `sectionMember=true` taşır. İşlem
idempotenttir. Container dışında semantic node veya container etiketiyle çelişen üye
`SECTION_MEMBER_INVALID` ihlalidir.

Section üye hedefi yalnız component türüyle seçilmez. Skorlayıcı node'un görünür prop
metnini section adı, ekran `job` değeri, `requiredData`, primary/secondary actions ve
role özgü `ara/filtre/ayar` sinyalleriyle deterministik token örtüşmesi üzerinden
karşılaştırır. Component-role kanıtı skora 4, semantik örtüşme 6 ağırlık verir; eşitlikte
contract sırası kararlı tie-break'tir. Atama yöntemi ile 0–1 güven node metadata'sında
tutulur fakat kaynak metin job teşhisine yazılmaz. `%35` altındaki semantik güven
`LOW_SECTION_ASSIGNMENT_CONFIDENCE` ihlalidir. Divider/Icon yapısal nötr kabul edilir.

Skorlayıcı en iyi ve ikinci section adayının normalize skor farkını
`sectionAssignmentMargin` olarak saklar. Açık sözleşme atamaları ile yapısal nötrlerde
margin `1` kabul edilir. Birden fazla hedef varken fark `%15` altındaysa deterministik
contract sırası hedefi belirler ancak node `sectionAssignmentAmbiguous=true` taşır ve
aday `AMBIGUOUS_SECTION_ASSIGNMENT` kalite ihlaliyle reddedilir.

Contract repair tarafından eklenen node'lar yalnız obligation'ın tek bir geçerli section
rolü hedeflediği durumda explicit kanıt alır. Örneğin tek `actions` bölümü bulunan bir
ekranda primary/secondary action repair node'u o bölüme bağlanabilir. Aynı role sahip iki
bölüm varsa motor hedef uydurmaz; node normal margin değerlendirmesine girer. Kanıtlı
atamalar `contractRepairEvidence=true` taşır, içerik değiştirilmez ve işlem idempotenttir.

Section dağılımı container başına heading dışındaki semantic üye sayısıyla ölçülür. En az
iki container ve dört üyesi bulunan ekranda tek container'ın payı `%75` değerini aşamaz.
Boş container veya bu yoğunluk sınırının aşılması `SECTION_DISTRIBUTION_IMBALANCED`
ihlalidir. Tek bölümlü, üç ya da daha az üyeli küçük ekranlar yoğunluk kapısından muaftır.

Section rol saflığı, üye alt ağaçlarındaki topology kataloğuna kayıtlı component aileleri
üzerinden hesaplanır. Component mevcut container rolünün izin listesinde değilse üye
cross-role sayılır ve aday `SECTION_ROLE_IMPURE` ile reddedilir. Birden fazla rolün izin
verdiği ListItem/Metric gibi component'ler geçerlidir; Text, Divider, Icon ve kayıtlı
olmayan sunum wrapper'ları saflık paydasına girmez.

Domain capability pack component'leri aynı merkezi topology kataloğunda rol taşır.
Health summary/metric, commerce product/list ve price/detail, learning lesson/form,
publishing story/editorial, operations signal/list/control aileleri ownership, atama,
coverage ve purity hesaplarında generic component'lerle aynı kurallara tabidir. Domain
component'i ilgisiz role yerleştirmek nötr sayılmaz ve `SECTION_ROLE_IMPURE` üretir.

Aynı archetype ekranlar için semantic structural identity; contract section rol sırası,
container başına heading dışı üye yoğunluk sınıfı (`0`, `1`, `2-3`, `4+`) ve nötr
wrapper'lardan arındırılmış component envanteriyle oluşturulur. En az iki semantic
container'ı bulunan çiftlerde identity benzerliği `%90` veya üzerindeyse aday
`SAME_ARCHETYPE_STRUCTURAL_IDENTITY` ile reddedilir. Metin, node kimliği, section adı ve
Stack/Row/Grid/Group gibi presentation wrapper'ları parmak izine dahil edilmez.

Planlama her ScreenContract için semantik `identityIntent` üretir: `dominantRole`,
`supportingRole` ve `focused|balanced|dense` density profile. İki rol sectionRoles içinde
bulunmalı ve birbirinden farklı olmalıdır. Aynı archetype ekranlarda bu üçlü benzersizdir.
Deterministic composer density profile'ı içerik satırı bütçesine uygular; normalize edilen
DesignSpec root'u intent'i teşhis metadata'sı olarak korur.

Identity intent fulfillment gerçek semantic container üyeleriyle ölçülür. Dominant rolün
üye sayısı supporting rolden büyük, supporting rolün üye sayısı en az bir olmalıdır.
Toplam üye yoğunluğu `focused <=8`, `balanced 5-12`, `dense >=9` aralıklarını sağlamalıdır.
Rol veya density koşulunun karşılanmaması `IDENTITY_INTENT_UNFULFILLED` ihlalidir.

Intent-aware targeted repair mevcut node'u silmez veya taşımaz. Supporting rol boşsa bir
uyumlu witness ekler; dominant rol supporting'den büyük olana ve balanced/dense minimum
yoğunluğu sağlanana kadar dominant role node bütçesi içinde witness ekleyebilir. Eklenen
node explicit contract kanıtı taşır. Focused ekran fazla yoğunsa içerik kesilmez; kalite
kapısı ihlali korur. Repair idempotent ve 60-node üst sınırıyla bounded'dır.

Repair effectiveness, mutasyon öncesi ve sonrası role/density fulfillment bileşenlerinin
eşit ağırlıklı 0–1 skoru üzerinden ölçülür. Node ekleyen repair skor artışı üretmelidir.
Skoru artırmayan, fulfillment tamamlanmadan bütçesi tükenen veya zaten fulfilled ekrana
node ekleyen repair `IDENTITY_REPAIR_INEFFECTIVE` ihlalidir.

Runtime renderer semantic container DOM node'larını yalnız rol enum'u içeren
`data-section-role` işaretiyle yayınlar. Canonical 390×844 capture; görünür node sayısı,
section sayısı, section alan kapsamı, dikey occupancy, 100k piksel başına node yoğunluğu,
section yükseklik varyasyonu ve rol sırasını `RuntimeVisualIdentityMetrics` olarak ölçer.
Metin, section adı ve müşteri içeriği runtime identity kanıtına dahil edilmez.

Runtime layout similarity yalnız aynı archetype ekran çiftlerini karşılaştırır. Section rol
sırası benzerliğin `%40`, normalize identity vector `%60` ağırlığını taşır. Bir çiftin
skoru `%90` veya üzerindeyse `RUNTIME_LAYOUT_IDENTITY_COLLISION` oluşur. `layoutIdentity`
kanıtı bulunmadan veya collision varken runtime `finalEligible` olamaz.

Runtime `visualHierarchy` kapısı her ekran için başlık dışındaki gerçek DOM geometrisini
değerlendirir. En az 2 semantic section, `%25–95` section alan kapsamı, en az `%45` dikey
occupancy ve 100k piksel başına `1–15` görünür node gerekir. İki veya daha fazla section
bulunan ekranda normalize yükseklik varyasyonu en az `%5` olmalıdır; böylece eşit boylu,
düz kart yığınları hiyerarşi kanıtı sayılmaz. Herhangi bir ekranın başarısızlığı final
uygunluğunu bloke eder. Kanıt yalnız sayısal geometri, archetype ve rol enum'ları taşır;
kullanıcı metni veya müşteri tasarımı taşımaz.

Runtime hierarchy eşikleri archetype profiliyle kalibre edilir. Dashboard ve analytics
ekranları daha yüksek doluluk, yoğunluk ve yükseklik kontrastı ister; form/detail ile
settings/profile odaklı akışları daha düşük fakat sıfır olmayan yoğunlukla kabul edilir.
Profil bulunamazsa muhafazakâr `default` uygulanır. Profil ve regresyon corpus'u `1.0.0`
sürümüyle izlenir. Corpus yedi
archetype'ın her biri için en az bir kabul ve bir red örneği taşır; bilinen corpus'ta
false-positive veya false-negative oluşması test kapısını düşürür.

Production runtime replay manifesti `2.0.0` sürümünde renderer, candidate hash ve her
ekran için archetype, screenshot SHA-256/byte boyutu, canonical bound listesi ve hierarchy
skoru taşır. Replay karşılaştırması ekran seti, renderer, screenshot hash, `%8` byte farkı,
`%10` node envanteri, `%3` normalize geometri ve `%10` hierarchy skoru eşiklerini ayrı
issue kodlarıyla denetler. Screenshot hash değişimi tek başına regresyon kabul edilir;
baseline güncellemesi açık inceleme gerektirir. Manifest kullanıcı metni, prompt veya
screenshot base64 içeriği taşımaz.

CI her değişiklikte replay/baseline sözleşme testlerini çalıştırır. Baseline klasöründeki
bir değişiklik yalnız `runtime-baseline-approved` maintainer etiketi ve manifest SHA-256
değerine bağlı `runtime-replay-approval.json` birlikte bulunursa geçer. Onay kaydı reviewer,
ISO-8601 tarih ve PR/ticket referansı taşır. İlk gerçek production baseline üretilene kadar
baseline durumu `PENDING` olarak belgelenir; sentetik fixture production kanıtı sayılamaz.

Runtime release evidence kararı üç değerlidir: eksik canlı kanıt `NOT_VERIFIED`, mevcut
kanıttaki açık başarısızlık `BLOCKED`, yalnız capture ortamı, geçerli altı ekranlı baseline,
hash onayı, replay ve server-derived final kararı birlikte başarılıysa `VERIFIED`.
`releaseEligible` sadece `VERIFIED` durumunda true olabilir.

Runtime hierarchy profillerinin tek kaynağı
`contracts/runtime-hierarchy-profiles.json` sözleşmesidir. DesignSpec ve Edge adapter'ları
bu dosyadan generated üretilir; certification capture sözleşmeyi doğrudan okur.
`contracts:runtime-hierarchy` generated çıktılardan biri kaynakla farklıysa CI'ı
`RUNTIME_HIERARCHY_PROFILE_DRIFT` ile düşürür. Eşik değişikliği JSON sözleşme sürümü,
kalibrasyon corpus'u ve doküman incelemesi birlikte yapılmadan tamamlanmış sayılmaz.

Hierarchy JSON sözleşmesi Draft 2020-12 schema ile alan, tür, range, required ve
additional-property kurallarına tabidir. Base commit'e göre profil eklemek veya eşiği
gevşetmek en az minor; minimum eşiği yükseltmek, maximum eşiği düşürmek, profil/alan
kaldırmak major sürüm gerektirir. Değişiklik yokken sürüm churn'ü kabul edilmez.
Golden parity testi aynı canonical bounds fixture'larını yedi archetype için DesignSpec
ve Edge evaluator'da çalıştırır; pass/fail, skor ve issue seti birebir eşit olmalıdır.

Her `visualHierarchy` raporu `profileVersion` ile canonical JSON'un whitespace bağımsız
SHA-256 değeri olan `profileHash` alanlarını taşır. Runtime replay manifesti de aynı iki
alanı kaydeder. Baseline ve adayın sürüm/hash çifti farklıysa replay
`RUNTIME_REPLAY_HIERARCHY_PROFILE_MISMATCH` ile bloke edilir; eski eşikle verilmiş karar
yeni eşikle üretilmiş gibi yorumlanamaz.

Replay provenance doğrulaması yalnız baseline-aday eşitliğine güvenmez. Her manifestin
profil sürümü ve hash'i çalışma ağacındaki kanonik sözleşmeyle ayrı ayrı eşleşmelidir; iki
tarafta aynı sahte hash bulunması kabul edilmez. Provenance alanı olmayan legacy manifest,
sürüm düşürme, desteklenmeyen renderer, kanonik olmayan viewport, altı ekran dışında
koleksiyon, yinelenen ekran kimliği, geçersiz zaman, `NaN`/sonsuz değer veya viewport dışı
bounds fail-closed reddedilir. Legacy kanıt otomatik migrate edilmez; trusted runtime
runner ile yeniden capture edilmesi gerekir.

Trusted runtime recorder, PNG data URL içeriğinin byte uzunluğunu ve SHA-256 değerini
sunucu tarafında yeniden hesaplar. Beyan edilen digest tek başına kanıt değildir. Yalnız
`image/png`, `phone-screen-v4`, 390×844 viewport ve tamamen sonlu/viewport içi bounds kabul
edilir. Browser tabanlı capture için CORS allowlist'i `x-runtime-certification-token`
başlığını açıkça içerir.

## Ayırt edici deneyim sözleşmesi

Generation V3 typed component property sözleşmeleri, compiler geçişi ve renderer kabul
kapıları [Generation V3 Production Readiness Planı](GENERATION_V3_PRODUCTION_READINESS_PLAN.md)
Sprint 1–3 kapsamında izlenir.

`ProductScreenSpec.experiencePattern`, ekranın başlığından bağımsız zorunlu ana etkileşim
modelidir: `standard | calendar | timeline | gallery | board | map`. Plan normalizasyonu
alanı model değerinden veya ekran adı, amaç, bölümler ve iş tanımından türetir. `standard`
dışındaki değerler sırasıyla `Calendar`, `Timeline`, `Gallery`, `KanbanBoard` veya `MapView`
bileşenini zorunlu kılar. Normalizer eksik imzayı deterministik ekler; kalite kapısı imza
hâlâ yoksa adayı reddeder. Eski ekranlar geriye uyumlu olarak `standard` kabul edilir.

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
