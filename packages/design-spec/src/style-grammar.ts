import type { DesignTemplateId, DesignTemplate } from "./strategy";

export type StyleGrammar = {
  presetId: DesignTemplateId;
  palette: DesignTemplate["strategy"]["palette"];
  typography: "technical" | "human" | "editorial" | "playful" | "neutral";
  surface: "flat" | "layered" | "soft" | "crisp";
  density: DesignTemplate["strategy"]["density"];
  radius: "sharp" | "restrained" | "soft" | "expressive";
  accentBudget: "restrained" | "functional" | "expressive";
  elevation: "none" | "selective" | "layered";
};

export const STYLE_GRAMMARS: Record<DesignTemplateId, StyleGrammar> = {
  "obsidian-precision": { presetId: "obsidian-precision", palette: "obsidian", typography: "technical", surface: "crisp", density: "compact", radius: "sharp", accentBudget: "functional", elevation: "selective" },
  "serene-health": { presetId: "serene-health", palette: "serene", typography: "human", surface: "soft", density: "comfortable", radius: "soft", accentBudget: "restrained", elevation: "selective" },
  "terracotta-market": { presetId: "terracotta-market", palette: "terracotta", typography: "editorial", surface: "layered", density: "comfortable", radius: "expressive", accentBudget: "functional", elevation: "layered" },
  "electric-learning": { presetId: "electric-learning", palette: "electric", typography: "playful", surface: "soft", density: "comfortable", radius: "expressive", accentBudget: "expressive", elevation: "selective" },
  "editorial-culture": { presetId: "editorial-culture", palette: "editorial", typography: "editorial", surface: "flat", density: "spacious", radius: "sharp", accentBudget: "restrained", elevation: "none" },
};

export function resolveStyleGrammar(presetId: DesignTemplateId): StyleGrammar {
  return STYLE_GRAMMARS[presetId];
}

