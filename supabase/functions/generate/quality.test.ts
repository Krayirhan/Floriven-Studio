import { describe, expect, it } from "vitest";
import type { ProductBlueprint } from "./domain";
import { detectDomainFromScreens, evaluateGenerationQuality } from "./quality";

const plan: ProductBlueprint = {
  productDomain: "freelance-project-finance",
  audience: "Yaratıcı profesyoneller",
  entities: ["proje", "müşteri", "fatura", "ödeme"],
  capabilities: ["proje takibi", "gelir takibi"],
  contentVocabulary: ["teslim tarihi", "gelir hedefi"],
  screens: [
    { id: "gundem", name: "Gündem", route: "/gundem", purpose: "Öncelikler", sections: ["Teslimler"], role: "overview", priority: "primary", navigationPlacement: "primary" },
    { id: "projeler", name: "Projeler", route: "/projeler", purpose: "Projeleri yönetir", sections: ["Aktif projeler"], role: "core", priority: "primary", navigationPlacement: "primary" },
    { id: "finans", name: "Finans", route: "/finans", purpose: "Ödemeleri izler", sections: ["Faturalar"], role: "core", priority: "primary", navigationPlacement: "primary" },
    { id: "musteriler", name: "Müşteriler", route: "/musteriler", purpose: "Müşterileri yönetir", sections: ["Müşteri listesi"], role: "core", priority: "primary", navigationPlacement: "primary" },
  ],
  navigation: { primaryScreenIds: ["gundem", "projeler", "finans", "musteriler"], utilityScreenIds: [] },
  screenPolicy: { requestedCount: 4, minCount: 4, maxCount: 4, rationale: "Test" },
};

function screens(typesByScreen: string[][]) {
  const names = plan.screens.map((screen) => screen.name);
  return plan.screens.map((screen, index) => ({
    id: `screen-${index}`,
    name: screen.name,
    route: screen.route,
    root: {
      type: "Screen",
      props: { summary: "proje müşteri fatura ödeme teslim tarihi gelir hedefi" },
      children: [
        { type: "TopAppBar", props: { title: screen.name } },
        ...typesByScreen[index].map((type, nodeIndex) => ({ type, props: { label: `${screen.name} ${nodeIndex}` } })),
        { type: "BottomNavigation", props: { items: names } },
      ],
    },
  }));
}

describe("generation quality gate", () => {
  it("passes a blueprint-aligned and structurally varied product", () => {
    const result = evaluateGenerationQuality(screens([
      ["Metric", "Chart", "Card"],
      ["SearchField", "Grid", "Button"],
      ["SegmentedControl", "ListItem", "Progress"],
      ["Avatar", "Form", "Switch"],
    ]), plan);

    expect(result.passed).toBe(true);
    expect(result.metrics.blueprintAlignment).toBe(1);
    expect(result.metrics.foreignDomainComponents).toBe(0);
  });

  it("rejects four copies of the same sparse skeleton", () => {
    const result = evaluateGenerationQuality(screens(Array.from({ length: 4 }, () => ["Card", "Button"])), plan);

    expect(result.passed).toBe(false);
    expect(result.metrics.structureDiversity).toBe(0);
    expect(result.issues).toContain("Ekranların yapısal kompozisyonları birbirini fazla tekrar ediyor.");
  });

  it("rejects a health component in a freelance product", () => {
    const result = evaluateGenerationQuality(screens([
      ["Metric", "CareSummary", "Card"],
      ["SearchField", "Grid", "Button"],
      ["SegmentedControl", "ListItem", "Progress"],
      ["Avatar", "Form", "Switch"],
    ]), plan);

    expect(result.passed).toBe(false);
    expect(result.metrics.foreignDomainComponents).toBe(1);
  });

  it("records renderer-independent structural metrics for every generation", () => {
    const result = evaluateGenerationQuality(screens([
      ["Card", "Card", "Text", "Text", "Text", "Text", "Text", "Text", "Text", "Text", "Text"],
      ["SearchField", "Grid", "Button", "Text", "Text", "Text", "Text", "Text", "Text", "Text", "Text"],
      ["SegmentedControl", "ListItem", "Progress", "Text", "Text", "Text", "Text", "Text", "Text", "Text", "Text"],
      ["Avatar", "Form", "Switch", "Text", "Text", "Text", "Text", "Text", "Text", "Text", "Text"],
    ]), plan);

    expect(result.metrics.maxTreeDepth).toBe(2);
    expect(result.metrics.nestedCardCount).toBe(0);
    expect(result.metrics.singleChildWrapperCount).toBe(0);
    expect(result.metrics.cardRatio).toBeGreaterThan(0);
    expect(result.metrics.surfaceRatio).toBe(result.metrics.cardRatio);
  });
});

describe("screenDifferentiation (archetype-aware)", () => {
  const archetypedPlan: ProductBlueprint = {
    ...plan,
    screens: plan.screens.map((screen, index) => ({ ...screen, archetype: index === 0 ? "dashboard" : index === 1 ? "management_list" : index === 2 ? "settings" : "form" })),
  };

  it("does not penalize screens with different archetypes that are already structurally distinct", () => {
    const result = evaluateGenerationQuality(screens([
      ["Metric", "Chart", "Card"],
      ["SearchField", "Grid", "Button"],
      ["SegmentedControl", "ListItem", "Progress"],
      ["Avatar", "Form", "Switch"],
    ]), archetypedPlan);

    expect(result.metrics.screenDifferentiation).toBe(1);
  });

  it("penalizes screens with different archetypes that still share a near-identical skeleton", () => {
    const result = evaluateGenerationQuality(screens([
      ["Text", "Card", "Card", "Card"],
      ["Text", "Card", "Card", "Card"],
      ["Text", "Card", "Card", "Card"],
      ["Text", "Card", "Card", "Card"],
    ]), archetypedPlan);

    expect(result.metrics.screenDifferentiation).toBeLessThan(1);
    expect(result.issues.some((issue) => issue.includes("archetype"))).toBe(true);
  });
});

describe("V2 deterministic presentation gates", () => {
  it("rejects a focused flow with a FAB, persistent navigation, and an oversized heading", () => {
    const focusedFlowPlan: ProductBlueprint = {
      ...plan,
      screens: plan.screens.map((screen, index) => ({
        ...screen,
        archetype: index === 3 ? "form" : "dashboard",
        fabAllowed: index === 3 ? false : undefined,
      })),
    };
    const output = screens([
      ["Metric", "Chart", "Card"],
      ["SearchField", "Grid", "Button"],
      ["SegmentedControl", "ListItem", "Progress"],
      ["Form", "Button", "Text", "Text", "Text", "Text", "Text", "Text", "Text", "Text", "Text"],
    ]);
    const formChildren = output[3].root.children as Array<Record<string, unknown>>;
    formChildren.push({ type: "FloatingActionButton", props: { icon: "add" } });
    formChildren.push({ type: "Text", props: { variant: "display", maxLines: 3 } });

    const result = evaluateGenerationQuality(output, focusedFlowPlan);

    expect(result.passed).toBe(false);
    expect(result.metrics.invalidFabCount).toBe(1);
    expect(result.metrics.focusedFlowBottomNavViolations).toBe(1);
    expect(result.metrics.oversizedHeadingCount).toBe(1);
  });
});

describe("detectDomainFromScreens (edit mode)", () => {
  it("finds the domain already active in the current screens, without reading any brief text", () => {
    const domainScreens = screens([
      ["Metric", "CareSummary", "Card"],
      ["SearchField", "Grid", "Button"],
      ["SegmentedControl", "ListItem", "Progress"],
      ["Avatar", "Form", "Switch"],
    ]);
    expect(detectDomainFromScreens(domainScreens)).toBe("health-care");
  });

  it("returns undefined for a domain-neutral product", () => {
    const neutralScreens = screens(Array.from({ length: 4 }, () => ["Card", "Button", "ListItem"]));
    expect(detectDomainFromScreens(neutralScreens)).toBeUndefined();
  });
});
