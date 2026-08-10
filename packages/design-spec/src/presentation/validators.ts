import type { PresentationSpecV2 } from "./contracts";

export function validatePresentationSpecV2(spec: PresentationSpecV2): string[] {
  const issues: string[] = [];
  if (spec.version !== "2.0.0") issues.push("UNSUPPORTED_VERSION");
  if (!spec.identity.mode) issues.push("IDENTITY_MODE_REQUIRED");
  if (!spec.typography.family || !spec.typography.displayFamily) issues.push("TYPOGRAPHY_FAMILY_REQUIRED");
  if (spec.spacing.sectionGap < 0 || spec.spacing.contentInset < 0) issues.push("NEGATIVE_SPACING");
  if (!spec.cards.types.length) issues.push("CARD_TYPES_REQUIRED");
  if (!spec.charts.types.length) issues.push("CHART_TYPES_REQUIRED");
  if (!spec.controls.types.length) issues.push("CONTROL_TYPES_REQUIRED");
  if (!spec.fields.styles.length) issues.push("FIELD_STYLES_REQUIRED");
  if (!spec.navigation.modes.includes(spec.navigation.active)) issues.push("ACTIVE_NAVIGATION_NOT_ALLOWED");
  return issues;
}
