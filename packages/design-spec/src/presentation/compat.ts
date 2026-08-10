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
    palette: { name: strategy.palette, accent: strategy.palette, background: "surface.default", foreground: "content.primary" },
    typography: { family: typography.family, displayFamily: typography.displayFamily ?? typography.family, numericFamily: typography.family, roles: { display: role(typography.displayFamily ?? typography.family, typography.headingSize, typography.headingWeight, typography.lineHeight), title: role(typography.family, "20px", typography.headingWeight), heading: role(typography.family, "18px", typography.headingWeight), body: role(typography.family, "16px", typography.weight, typography.lineHeight), caption: role(typography.family, "12px", typography.weight), label: role(typography.family, "12px", typography.headingWeight), metric: role(typography.family, "24px", typography.headingWeight), metadata: role(typography.family, "13px", typography.weight) } },
    spacing: { unit: 4, sectionGap: strategy.density === "compact" ? 12 : strategy.density === "spacious" ? 24 : 16, contentInset: strategy.density === "compact" ? 12 : strategy.density === "spacious" ? 24 : 16, density: strategy.density },
    geometry,
    surfaces: { style: profile.surfaceStyle ?? "flat", divider: profile.dividerStyle ?? "thin" },
    cards: { types: profile.cardTypes ?? ["metric", "list"], geometry },
    charts: profile.chartRules ?? { types: ["line", "bar"], grid: "subtle", tooltip: "compact", palette: "semantic", density: "balanced", animation: "none" },
    controls: { types: profile.controlTypes ?? ["toggle"], buttons: profile.buttonStyles ?? ["solid", "outline"] },
    fields: { styles: profile.formFieldStyles ?? ["outlined"] },
    pills: { types: profile.pillTypes ?? ["status"], status: profile.statusStyle ?? "semantic" },
    icons: { style: profile.iconStyle ?? "minimal" },
    media: { avatarShape: profile.avatarShape ?? "none", treatment: profile.imageTreatment ?? "none" },
    navigation: { modes: profile.navigationModes ?? [strategy.navigationStyle], active: activeNavigation },
    composition: { patterns: { dashboard: patterns.dashboard ?? "stacked", managementList: patterns.list ?? "stacked", detail: patterns.detail ?? "stacked", form: patterns.form ?? "stacked", analytics: patterns.analytics ?? "stacked", settings: patterns.settings ?? "stacked" }, grouping: profile.groupingStyle ?? "sectioned", sectionGap: strategy.density === "compact" ? 12 : strategy.density === "spacious" ? 24 : 16, contentInset: strategy.density === "compact" ? 12 : strategy.density === "spacious" ? 24 : 16 },
    motion: profile.motion ?? { duration: "200ms", easing: "standard", cardOpen: "fade", chartAnimation: "none", navigationTransition: "crossfade" },
  };
  return spec;
}
