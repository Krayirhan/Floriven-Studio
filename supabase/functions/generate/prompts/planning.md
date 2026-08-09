# Planning — phase 1, the flow plan

**Changes when phase 1 behaviour changes.** Low churn.

This file is the system prompt for a separate, cheap call that runs before
generation. It does not join the `contract → composition → content` chain.

## The token budget this file lives inside

Groq's free tier caps `llama-3.3-70b` at **12.000 tokens per minute**, and
`max_tokens` counts toward the request size — a request is rejected with `413`
before it runs if prompt + `max_tokens` exceeds what is left in the window.

| Call | Prompt | `max_tokens` | Total |
| --- | --- | --- | --- |
| plan | ~340 | 1.100 | ~1.440 |
| build | ~3.100 | 7.000 | ~10.100 |
| | | | **~11.540** |

That leaves under 500 tokens of headroom (`PLAN_TOKENS` was raised from 1.400 to
1.800 in [`index.ts`](../index.ts) to fit the archetype fields below — each
screen now carries six extra short fields instead of just a name and purpose).
**Keep this file terse.** If it must grow further, cut `BUILD_TOKENS` by the
same amount rather than letting the plan call start hitting `413`.

## Why phase 1 exists

Given a three-pillar brief — *"antrenman programı oluşturduğu, ilerlemeyi takip
ettiği ve beslenme günlüğü tuttuğu"* — the single-call pipeline dropped a pillar.
It produced Antrenman, İstatistik and Takvim: two invented screens, and no
nutrition screen at all despite it being named in the brief.

The model was not planning. It was pattern-completing a generic app shell. A cheap
call that does nothing but enumerate the pillars fixed it — all three appeared,
and screen names became domain-specific (`Beslenme Günlüğü`, not `Takvim`).

<!-- prompt:start -->
Bir mobil uygulamanın ürün yapısını VE her ekranın UX iskeletini analiz ediyorsun.
Görsel stil (renk/tipografi/preset) seçme — bu ayrı bir katman.
Şu JSON'u döndür:
{"productDomain":"string","audience":"string","entities":["string"],"capabilities":["string"],"contentVocabulary":["string"],"screenPolicy":{"requestedCount":null,"minCount":3,"maxCount":8,"rationale":"string"},"navigation":{"primaryScreenIds":["id"],"utilityScreenIds":["id"]},"screens":[{"id","name","route","purpose","sections","role","priority","parentId","navigationPlacement","archetype","layoutPattern","contentDensity","heroAllowed","fabAllowed","patterns"}]}

- productDomain yalnız brief'in ürün alanını anlatır. Görsel şablon/stil adı yazma.
- entities kullanıcının yönettiği somut varlıklar; capabilities yaptığı işlerdir.
- contentVocabulary brief'e ait 6-12 terimdir. Brief'te sağlık yoksa sağlık terimi,
  commerce yoksa ürün/sepet terimi, yayın yoksa yazı/arşiv terimi ekleme.

- Kullanıcı açık ekran sayısı verdiyse requestedCount odur ve 1-12 aralığında tam uygula.
  Sayı vermediyse requestedCount null; ürün karmaşıklığına göre 3-8 gerekli ekran seç.
- İlk ekran overview'dur. Briefteki her ana görev bir core ekran veya açıkça bağlı detail/form
  ekranıyla çözülsün. Hesap, bildirim, entegrasyon, para birimi, tema veya çalışma alanı
  tercihi gerekiyorsa settings ekranı ekle; gerekmiyorsa zorla ekleme.
- role: overview|core|detail|form|support|settings|onboarding. parentId yalnız hiyerarşik
  ekranlarda kullanılır. navigationPlacement: primary|hierarchical|utility|hidden.
- navigation.primaryScreenIds 3-5 birincil ekrandan oluşur. Detay, form ve ayarları alt
  navigasyona doldurma; utilityScreenIds profil/ayar gibi menüden erişilen ekranlardır.
- name: kısa Türkçe ekran adı, uygulamanın diline ait (jenerik "Ana Sayfa" yerine
  uygulamaya özgü bir ad tercih et).
- route: kebab-case yol, örn "/beslenme".
- purpose: kullanıcının burada ne başardığını anlatan tek Türkçe cümle.
- sections: sırayla 4-6 somut Türkçe bölüm etiketi. Uygulamanın kendi metriklerini,
  kendi liste içeriklerini, kendi eylemlerini isimlendir. Jenerik etiket yasak.

UX ISKELETİ — her ekran farklı bir görev çözer, bu yüzden aynı iskeleti tekrarlama:
- archetype: dashboard|management_list|settings|form|detail|profile. Ekranın GÖREVİNDEN
  seç, asla görsel stilden. dashboard=özet+KPI+son aktivite. management_list=özet şeridi+
  filtre+yoğun liste. settings=gruplu ayar satırları. form=kompakt alanlar+sabit aksiyon.
  detail=kimlik/özet+birincil bilgi+bağlamsal aksiyon. profile=kimlik+hesap+gruplu tercihler.
- layoutPattern: archetype'a uygun 2-4 kelimelik somut iskelet, örn "özet şeridi+filtre+
  yoğun liste" veya "kimlik+bilgi+aksiyon". Ardışık iki ekranda aynı layoutPattern'i verme.
- contentDensity: low|medium|high — ekranın bilgi yoğunluğu.
- heroAllowed: yalnız onboarding, boş durum veya gerçek bir dashboard özetiyse true;
  aksi halde false. Operasyonel/yönetim ekranlarında büyük başlık yasak.
- fabAllowed: yalnız net bir oluşturma/ekleme eylemi varsa true. settings ve profile
  ekranlarında HER ZAMAN false.
- patterns: bu ekranda kullanılacak 2-4 somut desen, örn ["SegmentedControl","SearchField",
  "ListRow","StatusBadge"]. "Card"ı tek başına desen olarak yazma — hangi içerik hangi
  düzende olacaksa onu yaz.

Sadece JSON döndür.
<!-- prompt:end -->

## How the plan reaches phase 2

Each field lands somewhere specific in the build call's user message:

| Field | Used for |
| --- | --- |
| `name` | the screen's `name`, its `TopAppBar.title`, and one slot in every screen's `BottomNavigation` |
| `route` | the screen's `route`, and the slug that prefixes its node ids |
| `purpose` | one line of context so the model knows what the screen is for |
| `sections` | the ordered section labels the `heading` nodes should realise |
| `archetype` / `layoutPattern` / `contentDensity` | told to the build call verbatim as the screen's required composition — this is what stops "operations screen with three different jobs" from all rendering as the same header→title→Card-stack |
| `heroAllowed` / `fabAllowed` | mechanically enforced too: `fabAllowed:false` gets its FAB stripped in `repairStructure()` even if the build call ignores the instruction |
| `patterns` | 2-4 concrete UI shapes the build call should reach for before falling back to a bare `Card` |

`sections` is the highest-value field for *content* — it stops the build call
from inventing its own topics. `archetype`/`layoutPattern` are the highest-value
fields for *structure* — they stop every screen from collapsing into the one
layout a mid-size model finds safest regardless of what the screen is for.

## When the plan comes back broken

`planScreens()` never throws on a malformed entry — a failed plan would waste the
whole minute's token budget. It coerces instead:

| Missing or malformed | Falls back to |
| --- | --- |
| `name` | `Ekran 1`, `Ekran 2`, `Ekran 3` |
| `route` | `/ekran-1`, `/ekran-2`, `/ekran-3` |
| `purpose` | empty string |
| `sections` | empty array — the build call then invents its own sections |
| `archetype` | derived from `role` (`deriveArchetype()` in `domain.ts`) — never left unset |
| `fabAllowed` | forced `false` whenever `role` is `settings`, regardless of what the model said |
| ekran sayısı politika dışında | güvenli 3-12 aralığına sınırlanır |

Only a completely empty `screens` array throws. A degraded plan still produces
screens; it just produces blander ones.
