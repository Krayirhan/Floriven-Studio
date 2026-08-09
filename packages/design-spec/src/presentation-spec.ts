import type { DesignStrategy } from "./strategy";

/** Visual-only choices. This contract deliberately has no screen, route, action, or domain fields. */
export type PresentationSpec = {
  version: "1.0.0";
  palette: DesignStrategy["palette"];
  cardStyle: DesignStrategy["cardStyle"];
  density: DesignStrategy["density"];
  navigationStyle: DesignStrategy["navigationStyle"];
  visualDirection: string;
};

export function createPresentationSpec(strategy: DesignStrategy): PresentationSpec {
  return {
    version: "1.0.0",
    palette: strategy.palette,
    cardStyle: strategy.cardStyle,
    density: strategy.density,
    navigationStyle: strategy.navigationStyle,
    visualDirection: strategy.visualDirection,
  };
}
