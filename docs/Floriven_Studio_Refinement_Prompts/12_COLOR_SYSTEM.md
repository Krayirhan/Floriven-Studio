# 12. Color System

## Amaç

Floriven Studio ana çalışma alanında yalnızca **Color System** birimini iyileştirmek. Diğer başarılı bölümleri korumak.

## Kullanım

Mevcut Floriven Studio ekran görüntüsünü referans olarak yükleyin ve aşağıdaki promptu tek başına uygulayın.

## Prompt

```text
Refine ONLY the Floriven Studio application color system.

Do not change layout.
Do not change typography.
Do not redesign components.

Preserve Floriven’s warm dark identity and terracotta signature color.

CURRENT PROBLEM:

The interface sometimes feels too dark and muddy because black, green, brown, burgundy, and terracotta surfaces are all low-luminance and compete with each other.

Neutralize the application chrome.

Recommended foundation:

APP BACKGROUND
#0A0C0A

SIDEBAR
#0D100D

PRIMARY SURFACE
#121512

RAISED SURFACE
#171A17

HOVER SURFACE
#1C201C

BORDER
rgba(255,255,255,0.09)

STRONG BORDER
rgba(255,255,255,0.14)

PRIMARY TEXT
rgba(255,255,255,0.94)

SECONDARY TEXT
rgba(255,255,255,0.70)

MUTED TEXT
rgba(255,255,255,0.54)

FLORIVEN PRIMARY
warm terracotta around #DE7B5B

SECONDARY BRAND ACCENT
muted natural green

SUCCESS
muted mint

WARNING
warm amber

ERROR
soft coral

Use color-rich backgrounds mainly inside:

- Generated project previews
- Template previews
- Product screenshots
- Small category labels

Keep the core application chrome mostly neutral.

Floriven should feel:

Warm
Creative
Premium
Technical
Precise

Avoid making it feel:

Brown
Vintage
Coffee-themed
Lifestyle-oriented
Crypto-like
Neon
```
