# Floriven Studio — Tüm Refinement Promptları
Bu dosya 15 promptun tek dokümanda birleşmiş kopyasıdır. Ayrı MD dosyaları esas kullanım formatıdır.

---

# 01. Desktop Layout Width

```text
Refine ONLY the desktop layout width and content-container behavior of the current Floriven Studio home workspace.

Do not redesign the visual language.
Do not change colors.
Do not change typography styles yet.
Do not change the information architecture.
Do not add new sections.

CURRENT PROBLEM:

The main application content uses too little horizontal space on large desktop monitors.

On 1728px–1920px screens, a large unused empty area remains on the right side.

This makes Floriven Studio look smaller, less mature, and less like a professional desktop SaaS application.

FIX THE DESKTOP LAYOUT.

LEFT SIDEBAR:
Keep persistent.

Target width:
220–240px.

MAIN APPLICATION AREA:
Use the remaining viewport width confidently.

Set the main content container to approximately:

max-width: 1360–1440px

Use responsive width:
width: 100%

Recommended desktop horizontal padding:
40–56px.

Do not center the application inside a narrow 900–1050px column.

For very large monitors, allow the main workspace to expand naturally while maintaining readable content proportions.

TARGET STRUCTURE:

| Sidebar | Wide Floriven workspace                           |

NOT:

| Sidebar | Narrow content | Huge unused empty space           |

Update the following sections to benefit from the wider layout:

- AI composer
- Latest project
- Recent projects
- Template gallery

On >= 1600px:

Recent projects:
3–4 columns depending on card minimum width.

Templates:
3–4 columns depending on available width.

Latest project:
Use a wider visual preview.

AI composer:
Increase width significantly.

Do not make components taller simply because more width is available.

Use the additional width to improve density and reduce page height.

The result should feel designed specifically for large professional desktop monitors.

Preserve all existing functionality and visual identity.

Only improve the layout width and responsive container behavior.
```

---

# 02. Typography Scale & UI Readability

```text
Refine ONLY the typography scale and general UI readability of the current Floriven Studio workspace.

Do not redesign the layout.
Do not change the color palette.
Do not change card structure.
Do not add new features.

CURRENT PROBLEM:

The interface feels approximately 8–12% too small.

Many labels, metadata elements, sidebar items, chips, project descriptions, and toolbar controls look miniature on 1440–1920px desktop screens.

Floriven Studio should feel dense and professional, but never tiny.

Create a consistent application typography system.

Use Geist or Inter.

Recommended scale:

PAGE TITLE
32px
font-weight: 700
line-height: 1.15

SECTION TITLE
20–22px
font-weight: 650–700

PROJECT TITLE
16–17px
font-weight: 600–650

CARD TITLE
15–16px
font-weight: 600

BODY
14–15px
font-weight: 400
line-height: 1.5

PROMPT TEXT
15–16px

SIDEBAR NAVIGATION
13–14px
font-weight: 500

TOP TOOLBAR
12–13px

METADATA
12–13px
font-weight: 450

BUTTON LABEL
13–14px
font-weight: 600

BADGE
11–12px
font-weight: 550–600

EYEBROW
11px
font-weight: 650
letter-spacing: 0.06em

Increase interactive control heights where necessary.

Minimum standard controls:
36px

Primary controls:
40–44px

Do not increase everything uniformly.

Preserve visual hierarchy.

Important product content should become easier to read.

Secondary information should remain secondary without becoming invisible.

Do not create hierarchy purely through tiny font sizes.

The final interface should feel approximately 8–10% more comfortable without becoming oversized.
```

---

# 03. Contrast & Text Readability

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

---

# 04. Global Topbar

```text
Refine ONLY the global topbar of Floriven Studio.

Preserve the current sidebar and main content.

Do not redesign the rest of the page.

CURRENT PROBLEM:

The global topbar contains the correct functionality but feels too small and visually similar to browser chrome.

It should feel like a mature SaaS application toolbar.

TARGET HEIGHT:

50–54px

LEFT:

Global search.

Width:
300–360px desktop.

Placeholder:

“Proje, ekran, varlık veya şablon ara…”

Add shortcut hint:

⌘K / Ctrl+K

CENTER / FLEX:

Active generation indicator.

Example:

● 1 üretim devam ediyor

Use restrained muted-green styling.

Make it clearly clickable.

On click show a compact popover:

Kişisel Finans

Bütçe Detayı hazırlanıyor

2 / 3 ekran tamamlandı

68%

[Projeyi aç]
[Detayları gör]

Optional:
[İptal et]

RIGHT:

82 kredi

Notification button

Yardım

User avatar
Emre Y.

Improve horizontal spacing between controls.

Use clear hover, focus, active, and pressed states.

Do not make the toolbar visually dominant.

Do not create large colorful buttons.

The topbar must remain subtle but clearly usable.

Add visible notification unread state when relevant.

Credits should open a small usage popover when clicked.

The final topbar should feel practical, calm, and professional rather than miniature.
```

---

# 05. Left Sidebar

```text
Refine ONLY the Floriven Studio left sidebar.

Preserve the navigation architecture.

Do not introduce new major navigation categories.

Target width:
220–240px.

Keep:

Floriven Studio

+ Yeni tasarım

Ana sayfa
Projelerim
Paylaşılanlar
Şablonlar
Varlıklar

Son projeler

Kullanım ve krediler
Ayarlar
Yardım

User profile

Improve:

- Typography size
- Project preview readability
- Navigation spacing
- Active state
- Hover state
- Visual hierarchy

PRIMARY CTA:

“+ Yeni tasarım”

Keep terracotta as the primary CTA.

Height:
40–42px

Do not make it excessively tall.

ACTIVE NAVIGATION:

Do not use a large solid terracotta block.

Instead use:

- Neutral raised surface
- Slight terracotta tint
- Small left accent indicator
- High-contrast text

RECENT PROJECTS:

Make preview thumbnails slightly larger and recognizable.

Each row:

[thumbnail] Kişisel Finans
            3 ekran · 5 dk önce

Keep rows compact.

Add hover menu:

•••

Do not create excessive separators.

BOTTOM AREA:

Use subtle division before:

Kullanım ve krediler
Ayarlar
Yardım

USER AREA:

Avatar
Emre Y.
Ücretsiz plan
•••

The sidebar should feel like a professional project navigation system, not a tiny menu.
```

---

# 06. Main AI Composer

```text
Refine ONLY the main Floriven Studio AI creation composer.

Preserve the current product modes and general structure.

Do not redesign the rest of the dashboard.

The composer must become the strongest functional element on the page.

Current heading:

“Ne tasarlamak istiyorsun?”

Keep it.

Supporting text:

“Mobil veya web fikrini anlat, mevcut ekranını yükle ya da kaldığın projeyle devam et.”

MODES:

Mobil Uygulama
Web UI & Dashboard
Ekranı Yeniden Tasarla

Improve the mode selector.

These are not minor filter chips.

They are three core Floriven product workflows.

Make them:

- Clearly readable
- Easy to switch
- Visually important without being oversized
- Accessible via keyboard
- Equipped with icon + label

Increase composer width.

Increase prompt input height moderately.

Prompt area should feel like an AI creation workspace rather than a normal textarea.

Default prompt placeholder:

“Nasıl bir mobil uygulama tasarlamak istiyorsun?”

Primary CTA:

“✦ Floriven ile Üret”

Keep this wording.

Secondary action:

“+ Referans”

Keep:

“Gelişmiş seçenekler”

Use progressive disclosure.

Default composer should remain simple.

Do not expose every generation option initially.

Improve:

- Focus state
- Typing state
- Upload state
- Drag-over state
- Generation state
- Disabled state
- Credit warning state

When the prompt becomes long, allow natural textarea expansion up to a reasonable maximum.

The composer should visually communicate:

Describe
→ Configure
→ Generate

Do not add unnecessary marketing text.
```

---

# 07. Quick Starts

```text
Refine ONLY the “Hızlı başlangıçlar” area inside the Floriven Studio composer.

Keep it integrated with the composer.

Do not create a separate floating prompt library.

Current categories:

- Kişisel finans
- Wellness tracker
- E-ticaret
- AI asistan
- Eğitim
- Sosyal topluluk

Increase chip height to approximately:
32–36px.

Increase horizontal padding.

Improve text readability.

On hover or keyboard focus, show a small tooltip containing a real starter prompt.

Example:

Kişisel finans

Tooltip:

“Genç profesyoneller için kişisel finans uygulaması oluştur. Ana sayfa, işlemler ve bütçe detay ekranlarını üret.”

When clicked:

Populate the main prompt field.

Do not immediately start generation.

Allow users to modify the suggested prompt first.

Selected starter may receive a subtle Floriven accent state.

Do not use saturated terracotta backgrounds for every chip.

Use neutral surfaces with clear hover states.
```

---

# 08. Screenshot Redesign Mode

```text
Refine ONLY the “Ekranı Yeniden Tasarla” workflow inside the Floriven Studio composer.

It must be completely adapted to screenshot redesign.

Do not display the standard prompt-first composer when this mode is active.

Use an upload-first workflow.

HEADER:

“Mevcut ekranını yeniden tasarla”

Supporting text:

“Ekranını yükle. Floriven içerikleri ve kullanıcı aksiyonlarını analiz ederek işlevleri koruyan yeni tasarım yönleri oluştursun.”

MAIN DROPZONE:

“Ekran görüntüsünü buraya bırak”

“veya dosya seç”

Supported:
PNG · JPG · WebP

Secondary action:

“Birden fazla ekran yükle”

After upload:

Show a large readable screenshot preview.

ANALYSIS STATE:

“Ekran analiz ediliyor…”

Then show:

Floriven şunları algıladı:

✓ Alt navigasyon
✓ 4 temel kullanıcı aksiyonu
✓ 3 içerik bölümü
✓ Form bileşenleri
⚠ 2 erişilebilirlik sorunu

PRESERVE OPTIONS:

✓ İçeriği koru
✓ Kullanıcı aksiyonlarını koru
✓ Navigasyonu koru
✓ Veri alanlarını koru

OPTIONAL INSTRUCTION:

“Neyi değiştirmek istiyorsun?”

Example:

“Kart kullanımını azalt, bilgi hiyerarşisini güçlendir ve daha premium bir finans ürünü hissi oluştur.”

DESIGN DIRECTION:

Otomatik
Editorial Minimal
Soft Futurism
Warm Organic
Modern Native
Experimental

VARIATIONS:

1
2
3

Primary CTA:

“✦ Yeniden tasarla”

After generation:

Show the original screen and generated alternatives side-by-side.

Do not treat screenshot redesign as simply another prompt tab.

Make it feel like a specialized Floriven capability.
```

---

# 09. Latest Project / Continue

```text
Refine ONLY the “Kaldığın yerden devam et / Son Çalışılan Proje” section.

Preserve the existing project and content.

Project:

Kişisel Finans

Current structure is correct but the visual preview should become more important.

Use approximately:

46% project preview
54% project information

LEFT:

Show three real mobile screens.

Make them 20–30% larger than the current implementation.

Allow the screens to slightly overlap for depth, but do not hide important UI.

RIGHT:

Status:
“Düzenlemeye hazır”

Design direction:
“Editorial Minimal”

Title:
“Kişisel Finans”

Description:
“Genç profesyoneller için bütçe, gelir ve harcama yönetimi mobil deneyimi.”

Metadata:

3 ekran
3 varyasyon
5 dk önce düzenlendi

Primary CTA:

“Düzenlemeye devam et”

Secondary CTA:

“Önizle”

More menu:

- Varyasyon üret
- Paylaş
- Çoğalt
- Proje detayları
- Arşivle

Make the preview the visual focal point.

Do not make text dominate the card.

This should feel like:

“This is where I left off.”

Keep the card highly clickable and useful.
```

---

# 10. Other Projects Grid

```text
Refine ONLY the “Diğer projelerin” section.

Do not change the latest-project section.

Use the wider desktop layout efficiently.

Desktop >= 1700px:
4 columns if minimum card width remains comfortable.

Desktop 1366–1699px:
3 columns.

Tablet:
2 columns.

Each project card should contain:

- Real multi-screen preview
- Design direction
- Project title
- Screen count
- Last edited time
- Short description, maximum two lines
- Contextual action

Example:

Kişisel Finans

Editorial Minimal

3 ekran

5 dk önce

“Genç profesyoneller için bütçe ve harcama yönetimi.”

Action:
“Düzenle →”

PROJECT VISUALS MUST BE LARGE ENOUGH TO RECOGNIZE.

Increase preview size by approximately 20%.

Reduce unnecessary card height.

Do not create large text-heavy cards.

Cards should prioritize:

1. Visual preview
2. Project identity
3. Useful metadata
4. Action

Use clearly different visual projects.

Do not merely recolor the same UI template.

Hover state:

- Slight surface lift
- Stronger border
- Preview movement no more than 2–3px
- Show additional actions

Avoid heavy glow.
```

---

# 11. Template Gallery

```text
Refine ONLY the “Popüler tasarım stilleri” template section.

Preserve the existing template concepts.

The section should inspire users without becoming visually stronger than their own projects.

Use:

Desktop wide:
4 columns where appropriate.

Standard desktop:
3 columns.

Each template card must contain:

- Large real UI preview
- Category
- Design direction
- Template name
- Short description
- Number of screens
- CTA

Example:

FINTECH

Professional Finance

Apex Wealth — Kişisel Finans OS

“Koyu yüzeyler, varlık halkaları, harcama grafikleri ve hızlı transfer ekranları.”

5 ekranlık akış

CTA:

“Bu stille başla”

Keep visual direction badges subtle.

Template previews can be expressive.

However:

User project previews should remain slightly more prominent than template previews.

Use consistent card dimensions.

Limit descriptions to two lines.

Strengthen visual hierarchy.

Reduce unnecessary metadata.

Do not make every template CTA a large filled terracotta button.

Use outline or tinted secondary actions.

Only hover/focus may increase terracotta emphasis.
```

---

# 12. Color System

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

---

# 13. Terracotta Accent Discipline

```text
Audit and refine ONLY the usage of Floriven’s terracotta accent color.

Do not change the base palette.

CURRENT PROBLEM:

Terracotta appears in too many locations, reducing its ability to communicate priority.

Use SOLID TERRACOTTA only for the highest-priority actions:

1. + Yeni tasarım
2. Floriven ile Üret
3. Düzenlemeye devam et
4. Yeniden tasarla when redesign mode is active

Use TERRACOTTA OUTLINE or TEXT for:

- Template CTA
- Secondary links
- Small contextual actions
- Section eyebrow labels
- Design-direction metadata

Use NEUTRAL ACTIVE STATES for sidebar navigation.

Do not fill active navigation with solid terracotta.

Use:

Dark elevated surface
+
small terracotta indicator
+
high-contrast label

Remove unnecessary orange/terracotta backgrounds from:

- Non-critical badges
- Minor links
- Metadata
- Repeated secondary buttons

The primary brand color should regain scarcity and visual authority.
```

---

# 14. Density & Vertical Rhythm

```text
Perform a density and vertical-rhythm refinement of the Floriven Studio home workspace.

Do not redesign components.
Do not shrink typography.
Do not reduce readability.

CURRENT PROBLEM:

The page is longer than necessary because content sections are not using wide desktop space efficiently and vertical gaps are slightly excessive.

Reduce total page height by approximately 15–25% through better layout efficiency.

Do this by:

- Using wider project grids
- Using wider template grids
- Reducing oversized section-to-section gaps
- Reducing empty space inside cards
- Limiting descriptions to two lines
- Keeping metadata compact
- Aligning cards consistently
- Using responsive columns

Recommended section spacing:

Main composer → Latest project:
40–48px

Latest project → Other projects:
48–56px

Projects → Templates:
56–64px

Card internal spacing:
16–20px

Grid gap:
16–20px

Do not compress everything into a dense enterprise dashboard.

Maintain breathing room.

The result should feel:

Efficient
Fast to scan
Comfortable
Premium

not:

Sparse
Tiny
Overcompressed
```

---

# 15. Interaction States & Micro-interactions

```text
Add production-ready interaction states to the existing Floriven Studio home workspace.

Do not redesign the static layout.

Define consistent states for all interactive components.

BUTTONS:

- Default
- Hover
- Pressed
- Focus
- Disabled
- Loading

PROJECT CARDS:

- Default
- Hover
- Keyboard focus
- Selected
- Loading
- Generation in progress
- Error

TEMPLATE CARDS:

- Default
- Hover
- Focus
- Selected style

AI COMPOSER:

- Empty
- Focused
- Typing
- Drag-over
- Reference uploaded
- Generating
- Failed
- Insufficient credits

SEARCH:

- Empty
- Focused
- Results
- No result
- Loading

GENERATION INDICATOR:

- Queued
- Generating
- Completed
- Failed

Use subtle transitions:

120–180ms for control states.

200–250ms for panels and popovers.

Do not use heavy glow.

Do not use floating decorative animation.

Motion should always communicate interaction or system state.

Respect prefers-reduced-motion.

Add clearly visible keyboard focus states throughout the application.
```
