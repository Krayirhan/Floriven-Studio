# 03. Contrast & Text Readability

## Amaç

Floriven Studio ana çalışma alanında yalnızca **Contrast & Text Readability** birimini iyileştirmek. Diğer başarılı bölümleri korumak.

## Kullanım

Mevcut Floriven Studio ekran görüntüsünü referans olarak yükleyin ve aşağıdaki promptu tek başına uygulayın.

## Prompt

```text
Refine ONLY the contrast and text readability of the Floriven Studio dark interface.

Do not change the layout.
Do not change the core brand colors.
Do not redesign cards.
Do not change typography sizes unless absolutely required for accessibility.

CURRENT PROBLEM:

Secondary text, metadata, descriptions, timestamps, screen counts, sidebar secondary information, and helper text are too low-contrast.

The dark interface feels premium at first glance but becomes unnecessarily difficult to read.

Create three clearly defined text hierarchy levels:

PRIMARY TEXT
rgba(255,255,255,0.94)

SECONDARY TEXT
rgba(255,255,255,0.70)

MUTED TEXT
rgba(255,255,255,0.54)

Do not use opacity below approximately 50% for information the user needs to understand.

Increase readability of:

- Prompt placeholder
- Project descriptions
- Screen counts
- Variation counts
- Last edited timestamps
- Sidebar project metadata
- Template descriptions
- Template screen counts
- “Tümünü gör”
- Form labels
- Quick-start labels
- Topbar utility labels

Maintain a dark premium atmosphere.

Do not turn all text bright white.

The hierarchy should remain obvious:

Primary
Secondary
Muted

But every functional text element must remain comfortably readable.

Also slightly strengthen important card borders if required:

border:
rgba(255,255,255,0.08–0.11)

The result should improve readability without losing Floriven Studio’s refined dark character.
```
