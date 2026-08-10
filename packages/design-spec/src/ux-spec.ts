import type { ProductBlueprint, ProductScreenPlan } from "./product-blueprint";
import { createScreenIntent, type ScreenIntent } from "./screen-intent";

export type NavigationMode = "root" | "focused" | "modal" | "wizard";
export type ContentDensity = "low" | "medium" | "high";
export type SemanticActionIntent = "create" | "edit" | "delete" | "save" | "cancel" | "search" | "filter" | "select" | "navigate" | "share" | "confirm";

export type UXScreenSpec = {
  screenId: string;
  archetype: "dashboard" | "management_list" | "settings" | "form" | "detail" | "profile";
  navigationMode: NavigationMode;
  contentDensity: ContentDensity;
  primaryAction?: { id: string; intent: SemanticActionIntent; target: string };
};

export type UXSpec = {
  version: "1.0.0";
  blueprint: Pick<ProductBlueprint, "productDomain" | "audience" | "entities" | "capabilities" | "contentVocabulary" | "navigation" | "screenPolicy">;
  screens: ScreenIntent[];
};

export function createUXSpec(blueprint: ProductBlueprint): UXSpec {
  return {
    version: "1.0.0",
    blueprint: {
      productDomain: blueprint.productDomain,
      audience: blueprint.audience,
      entities: blueprint.entities,
      capabilities: blueprint.capabilities,
      contentVocabulary: blueprint.contentVocabulary,
      navigation: blueprint.navigation,
      screenPolicy: blueprint.screenPolicy,
    },
    screens: blueprint.screens.map(toUXScreen).map(createScreenIntent),
  };
}

function toUXScreen(screen: ProductScreenPlan): UXScreenSpec {
  const archetype = screen.role === "overview" ? "dashboard" : screen.role === "settings" ? "settings" : screen.role === "form" || screen.role === "onboarding" ? "form" : screen.role === "detail" ? "detail" : "management_list";
  return {
    screenId: screen.id,
    archetype,
    navigationMode: screen.role === "form" || screen.role === "detail" ? "focused" : "root",
    contentDensity: archetype === "management_list" ? "high" : "medium",
  };
}
