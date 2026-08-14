# StyleSystemProfile → Production DOM Grammar Coverage

Scope: Visual Engine V4 Studio production renderer. Evidence requires the real `compileVisualScreen → RenderPlan → LayoutEngine → PhoneScreen` path and a measurable DOM, CSS, component-family, or geometry effect.

| Family | PresentationSpecV2 | Production effect | Status | Weight |
|---|---|---|---|---:|
| cardTypes | `cards.types` | Card/section component family | ACTIVE | 1 |
| cardGeometry | `geometry`, `cards.geometry` | padding, border, shadow, radius | ACTIVE | 1 |
| chartRules | `charts` | renderer geometry, grid, density, palette, animation; tooltip incomplete | PARTIAL | .5 |
| controlTypes | `controls.types` | segmented/switch families; accordion/disclosure incomplete | PARTIAL | .5 |
| pillTypes | `pills.types` | Badge DOM family | ACTIVE | 1 |
| buttonStyles | `controls.buttons` | background, border, shadow | ACTIVE | 1 |
| formFieldStyles | `fields.styles` | field family/radius; some variants collapse | PARTIAL | .5 |
| navigationModes | `navigation` | navigation mode and geometry | ACTIVE | 1 |
| typographyRules | `typography` | font, scale, weight, line height, casing | ACTIVE | 1 |
| layoutPatterns | `composition.availablePatterns` | runtime layout capability DOM | ACTIVE | 1 |
| groupingStyle | `composition.grouping` | section grouping geometry | ACTIVE | 1 |
| iconStyle | `icons.style` | icon stroke/border/filter | ACTIVE | 1 |
| imageTreatment | `media.treatment` | crop/filter/clip/gradient | ACTIVE | 1 |
| surfaceStyle | `surfaces.style` | glass/paper card surfaces | ACTIVE | 1 |
| dividerStyle | `surfaces.divider` | divider geometry | ACTIVE | 1 |
| statusStyle | `pills.status` | status badge geometry | ACTIVE | 1 |
| dataPresentation | `behavior.dataPresentation` | metric hierarchy/emphasis | ACTIVE | 1 |
| interactionStyle | `behavior.interaction` | component transform policy | ACTIVE | 1 |
| screenComposition | `composition.patterns` | RenderPlan pattern and LayoutEngine geometry | ACTIVE | 1 |
| emptyStateStyle | `behavior.emptyState` | policy reaches DOM; generic empty-state family incomplete | PARTIAL | .5 |
| modalStyle | `behavior.modal` | modal geometry | ACTIVE | 1 |
| motion | `motion` | duration, transition, chart animation | ACTIVE | 1 |

`(18 × 1.0 + 4 × 0.5) / 22 = 20 / 22 = 90.90909091%`

**WEIGHTED_PRODUCTION_COVERAGE: 90.90909091% — PASS**

Core-family gate: PASS. No required core family is DEAD or UNKNOWN. Detailed source, resolver, plan consumer, production consumer and tests are recorded in `grammar-coverage.json`.
