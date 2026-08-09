import type { UXScreenSpec } from "./ux-spec";

export type PatternId = "TransactionRow" | "InvoiceRow" | "SettingsRow" | "KeyValueRow" | "SearchBar" | "FilterBar" | "SummaryMetric" | "FormField" | "FormSection" | "DetailSection" | "ChartSection" | "EmptyState";

export type PatternDefinition = {
  id: PatternId;
  archetypes: UXScreenSpec["archetype"][];
  semanticRole: string;
  requiredData: readonly string[];
};

export const PATTERN_REGISTRY: Record<PatternId, PatternDefinition> = {
  TransactionRow: { id: "TransactionRow", archetypes: ["management_list"], semanticRole: "entity-row", requiredData: ["title", "amount"] },
  InvoiceRow: { id: "InvoiceRow", archetypes: ["management_list"], semanticRole: "entity-row", requiredData: ["title", "amount", "status"] },
  SettingsRow: { id: "SettingsRow", archetypes: ["settings", "profile"], semanticRole: "setting-row", requiredData: ["label"] },
  KeyValueRow: { id: "KeyValueRow", archetypes: ["detail"], semanticRole: "property-row", requiredData: ["label", "value"] },
  SearchBar: { id: "SearchBar", archetypes: ["management_list"], semanticRole: "search", requiredData: ["placeholder"] },
  FilterBar: { id: "FilterBar", archetypes: ["management_list"], semanticRole: "filter", requiredData: ["options"] },
  SummaryMetric: { id: "SummaryMetric", archetypes: ["dashboard", "detail"], semanticRole: "metric", requiredData: ["label", "value"] },
  FormField: { id: "FormField", archetypes: ["form"], semanticRole: "input", requiredData: ["label", "fieldType"] },
  FormSection: { id: "FormSection", archetypes: ["form"], semanticRole: "input-group", requiredData: ["title"] },
  DetailSection: { id: "DetailSection", archetypes: ["detail"], semanticRole: "detail-group", requiredData: ["title"] },
  ChartSection: { id: "ChartSection", archetypes: ["dashboard"], semanticRole: "chart-group", requiredData: ["title", "measure"] },
  EmptyState: { id: "EmptyState", archetypes: ["dashboard", "management_list", "settings", "form", "detail", "profile"], semanticRole: "empty-state", requiredData: ["title"] },
};

export const ARCHETYPE_PATTERN_ALLOWLIST: Record<UXScreenSpec["archetype"], readonly PatternId[]> = {
  dashboard: ["SummaryMetric", "ChartSection", "EmptyState"],
  management_list: ["TransactionRow", "InvoiceRow", "SearchBar", "FilterBar", "SummaryMetric", "EmptyState"],
  settings: ["SettingsRow", "EmptyState"],
  form: ["FormSection", "FormField", "EmptyState"],
  detail: ["KeyValueRow", "SummaryMetric", "DetailSection", "EmptyState"],
  profile: ["SettingsRow", "EmptyState"],
};

export function allowedPatternsForArchetype(archetype: UXScreenSpec["archetype"]): readonly PatternId[] {
  return ARCHETYPE_PATTERN_ALLOWLIST[archetype];
}

/** Validates a planned pattern sequence before primitive composition starts. */
export function validatePatternPlan(screen: UXScreenSpec, patternIds: readonly PatternId[]): string[] {
  const allowed = new Set(allowedPatternsForArchetype(screen.archetype));
  const issues = patternIds.filter((patternId) => !allowed.has(patternId)).map((patternId) => `PATTERN_NOT_ALLOWED:${patternId}`);
  if (patternIds.length === 0) issues.push("PATTERN_PLAN_EMPTY");
  return [...new Set(issues)];
}

export function validatePatternUse(patternId: PatternId, screen: UXScreenSpec, data: Record<string, unknown>): string[] {
  const pattern = PATTERN_REGISTRY[patternId];
  const issues: string[] = [];
  if (!pattern.archetypes.includes(screen.archetype)) issues.push("PATTERN_ARCHETYPE_MISMATCH");
  for (const key of pattern.requiredData) if (data[key] === undefined || data[key] === "") issues.push(`PATTERN_DATA_REQUIRED:${key}`);
  return issues;
}
