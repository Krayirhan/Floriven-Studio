# Content — semantic rules for what goes inside each prop

**The highest-churn file in the layer.** Every rule here exists because a specific
bad output was observed. Expect to add to it whenever you see a new failure.

Nothing here is enforced in code. `validateScreen()` checks structure — node
counts, required types, unique ids — and is blind to every rule below. A screen
reading `Kahvaltı | 2 saat | 10:00` passes validation cleanly. These rules are the
only thing standing between the user and that screen.

## The one thing that makes a rule work

> "Don't write generic content" — ignored, every run.
> "No two ListItems in one Card may share a trailing value" — obeyed, first run.

A rule binds when a machine could check it. If you cannot describe the check, the
model will not follow the rule. Rewrite it until you can.

Measured on one fitness brief, before and after this file existed:

| Defect | Before | After |
| --- | --- | --- |
| Empty `subtitle` | 3 | 0 |
| Metrics piled into `title` | 2 | 0 |
| `Badge` holding a day name or meal | 3 | 0 |
| Repeated `trailing` in one Card | 3 | 1 |

## Rules

Each rule below follows the same four-part shape — claim, what it rejects, good,
bad. Keep the shape when adding rules; it is what makes them mechanical to write
and mechanical to check.

### 9 — ListItem carries three distinct jobs

Rejects: any empty field, and any clock time standing in for a measurement.

| | title | subtitle | trailing |
| --- | --- | --- | --- |
| role | the thing | its descriptive detail | its measurement |
| good | `Bench Press` | `4 set · 12 tekrar` | `60 kg` |
| good | `Kahvaltı` | `2 yumurta, tam buğday ekmek` | `420 kcal` |
| bad | `Pazartesi` | *(empty)* | `10:00` |

### 10 — Variety within a Card

Rejects: three rows reading `10:00 / 10:00 / 10:00`.
Good: `60 kg` / `45 kg` / `30 kg`. Bad: the same number three times.

### 11 — `title` is one sentence about the user's state

Rejects: metrics glued together with `·` or `için`.
Good: `Bu hafta 4 antrenmanın 3'ünü tamamladın`.
Bad: `1.840 kcal · 3 x 12 tekrar`.

### 12 — `heading` is a section label

Rejects: a data point used as a heading.
Good: `Bugünün öğünleri`. Bad: `Boy: 175 cm` — that is a `body`.

### 13 — `Badge` is a status

Rejects: day names, dates, clock times, meal names.
Good: `Hedefte`, `2 öğün eksik`, `3 gün gecikme`. Bad: `Pazartesi`, `Kahvaltı`.

### 14 — `Progress` states value against target

Rejects: a bare percentage with no unit and no target.
Good: label `1.840 / 2.500 kcal`, value `74`. Bad: label `%74`.

### 15 — An entity may recur across screens; a *row* may not

Rejects: a row copied unchanged into another screen.

The first version of this rule banned repeated titles outright. That was written
against `llama-3.3-70b`, which pasted identical lists across screens out of
laziness. `gpt-oss-120b` does something better and the blunt rule would have
forbidden it — the same three books appearing on all three screens, each time
through that screen's own lens:

| screen | title | subtitle | trailing |
| --- | --- | --- | --- |
| goals | `Kürk Mantolu Madonna` | `Sayfa hedefi: 400` | `0 / 400` |
| progress | `Kürk Mantolu Madonna` | `Okunan: 200 sayfa` | `200 / 400` |
| quotes | `Kürk Mantolu Madonna` | `"Sevgi bir çiçek gibi…"` | `3 kez beğenildi` |

That is one app's data seen three ways, and it is the strongest output this
system has produced. The check is therefore on the row, not the title: if a
title recurs, its `subtitle` and `trailing` must both differ and must reflect
what *this* screen is for.

A rule can be wrong in the direction of quality. This one was, and only a
stronger model revealed it — worth remembering when the next model lands.

### 16 — Every row is a named instance, not a category

Rejects: a generic noun, with or without an index, standing in for a real record.

Observed on a book-tracking brief: `Alıntı 1 | Kitap Adı | 2 gün önce`. Rule 6 in
`composition.md` already banned `Başlık`/`Açıklama`/`Metin`, but that is a fixed
word list — `Kitap Adı` and `Alıntı 1` are the same failure wearing different
words. The check has to be about the *kind* of string, not a blocklist.

| | title | subtitle |
| --- | --- | --- |
| good | `"Kırmızı Pazartesi"` | `Gabriel García Márquez · s. 84` |
| bad | `Alıntı 1` | `Kitap Adı` |
| bad | `Kitap 2` | `Yazar Adı` |

A row must read like a row from a real user's database.

<!-- prompt:start -->
9. ListItem = { title: the thing, subtitle: its descriptive detail, trailing: its
   measurement }. All three are mandatory and non-empty.
     good: "Bench Press" / "4 set · 12 tekrar" / "60 kg"
     good: "Kahvaltı"    / "2 yumurta, tam buğday ekmek" / "420 kcal"
     bad:  "Pazartesi"   / ""                  / "10:00"
   The measurement must be the item's own quantity in the app's real unit —
   never a clock time standing in for a value.
10. VARIETY IS ENFORCED: within one Card, no two ListItems may share the same
    trailing value. Three rows reading "10:00 / 10:00 / 10:00" is rejected.
    Every row carries its own distinct, plausible number.
11. Text variant:"title" is ONE plain sentence describing the user's current state
    ("Bu hafta 4 antrenmanın 3'ünü tamamladın"). Never a pile of metrics glued with
    "·" or "için" — "1.840 kcal · 3 x 12 tekrar" is rejected.
12. Text variant:"heading" is a SECTION LABEL naming the group below it
    ("Bugünün öğünleri"). Never a data point — "Boy: 175 cm" is a body, not a heading.
13. Badge is a short STATUS only ("Hedefte", "2 öğün eksik", "3 gün gecikme").
    Never a day name, a date, a clock time, or a meal name.
14. Progress.label states value against target in the real unit
    ("1.840 / 2.500 kcal"), and value is that ratio as 0-100.
15. The same entity MAY appear on more than one screen — that continuity is good.
    But a row must never be copied unchanged: when a title recurs, its subtitle
    and trailing must both differ and must reflect what THIS screen is for.
      good: "Kürk Mantolu Madonna" / "Sayfa hedefi: 400"   / "0 / 400"    (hedefler)
            "Kürk Mantolu Madonna" / "Okunan: 200 sayfa"   / "200 / 400"  (ilerleme)
      bad:  the identical row pasted into a second screen.
16. Every ListItem is a NAMED INSTANCE from a real user's data — never a category
    label, with or without an index.
      good: "Kırmızı Pazartesi" / "Gabriel García Márquez · s. 84" / "%62"
      bad:  "Alıntı 1"          / "Kitap Adı"                     / "2 gün önce"
      bad:  "Kitap 2"           / "Yazar Adı"                     / "10 sayfa"
    If a title would still make sense with any other app's data pasted under it,
    it is a category, not an instance. Invent the specific record.

REDUCTIVE DISCIPLINE: prefer fewer, fuller elements over more, emptier ones.
Every node must carry real information. A row that says nothing is worse than no row.

Output JSON only. No markdown, no commentary.
<!-- prompt:end -->

## Adding a rule

1. **Quote the bad output.** Not "content was weak" — the literal string, e.g.
   `Kahvaltı | 2 saat | 10:00`.
2. **Name the prop and the confusion.** `trailing` received a duration where the
   domain's unit is calories.
3. **Write the check a machine would run.** "For meal rows, `trailing` matches a
   calorie pattern, not `HH:MM`." If you cannot write it, the rule will not bind —
   go back to step 2 and narrow it.
4. **Add the rule with a good/bad pair, redeploy, rerun the same brief.** Confirm
   the defect count moved. An unmeasured rule is a guess.

Rule numbering continues from 15 — the numbers are shared with `composition.md`,
which owns 1-8. Do not renumber; the model refers to them positionally and old
numbers appear in past debugging notes.
