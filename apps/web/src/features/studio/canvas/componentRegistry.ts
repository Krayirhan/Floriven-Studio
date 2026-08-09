/**
 * Canonical component allowlist shared by the editor renderer and AI boundary.
 * A model may only emit these declarative primitives.
 */
export const COMPONENT_TYPES = [
  "Screen", "SafeArea", "ScrollView", "Stack", "Row", "Grid", "Text", "Image", "Icon",
  "Button", "IconButton", "TextField", "SearchField", "Checkbox", "Switch", "Card", "ListItem",
  "Divider", "Badge", "Avatar", "TabBar", "BottomNavigation", "TopAppBar", "Modal", "Form", "Progress",
  "Metric", "Chart", "SegmentedControl", "FloatingActionButton",
  "CareSummary", "MedicationTimeline", "MedicationDoseRow", "HealthMetric", "UnitInput",
  "RangeChart", "TargetRange", "StatusAlert", "SafetyNotice", "SuccessFeedback",
  "EditorialHero", "FeatureStory", "StoryCard", "Byline", "MetadataStrip",
  "PullQuote", "SectionIndex", "ArchiveEntry",
  "CommerceHero", "ProductCard", "PriceBlock", "ProductGallery",
  "VariantSelector", "CartLine", "OrderSummary", "DeliveryPromise",
  "LearningHero", "XpProgress", "StreakBadge", "LessonCard",
  "RoadmapStep", "QuizChoice", "AnswerFeedback", "AchievementBadge",
  "CommandSummary", "SignalChart", "RiskIndicator", "OperationRow",
  "IncidentTimeline", "DataMatrix", "ControlToggle", "AuditEntry",
] as const;

export type ComponentType = typeof COMPONENT_TYPES[number];

export function isComponentType(type: string): type is ComponentType {
  return COMPONENT_TYPES.includes(type as ComponentType);
}

export const CONTAINER_TYPES = new Set<ComponentType>([
  "Screen", "SafeArea", "ScrollView", "Stack", "Row", "Grid", "Card", "Modal", "Form",
]);
