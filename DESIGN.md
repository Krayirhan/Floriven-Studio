# DESIGN.md — Floriven Studio

## Product Overview
Floriven Studio is an AI-first SaaS that converts natural language briefs into complete mobile app UI screens. Visual identity: premium, minimal, technical. Inspired by Linear, Vercel, Raycast.

---

## Color System

### Light Mode
| Token       | Value                    | Usage                        |
|-------------|--------------------------|------------------------------|
| `--bg`      | `#F0EFF5`                | Page background              |
| `--surface` | `#FFFFFF`                | Cards, modals, panels        |
| `--s2`      | `#E8E7F0`                | Secondary surfaces           |
| `--s3`      | `#F7F6FA`                | Tertiary surfaces, sidebars  |
| `--text`    | `#13121C`                | Primary text                 |
| `--t2`      | `#6B6880`                | Secondary text               |
| `--t3`      | `#A09DB8`                | Placeholder, muted           |
| `--accent`  | `#5046E4`                | Primary brand, CTA, links    |
| `--a-bg`    | `#ECEAFF`                | Accent chip backgrounds      |
| `--a-dim`   | `rgba(80,70,228,0.08)`   | Accent glow, focus rings     |
| `--border`  | `rgba(0,0,0,0.08)`       | Dividers, card borders       |
| `--b2`      | `rgba(0,0,0,0.14)`       | Stronger borders             |
| `--green`   | `#16A34A`                | Success, status "done"       |
| `--g-bg`    | `#DCFCE7`                | Green chip backgrounds       |

### Dark Mode (prefers-color-scheme: dark)
| Token       | Value                    |
|-------------|--------------------------|
| `--bg`      | `#08070F`                |
| `--surface` | `#111019`                |
| `--s2`      | `#1A1825`                |
| `--s3`      | `#0E0D17`                |
| `--text`    | `#EEEDF6`                |
| `--t2`      | `#8E8BAA`                |
| `--t3`      | `#5C5A72`                |
| `--accent`  | `#7C6FF7`                |
| `--a-bg`    | `#1C1A3A`                |
| `--a-dim`   | `rgba(124,111,247,0.1)`  |
| `--border`  | `rgba(255,255,255,0.07)` |
| `--b2`      | `rgba(255,255,255,0.12)` |
| `--green`   | `#22C55E`                |

---

## Typography

| Token     | Stack                                                              | Usage            |
|-----------|--------------------------------------------------------------------|------------------|
| `--serif` | `ui-serif, "New York", Georgia, serif`                             | Headlines, brand |
| `--sans`  | `ui-sans-serif, -apple-system, BlinkMacSystemFont, system-ui`      | Body, UI         |
| `--mono`  | `ui-monospace, "SF Mono", Consolas, monospace`                     | Code, terminal   |

### Scale
| Role         | Size                        | Weight | Letter-spacing |
|--------------|-----------------------------|--------|----------------|
| Display hero | `clamp(48px, 7vw, 96px)`    | 400    | -0.04em        |
| Section h2   | `clamp(28px, 3.5vw, 46px)`  | 400    | -0.03em        |
| Card h3      | `17–18px`                   | 600    | -0.02em        |
| Body large   | `16–17px`                   | 400    | normal         |
| Body         | `14–15px`                   | 400    | normal         |
| Small / meta | `11–13px`                   | 400–500| normal         |
| Label / tag  | `10–11px`                   | 700    | 0.08–0.1em     |

Headlines use `--serif`, italic variant for accent words. Body and UI use `--sans`.

---

## Spacing & Layout

- Container max-width: `1120px`, padding: `0 32px` (mobile: `0 20px`)
- Section padding: `80–96px 0`
- Card border-radius: `14–18px`
- Button border-radius: `8–10px`
- Gap between grid items: `12–16px`
- Section gap (heading → content): `48–64px`

---

## Component Patterns

### Buttons
- **Accent**: `background: var(--accent)`, white text, `border-radius: 9px`
- **Ghost**: transparent, `border: 1px solid var(--border)`, `color: var(--t2)`
- **White**: white bg, accent text (used on dark backgrounds)
- Hover: `translateY(-1px)` + `opacity: 0.88`
- Size: `padding: 9px 18px`, `font-size: 14px`, `font-weight: 500`

### Cards
- `background: var(--surface)`, `border: 1px solid var(--border)`, `border-radius: 16px`
- Hover: `box-shadow: var(--shadow-lg)`, `transform: translateY(-2px)`

### Labels / Tags
- Uppercase, `font-size: 10–11px`, `font-weight: 700`, `letter-spacing: 0.08–0.1em`
- Accent color tags: `color: var(--accent)`, `background: var(--a-bg)`, `border-radius: 4px`, `padding: 3px 9px`
- Green status: `color: var(--green)`, `background: color-mix(in srgb, var(--green) 12%, transparent)`, `border-radius: 20px`

### Navigation
- Sticky, `backdrop-filter: blur(20px)`, `height: 60px`
- Logo: `--serif`, `font-size: 17px`, small `◆` mark in accent color
- Links: `font-size: 13.5px`, `color: var(--t2)`, hover `background: var(--s2)`, `border-radius: 6px`

---

## Animation Principles

- Prefer CSS transitions and keyframes over JS animation libraries
- Duration: `0.15s` for micro (hover), `0.3–0.5s` for entrances
- Easing: `ease` for entrances, linear for loops
- Entry pattern: `opacity: 0 → 1` + `translateY(8–16px) → 0`
- Respect `prefers-reduced-motion`: disable non-essential animations
- Stagger delays: `0.1–0.15s` between sibling elements

### Keyframes in use
- `pulse` — green dot, 2s ease-in-out, opacity + scale
- `blink` — cursor, 1s step-end, opacity
- `rise` — card entry, 0.5s ease, opacity + translateY
- `draw` — SVG beam lines, 2s ease-out, stroke-dashoffset
- `termAppear` — terminal lines, 0.3s ease, opacity (staggered delays)
- `scroll` — ticker marquee, 28s linear

---

## Voice & Copy

- Language: Turkish (primary), English (technical terms, export labels)
- Tone: confident, minimal, product-first — no fluff
- Headlines: serif italic for the "moment" word ("saniyeler içinde.", "eksiksiz.")
- Section labels: short uppercase tag above every section heading
- CTA copy: action-first ("Erken erişim al →"), not generic ("Sign up")

---

## Page Structure (Landing)

```
Nav (sticky, glass)
Hero (centered text → studio mockup)
Ticker (scrolling tech stack)
StatsBar (4 animated numbers)
HowItWorks (3 steps, 01/02/03)
ScrollFeatures (sticky left phone + scrolling features)
Features (2×2 bento grid)
BeforeAfter (2-column comparison)
Testimonials (3 quote cards)
Pricing (3-tier cards, middle highlighted)
CtaBand (email capture)
Footer
```

---

## File Conventions

- Styling: CSS Modules (`.module.css` per component)
- Tokens: single source of truth in `apps/web/src/styles/tokens.css`
- Architecture: feature-based (`features/landing/`, `components/ui/`, `components/layout/`)
- No cross-feature imports
- No Tailwind — use CSS custom properties from tokens
