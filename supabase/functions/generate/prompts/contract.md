# Contract — component vocabulary and output shape

**Changes only when the renderer changes.** This file is locked to three places in
the codebase and must stay identical to all of them:

| Locked to | What it holds |
| --- | --- |
| [`componentRegistry.ts`](../../../apps/web/src/features/studio/canvas/componentRegistry.ts) | `COMPONENT_TYPES` allowlist, `CONTAINER_TYPES` set |
| [`PhoneScreen.tsx`](../../../apps/web/src/features/studio/canvas/PhoneScreen.tsx) | the `switch` that draws each type |
| [`index.ts`](../index.ts) | `CONTAINERS` / `LEAVES` validation sets |

**Why drift here is the worst failure in the system:** if this file lists a type the
renderer has no `case` for, the model happily emits it, validation passes, and
`DesignNodeRenderer` returns `null` — the node vanishes with no error anywhere.
The screen silently loses content and nothing in the logs says why.

`scripts/build-prompts.mjs` refuses to build when this file and
`componentRegistry.ts` disagree. Do not bypass it.

## Component table

| Type | Container | Required props | Optional props |
| --- | --- | --- | --- |
| `Screen` | yes | — | — |
| `ScrollView` `Stack` `Row` `Grid` `Card` `Form` | yes | — | — |
| `TopAppBar` | no | `title` | `action` |
| `Text` | no | `text`, `variant` | — |
| `Button` | no | `label` | — |
| `IconButton` | no | `icon` | — |
| `TextField` `SearchField` | no | `placeholder` | — |
| `ListItem` | no | `title`, `subtitle`, `trailing` | — |
| `Progress` | no | `label`, `value` | — |
| `Metric` | no | `label`, `value`, `caption` | `tone` |
| `Chart` | no | `label`, `values` | `tone` |
| `SegmentedControl` | no | `items` | — |
| `FloatingActionButton` | no | `icon` | — |
| `Badge` | no | `label` | — |
| `Avatar` | no | `initials` | — |
| `Image` | no | `alt` | — |
| `Icon` | no | `name` | — |
| `Divider` | no | — | — |
| `Checkbox` `Switch` | no | `label` | — |
| `BottomNavigation` `TabBar` | no | `items` | — |
| `CareSummary` | no | `title`, `subtitle`, `status`, `progress` | — |
| `MedicationTimeline` | no | `label`, `items` | — |
| `MedicationDoseRow` | no | `name`, `dose`, `time`, `instruction`, `status` | — |
| `HealthMetric` | no | `label`, `value`, `unit`, `status`, `caption` | — |
| `UnitInput` | no | `label`, `value`, `unit` | `hint` |
| `RangeChart` | no | `label`, `values`, `minimum`, `maximum`, `unit`, `targetMinimum`, `targetMaximum` | — |
| `TargetRange` | no | `label`, `value`, `minimum`, `maximum`, `unit` | — |
| `StatusAlert` | no | `title`, `message`, `severity` | — |
| `SafetyNotice` | no | `title`, `message` | — |
| `SuccessFeedback` | no | `title`, `message` | — |
| `EditorialHero` | no | `kicker`, `headline`, `dek`, `issue`, `date` | — |
| `FeatureStory` | no | `category`, `title`, `summary` | — |
| `StoryCard` | no | `index`, `category`, `title`, `summary` | — |
| `Byline` | no | `author`, `role` | — |
| `MetadataStrip` | no | `date`, `readingTime`, `edition` | — |
| `PullQuote` | no | `quote`, `attribution` | — |
| `SectionIndex` | no | `items` | `items:string[]` |
| `ArchiveEntry` | no | `number`, `date`, `title`, `theme` | — |
| `CommerceHero` | no | `eyebrow`, `title`, `subtitle`, `cta` | — |
| `ProductCard` | no | `maker`, `name`, `description`, `price`, `status`, `badge` | — |
| `PriceBlock` | no | `label`, `price`, `compareAt`, `taxNote` | — |
| `ProductGallery` | no | `alt`, `current`, `total` | — |
| `VariantSelector` | no | `label`, `options` | `options:string[]` |
| `CartLine` | no | `name`, `variant`, `quantity`, `price` | — |
| `OrderSummary` | no | `title`, `subtotal`, `shipping`, `total` | — |
| `DeliveryPromise` | no | `title`, `detail` | — |
| `LearningHero` | no | `eyebrow`, `title`, `mission`, `reward` | — |
| `XpProgress` | no | `label`, `current`, `target`, `value`, `nextReward` | — |
| `StreakBadge` | no | `days`, `message` | — |
| `LessonCard` | no | `level`, `topic`, `title`, `duration`, `status` | — |
| `RoadmapStep` | no | `order`, `title`, `description`, `state` | — |
| `QuizChoice` | no | `key`, `label`, `state` | — |
| `AnswerFeedback` | no | `result`, `title`, `explanation` | — |
| `AchievementBadge` | no | `icon`, `title`, `description`, `earnedAt` | — |
| `CommandSummary` | no | `eyebrow`, `title`, `value`, `status`, `detail` | — |
| `SignalChart` | no | `label`, `values`, `window`, `unit`, `annotation` | — |
| `RiskIndicator` | no | `label`, `value`, `severity`, `explanation` | — |
| `OperationRow` | no | `name`, `owner`, `updatedAt`, `status`, `metric` | — |
| `IncidentTimeline` | no | `label`, `events` | `events:string[]` |
| `DataMatrix` | no | `columns`, `rows` | both `string[]` |
| `ControlToggle` | no | `label`, `description`, `state`, `guard` | — |
| `AuditEntry` | no | `time`, `actor`, `action`, `target` | — |

`Modal` and `SafeArea` exist in the registry but are deliberately kept out of the
prompt — nothing in the current composition needs them, and every extra type is
another thing the model can misuse.

<!-- prompt:start -->
You are a senior product designer. Output a JSON object:
{"screens":[Screen, ...]} — exactly the screens supplied by the current
ProductBlueprint batch, in the supplied order.

TYPES
Containers (may have "children"): Screen, ScrollView, Stack, Row, Grid, Card, Form
Leaves (must NOT have "children"):
  TopAppBar {title, action?}
  Text {text, variant:"title"|"heading"|"body"|"caption"}
  Button {label} · IconButton {icon}
  TextField|SearchField {placeholder}
  ListItem {title, subtitle, trailing}
  Progress {label, value:0-100}
  Metric {label, value, caption, tone?:"primary"|"success"|"warning"|"danger"|"neutral"}
  Chart {label, values:number[], tone?}
  SegmentedControl {items:string[]}
  FloatingActionButton {icon:string}
  Badge {label} · Avatar {initials} · Image {alt} · Icon {name} · Divider {}
  Checkbox|Switch {label}
  BottomNavigation {items:string[]}
  CareSummary {title, subtitle, status:"normal"|"attention"|"critical", progress:0-100}
  MedicationTimeline {label, items:string[]}
  MedicationDoseRow {name, dose, time, instruction, status:"scheduled"|"due"|"taken"|"overdue"|"skipped"}
  HealthMetric {label, value, unit, status:"normal"|"attention"|"critical", caption}
  UnitInput {label, value, unit, hint?}
  RangeChart {label, values:number[], minimum, maximum, unit, targetMinimum, targetMaximum}
  TargetRange {label, value, minimum, maximum, unit}
  StatusAlert {title, message, severity:"normal"|"attention"|"critical"}
  SafetyNotice {title, message}
  SuccessFeedback {title, message}
  EditorialHero {kicker, headline, dek, issue, date}
  FeatureStory {category, title, summary}
  StoryCard {index, category, title, summary}
  Byline {author, role} · MetadataStrip {date, readingTime, edition}
  PullQuote {quote, attribution} · SectionIndex {items:string[]}
  ArchiveEntry {number, date, title, theme}
  CommerceHero {eyebrow, title, subtitle, cta}
  ProductCard {maker, name, description, price, status, badge}
  PriceBlock {label, price, compareAt, taxNote} · ProductGallery {alt, current, total}
  VariantSelector {label, options:string[]} · CartLine {name, variant, quantity, price}
  OrderSummary {title, subtotal, shipping, total} · DeliveryPromise {title, detail}
  LearningHero {eyebrow, title, mission, reward}
  XpProgress {label, current, target, value:0-100, nextReward} · StreakBadge {days, message}
  LessonCard {level, topic, title, duration, status} · RoadmapStep {order, title, description, state}
  QuizChoice {key, label, state} · AnswerFeedback {result, title, explanation}
  AchievementBadge {icon, title, description, earnedAt}
  CommandSummary {eyebrow, title, value, status, detail}
  SignalChart {label, values:number[], window, unit, annotation}
  RiskIndicator {label, value, severity:"low"|"attention"|"critical", explanation}
  OperationRow {name, owner, updatedAt, status, metric} · IncidentTimeline {label, events:string[]}
  DataMatrix {columns:string[], rows:string[]} · ControlToggle {label, description, state, guard}
  AuditEntry {time, actor, action, target}

A leaf carrying "children" is a contract violation. A type outside this list is a
contract violation — it cannot be drawn and its content is lost.

SHAPE
Screen = {id, name, route, root}; root.props.theme is one of "ocean"|"mint"|"violet"|"coral" and MUST be identical on all screens.
root.props.strategy is identical on all screens:
{mode:"auto"|"template", stylePresetId?:string,
 palette:"obsidian"|"serene"|"terracotta"|"electric"|"editorial",
 cardStyle:"crisp"|"soft"|"layered"|"playful"|"minimal",
 density:"compact"|"comfortable"|"spacious",
 navigationStyle:"solid"|"floating"|"glass"|"minimal",
 visualDirection:string, rationale:string[]}
node   = {id, type, props, a11y:{role,label}, layout?, children?}
layout = {mode:"column"|"row"|"grid", gap:"space.3"}  (containers only)
<!-- prompt:end -->

## Keeping this file honest

The build-time check compares the types inside the `prompt` block against
`COMPONENT_TYPES`. It catches a type here that the registry lacks. It does **not**
catch prop-name drift — if `ListItem` gains a `leading` prop in `PhoneScreen.tsx`,
this table must be updated by hand.
