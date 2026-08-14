# 04 — PresentationSpec V2

## Amaç

`StyleSystemProfile` ile runtime renderer arasında eksiksiz, typed ve preset-agnostic bir kontrat oluşturmak.

## Önerilen contract

```ts
export interface PresentationSpecV2 {
  version: "2.0.0";

  identity: {
    mode: "auto" | "template";
    sourcePresetId?: DesignTemplateId;
  };

  palette: ResolvedPalette;
  typography: ResolvedTypography;
  spacing: ResolvedSpacing;
  geometry: ResolvedGeometry;

  surfaces: ResolvedSurfaceSystem;
  cards: ResolvedCardSystem;
  charts: ResolvedChartSystem;
  controls: ResolvedControlSystem;
  fields: ResolvedFieldSystem;
  pills: ResolvedPillSystem;
  icons: ResolvedIconSystem;
  media: ResolvedMediaSystem;
  navigation: ResolvedNavigationSystem;
  composition: ResolvedCompositionSystem;
  motion: ResolvedMotionSystem;
}
```

## ResolvedTypography

```ts
interface ResolvedTypography {
  family: string;
  displayFamily: string;
  numericFamily?: string;

  roles: {
    display: TypeRole;
    title: TypeRole;
    heading: TypeRole;
    body: TypeRole;
    caption: TypeRole;
    label: TypeRole;
    metric: TypeRole;
    metadata: TypeRole;
  };
}
```

## ResolvedCompositionSystem

```ts
interface ResolvedCompositionSystem {
  patterns: {
    dashboard: LayoutPattern;
    managementList: LayoutPattern;
    detail: LayoutPattern;
    form: LayoutPattern;
    analytics: LayoutPattern;
    settings: LayoutPattern;
  };

  grouping: GroupingStyle;
  sectionGap: number;
  contentInset: number;
}
```

## Resolver inputs

```ts
resolvePresentation({
  strategy,
  styleSystemProfile,
  screenIntent,
  platform,
  accessibilityPreferences
})
```

## Invariants

- Renderer `stylePresetId` branch etmez.
- Unknown variant explicit fallback reason üretir.
- Resolved contract JSON-serializable olmalıdır.
- Presentation output deterministic olmalıdır.
- Aynı input aynı output hash'ini üretmelidir.
