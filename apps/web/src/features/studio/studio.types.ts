import type { DesignNode, DesignSpec, Screen } from "@floriven/design-spec";

export type LeftTab = "screens" | "layers" | "components" | "assets" | "ai";
export type RightTab = "design" | "prototype";

export type StudioScreen = Screen;
export type StudioDocument = DesignSpec;
export type StudioNode = DesignNode;

export type JournalEntry = {
  id: string;
  type: "generate" | "edit" | "analyze" | "apply" | "variant";
  message: string;
  detail?: string;
  timestamp: number;
  screenIds?: string[];
};
