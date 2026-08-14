export const COMPONENT_CONTRACTS_VERSION = "1.0.0" as const;

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; issues: string[] };

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function exactKeys(obj: Record<string, unknown>, allowed: string[], path: string, issues: string[]): void {
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(obj)) {
    if (!allowedSet.has(key)) issues.push(`${path}: unknown key ${key}`);
  }
}

function nonEmptyString(val: unknown, path: string, issues: string[], maxLen = 500): boolean {
  if (typeof val !== "string" || val.trim().length === 0) {
    issues.push(`${path}: non-empty string required`);
    return false;
  }
  if (val.length > maxLen) {
    issues.push(`${path}: must be at most ${maxLen} characters`);
    return false;
  }
  return true;
}

// --- Specific Prop Interfaces ---

export type TextProps = {
  text: string;
  variant?: "body" | "title" | "heading" | "caption" | "label";
  tone?: "neutral" | "primary" | "critical" | "attention" | "positive" | "accent";
};

export type ImageProps = {
  alt: string;
  src?: string;
};

export type IconProps = {
  name: string;
};

export type ButtonProps = {
  label: string;
  icon?: string;
  variant?: "filled" | "outlined" | "ghost" | "tonal";
  tone?: "neutral" | "primary" | "critical" | "accent";
};

export type IconButtonProps = {
  icon: string;
  label?: string;
};

export type TextFieldProps = {
  label: string;
  placeholder?: string;
  value?: string;
};

export type SearchFieldProps = {
  placeholder: string;
  label?: string;
  value?: string;
};

export type CheckboxProps = {
  label: string;
  checked?: boolean;
};

export type SwitchProps = {
  label: string;
  checked?: boolean;
};

export type CardProps = {
  title?: string;
  subtitle?: string;
  variant?: "elevated" | "outlined" | "flat";
  family?: string;
  tone?: "neutral" | "primary" | "critical" | "attention" | "positive" | "accent";
};

export type ListItemProps = {
  title: string;
  subtitle?: string;
  trailing?: string;
  icon?: string;
  tone?: "neutral" | "primary" | "critical" | "attention" | "positive" | "accent";
};

export type DividerProps = Record<string, never>;

export type BadgeProps = {
  label: string;
  tone?: "neutral" | "primary" | "critical" | "attention" | "positive" | "accent";
};

export type AvatarProps = {
  initials?: string;
  src?: string;
  alt?: string;
};

export type TabBarProps = {
  items: string[];
};

export type BottomNavigationProps = {
  items: string[];
};

export type TopAppBarProps = {
  title: string;
  action?: string;
};

export type ModalProps = Record<string, never>;
export type FormProps = Record<string, never>;

export type ProgressProps = {
  value: number;
  label?: string;
  tone?: "neutral" | "primary" | "critical" | "attention" | "positive" | "accent";
};

export type MetricProps = {
  label: string;
  value: string;
  caption?: string;
  tone?: "neutral" | "primary" | "critical" | "attention" | "positive" | "accent";
};

export type ChartProps = {
  label: string;
  values: number[];
  chartType?: "line" | "bar" | "area" | "donut" | "radial";
  tone?: "neutral" | "primary" | "critical" | "attention" | "positive" | "accent";
};

export type SegmentedControlProps = {
  items: string[];
  selected?: string;
};

export type FloatingActionButtonProps = {
  icon: string;
  label?: string;
};

export type CalendarProps = {
  label: string;
  days: string[];
  events: string[];
  timeSlots?: string[];
};

export type TimelineProps = {
  label: string;
  events: string[];
};

export type GalleryProps = {
  label: string;
  items: string[];
};

export type KanbanBoardProps = {
  label: string;
  columns: string[];
  cards: string[];
};

export type MapViewProps = {
  label: string;
  markers: string[];
  routes?: string[];
};

// Domain - Health
export type CareSummaryProps = {
  title: string;
  subtitle: string;
  progress: number;
  status?: "normal" | "due" | "attention" | "critical" | "overdue";
};

export type MedicationTimelineProps = {
  label: string;
  items: string[];
};

export type MedicationDoseRowProps = {
  name: string;
  dose: string;
  instruction: string;
  time: string;
  status: "scheduled" | "taken" | "due" | "overdue" | "attention";
};

export type HealthMetricProps = {
  label: string;
  value: string;
  unit: string;
  caption?: string;
  status?: "normal" | "attention" | "critical";
};

export type UnitInputProps = {
  label: string;
  value: string;
  unit: string;
  hint?: string;
};

export type RangeChartProps = {
  label: string;
  unit: string;
  values: number[];
  minimum: number;
  maximum: number;
  targetMinimum?: number;
  targetMaximum?: number;
};

export type TargetRangeProps = {
  label: string;
  value: number;
  unit: string;
  minimum: number;
  maximum: number;
};

export type StatusAlertProps = {
  title: string;
  message: string;
  severity: "normal" | "attention" | "critical";
};

export type SafetyNoticeProps = {
  title: string;
  message: string;
};

export type SuccessFeedbackProps = {
  title: string;
  message: string;
};

// Domain - Editorial
export type EditorialHeroProps = {
  kicker: string;
  headline: string;
  dek: string;
  issue: string;
  date: string;
};

export type FeatureStoryProps = {
  category: string;
  title: string;
  summary: string;
};

export type StoryCardProps = {
  index: string;
  category: string;
  title: string;
  summary: string;
};

export type BylineProps = {
  author: string;
  role: string;
};

export type MetadataStripProps = {
  date: string;
  readingTime: string;
  edition: string;
};

export type PullQuoteProps = {
  quote: string;
  attribution: string;
};

export type SectionIndexProps = {
  items: string[];
};

export type ArchiveEntryProps = {
  number: string;
  date: string;
  title: string;
  theme: string;
};

// Domain - Commerce
export type CommerceHeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
};

export type ProductCardProps = {
  name: string;
  price: string;
  description: string;
  badge?: string;
  maker?: string;
  status?: string;
};

export type PriceBlockProps = {
  label: string;
  price: string;
  compareAt?: string;
  taxNote?: string;
};

export type ProductGalleryProps = {
  alt: string;
  current?: number;
  total?: number;
};

export type VariantSelectorProps = {
  label: string;
  options: string[];
};

export type CartLineProps = {
  name: string;
  variant: string;
  price: string;
  quantity?: number;
};

export type OrderSummaryProps = {
  title: string;
  subtotal: string;
  shipping: string;
  total: string;
};

export type DeliveryPromiseProps = {
  title: string;
  detail: string;
};

// Domain - Learning
export type LearningHeroProps = {
  eyebrow: string;
  title: string;
  mission: string;
  reward: string;
};

export type XpProgressProps = {
  label: string;
  current: string;
  target: string;
  value: number;
  nextReward?: string;
};

export type StreakBadgeProps = {
  days: number;
  message: string;
};

export type LessonCardProps = {
  level: string;
  topic: string;
  title: string;
  duration: string;
  status: string;
};

export type RoadmapStepProps = {
  order: string;
  title: string;
  description: string;
  state: "completed" | "current" | "locked";
};

export type QuizChoiceProps = {
  key: string;
  label: string;
  state?: "default" | "selected";
};

export type AnswerFeedbackProps = {
  result: "correct" | "incorrect";
  title: string;
  explanation: string;
};

export type AchievementBadgeProps = {
  title: string;
  description: string;
  icon?: string;
  earnedAt?: string;
};

// Domain - Ops / Precision
export type CommandSummaryProps = {
  eyebrow: string;
  status: string;
  value: string;
  title: string;
  detail: string;
};

export type SignalChartProps = {
  label: string;
  window: string;
  unit: string;
  values: number[];
  annotation?: string;
};

export type RiskIndicatorProps = {
  label: string;
  value: string;
  explanation: string;
  severity: "low" | "medium" | "high" | "critical";
};

export type OperationRowProps = {
  name: string;
  owner: string;
  updatedAt: string;
  status: string;
  metric?: string;
};

export type IncidentTimelineProps = {
  label: string;
  events: string[];
};

export type DataMatrixProps = {
  columns: string[];
  rows: string[];
};

export type ControlToggleProps = {
  label: string;
  description: string;
  state: string;
  guard?: string;
};

export type AuditEntryProps = {
  time: string;
  actor: string;
  action: string;
  target: string;
};

// Containers & Layout primitives
export type ScreenProps = Record<string, never>;
export type SafeAreaProps = Record<string, never>;
export type ScrollViewProps = Record<string, never>;
export type StackProps = Record<string, never>;
export type RowProps = Record<string, never>;
export type GridProps = Record<string, never>;

// --- Full Component Map & Union ---

export type ComponentPropsMap = {
  Screen: ScreenProps;
  SafeArea: SafeAreaProps;
  ScrollView: ScrollViewProps;
  Stack: StackProps;
  Row: RowProps;
  Grid: GridProps;
  Text: TextProps;
  Image: ImageProps;
  Icon: IconProps;
  Button: ButtonProps;
  IconButton: IconButtonProps;
  TextField: TextFieldProps;
  SearchField: SearchFieldProps;
  Checkbox: CheckboxProps;
  Switch: SwitchProps;
  Card: CardProps;
  ListItem: ListItemProps;
  Divider: DividerProps;
  Badge: BadgeProps;
  Avatar: AvatarProps;
  TabBar: TabBarProps;
  BottomNavigation: BottomNavigationProps;
  TopAppBar: TopAppBarProps;
  Modal: ModalProps;
  Form: FormProps;
  Progress: ProgressProps;
  Metric: MetricProps;
  Chart: ChartProps;
  SegmentedControl: SegmentedControlProps;
  FloatingActionButton: FloatingActionButtonProps;
  Calendar: CalendarProps;
  Timeline: TimelineProps;
  Gallery: GalleryProps;
  KanbanBoard: KanbanBoardProps;
  MapView: MapViewProps;
  CareSummary: CareSummaryProps;
  MedicationTimeline: MedicationTimelineProps;
  MedicationDoseRow: MedicationDoseRowProps;
  HealthMetric: HealthMetricProps;
  UnitInput: UnitInputProps;
  RangeChart: RangeChartProps;
  TargetRange: TargetRangeProps;
  StatusAlert: StatusAlertProps;
  SafetyNotice: SafetyNoticeProps;
  SuccessFeedback: SuccessFeedbackProps;
  EditorialHero: EditorialHeroProps;
  FeatureStory: FeatureStoryProps;
  StoryCard: StoryCardProps;
  Byline: BylineProps;
  MetadataStrip: MetadataStripProps;
  PullQuote: PullQuoteProps;
  SectionIndex: SectionIndexProps;
  ArchiveEntry: ArchiveEntryProps;
  CommerceHero: CommerceHeroProps;
  ProductCard: ProductCardProps;
  PriceBlock: PriceBlockProps;
  ProductGallery: ProductGalleryProps;
  VariantSelector: VariantSelectorProps;
  CartLine: CartLineProps;
  OrderSummary: OrderSummaryProps;
  DeliveryPromise: DeliveryPromiseProps;
  LearningHero: LearningHeroProps;
  XpProgress: XpProgressProps;
  StreakBadge: StreakBadgeProps;
  LessonCard: LessonCardProps;
  RoadmapStep: RoadmapStepProps;
  QuizChoice: QuizChoiceProps;
  AnswerFeedback: AnswerFeedbackProps;
  AchievementBadge: AchievementBadgeProps;
  CommandSummary: CommandSummaryProps;
  SignalChart: SignalChartProps;
  RiskIndicator: RiskIndicatorProps;
  OperationRow: OperationRowProps;
  IncidentTimeline: IncidentTimelineProps;
  DataMatrix: DataMatrixProps;
  ControlToggle: ControlToggleProps;
  AuditEntry: AuditEntryProps;
};

export type AllComponentType = keyof ComponentPropsMap;

export type V3ComponentProps = {
  [K in AllComponentType]: { type: K; props: ComponentPropsMap[K] };
}[AllComponentType];

export type ComponentCategory =
  | "layout"
  | "general"
  | "navigation"
  | "action"
  | "input"
  | "data-display"
  | "feedback"
  | "domain-health"
  | "domain-editorial"
  | "domain-commerce"
  | "domain-learning"
  | "domain-ops";

export type ComponentDefinition<T extends AllComponentType = AllComponentType> = {
  type: T;
  category: ComponentCategory;
  requiredProps: (keyof ComponentPropsMap[T])[];
  optionalProps: (keyof ComponentPropsMap[T])[];
  jsonSchema: Record<string, unknown>;
  a11yRules: { role: string; labelRequired: boolean };
  validate: (props: unknown, path: string, issues: string[]) => ComponentPropsMap[T] | undefined;
};

// --- Validator Helpers ---

function stringArray(value: unknown, path: string, issues: string[], opts?: { min?: number; max?: number }): string[] | undefined {
  if (!Array.isArray(value)) {
    issues.push(`${path}: array of strings required`);
    return undefined;
  }
  const min = opts?.min ?? 1;
  const max = opts?.max ?? 50;
  if (value.length < min || value.length > max) {
    issues.push(`${path}: must contain between ${min} and ${max} items`);
    return undefined;
  }
  for (let i = 0; i < value.length; i++) {
    if (typeof value[i] !== "string" || value[i].trim().length === 0) {
      issues.push(`${path}[${i}]: non-empty string required`);
      return undefined;
    }
  }
  return value as string[];
}

function numberArray(value: unknown, path: string, issues: string[], opts?: { min?: number; max?: number }): number[] | undefined {
  if (!Array.isArray(value)) {
    issues.push(`${path}: array of numbers required`);
    return undefined;
  }
  const min = opts?.min ?? 1;
  const max = opts?.max ?? 50;
  if (value.length < min || value.length > max) {
    issues.push(`${path}: must contain between ${min} and ${max} items`);
    return undefined;
  }
  for (let i = 0; i < value.length; i++) {
    if (typeof value[i] !== "number" || !Number.isFinite(value[i])) {
      issues.push(`${path}[${i}]: finite number required`);
      return undefined;
    }
  }
  return value as number[];
}

function enumString<E extends string>(value: unknown, allowed: readonly E[], path: string, issues: string[]): E | undefined {
  if (typeof value !== "string" || !allowed.includes(value as E)) {
    issues.push(`${path}: must be one of ${allowed.join(", ")}`);
    return undefined;
  }
  return value as E;
}

function boundedNumber(value: unknown, min: number, max: number, path: string, issues: string[]): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    issues.push(`${path}: number between ${min} and ${max} required`);
    return undefined;
  }
  return value;
}

// --- Registry Definitions ---

export const COMPONENT_REGISTRY: { [K in AllComponentType]: ComponentDefinition<K> } = {
  Screen: {
    type: "Screen", category: "layout", requiredProps: [], optionalProps: [],
    jsonSchema: { type: "object", additionalProperties: false, properties: {} },
    a11yRules: { role: "main", labelRequired: false },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, [], path, issues);
      return {};
    },
  },
  SafeArea: {
    type: "SafeArea", category: "layout", requiredProps: [], optionalProps: [],
    jsonSchema: { type: "object", additionalProperties: false, properties: {} },
    a11yRules: { role: "region", labelRequired: false },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, [], path, issues);
      return {};
    },
  },
  ScrollView: {
    type: "ScrollView", category: "layout", requiredProps: [], optionalProps: [],
    jsonSchema: { type: "object", additionalProperties: false, properties: {} },
    a11yRules: { role: "region", labelRequired: false },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, [], path, issues);
      return {};
    },
  },
  Stack: {
    type: "Stack", category: "layout", requiredProps: [], optionalProps: [],
    jsonSchema: { type: "object", additionalProperties: false, properties: {} },
    a11yRules: { role: "group", labelRequired: false },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, [], path, issues);
      return {};
    },
  },
  Row: {
    type: "Row", category: "layout", requiredProps: [], optionalProps: [],
    jsonSchema: { type: "object", additionalProperties: false, properties: {} },
    a11yRules: { role: "group", labelRequired: false },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, [], path, issues);
      return {};
    },
  },
  Grid: {
    type: "Grid", category: "layout", requiredProps: [], optionalProps: [],
    jsonSchema: { type: "object", additionalProperties: false, properties: {} },
    a11yRules: { role: "grid", labelRequired: false },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, [], path, issues);
      return {};
    },
  },
  Divider: {
    type: "Divider", category: "layout", requiredProps: [], optionalProps: [],
    jsonSchema: { type: "object", additionalProperties: false, properties: {} },
    a11yRules: { role: "separator", labelRequired: false },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, [], path, issues);
      return {};
    },
  },
  Modal: {
    type: "Modal", category: "layout", requiredProps: [], optionalProps: [],
    jsonSchema: { type: "object", additionalProperties: false, properties: {} },
    a11yRules: { role: "dialog", labelRequired: false },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, [], path, issues);
      return {};
    },
  },
  Form: {
    type: "Form", category: "layout", requiredProps: [], optionalProps: [],
    jsonSchema: { type: "object", additionalProperties: false, properties: {} },
    a11yRules: { role: "form", labelRequired: false },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, [], path, issues);
      return {};
    },
  },

  Text: {
    type: "Text", category: "general", requiredProps: ["text"], optionalProps: ["variant", "tone"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["text"],
      properties: {
        text: { type: "string", minLength: 1 },
        variant: { type: "string", enum: ["body", "title", "heading", "caption", "label"] },
        tone: { type: "string", enum: ["neutral", "primary", "critical", "attention", "positive", "accent"] },
      },
    },
    a11yRules: { role: "text", labelRequired: false },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["text", "variant", "tone"], path, issues);
      if (!nonEmptyString(props.text, `${path}.text`, issues, 1000)) return undefined;
      const out: TextProps = { text: props.text as string };
      if (props.variant !== undefined) {
        const v = enumString(props.variant, ["body", "title", "heading", "caption", "label"] as const, `${path}.variant`, issues);
        if (v !== undefined) out.variant = v;
      }
      if (props.tone !== undefined) {
        const t = enumString(props.tone, ["neutral", "primary", "critical", "attention", "positive", "accent"] as const, `${path}.tone`, issues);
        if (t !== undefined) out.tone = t;
      }
      return out;
    },
  },
  Image: {
    type: "Image", category: "general", requiredProps: ["alt"], optionalProps: ["src"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["alt"],
      properties: { alt: { type: "string", minLength: 1 }, src: { type: "string" } },
    },
    a11yRules: { role: "img", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["alt", "src"], path, issues);
      if (!nonEmptyString(props.alt, `${path}.alt`, issues, 200)) return undefined;
      const out: ImageProps = { alt: props.alt as string };
      if (props.src !== undefined && typeof props.src === "string") out.src = props.src;
      return out;
    },
  },
  Icon: {
    type: "Icon", category: "general", requiredProps: ["name"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["name"],
      properties: { name: { type: "string", minLength: 1 } },
    },
    a11yRules: { role: "presentation", labelRequired: false },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["name"], path, issues);
      if (!nonEmptyString(props.name, `${path}.name`, issues, 100)) return undefined;
      return { name: props.name as string };
    },
  },
  Button: {
    type: "Button", category: "action", requiredProps: ["label"], optionalProps: ["icon", "variant", "tone"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["label"],
      properties: {
        label: { type: "string", minLength: 1 },
        icon: { type: "string" },
        variant: { type: "string", enum: ["filled", "outlined", "ghost", "tonal"] },
        tone: { type: "string", enum: ["neutral", "primary", "critical", "accent"] },
      },
    },
    a11yRules: { role: "button", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["label", "icon", "variant", "tone"], path, issues);
      if (!nonEmptyString(props.label, `${path}.label`, issues, 100)) return undefined;
      const out: ButtonProps = { label: props.label as string };
      if (props.icon !== undefined && typeof props.icon === "string") out.icon = props.icon;
      if (props.variant !== undefined) {
        const v = enumString(props.variant, ["filled", "outlined", "ghost", "tonal"] as const, `${path}.variant`, issues);
        if (v !== undefined) out.variant = v;
      }
      if (props.tone !== undefined) {
        const t = enumString(props.tone, ["neutral", "primary", "critical", "accent"] as const, `${path}.tone`, issues);
        if (t !== undefined) out.tone = t;
      }
      return out;
    },
  },
  IconButton: {
    type: "IconButton", category: "action", requiredProps: ["icon"], optionalProps: ["label"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["icon"],
      properties: { icon: { type: "string", minLength: 1 }, label: { type: "string" } },
    },
    a11yRules: { role: "button", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["icon", "label"], path, issues);
      if (!nonEmptyString(props.icon, `${path}.icon`, issues, 100)) return undefined;
      const out: IconButtonProps = { icon: props.icon as string };
      if (props.label !== undefined && typeof props.label === "string") out.label = props.label;
      return out;
    },
  },
  TextField: {
    type: "TextField", category: "input", requiredProps: ["label"], optionalProps: ["placeholder", "value"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["label"],
      properties: { label: { type: "string", minLength: 1 }, placeholder: { type: "string" }, value: { type: "string" } },
    },
    a11yRules: { role: "textbox", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["label", "placeholder", "value"], path, issues);
      if (!nonEmptyString(props.label, `${path}.label`, issues, 100)) return undefined;
      const out: TextFieldProps = { label: props.label as string };
      if (props.placeholder !== undefined && typeof props.placeholder === "string") out.placeholder = props.placeholder;
      if (props.value !== undefined && typeof props.value === "string") out.value = props.value;
      return out;
    },
  },
  SearchField: {
    type: "SearchField", category: "input", requiredProps: ["placeholder"], optionalProps: ["label", "value"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["placeholder"],
      properties: { placeholder: { type: "string", minLength: 1 }, label: { type: "string" }, value: { type: "string" } },
    },
    a11yRules: { role: "searchbox", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["placeholder", "label", "value"], path, issues);
      if (!nonEmptyString(props.placeholder, `${path}.placeholder`, issues, 100)) return undefined;
      const out: SearchFieldProps = { placeholder: props.placeholder as string };
      if (props.label !== undefined && typeof props.label === "string") out.label = props.label;
      if (props.value !== undefined && typeof props.value === "string") out.value = props.value;
      return out;
    },
  },
  Checkbox: {
    type: "Checkbox", category: "input", requiredProps: ["label"], optionalProps: ["checked"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["label"],
      properties: { label: { type: "string", minLength: 1 }, checked: { type: "boolean" } },
    },
    a11yRules: { role: "checkbox", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["label", "checked"], path, issues);
      if (!nonEmptyString(props.label, `${path}.label`, issues, 100)) return undefined;
      const out: CheckboxProps = { label: props.label as string };
      if (props.checked !== undefined) {
        if (typeof props.checked !== "boolean") issues.push(`${path}.checked: boolean required`);
        else out.checked = props.checked;
      }
      return out;
    },
  },
  Switch: {
    type: "Switch", category: "input", requiredProps: ["label"], optionalProps: ["checked"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["label"],
      properties: { label: { type: "string", minLength: 1 }, checked: { type: "boolean" } },
    },
    a11yRules: { role: "switch", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["label", "checked"], path, issues);
      if (!nonEmptyString(props.label, `${path}.label`, issues, 100)) return undefined;
      const out: SwitchProps = { label: props.label as string };
      if (props.checked !== undefined) {
        if (typeof props.checked !== "boolean") issues.push(`${path}.checked: boolean required`);
        else out.checked = props.checked;
      }
      return out;
    },
  },
  Card: {
    type: "Card", category: "general", requiredProps: [], optionalProps: ["title", "subtitle", "variant", "family", "tone"],
    jsonSchema: {
      type: "object", additionalProperties: false, properties: {
        title: { type: "string" },
        subtitle: { type: "string" },
        variant: { type: "string", enum: ["elevated", "outlined", "flat"] },
        family: { type: "string" },
        tone: { type: "string", enum: ["neutral", "primary", "critical", "attention", "positive", "accent"] },
      },
    },
    a11yRules: { role: "region", labelRequired: false },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["title", "subtitle", "variant", "family", "tone"], path, issues);
      const out: CardProps = {};
      if (props.title !== undefined && typeof props.title === "string") out.title = props.title;
      if (props.subtitle !== undefined && typeof props.subtitle === "string") out.subtitle = props.subtitle;
      if (props.variant !== undefined) {
        const v = enumString(props.variant, ["elevated", "outlined", "flat"] as const, `${path}.variant`, issues);
        if (v !== undefined) out.variant = v;
      }
      if (props.family !== undefined && typeof props.family === "string") out.family = props.family;
      if (props.tone !== undefined) {
        const t = enumString(props.tone, ["neutral", "primary", "critical", "attention", "positive", "accent"] as const, `${path}.tone`, issues);
        if (t !== undefined) out.tone = t;
      }
      return out;
    },
  },
  ListItem: {
    type: "ListItem", category: "data-display", requiredProps: ["title"], optionalProps: ["subtitle", "trailing", "icon", "tone"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["title"],
      properties: {
        title: { type: "string", minLength: 1 },
        subtitle: { type: "string" },
        trailing: { type: "string" },
        icon: { type: "string" },
        tone: { type: "string", enum: ["neutral", "primary", "critical", "attention", "positive", "accent"] },
      },
    },
    a11yRules: { role: "listitem", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["title", "subtitle", "trailing", "icon", "tone"], path, issues);
      if (!nonEmptyString(props.title, `${path}.title`, issues, 200)) return undefined;
      const out: ListItemProps = { title: props.title as string };
      if (props.subtitle !== undefined && typeof props.subtitle === "string") out.subtitle = props.subtitle;
      if (props.trailing !== undefined && typeof props.trailing === "string") out.trailing = props.trailing;
      if (props.icon !== undefined && typeof props.icon === "string") out.icon = props.icon;
      if (props.tone !== undefined) {
        const t = enumString(props.tone, ["neutral", "primary", "critical", "attention", "positive", "accent"] as const, `${path}.tone`, issues);
        if (t !== undefined) out.tone = t;
      }
      return out;
    },
  },
  Badge: {
    type: "Badge", category: "feedback", requiredProps: ["label"], optionalProps: ["tone"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["label"],
      properties: {
        label: { type: "string", minLength: 1 },
        tone: { type: "string", enum: ["neutral", "primary", "critical", "attention", "positive", "accent"] },
      },
    },
    a11yRules: { role: "status", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["label", "tone"], path, issues);
      if (!nonEmptyString(props.label, `${path}.label`, issues, 80)) return undefined;
      const out: BadgeProps = { label: props.label as string };
      if (props.tone !== undefined) {
        const t = enumString(props.tone, ["neutral", "primary", "critical", "attention", "positive", "accent"] as const, `${path}.tone`, issues);
        if (t !== undefined) out.tone = t;
      }
      return out;
    },
  },
  Avatar: {
    type: "Avatar", category: "general", requiredProps: [], optionalProps: ["initials", "src", "alt"],
    jsonSchema: {
      type: "object", additionalProperties: false,
      properties: { initials: { type: "string" }, src: { type: "string" }, alt: { type: "string" } },
    },
    a11yRules: { role: "img", labelRequired: false },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["initials", "src", "alt"], path, issues);
      const out: AvatarProps = {};
      if (props.initials !== undefined && typeof props.initials === "string") out.initials = props.initials;
      if (props.src !== undefined && typeof props.src === "string") out.src = props.src;
      if (props.alt !== undefined && typeof props.alt === "string") out.alt = props.alt;
      return out;
    },
  },
  TabBar: {
    type: "TabBar", category: "navigation", requiredProps: ["items"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["items"],
      properties: { items: { type: "array", minItems: 2, maxItems: 8, items: { type: "string", minLength: 1 } } },
    },
    a11yRules: { role: "tablist", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["items"], path, issues);
      const items = stringArray(props.items, `${path}.items`, issues, { min: 2, max: 8 });
      return items ? { items } : undefined;
    },
  },
  BottomNavigation: {
    type: "BottomNavigation", category: "navigation", requiredProps: ["items"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["items"],
      properties: { items: { type: "array", minItems: 2, maxItems: 6, items: { type: "string", minLength: 1 } } },
    },
    a11yRules: { role: "navigation", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["items"], path, issues);
      const items = stringArray(props.items, `${path}.items`, issues, { min: 2, max: 6 });
      return items ? { items } : undefined;
    },
  },
  TopAppBar: {
    type: "TopAppBar", category: "navigation", requiredProps: ["title"], optionalProps: ["action"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["title"],
      properties: { title: { type: "string", minLength: 1 }, action: { type: "string" } },
    },
    a11yRules: { role: "banner", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["title", "action"], path, issues);
      if (!nonEmptyString(props.title, `${path}.title`, issues, 100)) return undefined;
      const out: TopAppBarProps = { title: props.title as string };
      if (props.action !== undefined && typeof props.action === "string") out.action = props.action;
      return out;
    },
  },
  Progress: {
    type: "Progress", category: "feedback", requiredProps: ["value"], optionalProps: ["label", "tone"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["value"],
      properties: {
        value: { type: "number", minimum: 0, maximum: 100 },
        label: { type: "string" },
        tone: { type: "string", enum: ["neutral", "primary", "critical", "attention", "positive", "accent"] },
      },
    },
    a11yRules: { role: "progressbar", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["value", "label", "tone"], path, issues);
      const value = boundedNumber(props.value, 0, 100, `${path}.value`, issues);
      if (value === undefined) return undefined;
      const out: ProgressProps = { value };
      if (props.label !== undefined && typeof props.label === "string") out.label = props.label;
      if (props.tone !== undefined) {
        const t = enumString(props.tone, ["neutral", "primary", "critical", "attention", "positive", "accent"] as const, `${path}.tone`, issues);
        if (t !== undefined) out.tone = t;
      }
      return out;
    },
  },
  Metric: {
    type: "Metric", category: "data-display", requiredProps: ["label", "value"], optionalProps: ["caption", "tone"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["label", "value"],
      properties: {
        label: { type: "string", minLength: 1 },
        value: { type: "string", minLength: 1 },
        caption: { type: "string" },
        tone: { type: "string", enum: ["neutral", "primary", "critical", "attention", "positive", "accent"] },
      },
    },
    a11yRules: { role: "status", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["label", "value", "caption", "tone"], path, issues);
      if (!nonEmptyString(props.label, `${path}.label`, issues, 100)) return undefined;
      if (!nonEmptyString(props.value, `${path}.value`, issues, 100)) return undefined;
      const out: MetricProps = { label: props.label as string, value: props.value as string };
      if (props.caption !== undefined && typeof props.caption === "string") out.caption = props.caption;
      if (props.tone !== undefined) {
        const t = enumString(props.tone, ["neutral", "primary", "critical", "attention", "positive", "accent"] as const, `${path}.tone`, issues);
        if (t !== undefined) out.tone = t;
      }
      return out;
    },
  },
  Chart: {
    type: "Chart", category: "data-display", requiredProps: ["label", "values"], optionalProps: ["chartType", "tone"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["label", "values"],
      properties: {
        label: { type: "string", minLength: 1 },
        values: { type: "array", minItems: 2, maxItems: 24, items: { type: "number" } },
        chartType: { type: "string", enum: ["line", "bar", "area", "donut", "radial"] },
        tone: { type: "string", enum: ["neutral", "primary", "critical", "attention", "positive", "accent"] },
      },
    },
    a11yRules: { role: "graphics-document", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["label", "values", "chartType", "tone"], path, issues);
      if (!nonEmptyString(props.label, `${path}.label`, issues, 100)) return undefined;
      const values = numberArray(props.values, `${path}.values`, issues, { min: 2, max: 24 });
      if (!values) return undefined;
      const out: ChartProps = { label: props.label as string, values };
      if (props.chartType !== undefined) {
        const ct = enumString(props.chartType, ["line", "bar", "area", "donut", "radial"] as const, `${path}.chartType`, issues);
        if (ct !== undefined) out.chartType = ct;
      }
      if (props.tone !== undefined) {
        const t = enumString(props.tone, ["neutral", "primary", "critical", "attention", "positive", "accent"] as const, `${path}.tone`, issues);
        if (t !== undefined) out.tone = t;
      }
      return out;
    },
  },
  SegmentedControl: {
    type: "SegmentedControl", category: "input", requiredProps: ["items"], optionalProps: ["selected"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["items"],
      properties: {
        items: { type: "array", minItems: 2, maxItems: 6, items: { type: "string", minLength: 1 } },
        selected: { type: "string" },
      },
    },
    a11yRules: { role: "radiogroup", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["items", "selected"], path, issues);
      const items = stringArray(props.items, `${path}.items`, issues, { min: 2, max: 6 });
      if (!items) return undefined;
      const out: SegmentedControlProps = { items };
      if (props.selected !== undefined && typeof props.selected === "string") out.selected = props.selected;
      return out;
    },
  },
  FloatingActionButton: {
    type: "FloatingActionButton", category: "action", requiredProps: ["icon"], optionalProps: ["label"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["icon"],
      properties: { icon: { type: "string", minLength: 1 }, label: { type: "string" } },
    },
    a11yRules: { role: "button", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["icon", "label"], path, issues);
      if (!nonEmptyString(props.icon, `${path}.icon`, issues, 80)) return undefined;
      const out: FloatingActionButtonProps = { icon: props.icon as string };
      if (props.label !== undefined && typeof props.label === "string") out.label = props.label;
      return out;
    },
  },

  Calendar: {
    type: "Calendar", category: "data-display", requiredProps: ["label", "days", "events"], optionalProps: ["timeSlots"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["label", "days", "events"],
      properties: {
        label: { type: "string", minLength: 1 },
        days: { type: "array", minItems: 1, maxItems: 14, items: { type: "string", minLength: 1 } },
        events: { type: "array", minItems: 1, maxItems: 20, items: { type: "string", minLength: 1 } },
        timeSlots: { type: "array", minItems: 1, maxItems: 24, items: { type: "string", minLength: 1 } },
      },
    },
    a11yRules: { role: "grid", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["label", "days", "events", "timeSlots"], path, issues);
      if (!nonEmptyString(props.label, `${path}.label`, issues, 100)) return undefined;
      const days = stringArray(props.days, `${path}.days`, issues, { min: 1, max: 14 });
      const events = stringArray(props.events, `${path}.events`, issues, { min: 1, max: 20 });
      if (!days || !events) return undefined;
      const out: CalendarProps = { label: props.label as string, days, events };
      if (props.timeSlots !== undefined) {
        const timeSlots = stringArray(props.timeSlots, `${path}.timeSlots`, issues, { min: 1, max: 24 });
        if (timeSlots) out.timeSlots = timeSlots;
      }
      return out;
    },
  },
  Timeline: {
    type: "Timeline", category: "data-display", requiredProps: ["label", "events"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["label", "events"],
      properties: {
        label: { type: "string", minLength: 1 },
        events: { type: "array", minItems: 1, maxItems: 20, items: { type: "string", minLength: 1 } },
      },
    },
    a11yRules: { role: "feed", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["label", "events"], path, issues);
      if (!nonEmptyString(props.label, `${path}.label`, issues, 100)) return undefined;
      const events = stringArray(props.events, `${path}.events`, issues, { min: 1, max: 20 });
      return events ? { label: props.label as string, events } : undefined;
    },
  },
  Gallery: {
    type: "Gallery", category: "data-display", requiredProps: ["label", "items"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["label", "items"],
      properties: {
        label: { type: "string", minLength: 1 },
        items: { type: "array", minItems: 1, maxItems: 20, items: { type: "string", minLength: 1 } },
      },
    },
    a11yRules: { role: "region", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["label", "items"], path, issues);
      if (!nonEmptyString(props.label, `${path}.label`, issues, 100)) return undefined;
      const items = stringArray(props.items, `${path}.items`, issues, { min: 1, max: 20 });
      return items ? { label: props.label as string, items } : undefined;
    },
  },
  KanbanBoard: {
    type: "KanbanBoard", category: "data-display", requiredProps: ["label", "columns", "cards"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["label", "columns", "cards"],
      properties: {
        label: { type: "string", minLength: 1 },
        columns: { type: "array", minItems: 1, maxItems: 6, items: { type: "string", minLength: 1 } },
        cards: { type: "array", minItems: 1, maxItems: 30, items: { type: "string", minLength: 1 } },
      },
    },
    a11yRules: { role: "region", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["label", "columns", "cards"], path, issues);
      if (!nonEmptyString(props.label, `${path}.label`, issues, 100)) return undefined;
      const columns = stringArray(props.columns, `${path}.columns`, issues, { min: 1, max: 6 });
      const cards = stringArray(props.cards, `${path}.cards`, issues, { min: 1, max: 30 });
      return columns && cards ? { label: props.label as string, columns, cards } : undefined;
    },
  },
  MapView: {
    type: "MapView", category: "data-display", requiredProps: ["label", "markers"], optionalProps: ["routes"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["label", "markers"],
      properties: {
        label: { type: "string", minLength: 1 },
        markers: { type: "array", minItems: 1, maxItems: 20, items: { type: "string", minLength: 1 } },
        routes: { type: "array", minItems: 1, maxItems: 10, items: { type: "string", minLength: 1 } },
      },
    },
    a11yRules: { role: "region", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["label", "markers", "routes"], path, issues);
      if (!nonEmptyString(props.label, `${path}.label`, issues, 100)) return undefined;
      const markers = stringArray(props.markers, `${path}.markers`, issues, { min: 1, max: 20 });
      if (!markers) return undefined;
      const out: MapViewProps = { label: props.label as string, markers };
      if (props.routes !== undefined) {
        const routes = stringArray(props.routes, `${path}.routes`, issues, { min: 1, max: 10 });
        if (routes) out.routes = routes;
      }
      return out;
    },
  },

  CareSummary: {
    type: "CareSummary", category: "domain-health", requiredProps: ["title", "subtitle", "progress"], optionalProps: ["status"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["title", "subtitle", "progress"],
      properties: {
        title: { type: "string", minLength: 1 },
        subtitle: { type: "string", minLength: 1 },
        progress: { type: "number", minimum: 0, maximum: 100 },
        status: { type: "string", enum: ["normal", "due", "attention", "critical", "overdue"] },
      },
    },
    a11yRules: { role: "region", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["title", "subtitle", "progress", "status"], path, issues);
      if (!nonEmptyString(props.title, `${path}.title`, issues, 100)) return undefined;
      if (!nonEmptyString(props.subtitle, `${path}.subtitle`, issues, 200)) return undefined;
      const progress = boundedNumber(props.progress, 0, 100, `${path}.progress`, issues);
      if (progress === undefined) return undefined;
      const out: CareSummaryProps = { title: props.title as string, subtitle: props.subtitle as string, progress };
      if (props.status !== undefined) {
        const s = enumString(props.status, ["normal", "due", "attention", "critical", "overdue"] as const, `${path}.status`, issues);
        if (s !== undefined) out.status = s;
      }
      return out;
    },
  },
  MedicationTimeline: {
    type: "MedicationTimeline", category: "domain-health", requiredProps: ["label", "items"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["label", "items"],
      properties: {
        label: { type: "string", minLength: 1 },
        items: { type: "array", minItems: 1, maxItems: 10, items: { type: "string", minLength: 1 } },
      },
    },
    a11yRules: { role: "feed", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["label", "items"], path, issues);
      if (!nonEmptyString(props.label, `${path}.label`, issues, 100)) return undefined;
      const items = stringArray(props.items, `${path}.items`, issues, { min: 1, max: 10 });
      return items ? { label: props.label as string, items } : undefined;
    },
  },
  MedicationDoseRow: {
    type: "MedicationDoseRow", category: "domain-health", requiredProps: ["name", "dose", "instruction", "time", "status"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["name", "dose", "instruction", "time", "status"],
      properties: {
        name: { type: "string", minLength: 1 },
        dose: { type: "string", minLength: 1 },
        instruction: { type: "string", minLength: 1 },
        time: { type: "string", minLength: 1 },
        status: { type: "string", enum: ["scheduled", "taken", "due", "overdue", "attention"] },
      },
    },
    a11yRules: { role: "article", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["name", "dose", "instruction", "time", "status"], path, issues);
      if (!nonEmptyString(props.name, `${path}.name`, issues, 100)) return undefined;
      if (!nonEmptyString(props.dose, `${path}.dose`, issues, 100)) return undefined;
      if (!nonEmptyString(props.instruction, `${path}.instruction`, issues, 200)) return undefined;
      if (!nonEmptyString(props.time, `${path}.time`, issues, 50)) return undefined;
      const status = enumString(props.status, ["scheduled", "taken", "due", "overdue", "attention"] as const, `${path}.status`, issues);
      return status ? { name: props.name as string, dose: props.dose as string, instruction: props.instruction as string, time: props.time as string, status } : undefined;
    },
  },
  HealthMetric: {
    type: "HealthMetric", category: "domain-health", requiredProps: ["label", "value", "unit"], optionalProps: ["caption", "status"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["label", "value", "unit"],
      properties: {
        label: { type: "string", minLength: 1 },
        value: { type: "string", minLength: 1 },
        unit: { type: "string", minLength: 1 },
        caption: { type: "string" },
        status: { type: "string", enum: ["normal", "attention", "critical"] },
      },
    },
    a11yRules: { role: "status", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["label", "value", "unit", "caption", "status"], path, issues);
      if (!nonEmptyString(props.label, `${path}.label`, issues, 100)) return undefined;
      if (!nonEmptyString(props.value, `${path}.value`, issues, 50)) return undefined;
      if (!nonEmptyString(props.unit, `${path}.unit`, issues, 50)) return undefined;
      const out: HealthMetricProps = { label: props.label as string, value: props.value as string, unit: props.unit as string };
      if (props.caption !== undefined && typeof props.caption === "string") out.caption = props.caption;
      if (props.status !== undefined) {
        const s = enumString(props.status, ["normal", "attention", "critical"] as const, `${path}.status`, issues);
        if (s !== undefined) out.status = s;
      }
      return out;
    },
  },
  UnitInput: {
    type: "UnitInput", category: "domain-health", requiredProps: ["label", "value", "unit"], optionalProps: ["hint"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["label", "value", "unit"],
      properties: {
        label: { type: "string", minLength: 1 },
        value: { type: "string", minLength: 1 },
        unit: { type: "string", minLength: 1 },
        hint: { type: "string" },
      },
    },
    a11yRules: { role: "textbox", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["label", "value", "unit", "hint"], path, issues);
      if (!nonEmptyString(props.label, `${path}.label`, issues, 100)) return undefined;
      if (!nonEmptyString(props.value, `${path}.value`, issues, 50)) return undefined;
      if (!nonEmptyString(props.unit, `${path}.unit`, issues, 50)) return undefined;
      const out: UnitInputProps = { label: props.label as string, value: props.value as string, unit: props.unit as string };
      if (props.hint !== undefined && typeof props.hint === "string") out.hint = props.hint;
      return out;
    },
  },
  RangeChart: {
    type: "RangeChart", category: "domain-health", requiredProps: ["label", "unit", "values", "minimum", "maximum"], optionalProps: ["targetMinimum", "targetMaximum"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["label", "unit", "values", "minimum", "maximum"],
      properties: {
        label: { type: "string", minLength: 1 },
        unit: { type: "string", minLength: 1 },
        values: { type: "array", minItems: 2, maxItems: 20, items: { type: "number" } },
        minimum: { type: "number" },
        maximum: { type: "number" },
        targetMinimum: { type: "number" },
        targetMaximum: { type: "number" },
      },
    },
    a11yRules: { role: "graphics-document", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["label", "unit", "values", "minimum", "maximum", "targetMinimum", "targetMaximum"], path, issues);
      if (!nonEmptyString(props.label, `${path}.label`, issues, 100)) return undefined;
      if (!nonEmptyString(props.unit, `${path}.unit`, issues, 50)) return undefined;
      const values = numberArray(props.values, `${path}.values`, issues, { min: 2, max: 20 });
      if (typeof props.minimum !== "number" || !Number.isFinite(props.minimum)) { issues.push(`${path}.minimum: number required`); return undefined; }
      if (typeof props.maximum !== "number" || !Number.isFinite(props.maximum)) { issues.push(`${path}.maximum: number required`); return undefined; }
      if (!values) return undefined;
      const out: RangeChartProps = { label: props.label as string, unit: props.unit as string, values, minimum: props.minimum, maximum: props.maximum };
      if (props.targetMinimum !== undefined && typeof props.targetMinimum === "number") out.targetMinimum = props.targetMinimum;
      if (props.targetMaximum !== undefined && typeof props.targetMaximum === "number") out.targetMaximum = props.targetMaximum;
      return out;
    },
  },
  TargetRange: {
    type: "TargetRange", category: "domain-health", requiredProps: ["label", "value", "unit", "minimum", "maximum"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["label", "value", "unit", "minimum", "maximum"],
      properties: {
        label: { type: "string", minLength: 1 },
        value: { type: "number" },
        unit: { type: "string", minLength: 1 },
        minimum: { type: "number" },
        maximum: { type: "number" },
      },
    },
    a11yRules: { role: "meter", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["label", "value", "unit", "minimum", "maximum"], path, issues);
      if (!nonEmptyString(props.label, `${path}.label`, issues, 100)) return undefined;
      if (typeof props.value !== "number" || !Number.isFinite(props.value)) { issues.push(`${path}.value: number required`); return undefined; }
      if (!nonEmptyString(props.unit, `${path}.unit`, issues, 50)) return undefined;
      if (typeof props.minimum !== "number" || !Number.isFinite(props.minimum)) { issues.push(`${path}.minimum: number required`); return undefined; }
      if (typeof props.maximum !== "number" || !Number.isFinite(props.maximum)) { issues.push(`${path}.maximum: number required`); return undefined; }
      return { label: props.label as string, value: props.value, unit: props.unit as string, minimum: props.minimum, maximum: props.maximum };
    },
  },
  StatusAlert: {
    type: "StatusAlert", category: "domain-health", requiredProps: ["title", "message", "severity"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["title", "message", "severity"],
      properties: {
        title: { type: "string", minLength: 1 },
        message: { type: "string", minLength: 1 },
        severity: { type: "string", enum: ["normal", "attention", "critical"] },
      },
    },
    a11yRules: { role: "alert", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["title", "message", "severity"], path, issues);
      if (!nonEmptyString(props.title, `${path}.title`, issues, 100)) return undefined;
      if (!nonEmptyString(props.message, `${path}.message`, issues, 300)) return undefined;
      const severity = enumString(props.severity, ["normal", "attention", "critical"] as const, `${path}.severity`, issues);
      return severity ? { title: props.title as string, message: props.message as string, severity } : undefined;
    },
  },
  SafetyNotice: {
    type: "SafetyNotice", category: "domain-health", requiredProps: ["title", "message"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["title", "message"],
      properties: { title: { type: "string", minLength: 1 }, message: { type: "string", minLength: 1 } },
    },
    a11yRules: { role: "note", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["title", "message"], path, issues);
      if (!nonEmptyString(props.title, `${path}.title`, issues, 100)) return undefined;
      if (!nonEmptyString(props.message, `${path}.message`, issues, 300)) return undefined;
      return { title: props.title as string, message: props.message as string };
    },
  },
  SuccessFeedback: {
    type: "SuccessFeedback", category: "domain-health", requiredProps: ["title", "message"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["title", "message"],
      properties: { title: { type: "string", minLength: 1 }, message: { type: "string", minLength: 1 } },
    },
    a11yRules: { role: "status", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["title", "message"], path, issues);
      if (!nonEmptyString(props.title, `${path}.title`, issues, 100)) return undefined;
      if (!nonEmptyString(props.message, `${path}.message`, issues, 300)) return undefined;
      return { title: props.title as string, message: props.message as string };
    },
  },

  EditorialHero: {
    type: "EditorialHero", category: "domain-editorial", requiredProps: ["kicker", "headline", "dek", "issue", "date"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["kicker", "headline", "dek", "issue", "date"],
      properties: {
        kicker: { type: "string", minLength: 1 },
        headline: { type: "string", minLength: 1 },
        dek: { type: "string", minLength: 1 },
        issue: { type: "string", minLength: 1 },
        date: { type: "string", minLength: 1 },
      },
    },
    a11yRules: { role: "article", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["kicker", "headline", "dek", "issue", "date"], path, issues);
      if (!nonEmptyString(props.kicker, `${path}.kicker`, issues, 100)) return undefined;
      if (!nonEmptyString(props.headline, `${path}.headline`, issues, 200)) return undefined;
      if (!nonEmptyString(props.dek, `${path}.dek`, issues, 300)) return undefined;
      if (!nonEmptyString(props.issue, `${path}.issue`, issues, 100)) return undefined;
      if (!nonEmptyString(props.date, `${path}.date`, issues, 50)) return undefined;
      return { kicker: props.kicker as string, headline: props.headline as string, dek: props.dek as string, issue: props.issue as string, date: props.date as string };
    },
  },
  FeatureStory: {
    type: "FeatureStory", category: "domain-editorial", requiredProps: ["category", "title", "summary"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["category", "title", "summary"],
      properties: { category: { type: "string", minLength: 1 }, title: { type: "string", minLength: 1 }, summary: { type: "string", minLength: 1 } },
    },
    a11yRules: { role: "article", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["category", "title", "summary"], path, issues);
      if (!nonEmptyString(props.category, `${path}.category`, issues, 100)) return undefined;
      if (!nonEmptyString(props.title, `${path}.title`, issues, 200)) return undefined;
      if (!nonEmptyString(props.summary, `${path}.summary`, issues, 400)) return undefined;
      return { category: props.category as string, title: props.title as string, summary: props.summary as string };
    },
  },
  StoryCard: {
    type: "StoryCard", category: "domain-editorial", requiredProps: ["index", "category", "title", "summary"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["index", "category", "title", "summary"],
      properties: { index: { type: "string", minLength: 1 }, category: { type: "string", minLength: 1 }, title: { type: "string", minLength: 1 }, summary: { type: "string", minLength: 1 } },
    },
    a11yRules: { role: "article", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["index", "category", "title", "summary"], path, issues);
      if (!nonEmptyString(props.index, `${path}.index`, issues, 20)) return undefined;
      if (!nonEmptyString(props.category, `${path}.category`, issues, 100)) return undefined;
      if (!nonEmptyString(props.title, `${path}.title`, issues, 200)) return undefined;
      if (!nonEmptyString(props.summary, `${path}.summary`, issues, 400)) return undefined;
      return { index: props.index as string, category: props.category as string, title: props.title as string, summary: props.summary as string };
    },
  },
  Byline: {
    type: "Byline", category: "domain-editorial", requiredProps: ["author", "role"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["author", "role"],
      properties: { author: { type: "string", minLength: 1 }, role: { type: "string", minLength: 1 } },
    },
    a11yRules: { role: "contentinfo", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["author", "role"], path, issues);
      if (!nonEmptyString(props.author, `${path}.author`, issues, 100)) return undefined;
      if (!nonEmptyString(props.role, `${path}.role`, issues, 100)) return undefined;
      return { author: props.author as string, role: props.role as string };
    },
  },
  MetadataStrip: {
    type: "MetadataStrip", category: "domain-editorial", requiredProps: ["date", "readingTime", "edition"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["date", "readingTime", "edition"],
      properties: { date: { type: "string", minLength: 1 }, readingTime: { type: "string", minLength: 1 }, edition: { type: "string", minLength: 1 } },
    },
    a11yRules: { role: "region", labelRequired: false },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["date", "readingTime", "edition"], path, issues);
      if (!nonEmptyString(props.date, `${path}.date`, issues, 50)) return undefined;
      if (!nonEmptyString(props.readingTime, `${path}.readingTime`, issues, 50)) return undefined;
      if (!nonEmptyString(props.edition, `${path}.edition`, issues, 50)) return undefined;
      return { date: props.date as string, readingTime: props.readingTime as string, edition: props.edition as string };
    },
  },
  PullQuote: {
    type: "PullQuote", category: "domain-editorial", requiredProps: ["quote", "attribution"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["quote", "attribution"],
      properties: { quote: { type: "string", minLength: 1 }, attribution: { type: "string", minLength: 1 } },
    },
    a11yRules: { role: "blockquote", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["quote", "attribution"], path, issues);
      if (!nonEmptyString(props.quote, `${path}.quote`, issues, 500)) return undefined;
      if (!nonEmptyString(props.attribution, `${path}.attribution`, issues, 100)) return undefined;
      return { quote: props.quote as string, attribution: props.attribution as string };
    },
  },
  SectionIndex: {
    type: "SectionIndex", category: "domain-editorial", requiredProps: ["items"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["items"],
      properties: { items: { type: "array", minItems: 1, maxItems: 10, items: { type: "string", minLength: 1 } } },
    },
    a11yRules: { role: "navigation", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["items"], path, issues);
      const items = stringArray(props.items, `${path}.items`, issues, { min: 1, max: 10 });
      return items ? { items } : undefined;
    },
  },
  ArchiveEntry: {
    type: "ArchiveEntry", category: "domain-editorial", requiredProps: ["number", "date", "title", "theme"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["number", "date", "title", "theme"],
      properties: {
        number: { type: "string", minLength: 1 },
        date: { type: "string", minLength: 1 },
        title: { type: "string", minLength: 1 },
        theme: { type: "string", minLength: 1 },
      },
    },
    a11yRules: { role: "article", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["number", "date", "title", "theme"], path, issues);
      if (!nonEmptyString(props.number, `${path}.number`, issues, 20)) return undefined;
      if (!nonEmptyString(props.date, `${path}.date`, issues, 50)) return undefined;
      if (!nonEmptyString(props.title, `${path}.title`, issues, 200)) return undefined;
      if (!nonEmptyString(props.theme, `${path}.theme`, issues, 100)) return undefined;
      return { number: props.number as string, date: props.date as string, title: props.title as string, theme: props.theme as string };
    },
  },

  CommerceHero: {
    type: "CommerceHero", category: "domain-commerce", requiredProps: ["eyebrow", "title", "subtitle", "cta"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["eyebrow", "title", "subtitle", "cta"],
      properties: {
        eyebrow: { type: "string", minLength: 1 },
        title: { type: "string", minLength: 1 },
        subtitle: { type: "string", minLength: 1 },
        cta: { type: "string", minLength: 1 },
      },
    },
    a11yRules: { role: "banner", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["eyebrow", "title", "subtitle", "cta"], path, issues);
      if (!nonEmptyString(props.eyebrow, `${path}.eyebrow`, issues, 100)) return undefined;
      if (!nonEmptyString(props.title, `${path}.title`, issues, 150)) return undefined;
      if (!nonEmptyString(props.subtitle, `${path}.subtitle`, issues, 200)) return undefined;
      if (!nonEmptyString(props.cta, `${path}.cta`, issues, 50)) return undefined;
      return { eyebrow: props.eyebrow as string, title: props.title as string, subtitle: props.subtitle as string, cta: props.cta as string };
    },
  },
  ProductCard: {
    type: "ProductCard", category: "domain-commerce", requiredProps: ["name", "price", "description"], optionalProps: ["badge", "maker", "status"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["name", "price", "description"],
      properties: {
        name: { type: "string", minLength: 1 },
        price: { type: "string", minLength: 1 },
        description: { type: "string", minLength: 1 },
        badge: { type: "string" },
        maker: { type: "string" },
        status: { type: "string" },
      },
    },
    a11yRules: { role: "article", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["name", "price", "description", "badge", "maker", "status"], path, issues);
      if (!nonEmptyString(props.name, `${path}.name`, issues, 150)) return undefined;
      if (!nonEmptyString(props.price, `${path}.price`, issues, 50)) return undefined;
      if (!nonEmptyString(props.description, `${path}.description`, issues, 300)) return undefined;
      const out: ProductCardProps = { name: props.name as string, price: props.price as string, description: props.description as string };
      if (props.badge !== undefined && typeof props.badge === "string") out.badge = props.badge;
      if (props.maker !== undefined && typeof props.maker === "string") out.maker = props.maker;
      if (props.status !== undefined && typeof props.status === "string") out.status = props.status;
      return out;
    },
  },
  PriceBlock: {
    type: "PriceBlock", category: "domain-commerce", requiredProps: ["label", "price"], optionalProps: ["compareAt", "taxNote"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["label", "price"],
      properties: {
        label: { type: "string", minLength: 1 },
        price: { type: "string", minLength: 1 },
        compareAt: { type: "string" },
        taxNote: { type: "string" },
      },
    },
    a11yRules: { role: "region", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["label", "price", "compareAt", "taxNote"], path, issues);
      if (!nonEmptyString(props.label, `${path}.label`, issues, 100)) return undefined;
      if (!nonEmptyString(props.price, `${path}.price`, issues, 50)) return undefined;
      const out: PriceBlockProps = { label: props.label as string, price: props.price as string };
      if (props.compareAt !== undefined && typeof props.compareAt === "string") out.compareAt = props.compareAt;
      if (props.taxNote !== undefined && typeof props.taxNote === "string") out.taxNote = props.taxNote;
      return out;
    },
  },
  ProductGallery: {
    type: "ProductGallery", category: "domain-commerce", requiredProps: ["alt"], optionalProps: ["current", "total"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["alt"],
      properties: { alt: { type: "string", minLength: 1 }, current: { type: "number" }, total: { type: "number" } },
    },
    a11yRules: { role: "region", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["alt", "current", "total"], path, issues);
      if (!nonEmptyString(props.alt, `${path}.alt`, issues, 100)) return undefined;
      const out: ProductGalleryProps = { alt: props.alt as string };
      if (props.current !== undefined && typeof props.current === "number") out.current = props.current;
      if (props.total !== undefined && typeof props.total === "number") out.total = props.total;
      return out;
    },
  },
  VariantSelector: {
    type: "VariantSelector", category: "domain-commerce", requiredProps: ["label", "options"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["label", "options"],
      properties: {
        label: { type: "string", minLength: 1 },
        options: { type: "array", minItems: 1, maxItems: 10, items: { type: "string", minLength: 1 } },
      },
    },
    a11yRules: { role: "group", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["label", "options"], path, issues);
      if (!nonEmptyString(props.label, `${path}.label`, issues, 100)) return undefined;
      const options = stringArray(props.options, `${path}.options`, issues, { min: 1, max: 10 });
      return options ? { label: props.label as string, options } : undefined;
    },
  },
  CartLine: {
    type: "CartLine", category: "domain-commerce", requiredProps: ["name", "variant", "price"], optionalProps: ["quantity"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["name", "variant", "price"],
      properties: {
        name: { type: "string", minLength: 1 },
        variant: { type: "string", minLength: 1 },
        price: { type: "string", minLength: 1 },
        quantity: { type: "number" },
      },
    },
    a11yRules: { role: "article", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["name", "variant", "price", "quantity"], path, issues);
      if (!nonEmptyString(props.name, `${path}.name`, issues, 150)) return undefined;
      if (!nonEmptyString(props.variant, `${path}.variant`, issues, 100)) return undefined;
      if (!nonEmptyString(props.price, `${path}.price`, issues, 50)) return undefined;
      const out: CartLineProps = { name: props.name as string, variant: props.variant as string, price: props.price as string };
      if (props.quantity !== undefined && typeof props.quantity === "number") out.quantity = props.quantity;
      return out;
    },
  },
  OrderSummary: {
    type: "OrderSummary", category: "domain-commerce", requiredProps: ["title", "subtotal", "shipping", "total"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["title", "subtotal", "shipping", "total"],
      properties: {
        title: { type: "string", minLength: 1 },
        subtotal: { type: "string", minLength: 1 },
        shipping: { type: "string", minLength: 1 },
        total: { type: "string", minLength: 1 },
      },
    },
    a11yRules: { role: "region", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["title", "subtotal", "shipping", "total"], path, issues);
      if (!nonEmptyString(props.title, `${path}.title`, issues, 100)) return undefined;
      if (!nonEmptyString(props.subtotal, `${path}.subtotal`, issues, 50)) return undefined;
      if (!nonEmptyString(props.shipping, `${path}.shipping`, issues, 50)) return undefined;
      if (!nonEmptyString(props.total, `${path}.total`, issues, 50)) return undefined;
      return { title: props.title as string, subtotal: props.subtotal as string, shipping: props.shipping as string, total: props.total as string };
    },
  },
  DeliveryPromise: {
    type: "DeliveryPromise", category: "domain-commerce", requiredProps: ["title", "detail"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["title", "detail"],
      properties: { title: { type: "string", minLength: 1 }, detail: { type: "string", minLength: 1 } },
    },
    a11yRules: { role: "note", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["title", "detail"], path, issues);
      if (!nonEmptyString(props.title, `${path}.title`, issues, 100)) return undefined;
      if (!nonEmptyString(props.detail, `${path}.detail`, issues, 300)) return undefined;
      return { title: props.title as string, detail: props.detail as string };
    },
  },

  LearningHero: {
    type: "LearningHero", category: "domain-learning", requiredProps: ["eyebrow", "title", "mission", "reward"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["eyebrow", "title", "mission", "reward"],
      properties: {
        eyebrow: { type: "string", minLength: 1 },
        title: { type: "string", minLength: 1 },
        mission: { type: "string", minLength: 1 },
        reward: { type: "string", minLength: 1 },
      },
    },
    a11yRules: { role: "banner", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["eyebrow", "title", "mission", "reward"], path, issues);
      if (!nonEmptyString(props.eyebrow, `${path}.eyebrow`, issues, 100)) return undefined;
      if (!nonEmptyString(props.title, `${path}.title`, issues, 150)) return undefined;
      if (!nonEmptyString(props.mission, `${path}.mission`, issues, 300)) return undefined;
      if (!nonEmptyString(props.reward, `${path}.reward`, issues, 100)) return undefined;
      return { eyebrow: props.eyebrow as string, title: props.title as string, mission: props.mission as string, reward: props.reward as string };
    },
  },
  XpProgress: {
    type: "XpProgress", category: "domain-learning", requiredProps: ["label", "current", "target", "value"], optionalProps: ["nextReward"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["label", "current", "target", "value"],
      properties: {
        label: { type: "string", minLength: 1 },
        current: { type: "string", minLength: 1 },
        target: { type: "string", minLength: 1 },
        value: { type: "number", minimum: 0, maximum: 100 },
        nextReward: { type: "string" },
      },
    },
    a11yRules: { role: "progressbar", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["label", "current", "target", "value", "nextReward"], path, issues);
      if (!nonEmptyString(props.label, `${path}.label`, issues, 100)) return undefined;
      if (!nonEmptyString(props.current, `${path}.current`, issues, 50)) return undefined;
      if (!nonEmptyString(props.target, `${path}.target`, issues, 50)) return undefined;
      const value = boundedNumber(props.value, 0, 100, `${path}.value`, issues);
      if (value === undefined) return undefined;
      const out: XpProgressProps = { label: props.label as string, current: props.current as string, target: props.target as string, value };
      if (props.nextReward !== undefined && typeof props.nextReward === "string") out.nextReward = props.nextReward;
      return out;
    },
  },
  StreakBadge: {
    type: "StreakBadge", category: "domain-learning", requiredProps: ["days", "message"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["days", "message"],
      properties: { days: { type: "number", minimum: 0 }, message: { type: "string", minLength: 1 } },
    },
    a11yRules: { role: "status", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["days", "message"], path, issues);
      if (typeof props.days !== "number" || !Number.isFinite(props.days) || props.days < 0) { issues.push(`${path}.days: non-negative number required`); return undefined; }
      if (!nonEmptyString(props.message, `${path}.message`, issues, 150)) return undefined;
      return { days: props.days, message: props.message as string };
    },
  },
  LessonCard: {
    type: "LessonCard", category: "domain-learning", requiredProps: ["level", "topic", "title", "duration", "status"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["level", "topic", "title", "duration", "status"],
      properties: {
        level: { type: "string", minLength: 1 },
        topic: { type: "string", minLength: 1 },
        title: { type: "string", minLength: 1 },
        duration: { type: "string", minLength: 1 },
        status: { type: "string", minLength: 1 },
      },
    },
    a11yRules: { role: "article", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["level", "topic", "title", "duration", "status"], path, issues);
      if (!nonEmptyString(props.level, `${path}.level`, issues, 50)) return undefined;
      if (!nonEmptyString(props.topic, `${path}.topic`, issues, 100)) return undefined;
      if (!nonEmptyString(props.title, `${path}.title`, issues, 200)) return undefined;
      if (!nonEmptyString(props.duration, `${path}.duration`, issues, 50)) return undefined;
      if (!nonEmptyString(props.status, `${path}.status`, issues, 50)) return undefined;
      return { level: props.level as string, topic: props.topic as string, title: props.title as string, duration: props.duration as string, status: props.status as string };
    },
  },
  RoadmapStep: {
    type: "RoadmapStep", category: "domain-learning", requiredProps: ["order", "title", "description", "state"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["order", "title", "description", "state"],
      properties: {
        order: { type: "string", minLength: 1 },
        title: { type: "string", minLength: 1 },
        description: { type: "string", minLength: 1 },
        state: { type: "string", enum: ["completed", "current", "locked"] },
      },
    },
    a11yRules: { role: "article", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["order", "title", "description", "state"], path, issues);
      if (!nonEmptyString(props.order, `${path}.order`, issues, 20)) return undefined;
      if (!nonEmptyString(props.title, `${path}.title`, issues, 150)) return undefined;
      if (!nonEmptyString(props.description, `${path}.description`, issues, 300)) return undefined;
      const state = enumString(props.state, ["completed", "current", "locked"] as const, `${path}.state`, issues);
      return state ? { order: props.order as string, title: props.title as string, description: props.description as string, state } : undefined;
    },
  },
  QuizChoice: {
    type: "QuizChoice", category: "domain-learning", requiredProps: ["key", "label"], optionalProps: ["state"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["key", "label"],
      properties: {
        key: { type: "string", minLength: 1 },
        label: { type: "string", minLength: 1 },
        state: { type: "string", enum: ["default", "selected"] },
      },
    },
    a11yRules: { role: "radio", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["key", "label", "state"], path, issues);
      if (!nonEmptyString(props.key, `${path}.key`, issues, 20)) return undefined;
      if (!nonEmptyString(props.label, `${path}.label`, issues, 200)) return undefined;
      const out: QuizChoiceProps = { key: props.key as string, label: props.label as string };
      if (props.state !== undefined) {
        const s = enumString(props.state, ["default", "selected"] as const, `${path}.state`, issues);
        if (s !== undefined) out.state = s;
      }
      return out;
    },
  },
  AnswerFeedback: {
    type: "AnswerFeedback", category: "domain-learning", requiredProps: ["result", "title", "explanation"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["result", "title", "explanation"],
      properties: {
        result: { type: "string", enum: ["correct", "incorrect"] },
        title: { type: "string", minLength: 1 },
        explanation: { type: "string", minLength: 1 },
      },
    },
    a11yRules: { role: "alert", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["result", "title", "explanation"], path, issues);
      const result = enumString(props.result, ["correct", "incorrect"] as const, `${path}.result`, issues);
      if (!nonEmptyString(props.title, `${path}.title`, issues, 100)) return undefined;
      if (!nonEmptyString(props.explanation, `${path}.explanation`, issues, 400)) return undefined;
      return result ? { result, title: props.title as string, explanation: props.explanation as string } : undefined;
    },
  },
  AchievementBadge: {
    type: "AchievementBadge", category: "domain-learning", requiredProps: ["title", "description"], optionalProps: ["icon", "earnedAt"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["title", "description"],
      properties: {
        title: { type: "string", minLength: 1 },
        description: { type: "string", minLength: 1 },
        icon: { type: "string" },
        earnedAt: { type: "string" },
      },
    },
    a11yRules: { role: "article", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["title", "description", "icon", "earnedAt"], path, issues);
      if (!nonEmptyString(props.title, `${path}.title`, issues, 100)) return undefined;
      if (!nonEmptyString(props.description, `${path}.description`, issues, 300)) return undefined;
      const out: AchievementBadgeProps = { title: props.title as string, description: props.description as string };
      if (props.icon !== undefined && typeof props.icon === "string") out.icon = props.icon;
      if (props.earnedAt !== undefined && typeof props.earnedAt === "string") out.earnedAt = props.earnedAt;
      return out;
    },
  },

  CommandSummary: {
    type: "CommandSummary", category: "domain-ops", requiredProps: ["eyebrow", "status", "value", "title", "detail"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["eyebrow", "status", "value", "title", "detail"],
      properties: {
        eyebrow: { type: "string", minLength: 1 },
        status: { type: "string", minLength: 1 },
        value: { type: "string", minLength: 1 },
        title: { type: "string", minLength: 1 },
        detail: { type: "string", minLength: 1 },
      },
    },
    a11yRules: { role: "region", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["eyebrow", "status", "value", "title", "detail"], path, issues);
      if (!nonEmptyString(props.eyebrow, `${path}.eyebrow`, issues, 100)) return undefined;
      if (!nonEmptyString(props.status, `${path}.status`, issues, 50)) return undefined;
      if (!nonEmptyString(props.value, `${path}.value`, issues, 50)) return undefined;
      if (!nonEmptyString(props.title, `${path}.title`, issues, 150)) return undefined;
      if (!nonEmptyString(props.detail, `${path}.detail`, issues, 300)) return undefined;
      return { eyebrow: props.eyebrow as string, status: props.status as string, value: props.value as string, title: props.title as string, detail: props.detail as string };
    },
  },
  SignalChart: {
    type: "SignalChart", category: "domain-ops", requiredProps: ["label", "window", "unit", "values"], optionalProps: ["annotation"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["label", "window", "unit", "values"],
      properties: {
        label: { type: "string", minLength: 1 },
        window: { type: "string", minLength: 1 },
        unit: { type: "string", minLength: 1 },
        values: { type: "array", minItems: 2, maxItems: 20, items: { type: "number" } },
        annotation: { type: "string" },
      },
    },
    a11yRules: { role: "graphics-document", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["label", "window", "unit", "values", "annotation"], path, issues);
      if (!nonEmptyString(props.label, `${path}.label`, issues, 100)) return undefined;
      if (!nonEmptyString(props.window, `${path}.window`, issues, 50)) return undefined;
      if (!nonEmptyString(props.unit, `${path}.unit`, issues, 50)) return undefined;
      const values = numberArray(props.values, `${path}.values`, issues, { min: 2, max: 20 });
      if (!values) return undefined;
      const out: SignalChartProps = { label: props.label as string, window: props.window as string, unit: props.unit as string, values };
      if (props.annotation !== undefined && typeof props.annotation === "string") out.annotation = props.annotation;
      return out;
    },
  },
  RiskIndicator: {
    type: "RiskIndicator", category: "domain-ops", requiredProps: ["label", "value", "explanation", "severity"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["label", "value", "explanation", "severity"],
      properties: {
        label: { type: "string", minLength: 1 },
        value: { type: "string", minLength: 1 },
        explanation: { type: "string", minLength: 1 },
        severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
      },
    },
    a11yRules: { role: "alert", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["label", "value", "explanation", "severity"], path, issues);
      if (!nonEmptyString(props.label, `${path}.label`, issues, 100)) return undefined;
      if (!nonEmptyString(props.value, `${path}.value`, issues, 50)) return undefined;
      if (!nonEmptyString(props.explanation, `${path}.explanation`, issues, 300)) return undefined;
      const severity = enumString(props.severity, ["low", "medium", "high", "critical"] as const, `${path}.severity`, issues);
      return severity ? { label: props.label as string, value: props.value as string, explanation: props.explanation as string, severity } : undefined;
    },
  },
  OperationRow: {
    type: "OperationRow", category: "domain-ops", requiredProps: ["name", "owner", "updatedAt", "status"], optionalProps: ["metric"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["name", "owner", "updatedAt", "status"],
      properties: {
        name: { type: "string", minLength: 1 },
        owner: { type: "string", minLength: 1 },
        updatedAt: { type: "string", minLength: 1 },
        status: { type: "string", minLength: 1 },
        metric: { type: "string" },
      },
    },
    a11yRules: { role: "article", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["name", "owner", "updatedAt", "status", "metric"], path, issues);
      if (!nonEmptyString(props.name, `${path}.name`, issues, 150)) return undefined;
      if (!nonEmptyString(props.owner, `${path}.owner`, issues, 100)) return undefined;
      if (!nonEmptyString(props.updatedAt, `${path}.updatedAt`, issues, 50)) return undefined;
      if (!nonEmptyString(props.status, `${path}.status`, issues, 50)) return undefined;
      const out: OperationRowProps = { name: props.name as string, owner: props.owner as string, updatedAt: props.updatedAt as string, status: props.status as string };
      if (props.metric !== undefined && typeof props.metric === "string") out.metric = props.metric;
      return out;
    },
  },
  IncidentTimeline: {
    type: "IncidentTimeline", category: "domain-ops", requiredProps: ["label", "events"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["label", "events"],
      properties: {
        label: { type: "string", minLength: 1 },
        events: { type: "array", minItems: 1, maxItems: 20, items: { type: "string", minLength: 1 } },
      },
    },
    a11yRules: { role: "feed", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["label", "events"], path, issues);
      if (!nonEmptyString(props.label, `${path}.label`, issues, 100)) return undefined;
      const events = stringArray(props.events, `${path}.events`, issues, { min: 1, max: 20 });
      return events ? { label: props.label as string, events } : undefined;
    },
  },
  DataMatrix: {
    type: "DataMatrix", category: "domain-ops", requiredProps: ["columns", "rows"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["columns", "rows"],
      properties: {
        columns: { type: "array", minItems: 1, maxItems: 10, items: { type: "string", minLength: 1 } },
        rows: { type: "array", minItems: 1, maxItems: 20, items: { type: "string", minLength: 1 } },
      },
    },
    a11yRules: { role: "table", labelRequired: false },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["columns", "rows"], path, issues);
      const columns = stringArray(props.columns, `${path}.columns`, issues, { min: 1, max: 10 });
      const rows = stringArray(props.rows, `${path}.rows`, issues, { min: 1, max: 20 });
      return columns && rows ? { columns, rows } : undefined;
    },
  },
  ControlToggle: {
    type: "ControlToggle", category: "domain-ops", requiredProps: ["label", "description", "state"], optionalProps: ["guard"],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["label", "description", "state"],
      properties: {
        label: { type: "string", minLength: 1 },
        description: { type: "string", minLength: 1 },
        state: { type: "string", minLength: 1 },
        guard: { type: "string" },
      },
    },
    a11yRules: { role: "switch", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["label", "description", "state", "guard"], path, issues);
      if (!nonEmptyString(props.label, `${path}.label`, issues, 100)) return undefined;
      if (!nonEmptyString(props.description, `${path}.description`, issues, 300)) return undefined;
      if (!nonEmptyString(props.state, `${path}.state`, issues, 50)) return undefined;
      const out: ControlToggleProps = { label: props.label as string, description: props.description as string, state: props.state as string };
      if (props.guard !== undefined && typeof props.guard === "string") out.guard = props.guard;
      return out;
    },
  },
  AuditEntry: {
    type: "AuditEntry", category: "domain-ops", requiredProps: ["time", "actor", "action", "target"], optionalProps: [],
    jsonSchema: {
      type: "object", additionalProperties: false, required: ["time", "actor", "action", "target"],
      properties: {
        time: { type: "string", minLength: 1 },
        actor: { type: "string", minLength: 1 },
        action: { type: "string", minLength: 1 },
        target: { type: "string", minLength: 1 },
      },
    },
    a11yRules: { role: "article", labelRequired: true },
    validate: (props, path, issues) => {
      if (!isObject(props)) { issues.push(`${path}: object required`); return undefined; }
      exactKeys(props, ["time", "actor", "action", "target"], path, issues);
      if (!nonEmptyString(props.time, `${path}.time`, issues, 50)) return undefined;
      if (!nonEmptyString(props.actor, `${path}.actor`, issues, 100)) return undefined;
      if (!nonEmptyString(props.action, `${path}.action`, issues, 100)) return undefined;
      if (!nonEmptyString(props.target, `${path}.target`, issues, 100)) return undefined;
      return { time: props.time as string, actor: props.actor as string, action: props.action as string, target: props.target as string };
    },
  },
};

export function validateComponentProps<T extends AllComponentType>(
  type: T,
  props: unknown,
  path = `props(${type})`,
): ValidationResult<ComponentPropsMap[T]> {
  const issues: string[] = [];
  const def = COMPONENT_REGISTRY[type];
  if (!def) {
    return { ok: false, issues: [`${path}: unknown component type "${type}"`] };
  }
  const result = def.validate(props, path, issues);
  if (issues.length > 0 || !result) {
    return { ok: false, issues };
  }
  return { ok: true, value: result as ComponentPropsMap[T] };
}
