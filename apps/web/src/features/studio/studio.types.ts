import type { DesignNode, DesignSpec, Screen } from "@floriven/design-spec";

export type LeftTab = "screens" | "layers" | "components" | "assets";
export type RightTab =
  "design" | "prototype" | "content" | "accessibility" | "ai";

export type StudioScreen = Screen;
export type StudioDocument = DesignSpec;
export type StudioNode = DesignNode;
