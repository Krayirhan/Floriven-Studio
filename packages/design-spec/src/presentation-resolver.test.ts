import { describe, expect, it } from "vitest";
import { DESIGN_TEMPLATES } from "./strategy";
import { createScreenIntent } from "./screen-intent";
import { resolvePresentation } from "./presentation/resolvePresentation";
import { compilePresentationTokens } from "./presentation/tokenCompiler";

const template = DESIGN_TEMPLATES[0];
const strategy = { mode: "template" as const, ...template.strategy, stylePresetId: template.id, rationale: [] };
const intent = createScreenIntent({ screenId: "form", archetype: "form", navigationMode: "focused", contentDensity: "medium" });

describe("presentation resolver", () => {
  it("resolves a preset without renderer or preset branches", () => {
    const result = resolvePresentation({ strategy, styleSystemProfile: template.system, screenIntent: intent });
    expect(result.spec.version).toBe("2.0.0");
    expect(result.spec.identity.sourcePresetId).toBe(template.id);
    expect(result.spec.navigation.active).not.toBe("floating");
    expect(result.fallbackReasons).toContain("BOTTOM_NAVIGATION_DISABLED_BY_SCREEN_INTENT");
  });

  it("applies accessibility deterministically", () => {
    const first = resolvePresentation({ strategy, styleSystemProfile: template.system, screenIntent: intent, accessibilityPreferences: { reducedMotion: true } });
    const second = resolvePresentation({ strategy, styleSystemProfile: template.system, screenIntent: intent, accessibilityPreferences: { reducedMotion: true } });
    expect(first).toEqual(second);
    expect(first.spec.motion.duration).toBe("0ms");
  });

  it("compiles stable CSS tokens", () => {
    const result = resolvePresentation({ strategy, styleSystemProfile: template.system, screenIntent: intent });
    const tokens = compilePresentationTokens(result.spec);
    expect(tokens["--floriven-geometry-radius"]).toBe(template.system.cardGeometry?.radius ?? "12px");
    expect(Object.keys(tokens).every((key) => key.startsWith("--floriven-"))).toBe(true);
  });
});
