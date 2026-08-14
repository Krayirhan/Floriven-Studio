import type { ScreenIntent } from "../screen-intent";
import type { DesignStrategy, StyleSystemProfile } from "../strategy";
import { adaptPresentationV1ToV2 } from "./compat";
import type { PresentationSpecV2 } from "./contracts";

export interface AccessibilityPreferences {
  reducedMotion?: boolean;
  minimumTouchTarget?: number;
  highContrast?: boolean;
}

export interface ResolvePresentationInput {
  strategy: DesignStrategy;
  styleSystemProfile: StyleSystemProfile;
  screenIntent: ScreenIntent;
  platform?: "web" | "ios" | "android";
  accessibilityPreferences?: AccessibilityPreferences;
}

export interface ResolvedPresentationResult {
  spec: PresentationSpecV2;
  fallbackReasons: string[];
}

export function resolvePresentation(input: ResolvePresentationInput): ResolvedPresentationResult {
  const preferences = input.accessibilityPreferences ?? {};
  const base = adaptPresentationV1ToV2({ strategy: input.strategy, profile: input.styleSystemProfile, screenIntent: input.screenIntent });
  const reasons: string[] = [];
  const density = input.screenIntent.contentDensity;
  const spacing = density === "high" ? 12 : density === "low" ? 24 : base.spacing.sectionGap;
  let spec: PresentationSpecV2 = {
    ...base,
    spacing: { ...base.spacing, sectionGap: spacing, contentInset: Math.max(base.spacing.contentInset, preferences.minimumTouchTarget ? 12 : 0) },
    composition: { ...base.composition, sectionGap: spacing, contentInset: Math.max(base.composition.contentInset, preferences.minimumTouchTarget ? 12 : 0) },
    navigation: input.screenIntent.bottomNavigationAllowed ? base.navigation : { ...base.navigation, modes: base.navigation.modes.filter((mode) => mode !== "floating"), active: base.navigation.modes.includes("minimal") ? "minimal" : base.navigation.active },
  };

  if (!input.screenIntent.bottomNavigationAllowed) reasons.push("BOTTOM_NAVIGATION_DISABLED_BY_SCREEN_INTENT");
  if (preferences.reducedMotion) {
    spec = { ...spec, motion: { ...spec.motion, duration: "0ms", cardOpen: "none", chartAnimation: "none", navigationTransition: "none" } };
    reasons.push("REDUCED_MOTION_APPLIED");
  }
  if (preferences.highContrast) reasons.push("HIGH_CONTRAST_REQUESTED");
  if (!input.styleSystemProfile.chartRules) reasons.push("CHART_RULES_DEFAULTED");
  if (!input.styleSystemProfile.typographyRules) reasons.push("TYPOGRAPHY_RULES_DEFAULTED");
  return { spec, fallbackReasons: reasons };
}
