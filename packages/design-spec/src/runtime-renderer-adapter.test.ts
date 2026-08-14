import { describe, expect, it } from "vitest";
import { adaptPresentationV2ToRuntime, isPresentationSpecV2 } from "./runtime-renderer-adapter";
import type { PresentationSpecV2 } from "./presentation/contracts";

const spec = { version: "2.0.0", identity: { mode: "template", sourcePresetId: "obsidian-precision" }, palette: { name: "obsidian", accent: "accent", background: "background", foreground: "foreground" }, typography: { family: "Inter", displayFamily: "Inter", roles: {} }, spacing: { unit: 4, sectionGap: 16, contentInset: 16, density: "comfortable" }, geometry: { radius: "0", border: "none", shadow: "none", elevation: "flat", padding: "16px", aspectRatio: "auto" }, surfaces: { style: "flat", divider: "thin" }, cards: { types: ["metric"], geometry: { radius: "0", border: "none", shadow: "none", elevation: "flat", padding: "16px", aspectRatio: "auto" } }, charts: { types: ["line"], grid: "none", tooltip: "none", palette: "semantic", density: "balanced", animation: "none" }, controls: { types: ["toggle"], buttons: ["solid"] }, fields: { styles: ["outlined"] }, pills: { types: ["status"], status: "semantic" }, icons: { style: "minimal" }, media: { avatarShape: "none", treatment: "none" }, navigation: { modes: ["minimal"], active: "minimal" }, composition: { patterns: { dashboard: "stacked", managementList: "stacked", detail: "stacked", form: "stacked", analytics: "stacked", settings: "stacked" }, grouping: "sectioned", sectionGap: 16, contentInset: 16 }, motion: { duration: "0ms", easing: "standard", cardOpen: "none", chartAnimation: "none", navigationTransition: "none" } } as unknown as PresentationSpecV2;

describe("runtime renderer adapter", () => {
  it("adapts V2 tokens to the legacy DOM renderer contract", () => {
    expect(adaptPresentationV2ToRuntime(spec)).toMatchObject({ version: "1.0.0", palette: "obsidian", cardStyle: "minimal", navigationStyle: "minimal" });
  });

  it("detects V2 without confusing the V1 contract", () => {
    expect(isPresentationSpecV2(spec)).toBe(true);
    expect(isPresentationSpecV2({ version: "1.0.0" } as never)).toBe(false);
  });
});
