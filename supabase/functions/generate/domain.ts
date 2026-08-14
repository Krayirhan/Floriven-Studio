export type DomainPackId = "health-care" | "commerce" | "learning" | "publishing" | "operations";
import type { ScreenContract } from './screen-contract.ts'

/**
 * The UX shape a screen should take — decided from the user's task, never from
 * the visual style preset. Without this, every screen degrades to the one
 * layout the model finds "safe": header, big title, a stack of Cards, FAB, nav.
 */
export type ScreenArchetype = "dashboard" | "management_list" | "settings" | "form" | "detail" | "profile" | "analytics";
export type ExperiencePattern = "standard" | "calendar" | "timeline" | "gallery" | "board" | "map";

export function deriveExperiencePattern(input: string): ExperiencePattern {
  const value = input.toLocaleLowerCase("tr-TR");
  if (/takvim|calendar|haftalık plan|haftalik plan|randevu|saat blok/.test(value)) return "calendar";
  if (/zaman çizelgesi|zaman cizelgesi|timeline|geçmiş|gecmis|aktivite akışı/.test(value)) return "timeline";
  if (/galeri|gallery|portfolyo|fotoğraf|fotograf|görsel koleksiyon/.test(value)) return "gallery";
  if (/kanban|board|iş panosu|is panosu|kolon.*kart|sprint panosu/.test(value)) return "board";
  if (/harita|map|konumlar|rota|yakınımdaki|yakinimdaki/.test(value)) return "map";
  return "standard";
}

/** Falls back to a role-based archetype when the plan call omits one. */
export function deriveArchetype(role: ProductScreenSpec["role"]): ScreenArchetype {
  if (role === "settings") return "settings";
  if (role === "form" || role === "onboarding") return "form";
  if (role === "detail") return "detail";
  if (role === "overview") return "dashboard";
  return "management_list";
}

export type ProductScreenSpec = {
  id: string;
  name: string;
  route: string;
  purpose: string;
  sections: string[];
  role: "overview" | "core" | "detail" | "form" | "support" | "settings" | "onboarding";
  priority: "primary" | "secondary" | "tertiary";
  parentId?: string;
  navigationPlacement: "primary" | "hierarchical" | "utility" | "hidden";
  /** UX composition hints — optional so older callers/tests without them still type-check. */
  archetype?: ScreenArchetype;
  layoutPattern?: string;
  contentDensity?: "low" | "medium" | "high";
  heroAllowed?: boolean;
  fabAllowed?: boolean;
  patterns?: string[];
  experiencePattern?: ExperiencePattern;
  /** Semantic obligations preserved from planning through composition. */
  contract: ScreenContract;
};

export type ProductBlueprint = {
  productDomain: string;
  audience: string;
  entities: string[];
  capabilities: string[];
  contentVocabulary: string[];
  screens: ProductScreenSpec[];
  navigation: { primaryScreenIds: string[]; utilityScreenIds: string[] };
  screenPolicy: { requestedCount?: number; minCount: number; maxCount: number; rationale: string };
};

export type ScreenCountOptions = { requestedScreenCount?: number; minScreenCount?: number; maxScreenCount?: number };

export function resolveScreenPolicy(brief: string, scope?: string, options: ScreenCountOptions = {}) {
  const explicitFromBrief = brief.match(/\b(1[0-2]|[1-9])\s*(?:ekran|sayfa)\b/i);
  const scopedCount = scope === "Tek ekran" ? 1 : scope === "Tam akış" ? 8 : undefined;
  const requestedCandidate = options.requestedScreenCount ?? (explicitFromBrief ? Number(explicitFromBrief[1]) : scopedCount);
  const requestedCount = Number.isInteger(requestedCandidate) ? Math.min(12, Math.max(1, Number(requestedCandidate))) : undefined;
  const minCount = requestedCount ?? Math.min(8, Math.max(3, Number(options.minScreenCount) || 3));
  const maxCount = requestedCount ?? Math.min(8, Math.max(minCount, Number(options.maxScreenCount) || 8));
  return {
    ...(requestedCount ? { requestedCount } : {}),
    minCount,
    maxCount,
    rationale: requestedCount
      ? `Kullanıcının açık kapsamı nedeniyle tam ${requestedCount} ekran.`
      : "Ekran sayısı ürün görevleri, varlıkları ve gerekli destek akışlarına göre AI tarafından belirlenir.",
  };
}

export function meetsScreenPolicy(screenCount: number, policy: ProductBlueprint["screenPolicy"]): boolean {
  return policy.requestedCount !== undefined
    ? screenCount === policy.requestedCount
    : screenCount >= policy.minCount && screenCount <= policy.maxCount;
}

export function requiresSettingsScreen(capabilities: string[], contentVocabulary: string[]): boolean {
  const signals = [...capabilities, ...contentVocabulary].join(" ").toLocaleLowerCase("tr-TR");
  return /ayarlar?|bildirim(?:ler| tercihleri?)?|tema tercihi|para birimi|entegrasyon(?:lar)?|kullanıcı hesabı|hesap (?:ayarları|tercihleri|güvenliği|yönetimi)|çalışma alanı (?:ayarları|tercihleri|yönetimi)|güvenlik ayarları/.test(signals);
}

/** Repairs only JSON syntax noise; semantic validation still happens afterwards. */
export function parseModelJson(text: string): Record<string, unknown> {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("AI geçerli bir JSON nesnesi döndürmedi");
  const repaired = text
    .slice(start, end + 1)
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/([{,]\s*)([A-Za-z_][\w-]*)(\s*:)/g, '$1"$2"$3');
  return JSON.parse(repaired) as Record<string, unknown>;
}

type Node = Record<string, unknown>;

function asRecord(value: unknown): Node {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Node) : {};
}

function flattenNodes(node: Node): Node[] {
  const children = Array.isArray(node.children) ? (node.children as Node[]) : [];
  return [node, ...children.flatMap(flattenNodes)];
}

/**
 * Reconstructs a ProductBlueprint from screens the client already has, instead of
 * planning one from a one-line edit instruction. This is what stops an instruction
 * like "Dark mode yap" from being read as a brand-new app brief: the product identity
 * (screen names, routes, navigation) comes from the current document, never from the
 * instruction text.
 */
export function buildSyntheticBlueprint(screens: Node[]): ProductBlueprint {
  const firstNav = flattenNodes(asRecord(screens[0]?.root)).find(
    (node) => node.type === "BottomNavigation" || node.type === "TabBar",
  );
  const items = asRecord(firstNav?.props).items;
  const navNames = new Set(Array.isArray(items) ? items.filter((item): item is string => typeof item === "string") : []);
  const inNav = (name: string) => navNames.size === 0 || navNames.has(name);

  const screenSpecs: ProductScreenSpec[] = screens.map((screen, index) => ({
    id: String(screen.id),
    name: String(screen.name),
    route: String(screen.route ?? `/ekran-${index + 1}`),
    purpose: "",
    sections: [],
    role: index === 0 ? "overview" : "core",
    priority: "primary",
    navigationPlacement: inNav(String(screen.name)) && index < 5 ? "primary" : "utility",
    contract: {
      version: '1.0.0',
      job: '',
      requiredSections: [],
      primaryAction: '',
      secondaryActions: [],
      requiredData: [],
      navigationTargetIds: [],
      sectionRoles: [],
    },
  }));
  const primaryScreenIds = screenSpecs.filter((screen) => screen.navigationPlacement === "primary").map((screen) => screen.id);
  const utilityScreenIds = screenSpecs.filter((screen) => screen.navigationPlacement === "utility").map((screen) => screen.id);

  return {
    productDomain: "",
    audience: "",
    entities: [],
    capabilities: [],
    contentVocabulary: [],
    screens: screenSpecs,
    navigation: { primaryScreenIds, utilityScreenIds },
    screenPolicy: { minCount: screens.length, maxCount: screens.length, requestedCount: screens.length, rationale: "Mevcut dokümanın ekranları korunuyor." },
  };
}

/**
 * A single incidental keyword (e.g. one mention of "rapor" in an otherwise
 * unrelated brief) must never be enough to activate a domain pack — that pack
 * rewrites screen content, so a weak signal would silently override an
 * unrelated product with someone else's industry copy. A domain only
 * activates once several of its own keywords show up independently.
 */
const DOMAIN_MIN_SIGNALS = 2;

const DOMAIN_SIGNALS: { id: DomainPackId; keywords: string[] }[] = [
  { id: "health-care", keywords: ["ilaç", "doz", "tansiyon", "kan şekeri", "glukoz", "sağlık ölç", "hasta", "tedavi"] },
  { id: "commerce", keywords: ["ürün katalo", "sepet", "satın al", "sipariş", "stok", "varyant", "kargo", "e-ticaret", "pazar yeri"] },
  { id: "learning", keywords: ["ders", "öğren", "quiz", "soru çöz", "xp", "seviye yol", "eğitim", "kurs"] },
  { id: "publishing", keywords: ["yayın", "makale", "yazı arşiv", "editör", "dergi", "okuma süresi", "kültür yayını"] },
  { id: "operations", keywords: ["api gecik", "hata oran", "operasyon merkezi", "incident", "denetim kaydı", "sistem sinyali", "servis durumu"] },
];

/**
 * Selects capabilities only from product semantics. Visual style is deliberately
 * absent from this API so a preset cannot influence domain activation.
 */
export function resolveDomainPack(blueprint: ProductBlueprint, brief: string): DomainPackId | undefined {
  const corpus = [
    brief,
    blueprint.productDomain,
    ...blueprint.entities,
    ...blueprint.capabilities,
    ...blueprint.contentVocabulary,
  ].join(" ").toLocaleLowerCase("tr-TR");

  let best: { id: DomainPackId; score: number } | undefined;
  for (const signal of DOMAIN_SIGNALS) {
    const score = signal.keywords.filter((keyword) => corpus.includes(keyword)).length;
    if (score >= DOMAIN_MIN_SIGNALS && (!best || score > best.score)) {
      best = { id: signal.id, score };
    }
  }
  return best?.id;
}
