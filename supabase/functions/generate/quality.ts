import { requiresSettingsScreen, type DomainPackId, type ProductBlueprint } from "./domain.ts";

type DesignNode = Record<string, unknown>;

export type GenerationQualityReport = {
  score: number;
  passed: boolean;
  issues: string[];
  metrics: {
    screenCount: number;
    blueprintAlignment: number;
    navigationConsistency: number;
    structureDiversity: number;
    screenDifferentiation: number;
    vocabularyCoverage: number;
    foreignDomainComponents: number;
    navigationReachability: number;
    settingsCoverage: number;
    maxTreeDepth: number;
    nestedCardCount: number;
    singleChildWrapperCount: number;
    cardRatio: number;
    surfaceRatio: number;
    invalidFabCount: number;
    focusedFlowBottomNavViolations: number;
    oversizedHeadingCount: number;
  };
};

export const DOMAIN_COMPONENTS: Record<DomainPackId, readonly string[]> = {
  "health-care": ["CareSummary", "MedicationTimeline", "MedicationDoseRow", "HealthMetric", "UnitInput", "RangeChart", "TargetRange", "StatusAlert", "SafetyNotice", "SuccessFeedback"],
  commerce: ["CommerceHero", "ProductCard", "PriceBlock", "ProductGallery", "VariantSelector", "CartLine", "OrderSummary", "DeliveryPromise"],
  learning: ["LearningHero", "XpProgress", "StreakBadge", "LessonCard", "RoadmapStep", "QuizChoice", "AnswerFeedback", "AchievementBadge"],
  publishing: ["EditorialHero", "FeatureStory", "StoryCard", "Byline", "MetadataStrip", "PullQuote", "SectionIndex", "ArchiveEntry"],
  operations: ["CommandSummary", "SignalChart", "RiskIndicator", "OperationRow", "IncidentTimeline", "DataMatrix", "ControlToggle", "AuditEntry"],
};

export function evaluateGenerationQuality(
  screens: DesignNode[],
  blueprint: ProductBlueprint,
  domainPackId?: DomainPackId,
): GenerationQualityReport {
  const issues: string[] = [];
  let score = 100;

  const expectedCount = blueprint.screens.length;
  if (screens.length !== expectedCount) {
    score -= 40;
    issues.push(`${expectedCount} ekran bekleniyordu; ${screens.length} ekran üretildi.`);
  }

  const aligned = screens.filter((screen, index) => {
    const planned = blueprint.screens[index];
    return planned && screen.name === planned.name && screen.route === planned.route;
  }).length;
  const blueprintAlignment = screens.length ? aligned / screens.length : 0;
  if (blueprintAlignment < 1) {
    score -= 25;
    issues.push("Ekran adları veya route değerleri ProductBlueprint ile eşleşmiyor.");
  }

  const persistentNavigationScreens = screens.filter((_, index) => {
    const archetype = blueprint.screens[index]?.archetype;
    return archetype !== "form" && archetype !== "detail";
  });
  const navSets = persistentNavigationScreens.map((screen) => {
    const nav = flatten((screen.root ?? {}) as DesignNode).find((node) => node.type === "BottomNavigation" || node.type === "TabBar");
    const items = asRecord(nav?.props).items;
    return Array.isArray(items) ? JSON.stringify(items) : "";
  });
  const navigationConsistency = navSets.length > 0 && navSets.every((items) => items && items === navSets[0]) ? 1 : 0;
  if (!navigationConsistency) {
    score -= 20;
    issues.push("Alt navigasyon tüm ekranlarda aynı değil.");
  }
  const primaryIds = blueprint.navigation.primaryScreenIds;
  const eligiblePrimaryCount = blueprint.screens.filter((screen) => screen.role === "overview" || screen.role === "core").length;
  const primaryPlanIsValid = primaryIds.length >= Math.min(3, Math.max(1, eligiblePrimaryCount))
    && primaryIds.length <= 5
    && primaryIds.every((id) => blueprint.screens.some((screen) => screen.id === id && screen.navigationPlacement === "primary"));
  const hierarchicalPlanIsValid = blueprint.screens
    .filter((screen) => screen.navigationPlacement === "hierarchical")
    .every((screen) => !!screen.parentId && blueprint.screens.some((candidate) => candidate.id === screen.parentId));
  const navigationReachability = primaryPlanIsValid && hierarchicalPlanIsValid ? 1 : 0;
  if (!navigationReachability) {
    score -= 20;
    issues.push("Birincil navigasyon veya hiyerarşik ekran bağlantıları geçerli değil.");
  }

  const signatures = screens.map(structureSignature);
  let duplicatePairs = 0;
  let pairCount = 0;
  for (let left = 0; left < signatures.length; left += 1) {
    for (let right = left + 1; right < signatures.length; right += 1) {
      pairCount += 1;
      if (similarity(signatures[left], signatures[right]) >= 0.9) duplicatePairs += 1;
    }
  }
  const structureDiversity = pairCount ? 1 - duplicatePairs / pairCount : 0;
  if (structureDiversity < 0.67) {
    score -= 20;
    issues.push("Ekranların yapısal kompozisyonları birbirini fazla tekrar ediyor.");
  }

  // Stricter than structureDiversity: two screens with DIFFERENT jobs (archetypes)
  // that still land on a near-identical node sequence are the "same layout,
  // different paint" failure — every screen collapsing to Card-stack regardless
  // of whether it's a dashboard, a list, or a settings screen.
  const crossArchetypeSimilarities: number[] = [];
  for (let left = 0; left < signatures.length; left += 1) {
    for (let right = left + 1; right < signatures.length; right += 1) {
      const archetypeLeft = blueprint.screens[left]?.archetype;
      const archetypeRight = blueprint.screens[right]?.archetype;
      if (!archetypeLeft || !archetypeRight || archetypeLeft === archetypeRight) continue;
      crossArchetypeSimilarities.push(similarity(signatures[left], signatures[right]));
    }
  }
  const crossArchetypeCollisions = crossArchetypeSimilarities.filter((value) => value >= 0.75).length;
  const screenDifferentiation = crossArchetypeSimilarities.length ? 1 - crossArchetypeCollisions / crossArchetypeSimilarities.length : 1;
  if (crossArchetypeCollisions > 0) {
    score -= crossArchetypeCollisions * 15;
    issues.push(`${crossArchetypeCollisions} ekran çifti farklı görev tipine (archetype) sahip olmasına rağmen neredeyse aynı yapıyı kullanıyor.`);
  }

  const nodeCounts = screens.map((screen) => flatten((screen.root ?? {}) as DesignNode).length - 1);
  const sparseScreens = nodeCounts.filter((count) => count < 12).length;
  if (sparseScreens) {
    score -= sparseScreens * 5;
    issues.push(`${sparseScreens} ekran yeterli içerik yoğunluğuna sahip değil.`);
  }

  const allowed = new Set(domainPackId ? DOMAIN_COMPONENTS[domainPackId] : []);
  const allDomainComponents = new Set(Object.values(DOMAIN_COMPONENTS).flat());
  const foreignDomainComponents = screens
    .flatMap((screen) => flatten((screen.root ?? {}) as DesignNode))
    .filter((node) => typeof node.type === "string" && allDomainComponents.has(node.type) && !allowed.has(node.type)).length;
  if (foreignDomainComponents) {
    score -= 35;
    issues.push(`${foreignDomainComponents} yabancı domain bileşeni tespit edildi.`);
  }

  const outputText = JSON.stringify(screens).toLocaleLowerCase("tr-TR");
  const vocabulary = [...blueprint.entities, ...blueprint.contentVocabulary]
    .map((item) => item.trim().toLocaleLowerCase("tr-TR"))
    .filter((item) => item.length >= 3);
  const vocabularyCoverage = vocabulary.length
    ? vocabulary.filter((item) => outputText.includes(item)).length / vocabulary.length
    : 1;
  if (vocabularyCoverage < 0.25) {
    score -= 15;
    issues.push("Ürün sözlüğü ekran içeriğine yeterince yansımıyor.");
  }

  const settingsRequired = requiresSettingsScreen(blueprint.capabilities, blueprint.contentVocabulary);
  const hasSettings = blueprint.screens.some((screen) => screen.role === "settings");
  const settingsCoverage = settingsRequired ? Number(hasSettings) : 1;
  if (!settingsCoverage) {
    score -= 15;
    issues.push("Ürün tercihleri gerektiriyor ancak ProductBlueprint ayarlar ekranı içermiyor.");
  }

  const structuralMetrics = calculateStructuralMetrics(screens.map((screen) => asRecord(screen.root)));
  const v2Violations = calculateV2Violations(screens, blueprint);

  if (v2Violations.invalidFabCount > 0) {
    issues.push("Floating action buttons are not allowed on the affected screen archetypes.");
  }
  if (v2Violations.focusedFlowBottomNavViolations > 0) {
    issues.push("Focused form or detail flows must not render persistent bottom navigation.");
  }
  if (v2Violations.oversizedHeadingCount > 0) {
    issues.push("Oversized or multi-line display headings violate the typography budget.");
  }

  score = Math.max(0, score);
  return {
    score,
    passed: score >= 70 && screens.length === expectedCount && blueprintAlignment === 1 && navigationConsistency === 1 && navigationReachability === 1 && settingsCoverage === 1 && foreignDomainComponents === 0 && structuralMetrics.nestedCardCount === 0 && structuralMetrics.cardRatio <= 0.7 && structuralMetrics.surfaceRatio <= 0.75 && v2Violations.invalidFabCount === 0 && v2Violations.focusedFlowBottomNavViolations === 0 && v2Violations.oversizedHeadingCount === 0,
    issues,
    metrics: {
      screenCount: screens.length,
      blueprintAlignment,
      navigationConsistency,
      structureDiversity,
      screenDifferentiation,
      vocabularyCoverage,
      foreignDomainComponents,
      navigationReachability,
      settingsCoverage,
      ...structuralMetrics,
      ...v2Violations,
    },
  };
}

const STRUCTURAL_WRAPPER_TYPES = new Set([
  "Screen",
  "SafeArea",
  "ScrollView",
  "Stack",
  "Row",
  "Grid",
  "Group",
  "Section",
]);

/**
 * Baseline-only metrics derived from the canonical DesignSpec tree. Geometry
 * and visual measurements intentionally stay out of this renderer-independent
 * stage.
 */
function calculateStructuralMetrics(roots: DesignNode[]) {
  let maxTreeDepth = 0;
  let nestedCardCount = 0;
  let singleChildWrapperCount = 0;
  let cardCount = 0;
  let surfaceCount = 0;
  let semanticBlockCount = 0;

  const visit = (node: DesignNode, depth: number, cardAncestorCount: number) => {
    maxTreeDepth = Math.max(maxTreeDepth, depth);
    const type = String(node.type ?? "");
    const children = Array.isArray(node.children) ? node.children.filter(isRecord) : [];
    const isWrapper = STRUCTURAL_WRAPPER_TYPES.has(type);
    const isCard = type === "Card";
    const isSurface = isCard || type === "Surface";

    if (!isWrapper) semanticBlockCount += 1;
    if (isCard) {
      cardCount += 1;
      if (cardAncestorCount > 0) nestedCardCount += 1;
    }
    if (isSurface) surfaceCount += 1;
    if (isWrapper && children.length === 1) singleChildWrapperCount += 1;

    for (const child of children) visit(child, depth + 1, cardAncestorCount + Number(isCard));
  };

  for (const root of roots) visit(root, 1, 0);

  return {
    maxTreeDepth,
    nestedCardCount,
    singleChildWrapperCount,
    cardRatio: semanticBlockCount ? cardCount / semanticBlockCount : 0,
    surfaceRatio: semanticBlockCount ? surfaceCount / semanticBlockCount : 0,
  };
}

function calculateV2Violations(
  screens: DesignNode[],
  blueprint: ProductBlueprint,
) {
  let invalidFabCount = 0;
  let focusedFlowBottomNavViolations = 0;
  let oversizedHeadingCount = 0;

  for (const [index, screen] of screens.entries()) {
    const plannedScreen = blueprint.screens[index];
    const archetype = plannedScreen?.archetype;
    const isFocusedFlow = archetype === "form" || archetype === "detail";
    const nodes = flatten(asRecord(screen.root));
    const hasFloatingActionButton = nodes.some((node) => node.type === "FloatingActionButton");
    const hasPersistentBottomNavigation = nodes.some(
      (node) => node.type === "BottomNavigation" || node.type === "TabBar",
    );

    if (
      hasFloatingActionButton &&
      (plannedScreen?.fabAllowed === false ||
        archetype === "settings" ||
        archetype === "form" ||
        archetype === "detail" ||
        archetype === "profile")
    ) {
      invalidFabCount += 1;
    }

    if (isFocusedFlow && hasPersistentBottomNavigation) {
      focusedFlowBottomNavViolations += 1;
    }

    for (const node of nodes) {
      if (node.type !== "Text") continue;
      const props = asRecord(node.props);
      const isDisplayOutsideDashboard = props.variant === "display" && archetype !== "dashboard";
      const hasTooManyHeadingLines = typeof props.maxLines === "number" && props.maxLines > 2;
      if (isDisplayOutsideDashboard || hasTooManyHeadingLines) oversizedHeadingCount += 1;
    }
  }

  return {
    invalidFabCount,
    focusedFlowBottomNavViolations,
    oversizedHeadingCount,
  };
}

function structureSignature(screen: DesignNode): string[] {
  const root = (screen.root ?? {}) as DesignNode;
  return flatten(root)
    .filter((node) => !["Screen", "TopAppBar", "BottomNavigation", "TabBar", "Text"].includes(String(node.type)))
    .map((node) => String(node.type));
}

function similarity(left: string[], right: string[]): number {
  const size = Math.max(left.length, right.length);
  if (!size) return 1;
  let matches = 0;
  for (let index = 0; index < Math.min(left.length, right.length); index += 1) {
    if (left[index] === right[index]) matches += 1;
  }
  return matches / size;
}

/** Reverse lookup: which domain pack, if any, is already active in a set of screens. */
export function detectDomainFromScreens(screens: DesignNode[]): DomainPackId | undefined {
  const types = new Set(screens.flatMap((screen) => flatten(asRecord(screen.root)).map((node) => String(node.type))));
  for (const [packId, components] of Object.entries(DOMAIN_COMPONENTS) as [DomainPackId, readonly string[]][]) {
    if (components.some((type) => types.has(type))) return packId;
  }
  return undefined;
}

function flatten(node: DesignNode): DesignNode[] {
  const children = Array.isArray(node.children) ? node.children.filter(isRecord) : [];
  return [node, ...children.flatMap(flatten)];
}

function asRecord(value: unknown): DesignNode {
  return isRecord(value) ? value : {};
}

function isRecord(value: unknown): value is DesignNode {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
