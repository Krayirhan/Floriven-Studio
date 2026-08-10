import type { PresentationSpec } from "./presentation-spec";
import type { PresentationSpecV2 } from "./presentation/contracts";

/**
 * Keeps the DOM renderer backwards compatible while making V2 the source of
 * truth for runtime presentation decisions.
 */
export function adaptPresentationV2ToRuntime(input: PresentationSpecV2): PresentationSpec {
  const cardStyle: PresentationSpec["cardStyle"] = input.geometry.radius === "0"
    ? "minimal"
    : input.geometry.elevation === "playful"
      ? "playful"
      : input.geometry.elevation === "soft" || input.geometry.elevation === "layered"
        ? "soft"
        : "crisp";
  return {
    version: "1.0.0",
    palette: input.palette.name,
    cardStyle,
    density: input.spacing.density,
    navigationStyle: input.navigation.active,
    visualDirection: `${input.identity.mode}:${input.identity.sourcePresetId ?? "auto"}`,
    cardFamilies: input.cards.types,
    chartTypes: input.charts.types,
  };
}

export function isPresentationSpecV2(input: PresentationSpec | PresentationSpecV2): input is PresentationSpecV2 {
  return input.version === "2.0.0";
}
