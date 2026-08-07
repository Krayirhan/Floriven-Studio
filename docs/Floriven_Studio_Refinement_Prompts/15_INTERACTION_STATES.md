# 15. Interaction States & Micro-interactions

## Amaç

Floriven Studio ana çalışma alanında yalnızca **Interaction States & Micro-interactions** birimini iyileştirmek. Diğer başarılı bölümleri korumak.

## Kullanım

Mevcut Floriven Studio ekran görüntüsünü referans olarak yükleyin ve aşağıdaki promptu tek başına uygulayın.

## Prompt

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
