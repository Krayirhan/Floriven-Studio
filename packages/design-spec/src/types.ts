/** DesignSpec v1 TypeScript tipleri — DESIGN_SPEC.md sözleşmesinden türetilmiştir. */

export type LayoutMode = "column" | "row" | "stack" | "grid" | "absolute" | "scroll";

export type ActionType =
  | "navigate"
  | "back"
  | "openModal"
  | "closeModal"
  | "setLocalState"
  | "submitForm"
  | "openUrl";

export interface A11y {
  role: string;
  label: string;
  hint?: string;
  state?: Record<string, unknown>;
  order?: number;
}

export interface Layout {
  mode: LayoutMode;
  gap?: string;
  padding?: string;
  wrap?: boolean;
}

export interface Action {
  type: ActionType;
  targetScreenId?: string;
  params?: Record<string, unknown>;
}

export interface Interaction {
  event: string;
  action: Action;
}

export interface DesignNode {
  id: string;
  type: string;
  props: Record<string, unknown>;
  layout?: Layout;
  children?: DesignNode[];
  interactions?: Interaction[];
  a11y?: A11y;
  visibility?: boolean | string;
  bindings?: Record<string, unknown>;
}

export interface Screen {
  id: string;
  name: string;
  route?: string;
  root: DesignNode;
}

export interface Flow {
  from: string;
  to: string;
  trigger: string;
}

export interface DesignSpec {
  schemaVersion: string;
  projectId: string;
  platform: "ios" | "android" | "cross-platform";
  locale: string;
  deviceProfile: string;
  tokens: Record<string, unknown>;
  assets: unknown[];
  components: Record<string, unknown>;
  screens: Screen[];
  flows: Flow[];
  metadata: Record<string, unknown>;
}

export type PatchOp =
  | "addNode"
  | "removeNode"
  | "moveNode"
  | "replaceProps"
  | "replaceLayout"
  | "setToken"
  | "addScreen"
  | "removeScreen";

export interface PatchOperation {
  op: PatchOp;
  nodeId?: string;
  value?: unknown;
}

export interface DesignSpecPatch {
  baseRevision: number;
  operations: PatchOperation[];
}
