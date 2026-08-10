import { describe, expect, it } from "vitest";
import { composeDeterministicCandidate } from "./deterministic-compositor-v2";
import { findDesignTemplate } from "./strategy";
import type { ProductBlueprint } from "./product-blueprint";

const blueprint = (domain: string, role: "overview" | "core" | "form" | "detail" | "settings"): ProductBlueprint => ({ productDomain: domain, audience: "ekip", entities: ["proje", "müşteri"], capabilities: ["izleme"], contentVocabulary: [domain, "proje"], screens: [{ id: "screen", name: `${domain} ekranı`, route: "/screen", purpose: `${domain} işini çözer`, sections: ["özet"], role, priority: "primary", navigationPlacement: "primary" }], navigation: { primaryScreenIds: ["screen"], utilityScreenIds: [] }, screenPolicy: { minCount: 1, maxCount: 1, rationale: "fixture" } });
const presentation = (() => { const template = findDesignTemplate("obsidian-precision")!; return { ...requirePresentation(template) }; })();
function requirePresentation(template: ReturnType<NonNullable<typeof findDesignTemplate>>) { return { version: "2.0.0" as const, identity: { mode: "template" as const, sourcePresetId: template.id }, palette: { name: "obsidian" as const, accent: "accent", background: "background", foreground: "foreground" }, typography: { family: "Inter", displayFamily: "Mono", roles: Object.fromEntries(["display", "title", "heading", "body", "caption", "label", "metric", "metadata"].map((key) => [key, { family: "Inter", size: "16px", weight: 500, lineHeight: "1.3", letterSpacing: "0" }])) as never }, spacing: { unit: 4, sectionGap: 16, contentInset: 16, density: "comfortable" as const }, geometry: { radius: "8px", border: "none", shadow: "none", elevation: "flat", padding: "16px", aspectRatio: "auto" }, surfaces: { style: "flat" as const, divider: "thin" as const }, cards: { types: ["metric", "list"] as const, geometry: { radius: "8px", border: "none", shadow: "none", elevation: "flat", padding: "16px", aspectRatio: "auto" } }, charts: { types: ["line", "bar"] as const, grid: "subtle" as const, tooltip: "compact" as const, palette: "semantic" as const, density: "balanced" as const, animation: "none" as const }, controls: { types: ["toggle"] as const, buttons: ["solid"] as const }, fields: { styles: ["outlined"] as const }, pills: { types: ["status"] as const, status: "semantic" as const }, icons: { style: "minimal" as const }, media: { avatarShape: "none" as const, treatment: "none" as const }, navigation: { modes: ["minimal"] as const, active: "minimal" as const }, composition: { patterns: { dashboard: "stacked", managementList: "stacked", detail: "stacked", form: "stacked", analytics: "stacked", settings: "stacked" }, grouping: "sectioned" as const, sectionGap: 16, contentInset: 16 }, motion: { duration: "0ms", easing: "standard" as const, cardOpen: "none" as const, chartAnimation: "none" as const, navigationTransition: "none" as const } }; }

describe("deterministic compositor v2", () => {
  it("uses archetype-specific recipes and deterministic hash", () => {
    const candidate = composeDeterministicCandidate({ blueprint: blueprint("finans", "overview"), presentation });
    expect(candidate.provider).toBe("deterministic");
    expect(candidate.screens[0]?.renderPlan.sections.some((section) => section.role === "hero")).toBe(true);
    expect(candidate.deterministicHash).toBe(composeDeterministicCandidate({ blueprint: blueprint("finans", "overview"), presentation }).deterministicHash);
  });

  it("keeps domain vocabulary and form policy in fallback", () => {
    const candidate = composeDeterministicCandidate({ blueprint: blueprint("sağlık", "form"), presentation });
    const screen = candidate.screens[0]!;
    expect(JSON.stringify(screen.root)).toContain("sağlık");
    expect(screen.renderPlan.diagnostics).toEqual([]);
  });
});
