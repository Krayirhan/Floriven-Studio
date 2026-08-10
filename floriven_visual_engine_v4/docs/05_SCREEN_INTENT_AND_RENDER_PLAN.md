# 05 — ScreenIntent & RenderPlan Contract

## ScreenIntent

```ts
export interface ScreenIntent {
  archetype:
    | "dashboard"
    | "management_list"
    | "detail"
    | "form"
    | "analytics"
    | "settings"
    | "profile"
    | "onboarding";

  primaryTask: string;
  primaryAction?: string;

  density: "compact" | "comfortable" | "spacious";

  heroAllowed: boolean;
  fabAllowed: boolean;
  persistentNavigation: boolean;

  informationPriority: {
    primary: string[];
    secondary: string[];
    tertiary: string[];
  };
}
```

## Persistence

ScreenIntent planning sırasında oluşup normalization sonrası kaybolmamalıdır.

Tercih edilen model:

```ts
interface Screen {
  ...
  presentationContext: ScreenIntent;
}
```

## RenderPlan

```ts
export interface ScreenRenderPlan {
  screenId: string;
  archetype: ScreenIntent["archetype"];
  layoutPattern: LayoutPattern;

  sections: RenderSection[];
  overlays: RenderOverlay[];
  navigation?: RenderNavigationPlan;
}

export interface RenderSection {
  id: string;

  role:
    | "hero"
    | "summary"
    | "toolbar"
    | "primary-content"
    | "secondary-content"
    | "insight"
    | "actions";

  emphasis: "primary" | "secondary" | "tertiary";

  span: number;
  order: number;
  nodes: DesignNode[];

  resolvedFamily?: string;
}
```

## Neden gerekli?

Semantic node sırası görsel hierarchy değildir.

Örneğin:

```text
Metric
Metric
Metric
Chart
ListItem
```

Editorial altında:
- primary metric hero,
- iki metric two-column,
- chart full-width sparkline,
- list divider-led

olabilir.

Obsidian altında:
- 2×2 bento,
- mini charts,
- glass operations region

olabilir.

Semantic truth aynıdır; RenderPlan farklıdır.
