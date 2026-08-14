import type { ScreenIntent } from "../screen-intent";
import type { DesignStrategy, StyleSystemProfile } from "../strategy";
import type { PresentationSpecV2, TypeRole } from "./contracts";

const fallback = <T>(value: T | undefined, safe: T): T => value ?? safe;
const role = (family: string, size: string, weight: number, lineHeight = "1.3"): TypeRole => ({ family, size, weight, lineHeight, letterSpacing: "0" });

export function adaptPresentationV1ToV2(input: { strategy: DesignStrategy; profile: StyleSystemProfile; screenIntent?: ScreenIntent }): PresentationSpecV2 {
  const { strategy, profile } = input;
  const typography = fallback(profile.typographyRules, { family: "Inter, sans-serif", displayFamily: "Inter, sans-serif", weight: 400, headingWeight: 700, letterSpacing: "0", headingSize: "24px", lineHeight: "1.3", uppercaseLabels: false });
  const geometry = fallback(profile.cardGeometry, { radius: "12px", border: "1px solid transparent", shadow: "none", elevation: "flat", padding: "16px", aspectRatio: "auto" });
  const patterns = fallback(profile.screenComposition, {});
  const activeNavigation = profile.navigationModes?.[0] ?? strategy.navigationStyle;
  const spec: PresentationSpecV2 = {
    version: "2.0.0",
    identity: { mode: strategy.mode, ...(strategy.stylePresetId ? { sourcePresetId: strategy.stylePresetId } : {}) },
    palette: resolvePalette(strategy.palette),
    typography: { family: typography.family, displayFamily: typography.displayFamily ?? typography.family, numericFamily: typography.family, uppercaseLabels: typography.uppercaseLabels, roles: { display: role(typography.displayFamily ?? typography.family, typography.headingSize, typography.headingWeight, typography.lineHeight), title: role(typography.family, "20px", typography.headingWeight), heading: role(typography.family, "18px", typography.headingWeight), body: role(typography.family, "16px", typography.weight, typography.lineHeight), caption: role(typography.family, "12px", typography.weight), label: role(typography.family, "12px", typography.headingWeight), metric: role(typography.family, "24px", typography.headingWeight), metadata: role(typography.family, "13px", typography.weight) } },
    spacing: { unit: 4, sectionGap: strategy.density === "compact" ? 12 : strategy.density === "spacious" ? 24 : 16, contentInset: strategy.density === "compact" ? 12 : strategy.density === "spacious" ? 24 : 16, density: strategy.density },
    geometry,
    surfaces: { style: profile.surfaceStyle ?? "flat", divider: profile.dividerStyle ?? "thin" },
    cards: { types: profile.cardTypes ?? ["metric", "list"], geometry },
    charts: profile.chartRules ?? { types: ["line", "bar"], grid: "subtle", tooltip: "compact", palette: "semantic", density: "balanced", animation: "none" },
    controls: { types: profile.controlTypes ?? ["toggle"], buttons: profile.buttonStyles ?? ["solid", "outline"] },
    fields: { styles: resolveFieldStyles(profile) },
    pills: { types: profile.pillTypes ?? ["status"], status: profile.statusStyle ?? "semantic" },
    icons: { style: profile.iconStyle ?? "minimal" },
    media: { avatarShape: profile.avatarShape ?? "none", treatment: profile.imageTreatment ?? "none" },
    navigation: { modes: profile.navigationModes ?? [strategy.navigationStyle], active: activeNavigation, geometry: resolveNavigationGeometry(profile, activeNavigation) },
    composition: { patterns: { dashboard: patterns.dashboard ?? "stacked", managementList: patterns.list ?? "stacked", detail: patterns.detail ?? "stacked", form: patterns.form ?? "stacked", analytics: patterns.analytics ?? "stacked", settings: patterns.settings ?? "stacked" }, availablePatterns: profile.layoutPatterns ?? ["stacked"], grouping: profile.groupingStyle ?? "sectioned", sectionGap: strategy.density === "compact" ? 12 : strategy.density === "spacious" ? 24 : 16, contentInset: strategy.density === "compact" ? 12 : strategy.density === "spacious" ? 24 : 16 },
    motion: profile.motion ?? { duration: "200ms", easing: "standard", cardOpen: "fade", chartAnimation: "none", navigationTransition: "crossfade" },
    behavior: { dataPresentation: profile.dataPresentation ?? "comparison", interaction: profile.interactionStyle ?? "subtle", emptyState: profile.emptyStateStyle ?? "minimal", modal: profile.modalStyle ?? "centered" },
  };
  return spec;
}

function resolveFieldStyles(profile: StyleSystemProfile): NonNullable<PresentationSpecV2["fields"]["styles"]> {
  if (profile.interactionStyle === "energetic") return ["touch-large", "filled"];
  if (profile.interactionStyle === "precise") return ["compact", "outlined"];
  if (profile.groupingStyle === "divider-led") return ["underline", "compact"];
  if (profile.groupingStyle === "sectioned") return ["filled", "soft"];
  return profile.formFieldStyles ?? ["outlined"];
}

function resolveNavigationGeometry(profile: StyleSystemProfile, active: PresentationSpecV2["navigation"]["active"]): PresentationSpecV2["navigation"]["geometry"] {
  if (active === "minimal") return "minimal";
  if (active === "glass") return "compact";
  if (active === "solid") return "inset";
  if (profile.cardTypes?.includes("hero") && profile.interactionStyle === "energetic") return "chunky";
  return "floating";
}

function resolvePalette(name: DesignStrategy["palette"]): PresentationSpecV2["palette"] {
  const tokens: Record<DesignStrategy["palette"], { accent: string; background: string; foreground: string }> = {
    obsidian: { accent: "#38bdf8", background: "#06111f", foreground: "#f8fafc" },
    serene: { accent: "#0d9488", background: "#f0fdfa", foreground: "#134e4a" },
    terracotta: { accent: "#ea580c", background: "#fffaf4", foreground: "#7c2d12" },
    electric: { accent: "#7c3aed", background: "#faf5ff", foreground: "#3b0764" },
    editorial: { accent: "#18181b", background: "#ffffff", foreground: "#09090b" },
  };
  return { name, ...tokens[name] };
}
