import { describe, expect, it } from "vitest";
import { createScreenIntent, validateScreenIntent } from "./screen-intent";
import { createUXSpec } from "./ux-spec";
import type { ProductBlueprint } from "./product-blueprint";

describe("ScreenIntent", () => {
  it("persists archetype policy for runtime consumption", () => {
    const intent = createScreenIntent({
      screenId: "invoice-form",
      archetype: "form",
      navigationMode: "focused",
      contentDensity: "medium",
    });

    expect(intent).toMatchObject({
      version: "1.0.0",
      screenId: "invoice-form",
      archetype: "form",
      heroAllowed: false,
      fabAllowed: false,
      bottomNavigationAllowed: false,
    });
    expect(validateScreenIntent(intent)).toEqual([]);
  });

  it("fails fast when runtime policy is inconsistent with the archetype", () => {
    const issues = validateScreenIntent({
      version: "1.0.0",
      screenId: "settings",
      archetype: "settings",
      navigationMode: "root",
      contentDensity: "medium",
      heroAllowed: true,
      fabAllowed: false,
      bottomNavigationAllowed: true,
    });

    expect(issues).toContain("HERO_POLICY_MISMATCH");
  });

  it("persists intents in the UX runtime contract", () => {
    const blueprint: ProductBlueprint = {
      productDomain: "operations",
      audience: "team",
      entities: ["task"],
      capabilities: ["tracking"],
      contentVocabulary: ["task"],
      screens: [{
        id: "home",
        name: "Home",
        route: "/",
        purpose: "overview",
        sections: ["summary"],
        role: "overview",
        priority: "primary",
        navigationPlacement: "primary",
      }],
      navigation: { primaryScreenIds: ["home"], utilityScreenIds: [] },
      screenPolicy: { minCount: 1, maxCount: 1, rationale: "fixture" },
    };

    expect(createUXSpec(blueprint).screens[0]?.version).toBe("1.0.0");
  });
});
