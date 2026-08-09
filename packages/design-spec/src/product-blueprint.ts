export type ProductScreenRole = "overview" | "core" | "detail" | "form" | "support" | "settings" | "onboarding";

export interface ProductScreenPlan {
  id: string;
  name: string;
  route: string;
  purpose: string;
  sections: string[];
  role: ProductScreenRole;
  priority: "primary" | "secondary" | "tertiary";
  parentId?: string;
  navigationPlacement: "primary" | "hierarchical" | "utility" | "hidden";
}

export interface ProductNavigationPlan {
  primaryScreenIds: string[];
  utilityScreenIds: string[];
}

export interface ProductScreenPolicy {
  requestedCount?: number;
  minCount: number;
  maxCount: number;
  rationale: string;
}

export interface ProductBlueprint {
  productDomain: string;
  audience: string;
  entities: string[];
  capabilities: string[];
  contentVocabulary: string[];
  screens: ProductScreenPlan[];
  navigation: ProductNavigationPlan;
  screenPolicy: ProductScreenPolicy;
}

export type DomainCapabilityPackId = "health-care" | "commerce" | "learning" | "publishing" | "operations";

export interface DomainCapabilityPack {
  id: DomainCapabilityPackId;
  activationSignals: readonly string[];
  componentTypes: readonly string[];
}
