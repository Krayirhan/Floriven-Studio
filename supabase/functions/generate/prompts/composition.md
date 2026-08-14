# Composition — screen skeleton, structural rules, worked example

**Changes when you want a different screen shape.** Medium churn.

## These three parts are one unit

The block recipe, the example, and the banned-phrase list cannot be separated:

- the example exists to **demonstrate** the recipe — change the 7 blocks and the
  example is immediately wrong
- the banned list is **derived from** the example's own wording — change the
  example and the list points at strings that no longer exist, while the new
  example's phrases leak into output unguarded

Splitting them across files was the first structure considered and rejected for
exactly this reason. Edit all three together or none.

## Why a recipe instead of a node count

`llama-3.3-70b` was told "produce 12-16 nodes". It produced 11, consistently.
Replacing the number with the explicit 7-block sequence below moved it to 16-17
with no other change.

A mid-size model does not plan toward a target count. It fills a structure. Give
it the structure.

## Why the example is about houseplants

An earlier example was a habit tracker — one domain hop away from fitness. The
model copied its numbers verbatim: the example's `18 / 28` ratio appeared
unchanged in fitness output. Moving the example to plant care and naming the
banned phrases explicitly took leakage to zero across every subsequent run.

The example teaches nesting depth, prop shape, a11y pattern and information
density. It must never teach content.

<!-- prompt:start -->
PRODUCT COMPOSITION — ProductBlueprint is the only product truth.
Implement each listed screen name, route, purpose and section without replacing it
with a generic overview/task/insights/settings set. Every supplied screen MUST solve its
own distinct user job and use a rich, multi-layered information structure appropriate to that job. Each screen has
16-24 nodes below root and at least 5 distinct visual component groups. Do not clone one
screen skeleton four times. Avoid flat, bare-bones, or empty card layouts.

The semantic composition stage receives a validated style-system profile in addition to
the ProductBlueprint. It MUST keep product domain, screen jobs, names, routes and
navigation semantics fixed, while using the style profile to vary information hierarchy,
grouping, density, typographic rhythm and component composition. Domain-specific
components are activated only by the separate DOMAIN CAPABILITY PACK derived from the
brief and ProductBlueprint. Different validated templates must not collapse to the same
node-type skeleton when their compositionPatterns or density differ.

UX ARCHETYPE — every screen in the batch carries its own UX İSKELETİ line
(archetype, layout, yoğunluk, hero, FAB, önerilen desenler). Treat it as a real
design brief for that screen, not decoration to reference loosely:
- You are designing a real production mobile application, not a Dribbble shot, a
  landing page, or a promotional concept.
- Build the layout from the screen's own archetype and layout pattern, then apply the
  supplied style-system composition patterns. Two screens with different archetypes must never share
  the same structural skeleton (same node-type sequence in the same order).
- hero=YASAK means: no oversized multi-line headline consuming the top of the
  screen. State the key fact in one line via Text variant:"heading" or a Metric,
  not a hero block. hero=izinli still means one concise line, not a landing-page headline.
- FAB=YASAK means: do not emit a FloatingActionButton on this screen under any
  circumstance, including "for visual consistency with other screens." Every
  screen's FAB (or lack of one) is decided by its own job, not by its neighbors.
- archetype=management_list wants a summary/filter strip above a dense, scannable
  list of real rows (ListItem) — not a stack of near-empty Cards.
- archetype=settings wants grouped rows (Switch/Checkbox/ListItem), never a
  decorative hero, never a FAB, never product-marketing tone.
- archetype=form wants compact fields (TextField/SearchField) and a single clear
  primary Button; no FAB, no hero.
- Do not wrap every section in a Card. Cards are for genuinely grouped, related
  content — flat Rows, ListItems, Dividers and direct children of the screen are
  equally valid and often the correct choice for management_list and settings.
- Do not add a decorative Image unless the screen's own content genuinely needs
  imagery (a product photo, a cover). An Image used as generic visual filler is a
  contract violation, not a stylistic choice.

RULES — a screen violating these is rejected:
1. root.type="Screen".
2. TopAppBar is first and BottomNavigation is always last.
3. Every Card has 3+ meaningful children (e.g. Text title + Metric/Progress/Badge + Row action/caption). Never a Card with one child.
4. Node ids globally unique across all generated screens; prefix with the screen slug (home_bar, home_c1, plan_bar...).
5. Every node has a11y {role, label} with a real Turkish label.
6. All copy Turkish, CONCRETE — real numbers, names, dates ("3 x 12 tekrar", "Salı 18:30", "1.840 kcal"). Placeholder text like "Başlık"/"Açıklama"/"Metin" is forbidden.
7. BottomNavigation items = the ProductBlueprint primary navigation screen names
   (maximum 5), in the supplied order and identical on every screen. Hierarchical and
   utility screens are not added to the bottom navigation.
8. Combine Metric for key numbers, Chart for trend lines, Progress for target completion, Badge for
   status, SegmentedControl for view filtering, and a FloatingActionButton for primary creation.
   Cards MUST set variant:"tinted"|"elevated"|"outline" and tone:"primary"|"success"|"warning"|"danger"|"neutral" to build contrast.
9. Every root.props.theme uses the SAME value across all screens: ocean, mint,
   violet or coral. Choose the theme from the user's domain.
10. Every root.props.strategy uses the SAME object across all screens. If the user
    message supplies a style strategy, copy it exactly. Otherwise analyze the
    product category, audience, usage context and information density; choose the
    palette, cardStyle, density and navigationStyle deliberately. rationale contains
    exactly 2 short, concrete Turkish design reasons. Do not reuse one default strategy
    for unrelated domains.
11. FloatingActionButton.icon and IconButton.icon use one canonical name only:
    "plus", "filter", "search", "edit", "check" or "arrow-right". Never output
    words such as "add", "create", "ekle" or "filter_alt" as visible icon content.
12. Never infer product vocabulary or component families from stylePresetId, palette,
    cardStyle, typography or preset name. Use a domain component only when the runtime
    DOMAIN CAPABILITY PACK explicitly permits it.

THE EXAMPLE BELOW IS A LOW-LEVEL NODE/NESTING REFERENCE ONLY, not the full
product composition. Follow ProductBlueprint for the actual screen jobs and content.
It is a plant-watering app. Your app is something else entirely.
Copy the SHAPE — node nesting, prop keys, a11y pattern, density.
Copy NOTHING else. These strings are banned in your output:
  "Bu hafta"  "18 / 28"  "En uzun"  "günlük seri"  "Sabah yürüyüşü"  "2 litre su"
  "toprak nemi"  "Deve tabanı"  "Sarmaşık"  "Kaktüs"  "Saksılarım"
Every number, unit, label and phrase you write must be invented from the user's
app description and its own domain vocabulary.

EXAMPLE (plant-care app — copy the SHAPE, not the CONTENT):
{"id":"scr_sera","name":"Saksılarım","route":"/saksilarim","root":{"id":"sera_root","type":"Screen","props":{"theme":"mint"},"layout":{"mode":"column","gap":"space.4"},"a11y":{"role":"main","label":"Saksılarım"},"children":[
{"id":"sera_bar","type":"TopAppBar","props":{"title":"Saksılarım","action":"Profil"},"a11y":{"role":"banner","label":"Üst çubuk"}},
{"id":"sera_ttl","type":"Text","props":{"text":"7 bitkiden 2'si bugün sulanmayı bekliyor","variant":"title"},"a11y":{"role":"heading","label":"Sulama durumu"}},
{"id":"sera_sum","type":"Card","props":{"variant":"tinted","tone":"success"},"layout":{"mode":"column","gap":"space.3"},"a11y":{"role":"region","label":"Nem özeti"},"children":[
 {"id":"sera_sum_h","type":"Text","props":{"text":"Ortalama toprak nemi","variant":"heading"},"a11y":{"role":"heading","label":"Ortalama toprak nemi"}},
 {"id":"sera_sum_p","type":"Progress","props":{"label":"%41 · ideal aralık %50-70","value":41},"a11y":{"role":"progressbar","label":"Toprak nemi yüzde 41"}},
 {"id":"sera_sum_r","type":"Row","props":{},"layout":{"mode":"row","gap":"space.3"},"a11y":{"role":"group","label":"Sulama bilgisi"},"children":[
  {"id":"sera_sum_b","type":"Badge","props":{"label":"2 bitki susuz"},"a11y":{"role":"status","label":"2 bitki susuz"}},
  {"id":"sera_sum_c","type":"Text","props":{"text":"Son sulama 3 gün önce","variant":"caption"},"a11y":{"role":"note","label":"Son sulama 3 gün önce"}}]}]},
{"id":"sera_lh","type":"Text","props":{"text":"Bugün ilgilenilecekler","variant":"heading"},"a11y":{"role":"heading","label":"Bugün ilgilenilecekler"}},
{"id":"sera_lst","type":"Card","props":{},"layout":{"mode":"column","gap":"space.2"},"a11y":{"role":"list","label":"Bitki listesi"},"children":[
 {"id":"sera_l1","type":"ListItem","props":{"title":"Deve tabanı","subtitle":"Salon · 200 ml su","trailing":"Bugün"},"a11y":{"role":"listitem","label":"Deve tabanı bugün sulanacak"}},
 {"id":"sera_l2","type":"ListItem","props":{"title":"Sarmaşık","subtitle":"Balkon · 150 ml su","trailing":"3 gün sonra"},"a11y":{"role":"listitem","label":"Sarmaşık 3 gün sonra sulanacak"}},
 {"id":"sera_ld","type":"Divider","props":{},"a11y":{"role":"separator","label":"Ayırıcı"}},
 {"id":"sera_l3","type":"ListItem","props":{"title":"Kaktüs","subtitle":"Pencere önü · 50 ml su","trailing":"6 gün sonra"},"a11y":{"role":"listitem","label":"Kaktüs 6 gün sonra sulanacak"}}]},
{"id":"sera_cta","type":"Button","props":{"label":"Sulamayı kaydet"},"a11y":{"role":"button","label":"Sulamayı kaydet"}},
{"id":"sera_nav","type":"BottomNavigation","props":{"items":["Saksılarım","Takvim","Notlar","Profil"]},"a11y":{"role":"navigation","label":"Alt gezinme"}}]}}
<!-- prompt:end -->

## What the code already repairs

Rules 1, 2, 5 and 7 are enforced mechanically by `repairStructure()` and
`normalizeNode()` in [`index.ts`](../index.ts) — a missing `TopAppBar` is injected, a
stray second `title` is demoted to `heading`, `BottomNavigation` is moved last and
its items overwritten, missing `a11y` is derived from props.

They stay in the prompt anyway: a model that produces them correctly costs nothing
to repair, and the repaired version is always blander than a good original.

Rules 3, 4, 6 and 8 have no mechanical fallback. If the model ignores them the
output is simply worse.
