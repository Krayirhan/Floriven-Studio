import { describe, expect, it } from "vitest";
import { COMPONENT_TYPES, CONTAINER_TYPES, isComponentType } from "./componentRegistry";

describe("AI component registry", () => {
  it("only accepts known declarative component types", () => {
    expect(isComponentType("Card")).toBe(true);
    expect(isComponentType("BalanceCard")).toBe(false);
    expect(isComponentType("script")).toBe(false);
  });

  it("keeps all containers in the allowlist", () => {
    for (const type of CONTAINER_TYPES) expect(COMPONENT_TYPES).toContain(type);
  });

  it("keeps the complete Serene Health domain set renderable", () => {
    const healthTypes = ["CareSummary", "MedicationTimeline", "MedicationDoseRow", "HealthMetric", "UnitInput", "RangeChart", "TargetRange", "StatusAlert", "SafetyNotice", "SuccessFeedback"];
    expect(healthTypes.every(isComponentType)).toBe(true);
    expect(COMPONENT_TYPES).toHaveLength(72);
  });

  it("keeps the complete Editorial Culture domain set renderable", () => {
    const editorialTypes = ["EditorialHero", "FeatureStory", "StoryCard", "Byline", "MetadataStrip", "PullQuote", "SectionIndex", "ArchiveEntry"];
    expect(editorialTypes.every(isComponentType)).toBe(true);
    expect(COMPONENT_TYPES).toHaveLength(72);
  });

  it("keeps the complete Terracotta Market domain set renderable", () => {
    const commerceTypes = ["CommerceHero","ProductCard","PriceBlock","ProductGallery","VariantSelector","CartLine","OrderSummary","DeliveryPromise"];
    expect(commerceTypes.every(isComponentType)).toBe(true);
    expect(COMPONENT_TYPES).toHaveLength(72);
  });
  it("keeps the complete Electric Learning domain set renderable",()=>{const types=["LearningHero","XpProgress","StreakBadge","LessonCard","RoadmapStep","QuizChoice","AnswerFeedback","AchievementBadge"];expect(types.every(isComponentType)).toBe(true);expect(COMPONENT_TYPES).toHaveLength(72)});
  it("keeps the complete Obsidian Precision domain set renderable",()=>{const types=["CommandSummary","SignalChart","RiskIndicator","OperationRow","IncidentTimeline","DataMatrix","ControlToggle","AuditEntry"];expect(types.every(isComponentType)).toBe(true);expect(COMPONENT_TYPES).toHaveLength(72)});
});
