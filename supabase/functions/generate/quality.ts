import { requiresSettingsScreen, type DomainPackId, type ProductBlueprint } from "./domain.ts";
import { evaluateSectionContainers, evaluateSectionMembers, evaluateSectionOwnership, evaluateSectionTopology } from './section-topology.ts';

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
    sameArchetypeDifferentiation: number;
    sameArchetypePairCount: number;
    sameArchetypeCollisionCount: number;
    maxSameArchetypeSimilarity: number;
    structuralIdentityPairCount: number;
    structuralIdentityCollisionCount: number;
    maxStructuralIdentitySimilarity: number;
    structuralIdentityDifferentiation: number;
    identityIntentCoverage: number;
    underFulfilledIdentityIntentCount: number;
    identityRoleViolationCount: number;
    identityDensityViolationCount: number;
    identityIntentRepairOperationCount: number;
    identityRepairAttemptCount: number;
    ineffectiveIdentityRepairCount: number;
    exhaustedIdentityRepairCount: number;
    unnecessaryIdentityRepairCount: number;
    averageIdentityRepairGain: number;
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
    genericContentCount: number;
    placeholderContentCount: number;
    repeatedContentCount: number;
    fallbackMetricFingerprint: number;
    screenPurposeCoverage: number;
    screenSectionCoverage: number;
    capabilityCoverage: number;
    underCoveredScreenCount: number;
    primaryActionCoverage: number;
    requiredDataCoverage: number;
    underFulfilledContractCount: number;
    contractRepairOperationCount: number;
    sectionTopologyCoverage: number;
    underCoveredTopologyScreenCount: number;
    sectionOwnershipCoverage: number;
    invalidSectionOrderCount: number;
    sectionContainerCoverage: number;
    orphanSectionOwnerCount: number;
    missingSectionHeadingCount: number;
    sectionMemberCoverage: number;
    orphanSemanticNodeCount: number;
    crossSectionMemberViolationCount: number;
    semanticMemberAssignmentConfidence: number;
    lowConfidenceSectionMemberCount: number;
    averageSectionAssignmentMargin: number;
    ambiguousSectionMemberCount: number;
    contractEvidenceAssignmentCount: number;
    emptySectionContainerCount: number;
    maxSectionMemberConcentration: number;
    imbalancedSectionScreenCount: number;
    sectionRolePurity: number;
    crossRoleSectionMemberCount: number;
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

  const sameArchetypeSimilarities: number[] = [];
  for (let left = 0; left < signatures.length; left += 1) {
    for (let right = left + 1; right < signatures.length; right += 1) {
      const archetypeLeft = blueprint.screens[left]?.archetype;
      const archetypeRight = blueprint.screens[right]?.archetype;
      if (!archetypeLeft || archetypeLeft !== archetypeRight) continue;
      sameArchetypeSimilarities.push(combinedStructuralSimilarity(signatures[left], signatures[right]));
    }
  }
  const sameArchetypeCollisionCount = sameArchetypeSimilarities.filter((value) => value >= 0.85).length;
  const sameArchetypeDifferentiation = sameArchetypeSimilarities.length
    ? 1 - sameArchetypeCollisionCount / sameArchetypeSimilarities.length
    : 1;
  const maxSameArchetypeSimilarity = sameArchetypeSimilarities.length ? Math.max(...sameArchetypeSimilarities) : 0;
  if (sameArchetypeCollisionCount > 0) {
    score -= Math.min(30, sameArchetypeCollisionCount * 15);
    issues.push(`SAME_ARCHETYPE_CLONE: ${sameArchetypeCollisionCount} ekran çifti aynı archetype içinde aynı component iskeletine çöktü.`);
  }

  const structuralIdentities = screens.map(structuralIdentitySignature);
  const structuralIdentitySimilarities: number[] = [];
  for (let left = 0; left < structuralIdentities.length; left += 1) {
    for (let right = left + 1; right < structuralIdentities.length; right += 1) {
      const archetypeLeft = blueprint.screens[left]?.archetype;
      const archetypeRight = blueprint.screens[right]?.archetype;
      if (!archetypeLeft || archetypeLeft !== archetypeRight) continue;
      if (!structuralIdentities[left].length || !structuralIdentities[right].length) continue;
      structuralIdentitySimilarities.push(combinedStructuralSimilarity(structuralIdentities[left], structuralIdentities[right]));
    }
  }
  const structuralIdentityCollisionCount = structuralIdentitySimilarities.filter((value) => value >= 0.9).length;
  const structuralIdentityDifferentiation = structuralIdentitySimilarities.length
    ? 1 - structuralIdentityCollisionCount / structuralIdentitySimilarities.length
    : 1;
  const maxStructuralIdentitySimilarity = structuralIdentitySimilarities.length ? Math.max(...structuralIdentitySimilarities) : 0;
  if (structuralIdentityCollisionCount > 0) {
    score -= Math.min(30, structuralIdentityCollisionCount * 15);
    issues.push(`SAME_ARCHETYPE_STRUCTURAL_IDENTITY: ${structuralIdentityCollisionCount} ekran çifti aynı section-role, component ailesi ve dağılım profiline çöktü.`);
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
  const contentMetrics = calculateContentMetrics(screens);
  const semanticMetrics = calculateSemanticCoverage(screens, blueprint);
  const contractMetrics = calculateScreenContractCoverage(screens, blueprint);
  const topologyMetrics = calculateTopologyCoverage(screens, blueprint);
  const identityIntentMetrics = calculateIdentityIntentFulfillment(screens, blueprint);
  const contractRepairOperationCount = screens.reduce((total, screen) => {
    const repair = asRecord(asRecord(asRecord(screen.root).props).contractRepair);
    return total + (typeof repair.operationCount === 'number' ? repair.operationCount : 0);
  }, 0);
  const identityIntentRepairOperationCount = screens.reduce((total, screen) => {
    const repair = asRecord(asRecord(asRecord(screen.root).props).identityIntentRepair);
    return total + (typeof repair.addedNodeCount === 'number' ? repair.addedNodeCount : 0);
  }, 0);
  const identityRepairReports = screens.map((screen) => asRecord(asRecord(asRecord(screen.root).props).identityIntentRepair));
  const attemptedIdentityRepairs = identityRepairReports.filter((repair) => typeof repair.addedNodeCount === 'number' && repair.addedNodeCount > 0);
  const identityRepairAttemptCount = attemptedIdentityRepairs.length;
  const ineffectiveIdentityRepairCount = attemptedIdentityRepairs.filter((repair) => repair.effective === false).length;
  const exhaustedIdentityRepairCount = attemptedIdentityRepairs.filter((repair) => repair.budgetExhausted === true).length;
  const unnecessaryIdentityRepairCount = attemptedIdentityRepairs.filter((repair) => repair.unnecessary === true).length;
  const repairGains = attemptedIdentityRepairs.map((repair) => typeof repair.effectivenessGain === 'number' ? repair.effectivenessGain : 0);
  const averageIdentityRepairGain = repairGains.length ? repairGains.reduce((total, gain) => total + gain, 0) / repairGains.length : 1;

  if (v2Violations.invalidFabCount > 0) {
    issues.push("Floating action buttons are not allowed on the affected screen archetypes.");
  }
  if (v2Violations.oversizedHeadingCount > 0) {
    issues.push("Oversized or multi-line display headings violate the typography budget.");
  }
  if (contentMetrics.placeholderContentCount > 0) {
    score -= Math.min(30, contentMetrics.placeholderContentCount * 10);
    issues.push(`PLACEHOLDER_CONTENT: ${contentMetrics.placeholderContentCount} jenerik form veya kayıt placeholder'ı tespit edildi.`);
  }
  if (contentMetrics.genericContentCount >= 3) {
    score -= 20;
    issues.push(`GENERIC_COPY: ${contentMetrics.genericContentCount} jenerik içerik ifadesi ekranlara taşındı.`);
  }
  if (contentMetrics.repeatedContentCount >= 2) {
    score -= 20;
    issues.push(`CROSS_SCREEN_DUPLICATION: ${contentMetrics.repeatedContentCount} içerik ifadesi farklı ekranlarda kopyalandı.`);
  }
  if (contentMetrics.fallbackMetricFingerprint > 0) {
    score -= 30;
    issues.push("FALLBACK_METRIC_FINGERPRINT: Sabit 68/24/91 metrik seti tespit edildi.");
  }
  if (semanticMetrics.underCoveredScreenCount > 0) {
    score -= Math.min(35, semanticMetrics.underCoveredScreenCount * 10);
    issues.push(`LOW_SCREEN_SEMANTIC_COVERAGE: ${semanticMetrics.underCoveredScreenCount} ekran kendi purpose/section sözleşmesini yeterince yansıtmıyor.`);
  }
  if (semanticMetrics.capabilityCoverage < 0.5) {
    score -= 15;
    issues.push("LOW_CAPABILITY_COVERAGE: Ürün kabiliyetleri ekran içeriğinde yeterince temsil edilmiyor.");
  }
  if (contractMetrics.underFulfilledContractCount > 0) {
    score -= Math.min(40, contractMetrics.underFulfilledContractCount * 15);
    issues.push(`SCREEN_CONTRACT_UNFULFILLED: ${contractMetrics.underFulfilledContractCount} ekran zorunlu aksiyon veya veri sözleşmesini karşılamıyor.`);
  }
  if (topologyMetrics.underCoveredTopologyScreenCount > 0) {
    score -= Math.min(40, topologyMetrics.underCoveredTopologyScreenCount * 15);
    issues.push(`SECTION_TOPOLOGY_UNFULFILLED: ${topologyMetrics.underCoveredTopologyScreenCount} ekran gerekli yapısal bölüm rollerini karşılamıyor.`);
  }
  if (topologyMetrics.sectionOwnershipCoverage < 1 || topologyMetrics.invalidSectionOrderCount > 0) {
    score -= 20;
    issues.push(`SECTION_OWNERSHIP_INVALID: Bölüm component sahipliği veya arketip sırası geçerli değil.`);
  }
  if (topologyMetrics.sectionContainerCoverage < 1 || topologyMetrics.orphanSectionOwnerCount > 0 || topologyMetrics.missingSectionHeadingCount > 0) {
    score -= 20;
    issues.push(`SECTION_CONTAINER_INVALID: Bölüm başlığı ve rol sahibi component aynı semantic container altında değil.`);
  }
  if (topologyMetrics.sectionMemberCoverage < 1 || topologyMetrics.orphanSemanticNodeCount > 0 || topologyMetrics.crossSectionMemberViolationCount > 0) {
    score -= 20;
    issues.push(`SECTION_MEMBER_INVALID: Semantic node üyeliği eksik veya yanlış section container'a bağlı.`);
  }
  if (topologyMetrics.lowConfidenceSectionMemberCount > 0) {
    score -= Math.min(20, topologyMetrics.lowConfidenceSectionMemberCount * 5);
    issues.push(`LOW_SECTION_ASSIGNMENT_CONFIDENCE: ${topologyMetrics.lowConfidenceSectionMemberCount} semantic node bölüm bağlamıyla yeterince eşleşmiyor.`);
  }
  if (topologyMetrics.ambiguousSectionMemberCount > 0) {
    score -= Math.min(20, topologyMetrics.ambiguousSectionMemberCount * 5);
    issues.push(`AMBIGUOUS_SECTION_ASSIGNMENT: ${topologyMetrics.ambiguousSectionMemberCount} semantic node iki veya daha fazla bölüme yakın skorla eşleşiyor.`);
  }
  if (topologyMetrics.emptySectionContainerCount > 0 || topologyMetrics.imbalancedSectionScreenCount > 0) {
    score -= Math.min(20, topologyMetrics.emptySectionContainerCount * 5 + topologyMetrics.imbalancedSectionScreenCount * 10);
    issues.push(`SECTION_DISTRIBUTION_IMBALANCED: ${topologyMetrics.emptySectionContainerCount} boş bölüm ve ${topologyMetrics.imbalancedSectionScreenCount} aşırı yoğun ekran tespit edildi.`);
  }
  if (topologyMetrics.crossRoleSectionMemberCount > 0) {
    score -= Math.min(20, topologyMetrics.crossRoleSectionMemberCount * 5);
    issues.push(`SECTION_ROLE_IMPURE: ${topologyMetrics.crossRoleSectionMemberCount} section üyesi bulunduğu bölümün component rolüyle uyumsuz.`);
  }
  if (identityIntentMetrics.underFulfilledIdentityIntentCount > 0) {
    score -= Math.min(30, identityIntentMetrics.underFulfilledIdentityIntentCount * 10);
    issues.push(`IDENTITY_INTENT_UNFULFILLED: ${identityIntentMetrics.underFulfilledIdentityIntentCount} ekran planlanan dominant/supporting rol veya yoğunluk profilini karşılamıyor.`);
  }
  if (ineffectiveIdentityRepairCount > 0 || exhaustedIdentityRepairCount > 0 || unnecessaryIdentityRepairCount > 0) {
    score -= Math.min(25, ineffectiveIdentityRepairCount * 10 + exhaustedIdentityRepairCount * 10 + unnecessaryIdentityRepairCount * 5);
    issues.push(`IDENTITY_REPAIR_INEFFECTIVE: ${ineffectiveIdentityRepairCount} etkisiz, ${exhaustedIdentityRepairCount} bütçesi tükenmiş ve ${unnecessaryIdentityRepairCount} gereksiz repair tespit edildi.`);
  }

  score = Math.max(0, score);
  return {
    score,
    passed: score >= 70 && screens.length === expectedCount && blueprintAlignment === 1 && navigationConsistency === 1 && navigationReachability === 1 && settingsCoverage === 1 && foreignDomainComponents === 0 && structuralMetrics.nestedCardCount === 0 && structuralMetrics.cardRatio <= 0.7 && structuralMetrics.surfaceRatio <= 0.75 && v2Violations.invalidFabCount === 0 && v2Violations.oversizedHeadingCount === 0 && contentMetrics.placeholderContentCount === 0 && contentMetrics.genericContentCount < 3 && contentMetrics.repeatedContentCount < 2 && contentMetrics.fallbackMetricFingerprint === 0 && semanticMetrics.underCoveredScreenCount === 0 && semanticMetrics.capabilityCoverage >= 0.5 && contractMetrics.underFulfilledContractCount === 0 && topologyMetrics.underCoveredTopologyScreenCount === 0 && topologyMetrics.sectionOwnershipCoverage === 1 && topologyMetrics.invalidSectionOrderCount === 0 && topologyMetrics.sectionContainerCoverage === 1 && topologyMetrics.orphanSectionOwnerCount === 0 && topologyMetrics.missingSectionHeadingCount === 0 && topologyMetrics.sectionMemberCoverage === 1 && topologyMetrics.orphanSemanticNodeCount === 0 && topologyMetrics.crossSectionMemberViolationCount === 0 && topologyMetrics.lowConfidenceSectionMemberCount === 0 && topologyMetrics.ambiguousSectionMemberCount === 0 && topologyMetrics.emptySectionContainerCount === 0 && topologyMetrics.imbalancedSectionScreenCount === 0 && topologyMetrics.crossRoleSectionMemberCount === 0 && sameArchetypeCollisionCount === 0 && structuralIdentityCollisionCount === 0 && identityIntentMetrics.underFulfilledIdentityIntentCount === 0 && ineffectiveIdentityRepairCount === 0 && exhaustedIdentityRepairCount === 0 && unnecessaryIdentityRepairCount === 0,
    issues,
    metrics: {
      screenCount: screens.length,
      blueprintAlignment,
      navigationConsistency,
      structureDiversity,
      screenDifferentiation,
      sameArchetypeDifferentiation,
      sameArchetypePairCount: sameArchetypeSimilarities.length,
      sameArchetypeCollisionCount,
      maxSameArchetypeSimilarity,
      structuralIdentityPairCount: structuralIdentitySimilarities.length,
      structuralIdentityCollisionCount,
      maxStructuralIdentitySimilarity,
      structuralIdentityDifferentiation,
      vocabularyCoverage,
      foreignDomainComponents,
      navigationReachability,
      settingsCoverage,
      ...structuralMetrics,
      ...v2Violations,
      ...contentMetrics,
      ...semanticMetrics,
      ...contractMetrics,
      ...topologyMetrics,
      ...identityIntentMetrics,
      contractRepairOperationCount,
      identityIntentRepairOperationCount,
      identityRepairAttemptCount,
      ineffectiveIdentityRepairCount,
      exhaustedIdentityRepairCount,
      unnecessaryIdentityRepairCount,
      averageIdentityRepairGain,
    },
  };
}

const CONTENT_PROP_KEYS = new Set(["text", "title", "subtitle", "trailing", "label", "placeholder", "message", "caption", "value", "trend", "description"]);
const CONTENT_NODE_TYPES_EXCLUDED = new Set(["Screen", "TopAppBar", "BottomNavigation", "TabBar"]);
const REPEAT_ALLOWLIST = new Set(["kaydet", "vazgeç", "devam", "paylaş", "güncelle", "tümü", "yeni", "takipte"]);
const PLACEHOLDER_PATTERNS = [
  /^(başlık|açıklama|metin|kategori|konum)$/u,
  /^(bir başlık girin|detayları yazın|gg\.aa\.yyyy)$/u,
  /^(yeni )?(kayıt|içerik)( \d+)?$/u,
];
const GENERIC_COPY = new Set([
  "ana gösterge", "aktif içerik", "son hareket", "sıradaki adım", "öne çıkan içerik",
  "güncel kayıt", "ilgili ayrıntılar ve güncel durum", "temel bilgiler", "ekip üyesi",
  "öne çıkan içgörü", "dönem karşılaştırması", "önerilen adım",
]);

function calculateContentMetrics(screens: DesignNode[]) {
  const occurrences = new Map<string, Set<number>>();
  let genericContentCount = 0;
  let placeholderContentCount = 0;
  const metricValues = new Set<string>();

  screens.forEach((screen, screenIndex) => {
    for (const node of flatten(asRecord(screen.root))) {
      const type = String(node.type ?? "");
      if (CONTENT_NODE_TYPES_EXCLUDED.has(type)) continue;
      const props = asRecord(node.props);
      for (const [key, raw] of Object.entries(props)) {
        if (!CONTENT_PROP_KEYS.has(key) || (typeof raw !== "string" && typeof raw !== "number")) continue;
        const normalized = normalizeContent(String(raw));
        if (!normalized) continue;
        if (PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(normalized))) placeholderContentCount += 1;
        if (GENERIC_COPY.has(normalized)) genericContentCount += 1;
        if (type === "Metric" && key === "value") metricValues.add(normalized.replace(/^%/u, ""));
        if (normalized.length < 8 || REPEAT_ALLOWLIST.has(normalized)) continue;
        const indexes = occurrences.get(normalized) ?? new Set<number>();
        indexes.add(screenIndex);
        occurrences.set(normalized, indexes);
      }
    }
  });

  const repeatedContentCount = [...occurrences.values()].filter((screenIndexes) => screenIndexes.size >= 2).length;
  const fallbackMetricFingerprint = ["68", "24", "91"].every((value) => metricValues.has(value)) ? 1 : 0;
  return { genericContentCount, placeholderContentCount, repeatedContentCount, fallbackMetricFingerprint };
}

function normalizeContent(value: string): string {
  return value.trim().replace(/\s+/gu, " ").toLocaleLowerCase("tr-TR");
}

const SEMANTIC_STOP_WORDS = new Set(["için", "ile", "ve", "veya", "bir", "bu", "tüm", "kendi", "olarak", "olan", "ekran", "kullanıcı"]);

function calculateSemanticCoverage(screens: DesignNode[], blueprint: ProductBlueprint) {
  const hasScreenContract = blueprint.screens.some((screen) => screen.purpose.trim() || screen.sections.some((section) => section.trim()));
  if (!hasScreenContract) {
    return { screenPurposeCoverage: 1, screenSectionCoverage: 1, capabilityCoverage: 1, underCoveredScreenCount: 0 };
  }

  const purposeScores: number[] = [];
  const sectionScores: number[] = [];
  let underCoveredScreenCount = 0;
  const allVisibleText: string[] = [];

  screens.forEach((screen, index) => {
    const visibleText = visibleContentText(screen);
    allVisibleText.push(visibleText);
    const planned = blueprint.screens[index];
    if (!planned) return;
    const purposeScore = phraseCoverage(planned.purpose, visibleText);
    const nonEmptySections = planned.sections.filter((section) => section.trim());
    const sectionScore = nonEmptySections.length
      ? nonEmptySections.reduce((total, section) => total + phraseCoverage(section, visibleText), 0) / nonEmptySections.length
      : 1;
    if (planned.purpose.trim()) purposeScores.push(purposeScore);
    if (nonEmptySections.length) sectionScores.push(sectionScore);
    if ((planned.purpose.trim() && purposeScore < 0.4) || (nonEmptySections.length && sectionScore < 0.5)) underCoveredScreenCount += 1;
  });

  const capabilityScores = blueprint.capabilities.filter((item) => item.trim()).map((capability) => phraseCoverage(capability, allVisibleText.join(" ")));
  return {
    screenPurposeCoverage: averageOrOne(purposeScores),
    screenSectionCoverage: averageOrOne(sectionScores),
    capabilityCoverage: averageOrOne(capabilityScores),
    underCoveredScreenCount,
  };
}

function calculateScreenContractCoverage(screens: DesignNode[], blueprint: ProductBlueprint) {
  const actionScores: number[] = [];
  const dataScores: number[] = [];
  let underFulfilledContractCount = 0;

  screens.forEach((screen, index) => {
    const contract = blueprint.screens[index]?.contract;
    if (!contract?.primaryAction.trim() && !contract?.requiredData.some((item) => item.trim())) return;
    const visibleText = visibleContentText(screen);
    const actionScore = phraseCoverage(contract.primaryAction, visibleText);
    const requiredData = contract.requiredData.filter((item) => item.trim());
    const dataScore = requiredData.length
      ? requiredData.reduce((total, item) => total + phraseCoverage(item, visibleText), 0) / requiredData.length
      : 1;
    actionScores.push(actionScore);
    dataScores.push(dataScore);
    if (actionScore < 0.5 || dataScore < 0.5) underFulfilledContractCount += 1;
  });

  return {
    primaryActionCoverage: averageOrOne(actionScores),
    requiredDataCoverage: averageOrOne(dataScores),
    underFulfilledContractCount,
  };
}

function calculateTopologyCoverage(screens: DesignNode[], blueprint: ProductBlueprint) {
  const scores: number[] = [];
  const ownershipScores: number[] = [];
  const containerScores: number[] = [];
  const memberScores: number[] = [];
  const semanticAssignmentScores: number[] = [];
  const assignmentMargins: number[] = [];
  const rolePurityScores: number[] = [];
  let underCoveredTopologyScreenCount = 0;
  let invalidSectionOrderCount = 0;
  let orphanSectionOwnerCount = 0;
  let missingSectionHeadingCount = 0;
  let orphanSemanticNodeCount = 0;
  let crossSectionMemberViolationCount = 0;
  let lowConfidenceSectionMemberCount = 0;
  let ambiguousSectionMemberCount = 0;
  let contractEvidenceAssignmentCount = 0;
  let emptySectionContainerCount = 0;
  let maxSectionMemberConcentration = 0;
  let imbalancedSectionScreenCount = 0;
  let crossRoleSectionMemberCount = 0;
  screens.forEach((screen, index) => {
    const requirements = blueprint.screens[index]?.contract?.sectionRoles ?? [];
    if (!requirements.length) return;
    const result = evaluateSectionTopology(asRecord(screen.root), requirements);
    const ownership = evaluateSectionOwnership(asRecord(screen.root), blueprint.screens[index]?.archetype, requirements);
    const containers = evaluateSectionContainers(asRecord(screen.root), requirements);
    const members = evaluateSectionMembers(asRecord(screen.root), requirements);
    scores.push(result.topologyRoleCoverage);
    ownershipScores.push(ownership.ownershipCoverage);
    containerScores.push(containers.containerCoverage);
    memberScores.push(members.memberCoverage);
    semanticAssignmentScores.push(members.semanticAssignmentConfidence);
    assignmentMargins.push(members.averageAssignmentMargin);
    rolePurityScores.push(members.rolePurity);
    if (result.topologyRoleCoverage < 1) underCoveredTopologyScreenCount += 1;
    if (!ownership.orderingValid) invalidSectionOrderCount += 1;
    orphanSectionOwnerCount += containers.orphanOwnedNodeCount;
    missingSectionHeadingCount += containers.missingHeadingCount;
    orphanSemanticNodeCount += members.orphanSemanticNodeCount;
    crossSectionMemberViolationCount += members.crossSectionViolationCount;
    lowConfidenceSectionMemberCount += members.lowConfidenceMemberCount;
    ambiguousSectionMemberCount += members.ambiguousMemberCount;
    contractEvidenceAssignmentCount += members.contractEvidenceAssignmentCount;
    emptySectionContainerCount += members.emptyContainerCount;
    maxSectionMemberConcentration = Math.max(maxSectionMemberConcentration, members.maxMemberConcentration);
    if (!members.distributionBalanced) imbalancedSectionScreenCount += 1;
    crossRoleSectionMemberCount += members.crossRoleMemberCount;
  });
  return {
    sectionTopologyCoverage: averageOrOne(scores),
    underCoveredTopologyScreenCount,
    sectionOwnershipCoverage: averageOrOne(ownershipScores),
    invalidSectionOrderCount,
    sectionContainerCoverage: averageOrOne(containerScores),
    orphanSectionOwnerCount,
    missingSectionHeadingCount,
    sectionMemberCoverage: averageOrOne(memberScores),
    orphanSemanticNodeCount,
    crossSectionMemberViolationCount,
    semanticMemberAssignmentConfidence: averageOrOne(semanticAssignmentScores),
    lowConfidenceSectionMemberCount,
    averageSectionAssignmentMargin: averageOrOne(assignmentMargins),
    ambiguousSectionMemberCount,
    contractEvidenceAssignmentCount,
    emptySectionContainerCount,
    maxSectionMemberConcentration,
    imbalancedSectionScreenCount,
    sectionRolePurity: averageOrOne(rolePurityScores),
    crossRoleSectionMemberCount,
  };
}

function calculateIdentityIntentFulfillment(screens: DesignNode[], blueprint: ProductBlueprint) {
  let evaluatedCount = 0;
  let fulfilledCount = 0;
  let identityRoleViolationCount = 0;
  let identityDensityViolationCount = 0;
  screens.forEach((screen, index) => {
    const intent = blueprint.screens[index]?.contract?.identityIntent;
    if (!intent) return;
    evaluatedCount += 1;
    const root = asRecord(screen.root);
    const containers = (Array.isArray(root.children) ? root.children.filter(isRecord) : [])
      .filter((node) => node.type === "Stack" && asRecord(node.props).semanticContainer === true);
    const roleCounts = new Map<string, number>();
    let totalMembers = 0;
    for (const container of containers) {
      const props = asRecord(container.props);
      const role = String(props.contractSectionRole ?? "");
      const members = (Array.isArray(container.children) ? container.children.filter(isRecord) : [])
        .filter((node) => !(node.type === "Text" && normalizeContent(String(asRecord(node.props).text ?? "")) === normalizeContent(String(props.contractSection ?? ""))));
      roleCounts.set(role, (roleCounts.get(role) ?? 0) + members.length);
      totalMembers += members.length;
    }
    const dominantCount = roleCounts.get(intent.dominantRole) ?? 0;
    const supportingCount = roleCounts.get(intent.supportingRole) ?? 0;
    const rolesFulfilled = dominantCount > supportingCount && supportingCount > 0;
    const densityFulfilled = intent.densityProfile === "focused"
      ? totalMembers <= 8
      : intent.densityProfile === "dense"
        ? totalMembers >= 9
        : totalMembers >= 5 && totalMembers <= 12;
    if (!rolesFulfilled) identityRoleViolationCount += 1;
    if (!densityFulfilled) identityDensityViolationCount += 1;
    if (rolesFulfilled && densityFulfilled) fulfilledCount += 1;
  });
  return {
    identityIntentCoverage: evaluatedCount ? fulfilledCount / evaluatedCount : 1,
    underFulfilledIdentityIntentCount: evaluatedCount - fulfilledCount,
    identityRoleViolationCount,
    identityDensityViolationCount,
  };
}

function visibleContentText(screen: DesignNode): string {
  const values: string[] = [];
  for (const node of flatten(asRecord(screen.root))) {
    if (CONTENT_NODE_TYPES_EXCLUDED.has(String(node.type ?? ""))) continue;
    for (const [key, value] of Object.entries(asRecord(node.props))) {
      if (CONTENT_PROP_KEYS.has(key) && (typeof value === "string" || typeof value === "number")) values.push(String(value));
    }
  }
  return normalizeContent(values.join(" "));
}

function phraseCoverage(expected: string, actual: string): number {
  const expectedTokens = semanticTokens(expected);
  if (!expectedTokens.length) return 1;
  const actualTokens = new Set(semanticTokens(actual));
  const covered = expectedTokens.filter((token) => actualTokens.has(token)).length;
  return covered / expectedTokens.length;
}

function semanticTokens(value: string): string[] {
  return normalizeContent(value)
    .match(/[\p{L}\p{N}]+/gu)
    ?.filter((token) => token.length >= 4 && !SEMANTIC_STOP_WORDS.has(token))
    .map((token) => token.length > 5 ? token.slice(0, 5) : token) ?? [];
}

function averageOrOne(values: number[]): number {
  return values.length ? values.reduce((total, value) => total + value, 0) / values.length : 1;
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
    if (isFocusedFlow && hasPersistentBottomNavigation) focusedFlowBottomNavViolations += 1;

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

function structuralIdentitySignature(screen: DesignNode): string[] {
  const root = asRecord(screen.root);
  const containers = (Array.isArray(root.children) ? root.children.filter(isRecord) : [])
    .filter((node) => node.type === "Stack" && asRecord(node.props).semanticContainer === true);
  if (containers.length < 2) return [];
  return containers.flatMap((container, sectionIndex) => {
    const props = asRecord(container.props);
    const role = String(props.contractSectionRole ?? "unknown");
    const members = (Array.isArray(container.children) ? container.children.filter(isRecord) : [])
      .filter((node) => !(node.type === "Text" && normalizeContent(String(asRecord(node.props).text ?? "")) === normalizeContent(String(props.contractSection ?? ""))));
    const sizeBucket = members.length <= 1 ? String(members.length) : members.length <= 3 ? "2-3" : "4+";
    const inventory = members.flatMap((member) => flatten(member))
      .map((node) => String(node.type ?? ""))
      .filter((type) => type && !["Text", "Divider", "Icon", "Stack", "Row", "Grid", "Group"].includes(type))
      .sort();
    return [`section:${sectionIndex}:${role}:size:${sizeBucket}`, ...inventory.map((type) => `section:${sectionIndex}:${role}:component:${type}`)];
  });
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

function combinedStructuralSimilarity(left: string[], right: string[]): number {
  const positional = similarity(left, right);
  const leftCounts = frequency(left);
  const rightCounts = frequency(right);
  const shared = [...leftCounts.entries()].reduce((total, [type, count]) => total + Math.min(count, rightCounts.get(type) ?? 0), 0);
  const inventory = left.length + right.length ? (2 * shared) / (left.length + right.length) : 1;
  return positional * 0.6 + inventory * 0.4;
}

function frequency(values: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
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
