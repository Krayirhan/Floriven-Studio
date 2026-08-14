# API Tasarım Spesifikasyonu

| Alan | Değer |
|---|---|
| Proje | Floriven Studio |
| Durum | Onay gerekli |
| Doküman sahibi | Backend Lead |
| Son güncelleme | 2026-08-05 |
| Gözden geçirme | Her API sürümü |

> Projenin resmî ürün adı **Floriven Studio** olarak belirlenmiştir. Mimari kararlar uygulamaya geçmeden önce ilgili ADR ile onaylanır.
## Genel

JSON tabanlı HTTPS API. Public sözleşme OpenAPI ile tutulur; bu doküman davranış ilkelerini tanımlar. API kökü `/api/v1`.

## Kimlik ve tenant

Bearer OIDC access token doğrulanır. Workspace bağlamı path veya açık header ile taşınır; token'daki üyelik server tarafından kontrol edilir. Client'ın gönderdiği owner/user alanlarına güvenilmez.

## Temel endpoint'ler

```text
POST   /workspaces
GET    /workspaces/{workspaceId}
POST   /workspaces/{workspaceId}/invitations
GET    /workspaces/{workspaceId}/projects
POST   /workspaces/{workspaceId}/projects
GET    /projects/{projectId}
PATCH  /projects/{projectId}
GET    /projects/{projectId}/design-document
PATCH  /projects/{projectId}/design-document
POST   /projects/{projectId}/snapshots
POST   /projects/{projectId}/generation-jobs
GET    /generation-jobs/{jobId}
POST   /generation-jobs/{jobId}/cancel
POST   /projects/{projectId}/export-jobs
GET    /export-jobs/{jobId}
GET    /workspaces/{workspaceId}/credits
GET    /workspaces/{workspaceId}/credit-ledger
```

Generation job isteği `designMode: "auto" | "template"` taşır. Template modunda
`stylePresetId` zorunludur ve sunucudaki sürümlü allowlist üzerinden doğrulanır;
istemcinin gönderdiği serbest stil nesnesine güvenilmez. Eski istemcilerin
`templateId` alanı geçici olarak `stylePresetId` alias'ı kabul edilir. Auto modda
stil kimliği gönderilmez ve DesignStrategy model çıktısı şema/enum doğrulamasından
geçirilir. Görsel stil seçimi ProductBlueprint ekranlarını, domainini veya
terminolojisini değiştiremez; domain capability pack yalnız brief analizinden seçilir.

İstek isteğe bağlı `requestedScreenCount`, `minScreenCount` ve `maxScreenCount`
alanlarını kabul eder. Açık sayı 1–12 aralığında tam hedeflenir. Sayı verilmezse
planner 3–8 ekran arasında ürün görevlerine göre karar verir. `screenScope` eski
istemciler için korunur: `Tek ekran` 1, `Tam akış` 8 ekrana eşlenir; `AI belirlesin`
otomatik politikayı kullanır. Dörtten büyük planlar sunucuda gruplu üretilir fakat
tek idempotent generation job olarak döner.

Job yanıtı ayrıca doğrulanmış `productBlueprint`, brief'ten türetilmiş opsiyonel
`domainPackId`, yalnız görsel `stylePresetId` ve deterministik `qualityReport`
alanlarını döndürür. `qualityReport.passed=false` olan üretim tamamlanmış sonuç
sayılmaz ve `resultScreens` kalıcılaştırılmaz.

Job yanıtı üretim kaynağını geriye uyumlu ek alanlarla açıklar:

- `compositionMode`: `ai_enhanced | deterministic_fallback`
- `degraded`: deterministik güvenli taslak kullanıldığında `true`
- `fallbackReason`: hassas içerik taşımayan kararlı hata/karar kodu
- `aiQualityScore` ve `baselineQualityScore`: aday seçiminin sayısal kanıtı

Provider veya statik kalite fallback'i kullanılmış bir job teknik olarak önizlenebilir
olsa bile istemci bunu özgün AI tasarımı olarak etiketleyemez. Ham provider yanıtı,
prompt, stack trace veya müşteri DesignSpec içeriği bu provenance alanlarına yazılmaz.

`qualityReport.metrics` ayrıca içerik kökenli deterministik ölçümleri taşır:
`genericContentCount`, `placeholderContentCount`, `repeatedContentCount` ve
`fallbackMetricFingerprint`. Placeholder içeriği, üç veya daha fazla jenerik ifade,
iki veya daha fazla ekranlar-arası kopya ya da bilinen deterministik metrik parmak izi
bulunan aday statik kalite kapısını geçemez. Navigation etiketleri, ekran adları,
erişilebilirlik metni ve kısa ortak aksiyonlar tekrar hesabının dışındadır.

Screen semantic coverage mevcut `ProductBlueprint` sözleşmesinden deterministik
hesaplanır. `screenPurposeCoverage` ekran görevlerinin, `screenSectionCoverage`
planlanan bölümlerin, `capabilityCoverage` ise ürün kabiliyetlerinin görünür içerikteki
karşılığını ölçer. Purpose kapsamı `%40` veya section kapsamı `%50` altında kalan
ekran `underCoveredScreenCount` değerini artırır; en az bir eksik ekran ya da global
capability kapsamının `%50` altında olması statik kaliteyi bloke eder. Edit modunda
sentetik blueprint purpose/section/capability taşımıyorsa bu kapı nötr kabul edilir;
mevcut doküman yalnız kısa bir stil talimatı nedeniyle anlamsız biçimde reddedilmez.

Aynı arketipi paylaşan ekranların yapısal farklılığı da deterministik olarak ölçülür.
`sameArchetypePairCount` karşılaştırılan çiftleri, `sameArchetypeCollisionCount` klon
sayısını, `maxSameArchetypeSimilarity` en yüksek benzerliği ve
`sameArchetypeDifferentiation` farklılaşma oranını taşır. Ortak ekran kabuğu ve metin
düğümleri karşılaştırma dışında tutulur; kalan bileşenlerin sırası `%60`, bileşen
envanteri `%40` ağırlıkla değerlendirilir. Benzerliği `%85` veya üzeri olan aynı
arketipli bir çift `SAME_ARCHETYPE_CLONE` ihlali üretir ve statik kaliteyi bloke eder.

Yeni üretimlerde her `productBlueprint.screens[]` öğesi `contract.version="1.0.0"`,
`job`, `requiredSections`, `primaryAction`, `secondaryActions`, `requiredData` ve
`navigationTargetIds` alanlarını taşır. Job ekran purpose değeriyle aynı, zorunlu
bölümler ekran sections listesinde ve navigasyon hedefleri başka planlı ekranlarda
olmalıdır. `primaryActionCoverage`, `requiredDataCoverage` ve
`underFulfilledContractCount` kalite teşhisine döner; aksiyon veya veri kapsamı `%50`
altında kalan ekran `SCREEN_CONTRACT_UNFULFILLED` ile reddedilir. Edit modunda
sentetik, boş sözleşme kalite açısından nötrdür.

`compositionMode="deterministic_fallback"` yeni bir üretimde kalitenin sözleşmesiz
olduğu anlamına gelmez. Fallback composer `ScreenContract` zorunlu bölümlerini,
aksiyonlarını ve veri alanlarını arketipe özgü node yapısına dönüştürür. Sabit 68/24/91
değerleri ve `Başlık`/`Açıklama` gibi placeholder'lar bu yolda kullanılamaz. Fallback
yine `degraded=true` olarak gösterilir ve runtime kanıtı olmadan final sayılamaz.

Normalize edilmiş AI adayındaki eksik ScreenContract yükümlülükleri tüm ekranı yeniden
üretmeden node-kapsamlı `add` patch'leriyle tamamlanır. Mevcut node kimlikleri ve içerik
korunur; eklenen kimlikler ekran id'siyle adlandırılır ve navigasyon düğümünden önce
yerleştirilir. Repair idempotenttir. `qualityReport.metrics.contractRepairOperationCount`
kaç hedefli operasyon uygulandığını bildirir; ham kullanıcı içeriği veya patch metinleri
job teşhisine yazılmaz.

`ScreenContract.sectionRoles` her `sections[]` değeri için aynı adlı tek bir kayıt
taşır. İzinli roller `summary | filters | entity-list | form-fields | actions |
analytics | details | settings` değerleridir ve ekran archetype'ı ile uyumlu olmalıdır.
`sectionTopologyCoverage` yapısal component kanıtı bulunan rol oranını,
`underCoveredTopologyScreenCount` en az bir rolü eksik ekran sayısını bildirir. Metin
başlıklarının tamam olması bu metriği yükseltmez. Eksik yapısal rol
`SECTION_TOPOLOGY_UNFULFILLED` ile final adayını bloke eder.

Topology doğrulaması ayrıca her bölümün benzersiz bir top-level component sahibi
olmasını ve bu sahiplerin archetype sırasına uymasını zorunlu kılar. Normalizasyon
yalnız sahip node'ları kendi aralarında sıralar; shell ve ilişkisiz içerik korunur.
`sectionOwnershipCoverage` sahip atanabilen bölüm oranını,
`invalidSectionOrderCount` sırası hâlâ geçersiz ekran sayısını taşır. Oranın `%100`
altında olması veya en az bir sıra ihlali `SECTION_OWNERSHIP_INVALID` ile adayı bloke
eder. Job teşhisine bölüm adı veya müşteri içeriği değil yalnız sayısal metrikler yazılır.

Her sahiplik bölümü normalize edilmiş DesignSpec'te açık bir `Stack` container olarak
somutlaşır. Container aynı bölüm heading'i ile rol sahibi component'i birlikte taşır.
`sectionContainerCoverage` eksiksiz container oranını,
`orphanSectionOwnerCount` container dışında kalan sahip component sayısını ve
`missingSectionHeadingCount` heading'i bulunmayan container sayısını bildirir. Kapsamın
`%100` altında olması veya orphan/heading eksikliği `SECTION_CONTAINER_INVALID` ile
adayı bloke eder. Teşhis yalnız sayıları taşır; section adları job cevabına kopyalanmaz.

Section container dışındaki semantic node'lar normalizasyon sırasında en uygun bölüme
üye yapılır. Shell node'ları taşınmaz; semantic node kimlikleri ve içerikleri korunur.
`sectionMemberCoverage` doğru container metadata'sıyla eşleşen üye oranını,
`orphanSemanticNodeCount` container dışında kalan semantic node sayısını,
`crossSectionMemberViolationCount` bulunduğu container ile section etiketi çelişen üye
sayısını taşır. Kapsamın `%100` altında olması veya herhangi bir orphan/cross-section
ihlali `SECTION_MEMBER_INVALID` ile final adayı bloke eder.

Nötr section üyeleri ScreenContract terimleri ve component-role uyumu birlikte
puanlanarak atanır. `semanticMemberAssignmentConfidence` yapılan semantik atamaların
0–1 ortalama güvenini, `lowConfidenceSectionMemberCount` güveni `%35` altında kalan
node sayısını taşır. En az bir düşük güvenli üye `LOW_SECTION_ASSIGNMENT_CONFIDENCE`
ile final adayı bloke eder. Public/job teşhisinde yalnız skor ve sayı bulunur; node
metni, section adı, kullanıcı brief'i veya gerekli veri ifadeleri tekrar edilmez.

`averageSectionAssignmentMargin`, en iyi ve ikinci section hedefi arasındaki 0–1 skor
farkının ortalamasını; `ambiguousSectionMemberCount` ise farkı `%15` altında kalan üye
sayısını taşır. Bu sayı sıfırdan büyükse `AMBIGUOUS_SECTION_ASSIGNMENT` final adayı
bloke eder. Public/job teşhisi yalnızca bu sayısal değerleri içerir.

`contractEvidenceAssignmentCount`, contract-repair obligation'ı ile tekil section rolü
arasında doğrulanmış eşleşme üzerinden explicit atanan üye sayısını bildirir. Birden fazla
aynı rol hedefi varsa bu sayaç artırılmaz ve sistem rastgele hedef üretmez. Public cevap
yalnız sayıyı taşır; obligation kaynağı veya kullanıcı metni job teşhisine kopyalanmaz.

`emptySectionContainerCount` heading dışında semantic üyesi bulunmayan container sayısını,
`maxSectionMemberConcentration` herhangi bir ekrandaki en yüksek 0–1 bölüm payını ve
`imbalancedSectionScreenCount` yeterli örnek büyüklüğünde `%75` yoğunluk sınırını aşan
ekran sayısını bildirir. Boş veya dengesiz dağılım final adayı
`SECTION_DISTRIBUTION_IMBALANCED` ile bloke eder.

`sectionRolePurity`, section container'lardaki rol-tanımlı component'lerin doğru rolle
eşleşme oranını; `crossRoleSectionMemberCount` en az bir uyumsuz rol component'i taşıyan
üye sayısını bildirir. Cross-role sayısının sıfırdan büyük olması final adayı
`SECTION_ROLE_IMPURE` ile bloke eder. Nötr sunum node'ları metriğe dahil edilmez.

Role purity kataloğu health-care, commerce, learning, publishing ve operations capability
pack component'lerini kapsar. Domain component'leri topology coverage için geçerli witness
olabilir ve yanlış section rolündeyse `crossRoleSectionMemberCount` değerini artırır.

`structuralIdentityPairCount`, semantic identity karşılaştırmasına uygun aynı-archetype
ekran çiftlerini; `structuralIdentityCollisionCount` `%90` eşiğini aşan çiftleri;
`maxStructuralIdentitySimilarity` en yüksek 0–1 benzerliği ve
`structuralIdentityDifferentiation` çakışmayan çift oranını bildirir. En az bir çakışma
`SAME_ARCHETYPE_STRUCTURAL_IDENTITY` ile final adayı bloke eder.

ScreenContract `identityIntent` alanı planlama çıktısında zorunludur; geriye dönük domain
tipinde opsiyonel tutulur. `dominantRole` ve `supportingRole` mevcut sectionRoles içinde
iki farklı rol, `densityProfile` ise `focused|balanced|dense` olmalıdır. Aynı archetype
ekranlarda intent üçlüsü tekrarlanamaz. Public job teşhisine yalnız normalize metadata ve
sayısal kalite sonuçları taşınır.

`identityIntentCoverage` karşılanan intent oranını,
`underFulfilledIdentityIntentCount` eksik ekran sayısını,
`identityRoleViolationCount` dominant/supporting sıralama ihlallerini ve
`identityDensityViolationCount` density aralığı ihlallerini bildirir. Eksik intent final
adayı `IDENTITY_INTENT_UNFULFILLED` ile bloke eder.

`identityIntentRepairOperationCount`, intent-aware repair tarafından eklenen toplam witness
sayısını bildirir. Root metadata ayrıca supporting/dominant/density nedenlerine göre yalnız
sayısal sayaçlar ve `budgetExhausted` taşır. Kullanıcı metni job teşhisine kopyalanmaz;
repair bütçesi yetmezse final kalite kapısı eksik intent'i reddetmeye devam eder.

`identityRepairAttemptCount`, `ineffectiveIdentityRepairCount`,
`exhaustedIdentityRepairCount`, `unnecessaryIdentityRepairCount` ve
`averageIdentityRepairGain` repair verimliliğini sayısal olarak bildirir. Etkisiz, bütçesi
tükenmiş veya gereksiz repair final adayı `IDENTITY_REPAIR_INEFFECTIVE` ile bloke eder.

Trusted phone runtime capture `visualIdentity` alanında `visibleNodeCount`, `sectionCount`,
`sectionAreaCoverage`, `verticalOccupancy`, `nodeDensityPer100k`,
`sectionHeightVariation`, `sectionRoleSequence` ve beş sayısal elemanlı `identityVector`
üretir. Koordinatlar canonical viewport'a normalize edilir; kullanıcı metni taşınmaz.

Runtime kalite raporu `layoutIdentity` gate'i taşır. Rapor `pairCount`, `collisionCount`,
`maxSimilarity`, `differentiation`, `issues` ve `passed` alanlarını içerir. Kanıt eksikse
`pendingGates` içinde `layoutIdentity` bulunur; `%90+` aynı-archetype collision final
uygunluğunu bloke eder.

Runtime certification screen kanıtı `archetype` ile her bound için opsiyonel
`semanticContainer` ve `sectionRole` metadata'sı taşır. Server bu güvenilir DOM
geometrisinden `visualHierarchy` raporunu yeniden hesaplar; istemciden hazır geçme/kalma
kararı kabul etmez. Rapor `screenCount`, `failingScreenCount`, `averageScore`,
`minimumScore`, `issues` ve `passed` alanlarını taşır. Kanıt eksikse `visualHierarchy`
`pendingGates` içine girer; başarısız rapor final uygunluğunu bloke eder.
Bu genişletilmiş kanıt sözleşmesi `evaluationVersion="v2"` kullanır; eski `v1` payload'ları
sessizce değerlendirilmez ve `RUNTIME_EVALUATION_VERSION_MISMATCH` ile reddedilir.
`visualHierarchy` server değerlendirmesi screen `archetype` değerine karşılık gelen
kalibrasyon profilini kullanır. Bilinmeyen archetype güvenli `default` profile düşer;
istemci eşik veya profil göndererek kalite kararını değiştiremez.

Runtime certification komutu `RUNTIME_REPLAY_OUTPUT_DIR` verildiğinde başarılı capture
sonrasında PNG, yalnız geometrik bounds JSON ve `runtime-replay-manifest.json` üretir.
Baseline karşılaştırması `RUNTIME_REPLAY_BASELINE` ve `RUNTIME_REPLAY_CANDIDATE` manifest
yollarıyla `certification:runtime-replay` kapısından çalışır. Bu dosyalar API cevabına
eklenmez ve tenantlar arasında paylaşılmaz.

CI `runtime-quality.yml` workflow'u runtime sözleşme, type-check ve güvenlik kapılarını
çalıştırır. `docs/certification/baselines/` değişirse
`certification:runtime-baseline-approval` komutu base SHA ile değişen dosyaları belirler;
maintainer etiketi ve manifest hash'iyle eşleşen onay kaydı olmadan PR başarısız olur.

`certification:runtime-release-evidence` credential değerlerini raporlamadan yalnız
önkoşul varlığını, altı ekranlı `2.0.0/phone-screen-v4` manifestini, hash onayını, replay
sonucunu ve runtime final kararını birleştirir. Strict mod release kapısıdır; normal CI
modu eksik canlı kanıtı görünür `NOT_VERIFIED` olarak raporlar.

Runtime recorder ve capture tarafı hierarchy eşiklerini bağımsız sabitlerle tanımlamaz.
Generated Edge adapter ile yerel capture aynı `runtime-hierarchy-profiles.json` sürümünü
kullanır; CI contract drift kontrolü başarılı olmadan runtime kalite değişikliği merge
edilemez.

CI hierarchy contract kontrolü PR base SHA'daki sözleşmeyle semver karşılaştırması yapar.
Uyumsuz geçiş `RUNTIME_HIERARCHY_SEMVER_VIOLATION`, generated içerik farkı
`RUNTIME_HIERARCHY_PROFILE_DRIFT` üretir. Edge runtime karar paritesi golden test ile
zorunludur; yalnız schema-valid olmak production uyumluluğu anlamına gelmez.

Persist edilen runtime `visualHierarchy` raporu `profileVersion` ve 64 karakterli
`profileHash` taşır. Replay/release evidence doğrulaması bu provenance değerlerini mevcut
canonical hierarchy sözleşmesiyle karşılaştırır. Alanların eksik veya biçimsiz olması
runtime kalite kanıtını geçersiz kılar.

Replay manifest doğrulayıcısı provenance değerlerini yalnız birbirleriyle değil kanonik
contract ile ayrı ayrı karşılaştırır. Eksik legacy provenance, downgrade, sahte fakat iki
tarafta eşit hash, bozuk ISO zaman, desteklenmeyen renderer, 390×844 dışı viewport, altı
ekran dışı koleksiyon, duplicate screen ID, 0–1 dışı hierarchy skoru ve sonlu/pozitif
olmayan ya da viewport dışına taşan bounds sertifikasyon hatasıdır; kanıt release kapısını
açamaz.

Canlı capture öncesinde `certification:runtime-live-preflight`; job kimliği, Supabase URL,
anon key, inspector grant ve uygulama URL'sini yalnız biçim/mevcudiyet açısından denetler,
değerleri çıktıya yazmaz. Recorder, PNG payload byte'larından SHA-256 değerini yeniden
hesaplar ve byte boyutunu doğrular. Digest/payload uyuşmazlığı `INVALID_SCREENSHOT`,
renderer, viewport veya bounds ihlali `INVALID_RENDER_METADATA` ile `422` döner.

## Idempotency

Generation, export, kredi satın alma ve webhook yan etkileri `Idempotency-Key` kullanır. Aynı key + aynı payload önceki sonucu döndürür; farklı payload 409 verir. Kayıt saklama süresi endpoint'e göre belgelenir.

Generation istemcisi ağ kopması, timeout veya `502/503/504` durumunda aynı
`Idempotency-Key` ile en fazla bir otomatik retry yapar. Sunucu `(project_id,
idempotency_key)` benzersizliğiyle ikinci job oluşmasını engeller. İlk çağrı hâlâ
işleniyorsa istemci mevcut job kimliğini periyodik olarak sorgular.

Generation POST ve GET çağrıları en az 32 karakterli `X-Job-Token` taşır. İstemci
token'ı session kapsamıyla saklar; sunucu yalnız SHA-256 özetini tutar. Tokensız veya
yanlış token'lı job okuması `403` döndürür. `generation_jobs` için anonim doğrudan
SELECT politikası bulunmaz; tüm okumalar bu Edge Function sınırından geçer.

## Concurrency

Design document update `If-Match`/revision taşır. Uyuşmazlıkta:

```json
{
  "type": "https://errors.example/conflict",
  "title": "Revision conflict",
  "status": 409,
  "code": "DOCUMENT_REVISION_CONFLICT",
  "currentRevision": 19,
  "correlationId": "..."
}
```

## Hata formatı

RFC 9457 Problem Details yaklaşımı kullanılır. Hata mesajı PII veya internal stack trace içermez. `code`, `correlationId`, alan hataları ve güvenli retry bilgisi bulunur.

## Pagination ve filtre

Cursor pagination varsayılandır. Limit maksimumu server belirler. Sıralama allowlist'ten seçilir; keyfi kolon adı kabul edilmez.

## Asenkron durum

Job endpoint 202 döndürür. Durum SSE ile `/jobs/stream` veya kontrollü polling ile izlenir. Event sırası ve tekrarları için event ID bulunur; UI state machine idempotent olmalıdır.

## Rate limit

Kullanıcı, workspace, IP ve maliyetli operasyon sınıfına göre ayrı bucket. 429 yanıtı `Retry-After` taşır. Rate limit başarısızlığı kredi kesmez.

## Sürümleme

Geriye uyumlu alan ekleme aynı v1 içinde olabilir. Alan anlamını değiştirme, silme veya enum daraltma yeni API sürümü veya geçiş dönemi ister. Deprecation header ve en az bir istemci sürümü geçiş süresi sağlanır.

## Üretim deneyim imzası

Generation V3 job güvenliği, runtime evidence, edit/patch ve deployment geçiş kapıları
[Generation V3 Production Readiness Planı](../02-architecture/GENERATION_V3_PRODUCTION_READINESS_PLAN.md)
Sprint 4–10 kapsamında izlenir.

Planlama çıktısındaki ekranlar opsiyonel `experiencePattern` alanı taşır. İzinli değerler
`standard`, `calendar`, `timeline`, `gallery`, `board` ve `map` değerleridir. Alan yoksa
sunucu kullanıcı brief'i ve ekran sözleşmesinden türetir. `standard` dışındaki her değer
karşılık gelen semantik component'i zorunlu kılar; yalnız başlık, metrik veya liste içeren
bir ikame başarılı üretim sayılmaz.

## Çapraz referanslar

| Konu | Doküman |
|---|---|
| DesignSpec şema detayı | [DESIGN_SPEC.md](../02-architecture/DESIGN_SPEC.md) |
| Modüler monolit kararı (servis sınırları) | [ADR-0001](../02-architecture/ADR-0001.md) |
| Kanonik model kararı | [ADR-0002](../02-architecture/ADR-0002.md) |
| AI job akışı | [AI_ARCHITECTURE.md](../02-architecture/AI_ARCHITECTURE.md) |
| Kimlik ve tenant modeli | [SECURITY_AND_PRIVACY.md](../05-security/SECURITY_AND_PRIVACY.md) |
| Kredi endpoint davranışı | [PRICING_AND_CREDITS.md](../07-business/PRICING_AND_CREDITS.md) |
| Hata ve retry standartları | [ERROR_HANDLING.md](ERROR_HANDLING.md) |
