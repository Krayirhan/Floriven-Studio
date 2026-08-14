import { describe, expect, it } from "vitest";
import { createPresentationSpec } from "./presentation-spec";
import { createUXSpec } from "./ux-spec";
import type { ProductBlueprint } from "./product-blueprint";
import { assertSemanticParity, createSemanticHash } from "./semantic-hash";
import type { DesignSpec } from "./types";

const blueprint: ProductBlueprint = {
  productDomain: "freelancer-finance", audience: "Freelancers", entities: ["invoice"], capabilities: ["billing"], contentVocabulary: ["invoice"],
  navigation: { primaryScreenIds: ["home", "invoices", "settings"], utilityScreenIds: [] },
  screenPolicy: { minCount: 3, maxCount: 3, rationale: "test" },
  screens: [
    { id: "home", name: "Home", route: "/", purpose: "Overview", sections: [], role: "overview", priority: "primary", navigationPlacement: "primary" },
    { id: "invoices", name: "Invoices", route: "/invoices", purpose: "List", sections: [], role: "core", priority: "primary", navigationPlacement: "primary" },
    { id: "settings", name: "Settings", route: "/settings", purpose: "Preferences", sections: [], role: "settings", priority: "secondary", navigationPlacement: "primary" },
  ],
};

describe("V2 stage contracts", () => {
  it("derives UX from product semantics rather than visual strategy", () => {
    const ux = createUXSpec(blueprint);
    const obsidian = createPresentationSpec({ mode: "template", stylePresetId: "obsidian-precision", palette: "obsidian", cardStyle: "crisp", density: "compact", navigationStyle: "glass", visualDirection: "dark", rationale: [] });
    const editorial = createPresentationSpec({ mode: "template", stylePresetId: "editorial-culture", palette: "editorial", cardStyle: "minimal", density: "spacious", navigationStyle: "minimal", visualDirection: "editorial", rationale: [] });

    expect(ux.screens.map((screen) => [screen.screenId, screen.archetype, screen.navigationMode])).toEqual([
      ["home", "dashboard", "root"], ["invoices", "management_list", "root"], ["settings", "settings", "root"],
    ]);
    expect(ux.screens[0]).toMatchObject({
      version: "1.0.0",
      heroAllowed: true,
      fabAllowed: false,
      bottomNavigationAllowed: true,
    });
    expect(obsidian).not.toEqual(editorial);
    expect(ux.screens).toHaveLength(3);
  });

  it("keeps semantic hash stable when only presentation changes", () => {
    const base: DesignSpec = {
      schemaVersion: "1.0.0", projectId: "test", platform: "ios", locale: "tr-TR", deviceProfile: "phone",
      tokens: { palette: "obsidian" }, assets: [], components: {}, flows: [], metadata: {},
      screens: [{ id: "home", name: "Home", route: "/", root: {
        id: "root", type: "Screen", props: { background: "black", radius: 12 }, children: [
          { id: "title", type: "Text", props: { text: "Gelir" }, children: [] },
        ],
      } }],
    };
    const styled = JSON.parse(JSON.stringify(base)) as DesignSpec;
    styled.tokens = { palette: "editorial", font: "serif", shadow: "large" };
    styled.screens[0].root.props = { background: "paper", radius: 0 };

    expect(createSemanticHash(base)).toBe(createSemanticHash(styled));
    expect(() => assertSemanticParity(base, styled)).not.toThrow();
  });

  it("rejects semantic tree mutation", () => {
    const base: DesignSpec = {
      schemaVersion: "1.0.0", projectId: "test", platform: "ios", locale: "tr-TR", deviceProfile: "phone",
      tokens: {}, assets: [], components: {}, flows: [], metadata: {},
      screens: [{ id: "home", name: "Home", root: { id: "root", type: "Screen", props: {}, children: [] } }],
    };
    const changed = JSON.parse(JSON.stringify(base)) as DesignSpec;
    changed.screens[0].root.children = [{ id: "new", type: "Button", props: { label: "Kaydet" } }];

    expect(() => assertSemanticParity(base, changed)).toThrow("SEMANTIC_STRUCTURE_MUTATED");
  });
});
