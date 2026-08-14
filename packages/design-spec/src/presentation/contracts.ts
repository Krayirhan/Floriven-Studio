import type {
  CardType, DesignTemplateId, DesignStrategy, DesignDensity, FormFieldStyle, IconStyle,
  LayoutPattern, MotionEasing, NavigationStyle, NavigationGeometry, PillType, PresetChartRules, PresetGeometry,
  PresetMotion, PresetTypography, StyleSystemProfile, SurfaceStyle, ChartType, ControlType,
} from "../strategy";

export type TypeRole = { family: string; size: string; weight: number; lineHeight: string; letterSpacing: string };
export type ResolvedTypography = { family: string; displayFamily: string; numericFamily?: string; uppercaseLabels: boolean; roles: Record<"display" | "title" | "heading" | "body" | "caption" | "label" | "metric" | "metadata", TypeRole> };
export type ResolvedPalette = { name: DesignStrategy["palette"]; accent: string; background: string; foreground: string };
export type ResolvedSpacing = { unit: number; sectionGap: number; contentInset: number; density: DesignDensity };
export type ResolvedGeometry = PresetGeometry;
export type ResolvedSurfaceSystem = { style: SurfaceStyle; divider: StyleSystemProfile["dividerStyle"] };
export type ResolvedCardSystem = { types: readonly CardType[]; geometry: ResolvedGeometry };
export type ResolvedChartSystem = PresetChartRules;
export type ResolvedControlSystem = { types: readonly ControlType[]; buttons: readonly string[] };
export type ResolvedFieldSystem = { styles: readonly FormFieldStyle[] };
export type ResolvedPillSystem = { types: readonly PillType[]; status: StyleSystemProfile["statusStyle"] };
export type ResolvedIconSystem = { style: IconStyle };
export type ResolvedMediaSystem = { avatarShape: StyleSystemProfile["avatarShape"]; treatment: StyleSystemProfile["imageTreatment"] };
export type ResolvedNavigationSystem = { modes: readonly NavigationStyle[]; active: NavigationStyle; geometry: NavigationGeometry };
export type ResolvedCompositionSystem = { patterns: Record<"dashboard" | "managementList" | "detail" | "form" | "analytics" | "settings", LayoutPattern>; availablePatterns: readonly LayoutPattern[]; grouping: NonNullable<StyleSystemProfile["groupingStyle"]>; sectionGap: number; contentInset: number };
export type ResolvedMotionSystem = PresetMotion;
export type ResolvedBehaviorSystem = {
  dataPresentation: NonNullable<StyleSystemProfile["dataPresentation"]>;
  interaction: NonNullable<StyleSystemProfile["interactionStyle"]>;
  emptyState: NonNullable<StyleSystemProfile["emptyStateStyle"]>;
  modal: NonNullable<StyleSystemProfile["modalStyle"]>;
};

export interface PresentationSpecV2 {
  version: "2.0.0";
  identity: { mode: DesignStrategy["mode"]; sourcePresetId?: DesignTemplateId };
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
  behavior: ResolvedBehaviorSystem;
}

export type PresentationVariant = PresentationSpecV2["version"];
