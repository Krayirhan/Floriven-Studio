import { describe, expect, it } from "vitest";
import { buildSyntheticBlueprint, type ProductBlueprint } from "./domain";
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
        { type: "Text", props: { text: `${screen.purpose} ${screen.sections.join(" ")} ${index === 0 ? plan.capabilities.join(" ") : ""}`, variant: "body" } },
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
    expect(result.metrics.screenPurposeCoverage).toBe(1);
    expect(result.metrics.screenSectionCoverage).toBe(1);
    expect(result.metrics.capabilityCoverage).toBe(1);
    expect(result.metrics.underCoveredScreenCount).toBe(0);
  });

  it("rejects a screen that omits its planned primary action or required data", () => {
    const contractedPlan = {
      ...plan,
      screens: plan.screens.map((screen, index) => index === 0 ? {
        ...screen,
        contract: {
          version: "1.0.0" as const,
          job: screen.purpose,
          requiredSections: screen.sections,
          sectionRoles: [
            { section: screen.sections[0], role: "summary" as const },
            { section: `${screen.sections[0]} analizi`, role: "analytics" as const },
          ],
          primaryAction: "Teslim planını güncelle",
          secondaryActions: ["Öncelikleri filtrele"],
          requiredData: ["teslim tarihi", "proje sorumlusu"],
          navigationTargetIds: ["projeler"],
        },
      } : screen),
    } as ProductBlueprint;
    const output = screens([
      ["Metric", "Chart", "Card"],
      ["SearchField", "Grid", "Button"],
      ["SegmentedControl", "ListItem", "Progress"],
      ["Avatar", "Form", "Switch"],
    ]);

    const rejected = evaluateGenerationQuality(output, contractedPlan);
    expect(rejected.passed).toBe(false);
    expect(rejected.metrics.underFulfilledContractCount).toBe(1);
    expect(rejected.issues.some((issue) => issue.startsWith("SCREEN_CONTRACT_UNFULFILLED"))).toBe(true);

    (output[0].root.children as Array<Record<string, unknown>>).push({
      type: "Button",
      props: { label: "Teslim planını güncelle · teslim tarihi · proje sorumlusu" },
    });
    const fulfilled = evaluateGenerationQuality(output, contractedPlan);
    expect(fulfilled.metrics.primaryActionCoverage).toBe(1);
    expect(fulfilled.metrics.requiredDataCoverage).toBe(1);
    expect(fulfilled.metrics.underFulfilledContractCount).toBe(0);
    expect(fulfilled.metrics.sectionTopologyCoverage).toBe(1);

    const firstChildren = output[0].root.children as Array<Record<string, unknown>>;
    const chartIndex = firstChildren.findIndex((node) => node.type === "Chart");
    firstChildren.splice(chartIndex, 1, { type: "Divider", props: {} });
    const topologyRejected = evaluateGenerationQuality(output, contractedPlan);
    expect(topologyRejected.metrics.underCoveredTopologyScreenCount).toBe(1);
    expect(topologyRejected.issues.some((issue) => issue.startsWith("SECTION_TOPOLOGY_UNFULFILLED"))).toBe(true);
  });

  it("rejects a deterministic section assignment when its best-target margin is ambiguous", () => {
    const contractedPlan = {
      ...plan,
      screens: plan.screens.map((screen, index) => index === 0 ? {
        ...screen,
        contract: {
          version: "1.0.0" as const,
          job: screen.purpose,
          requiredSections: screen.sections,
          sectionRoles: [{ section: screen.sections[0], role: "summary" as const }],
          primaryAction: "",
          secondaryActions: [],
          requiredData: [],
          navigationTargetIds: ["projeler"],
        },
      } : screen),
    } as ProductBlueprint;
    const output = screens([
      ["Metric", "Chart", "Card"],
      ["SearchField", "Grid", "Button"],
      ["SegmentedControl", "ListItem", "Progress"],
      ["Avatar", "Form", "Switch"],
    ]);
    output[0].root.children = [
      { type: "TopAppBar", props: { title: plan.screens[0].name } },
      {
        type: "Stack",
        props: { semanticContainer: true, contractSection: plan.screens[0].sections[0], contractSectionRole: "summary" },
        children: [
          { type: "Text", props: { text: plan.screens[0].sections[0] } },
          { type: "Metric", props: { contractSection: plan.screens[0].sections[0], contractSectionRole: "summary", label: plan.screens[0].purpose } },
          {
            type: "Text",
            props: {
              text: plan.capabilities.join(" "),
              contractSection: plan.screens[0].sections[0],
              contractSectionRole: "summary",
              sectionMember: true,
              sectionAssignmentConfidence: 0.7,
              sectionAssignmentMargin: 0.05,
              sectionAssignmentAmbiguous: true,
            },
          },
        ],
      },
      { type: "BottomNavigation", props: { items: plan.screens.map((screen) => screen.name) } },
    ];

    const result = evaluateGenerationQuality(output, contractedPlan);

    expect(result.metrics.ambiguousSectionMemberCount).toBe(1);
    expect(result.metrics.averageSectionAssignmentMargin).toBe(0.05);
    expect(result.passed).toBe(false);
    expect(result.issues.some((issue) => issue.startsWith("AMBIGUOUS_SECTION_ASSIGNMENT"))).toBe(true);
  });

  it("rejects a multi-section screen whose semantic members collapse into one container", () => {
    const contractedPlan = {
      ...plan,
      screens: plan.screens.map((screen, index) => index === 0 ? {
        ...screen,
        archetype: "management_list" as const,
        sections: ["Filtreler", "Kayıtlar"],
        contract: {
          version: "1.0.0" as const,
          job: screen.purpose,
          requiredSections: ["Filtreler", "Kayıtlar"],
          sectionRoles: [
            { section: "Filtreler", role: "filters" as const },
            { section: "Kayıtlar", role: "entity-list" as const },
          ],
          primaryAction: "",
          secondaryActions: [],
          requiredData: [],
          navigationTargetIds: ["projeler"],
        },
      } : screen),
    } as ProductBlueprint;
    const output = screens([
      ["Metric", "Chart", "Card"],
      ["SearchField", "Grid", "Button"],
      ["SegmentedControl", "ListItem", "Progress"],
      ["Avatar", "Form", "Switch"],
    ]);
    const assignedProps = (section: string, role: string) => ({
      contractSection: section,
      contractSectionRole: role,
      sectionMember: true,
      sectionAssignmentConfidence: 1,
      sectionAssignmentMargin: 1,
    });
    output[0].root.children = [
      { type: "TopAppBar", props: { title: plan.screens[0].name } },
      {
        type: "Stack",
        props: { semanticContainer: true, contractSection: "Filtreler", contractSectionRole: "filters" },
        children: [
          { type: "Text", props: { text: "Filtreler" } },
          ...Array.from({ length: 4 }, (_, index) => ({
            type: "SearchField",
            props: { ...assignedProps("Filtreler", "filters"), label: `${plan.screens[0].purpose} ${index === 0 ? plan.capabilities.join(" ") : index}` },
          })),
        ],
      },
      {
        type: "Stack",
        props: { semanticContainer: true, contractSection: "Kayıtlar", contractSectionRole: "entity-list" },
        children: [
          { type: "Text", props: { text: "Kayıtlar" } },
          { type: "ListItem", props: { ...assignedProps("Kayıtlar", "entity-list"), title: "Proje kaydı" } },
        ],
      },
      { type: "BottomNavigation", props: { items: plan.screens.map((screen) => screen.name) } },
    ];

    const result = evaluateGenerationQuality(output, contractedPlan);

    expect(result.metrics.maxSectionMemberConcentration).toBe(0.8);
    expect(result.metrics.imbalancedSectionScreenCount).toBe(1);
    expect(result.passed).toBe(false);
    expect(result.issues.some((issue) => issue.startsWith("SECTION_DISTRIBUTION_IMBALANCED"))).toBe(true);
  });

  it("rejects a section containing a component family incompatible with its role", () => {
    const contractedPlan = {
      ...plan,
      screens: plan.screens.map((screen, index) => index === 0 ? {
        ...screen,
        archetype: "management_list" as const,
        sections: ["Filtreler"],
        contract: {
          version: "1.0.0" as const,
          job: screen.purpose,
          requiredSections: ["Filtreler"],
          sectionRoles: [{ section: "Filtreler", role: "filters" as const }],
          primaryAction: "",
          secondaryActions: [],
          requiredData: [],
          navigationTargetIds: ["projeler"],
        },
      } : screen),
    } as ProductBlueprint;
    const output = screens([
      ["Metric", "Chart", "Card"],
      ["SearchField", "Grid", "Button"],
      ["SegmentedControl", "ListItem", "Progress"],
      ["Avatar", "Form", "Switch"],
    ]);
    output[0].root.children = [
      { type: "TopAppBar", props: { title: plan.screens[0].name } },
      {
        type: "Stack",
        props: { semanticContainer: true, contractSection: "Filtreler", contractSectionRole: "filters" },
        children: [
          { type: "Text", props: { text: "Filtreler" } },
          { type: "SearchField", props: { contractSection: "Filtreler", contractSectionRole: "filters", label: `${plan.screens[0].purpose} ${plan.capabilities.join(" ")}` } },
          { type: "Button", props: { contractSection: "Filtreler", contractSectionRole: "filters", label: "Uygula" } },
        ],
      },
      { type: "BottomNavigation", props: { items: plan.screens.map((screen) => screen.name) } },
    ];

    const result = evaluateGenerationQuality(output, contractedPlan);

    expect(result.metrics.sectionRolePurity).toBe(0.5);
    expect(result.metrics.crossRoleSectionMemberCount).toBe(1);
    expect(result.passed).toBe(false);
    expect(result.issues.some((issue) => issue.startsWith("SECTION_ROLE_IMPURE"))).toBe(true);
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

  it("rejects generic placeholders even when the screen tree is structurally valid", () => {
    const output = screens([
      ["Metric", "Chart", "Card"],
      ["SearchField", "Grid", "Button"],
      ["SegmentedControl", "ListItem", "Progress"],
      ["Avatar", "Form", "Switch"],
    ]);
    const children = output[1].root.children as Array<Record<string, unknown>>;
    children.push({ type: "TextField", props: { label: "Başlık", placeholder: "Bir başlık girin" } });

    const result = evaluateGenerationQuality(output, plan);

    expect(result.passed).toBe(false);
    expect(result.metrics.placeholderContentCount).toBe(2);
    expect(result.issues.some((issue) => issue.startsWith("PLACEHOLDER_CONTENT"))).toBe(true);
  });

  it("rejects content copied across multiple screens while allowing shared navigation", () => {
    const output = screens([
      ["Metric", "Chart", "Card"],
      ["SearchField", "Grid", "Button"],
      ["SegmentedControl", "ListItem", "Progress"],
      ["Avatar", "Form", "Switch"],
    ]);
    for (const screen of output.slice(0, 3)) {
      const children = screen.root.children as Array<Record<string, unknown>>;
      children.push({ type: "ListItem", props: { title: "Proje", subtitle: "Serbest çalışanlar için proje ve görev takibi yapan ortak açıklama" } });
      children.push({ type: "Text", props: { text: "İlgili ayrıntılar ve güncel durum" } });
    }

    const result = evaluateGenerationQuality(output, plan);

    expect(result.passed).toBe(false);
    expect(result.metrics.repeatedContentCount).toBeGreaterThanOrEqual(2);
    expect(result.metrics.genericContentCount).toBeGreaterThanOrEqual(3);
    expect(result.issues.some((issue) => issue.startsWith("CROSS_SCREEN_DUPLICATION"))).toBe(true);
  });

  it("rejects the deterministic 68/24/91 metric fingerprint", () => {
    const output = screens([
      ["Metric", "Chart", "Card"],
      ["SearchField", "Grid", "Button"],
      ["SegmentedControl", "ListItem", "Progress"],
      ["Avatar", "Form", "Switch"],
    ]);
    const children = output[0].root.children as Array<Record<string, unknown>>;
    children.push({ type: "Metric", props: { label: "Toplam", value: "68" } });
    children.push({ type: "Metric", props: { label: "Aktif", value: "24" } });
    children.push({ type: "Metric", props: { label: "Başarı", value: "%91" } });

    const result = evaluateGenerationQuality(output, plan);

    expect(result.passed).toBe(false);
    expect(result.metrics.fallbackMetricFingerprint).toBe(1);
    expect(result.issues).toContain("FALLBACK_METRIC_FINGERPRINT: Sabit 68/24/91 metrik seti tespit edildi.");
  });

  it("rejects screens that are structurally rich but ignore their own purpose and sections", () => {
    const output = screens([
      ["Metric", "Chart", "Card"],
      ["SearchField", "Grid", "Button"],
      ["SegmentedControl", "ListItem", "Progress"],
      ["Avatar", "Form", "Switch"],
    ]);
    for (const screen of output) {
      screen.root.children = (screen.root.children as Array<Record<string, unknown>>).filter((node) => node.type !== "Text");
    }

    const result = evaluateGenerationQuality(output, plan);

    expect(result.passed).toBe(false);
    expect(result.metrics.underCoveredScreenCount).toBeGreaterThanOrEqual(2);
    expect(result.metrics.screenPurposeCoverage).toBeLessThan(0.5);
    expect(result.metrics.screenSectionCoverage).toBeLessThan(0.5);
    expect(result.metrics.capabilityCoverage).toBeLessThan(0.5);
    expect(result.issues.some((issue) => issue.startsWith("LOW_SCREEN_SEMANTIC_COVERAGE"))).toBe(true);
    expect(result.issues).toContain("LOW_CAPABILITY_COVERAGE: Ürün kabiliyetleri ekran içeriğinde yeterince temsil edilmiyor.");
  });

  it("keeps edit-mode synthetic blueprints neutral when no semantic contract exists", () => {
    const output = screens([
      ["Metric", "Chart", "Card"],
      ["SearchField", "Grid", "Button"],
      ["SegmentedControl", "ListItem", "Progress"],
      ["Avatar", "Form", "Switch"],
    ]);
    const synthetic = buildSyntheticBlueprint(output);

    const result = evaluateGenerationQuality(output, synthetic);

    expect(result.metrics.screenPurposeCoverage).toBe(1);
    expect(result.metrics.screenSectionCoverage).toBe(1);
    expect(result.metrics.capabilityCoverage).toBe(1);
    expect(result.metrics.underCoveredScreenCount).toBe(0);
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

describe("same-archetype clone detection", () => {
  const repeatedListPlan: ProductBlueprint = {
    ...plan,
    screens: plan.screens.map((screen, index) => ({ ...screen, archetype: index === 0 ? "dashboard" : "management_list" })),
  };

  it("accepts multiple management screens when their component responsibilities differ", () => {
    const result = evaluateGenerationQuality(screens([
      ["Metric", "Chart", "Card"],
      ["SearchField", "ListItem", "ListItem", "Button"],
      ["SegmentedControl", "Progress", "ListItem", "Badge"],
      ["Avatar", "Grid", "Switch", "IconButton"],
    ]), repeatedListPlan);

    expect(result.metrics.sameArchetypePairCount).toBe(3);
    expect(result.metrics.sameArchetypeCollisionCount).toBe(0);
    expect(result.metrics.sameArchetypeDifferentiation).toBe(1);
    expect(result.passed).toBe(true);
  });

  it("rejects management screens that reuse the same component sequence", () => {
    const cloned = ["SearchField", "SegmentedControl", "Button", "ListItem", "ListItem", "ListItem", "ListItem"];
    const result = evaluateGenerationQuality(screens([
      ["Metric", "Chart", "Card"],
      cloned,
      cloned,
      cloned,
    ]), repeatedListPlan);

    expect(result.passed).toBe(false);
    expect(result.metrics.sameArchetypePairCount).toBe(3);
    expect(result.metrics.sameArchetypeCollisionCount).toBe(3);
    expect(result.metrics.maxSameArchetypeSimilarity).toBe(1);
    expect(result.issues.some((issue) => issue.startsWith("SAME_ARCHETYPE_CLONE"))).toBe(true);
  });

  it("rejects matching semantic structural identities even when presentation wrappers differ", () => {
    const output = screens([
      ["Metric", "Chart", "Card"],
      ["SearchField", "Grid", "Button"],
      ["SegmentedControl", "ListItem", "Progress"],
      ["Avatar", "Form", "Switch"],
    ]);
    const semanticScreen = (filterType: string, listWrapper?: string) => [
      { type: "TopAppBar", props: { title: "Ekran" } },
      { type: "Stack", props: { semanticContainer: true, contractSection: "Filtreler", contractSectionRole: "filters" }, children: [
        { type: "Text", props: { text: "Filtreler" } },
        { type: filterType, props: { contractSection: "Filtreler", contractSectionRole: "filters" } },
      ] },
      { type: "Stack", props: { semanticContainer: true, contractSection: "Kayıtlar", contractSectionRole: "entity-list" }, children: [
        { type: "Text", props: { text: "Kayıtlar" } },
        listWrapper
          ? { type: listWrapper, props: {}, children: [{ type: "ListItem", props: { contractSection: "Kayıtlar", contractSectionRole: "entity-list" } }] }
          : { type: "ListItem", props: { contractSection: "Kayıtlar", contractSectionRole: "entity-list" } },
      ] },
      { type: "BottomNavigation", props: { items: plan.screens.map((screen) => screen.name) } },
    ];
    output[1].root.children = semanticScreen("SearchField");
    output[2].root.children = semanticScreen("SearchField", "Group");
    output[3].root.children = semanticScreen("SegmentedControl");

    const result = evaluateGenerationQuality(output, repeatedListPlan);

    expect(result.metrics.structuralIdentityPairCount).toBe(3);
    expect(result.metrics.structuralIdentityCollisionCount).toBe(1);
    expect(result.passed).toBe(false);
    expect(result.issues.some((issue) => issue.startsWith("SAME_ARCHETYPE_STRUCTURAL_IDENTITY"))).toBe(true);
  });

  it("accepts same-archetype screens with distinct role, inventory, or density profiles", () => {
    const output = screens([
      ["Metric", "Chart", "Card"],
      ["SearchField", "Grid", "Button"],
      ["SegmentedControl", "ListItem", "Progress"],
      ["Avatar", "Form", "Switch"],
    ]);
    output[1].root.children = [
      { type: "Stack", props: { semanticContainer: true, contractSection: "Filtreler", contractSectionRole: "filters" }, children: [{ type: "SearchField", props: {} }] },
      { type: "Stack", props: { semanticContainer: true, contractSection: "Kayıtlar", contractSectionRole: "entity-list" }, children: [{ type: "ListItem", props: {} }] },
    ];
    output[2].root.children = [
      { type: "Stack", props: { semanticContainer: true, contractSection: "Özet", contractSectionRole: "summary" }, children: [{ type: "Metric", props: {} }] },
      { type: "Stack", props: { semanticContainer: true, contractSection: "İşlemler", contractSectionRole: "actions" }, children: [{ type: "Button", props: {} }, { type: "IconButton", props: {} }] },
    ];
    output[3].root.children = [
      { type: "Stack", props: { semanticContainer: true, contractSection: "Filtreler", contractSectionRole: "filters" }, children: [{ type: "SegmentedControl", props: {} }] },
      { type: "Stack", props: { semanticContainer: true, contractSection: "Kayıtlar", contractSectionRole: "entity-list" }, children: [{ type: "ListItem", props: {} }, { type: "ListItem", props: {} }, { type: "ListItem", props: {} }, { type: "ListItem", props: {} }] },
    ];

    const result = evaluateGenerationQuality(output, repeatedListPlan);

    expect(result.metrics.structuralIdentityPairCount).toBe(3);
    expect(result.metrics.structuralIdentityCollisionCount).toBe(0);
    expect(result.metrics.structuralIdentityDifferentiation).toBe(1);
  });
});

describe("identity intent fulfillment", () => {
  const intentPlan = {
    ...plan,
    screens: plan.screens.map((screen, index) => index === 0 ? {
      ...screen,
      archetype: "management_list" as const,
      sections: ["Kayıtlar", "Filtreler"],
      contract: {
        version: "1.0.0" as const,
        job: screen.purpose,
        requiredSections: ["Kayıtlar", "Filtreler"],
        sectionRoles: [
          { section: "Filtreler", role: "filters" as const },
          { section: "Kayıtlar", role: "entity-list" as const },
        ],
        identityIntent: { dominantRole: "entity-list" as const, supportingRole: "filters" as const, densityProfile: "balanced" as const },
        primaryAction: "",
        secondaryActions: [],
        requiredData: [],
        navigationTargetIds: ["projeler"],
      },
    } : screen),
  } as ProductBlueprint;

  function withIntentMembers(listCount: number, filterCount: number) {
    const output = screens([
      ["Metric", "Chart", "Card"],
      ["SearchField", "Grid", "Button"],
      ["SegmentedControl", "ListItem", "Progress"],
      ["Avatar", "Form", "Switch"],
    ]);
    const container = (section: string, role: string, type: string, count: number) => ({
      type: "Stack",
      props: { semanticContainer: true, contractSection: section, contractSectionRole: role },
      children: [
        { type: "Text", props: { text: section } },
        ...Array.from({ length: count }, (_, index) => ({ type, props: { contractSection: section, contractSectionRole: role, label: `${section} ${index}` } })),
      ],
    });
    output[0].root.children = [
      { type: "TopAppBar", props: { title: plan.screens[0].name } },
      container("Filtreler", "filters", "SearchField", filterCount),
      container("Kayıtlar", "entity-list", "ListItem", listCount),
      { type: "BottomNavigation", props: { items: plan.screens.map((screen) => screen.name) } },
    ];
    return output;
  }

  it("accepts an emitted structure matching dominant, supporting, and density intent", () => {
    const result = evaluateGenerationQuality(withIntentMembers(4, 2), intentPlan);

    expect(result.metrics.identityIntentCoverage).toBe(1);
    expect(result.metrics.underFulfilledIdentityIntentCount).toBe(0);
    expect(result.metrics.identityRoleViolationCount).toBe(0);
    expect(result.metrics.identityDensityViolationCount).toBe(0);
  });

  it("rejects reversed role dominance and an out-of-range density profile", () => {
    const result = evaluateGenerationQuality(withIntentMembers(1, 2), intentPlan);

    expect(result.metrics.identityIntentCoverage).toBe(0);
    expect(result.metrics.underFulfilledIdentityIntentCount).toBe(1);
    expect(result.metrics.identityRoleViolationCount).toBe(1);
    expect(result.metrics.identityDensityViolationCount).toBe(1);
    expect(result.passed).toBe(false);
    expect(result.issues.some((issue) => issue.startsWith("IDENTITY_INTENT_UNFULFILLED"))).toBe(true);
  });

  it("rejects ineffective or budget-exhausted repair telemetry", () => {
    const output = screens([
      ["Metric", "Chart", "Card"],
      ["SearchField", "Grid", "Button"],
      ["SegmentedControl", "ListItem", "Progress"],
      ["Avatar", "Form", "Switch"],
    ]);
    output[0].root.props = {
      ...output[0].root.props,
      identityIntentRepair: { addedNodeCount: 1, effectivenessGain: 0, effective: false, unnecessary: false, budgetExhausted: true },
    };
    output[1].root.props = {
      ...output[1].root.props,
      identityIntentRepair: { addedNodeCount: 2, effectivenessGain: 0.5, effective: true, unnecessary: false, budgetExhausted: false },
    };

    const result = evaluateGenerationQuality(output, plan);

    expect(result.metrics.identityIntentRepairOperationCount).toBe(3);
    expect(result.metrics.identityRepairAttemptCount).toBe(2);
    expect(result.metrics.ineffectiveIdentityRepairCount).toBe(1);
    expect(result.metrics.exhaustedIdentityRepairCount).toBe(1);
    expect(result.metrics.averageIdentityRepairGain).toBe(0.25);
    expect(result.passed).toBe(false);
    expect(result.issues.some((issue) => issue.startsWith("IDENTITY_REPAIR_INEFFECTIVE"))).toBe(true);
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
