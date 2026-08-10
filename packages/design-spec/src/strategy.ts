export const DESIGN_TEMPLATE_IDS = ["obsidian-precision", "serene-health", "terracotta-market", "electric-learning", "editorial-culture"] as const;

export type DesignTemplateId = (typeof DESIGN_TEMPLATE_IDS)[number];
export type GenerationDesignMode = "auto" | "template";
export type DesignPalette = "obsidian" | "serene" | "terracotta" | "electric" | "editorial";
export type CardStyle = "crisp" | "soft" | "layered" | "playful" | "minimal";
export type DesignDensity = "compact" | "comfortable" | "spacious";
export type NavigationStyle = "solid" | "floating" | "glass" | "minimal";
export type CardType = "metric" | "list" | "hero" | "split" | "timeline" | "media" | "glass" | "editorial";
export type ChartType = "bar" | "line" | "area" | "donut" | "radial" | "sparkline" | "heatmap" | "segmented";
export type ControlType = "switch" | "checkbox" | "toggle" | "segmented" | "accordion" | "disclosure";
export type PillType = "status" | "filter" | "category" | "tag" | "notification";
export type ButtonStyle = "solid" | "outline" | "ghost" | "gradient" | "icon-only" | "floating";
export type FormFieldStyle = "underline" | "filled" | "outlined" | "soft" | "compact" | "touch-large";
export type IconStyle = "outline" | "filled" | "duotone" | "geometric" | "hand-drawn" | "minimal";
export type SurfaceStyle = "flat" | "glass" | "paper" | "neon" | "soft-shadow" | "layered";
export type LayoutPattern = "grid" | "editorial-asymmetry" | "strict-grid" | "bento" | "stacked";
export type MotionEasing = "linear" | "standard" | "spring" | "ease-out" | "editorial";

export interface PresetTypography {
  family: string;
  displayFamily?: string;
  weight: number;
  headingWeight: number;
  letterSpacing: string;
  headingSize: string;
  lineHeight: string;
  uppercaseLabels: boolean;
}

export interface PresetGeometry {
  radius: string;
  border: string;
  shadow: string;
  elevation: string;
  padding: string;
  aspectRatio: string;
}

export interface PresetChartRules {
  types: readonly ChartType[];
  grid: "none" | "subtle" | "strong";
  tooltip: "none" | "compact" | "rich";
  palette: "single-accent" | "semantic" | "gradient" | "multi-accent" | "monochrome";
  density: "sparse" | "balanced" | "dense";
  animation: "none" | "subtle" | "energetic";
}

export interface PresetMotion {
  duration: string;
  easing: MotionEasing;
  cardOpen: "fade" | "slide" | "scale" | "lift" | "none";
  chartAnimation: "draw" | "grow" | "pulse" | "none";
  navigationTransition: "crossfade" | "slide" | "spring" | "none";
}

export interface DesignStrategy {
  mode: GenerationDesignMode;
  stylePresetId?: DesignTemplateId;
  /** @deprecated Read compatibility for documents generated before v3. */
  templateId?: DesignTemplateId;
  palette: DesignPalette;
  cardStyle: CardStyle;
  density: DesignDensity;
  navigationStyle: NavigationStyle;
  visualDirection: string;
  rationale: string[];
}

export interface StyleSystemProfile {
  typography: string;
  colorIntent: string;
  layoutRhythm: string;
  signatureComponents: readonly string[];
  avoid: readonly string[];
  compositionPatterns: readonly [string, string, string, string];
  /** v3 visual grammar. Optional for v2 fixture compatibility; required by production validation. */
  cardTypes?: readonly CardType[];
  cardGeometry?: PresetGeometry;
  chartRules?: PresetChartRules;
  controlTypes?: readonly ControlType[];
  pillTypes?: readonly PillType[];
  buttonStyles?: readonly ButtonStyle[];
  formFieldStyles?: readonly FormFieldStyle[];
  navigationModes?: readonly NavigationStyle[];
  typographyRules?: PresetTypography;
  layoutPatterns?: readonly LayoutPattern[];
  groupingStyle?: "flat-list" | "card-clusters" | "sectioned" | "divider-led" | "timeline" | "nested";
  iconStyle?: IconStyle;
  avatarShape?: "circle" | "square" | "masked" | "none";
  imageTreatment?: "full-bleed" | "editorial-crop" | "gradient-placeholder" | "masked" | "none";
  surfaceStyle?: SurfaceStyle;
  dividerStyle?: "invisible" | "thin" | "strong" | "accent" | "ink";
  statusStyle?: "semantic" | "pill" | "bar" | "stepper" | "timeline";
  dataPresentation?: "hero-metric" | "comparison" | "trend-delta" | "percentage" | "mini-chart";
  interactionStyle?: "subtle" | "tactile" | "energetic" | "precise" | "reduced";
  screenComposition?: Partial<Record<"dashboard" | "list" | "detail" | "form" | "analytics" | "settings", LayoutPattern>>;
  emptyStateStyle?: "illustrated" | "typographic" | "cta-led" | "minimal";
  modalStyle?: "bottom-sheet" | "centered" | "side-panel" | "full-screen";
  motion?: PresetMotion;
}

/** @deprecated Use StyleSystemProfile. Kept for source compatibility. */
export type TemplateSystemProfile = StyleSystemProfile;

export interface DesignTemplate {
  id: DesignTemplateId;
  version: "2.0.0";
  name: string;
  category: string;
  description: string;
  previewColor: string;
  strategy: Omit<DesignStrategy, "mode" | "templateId" | "rationale">;
  system: StyleSystemProfile;
}

export type StylePreset = DesignTemplate;

export const DESIGN_TEMPLATES: readonly DesignTemplate[] = [
  {
    id: "obsidian-precision",
    version: "2.0.0",
    name: "Obsidian Precision",
    category: "DARK · DENSE · TECHNICAL",
    previewColor: "#06111f",
    description: "Koyu neon katmanlar, keskin izometrik ritim, tabular veriler ve büyüleyici cyan/violet siber vurgu.",
    strategy: { palette: "obsidian", cardStyle: "crisp", density: "compact", navigationStyle: "glass", visualDirection: "Teknik siber kesinlik, yüksek kontrastlı neon dokunuşlar ve zengin katmanlı bilgi mimarisi" },
    system: {
      typography: "Mikro aralıklı neo-grotesk; tabular monospaced veriler ve keskin yüksek kontrastlı başlıklar",
      colorIntent: "Obsidian cam zemin, buzul beyazı tipografi, siber cyan ve mor gradient ışımaları",
      layoutRhythm: "8px kompakt ritim; cam paneller, neon ayırıcılar ve mikro veri çubukları",
      signatureComponents: ["Cam Panelli Kart", "Neon Durum Rozeti", "Tabular Metrik Çubuğu", "Buzul Cam Navigasyon"],
      avoid: ["Pastel zemin", "Aşırı yuvarlatılmış radyal köşe", "Geniş boşluk", "Donuk monokrom görünüm"],
      compositionPatterns: ["Siber Özet: neon aksan çubuğu + 3 tabular metrik + canlı durum", "Veri Taraması: filtre + neon kılavuz çizgileri + aksiyon", "Detay Paneli: geniş cam card + alt sinyaller", "Aksiyon Modalı: cam glow + belirgin neon CTA"]
    }
  },
  {
    id: "serene-health",
    version: "2.0.0",
    name: "Serene Flow",
    category: "CALM · SOFT · HUMAN",
    previewColor: "#173b32",
    description: "Sakin doğa tonları, yumuşak organik kartlar, lüks dokunma alanları ve insan odaklı huzurlu bir arayüz dili.",
    strategy: { palette: "serene", cardStyle: "soft", density: "comfortable", navigationStyle: "floating", visualDirection: "Sakin ve lüks organik ritim, güven veren yumuşak gölgeler ve nefes alan insani netlik" },
    system: {
      typography: "Lüks humanist sans; geniş satır aralıklı insani başlıklar ve dinlendirici gövde metni",
      colorIntent: "Sis beyazı zemin, derin adaçayı ve zümrüt aksanlar, yumuşak krem katmanlar",
      layoutRhythm: "14px nefes alan ritim; yuvarlatılmış insani kartlar ve geniş dokunma hedefleri",
      signatureComponents: ["Organik Katman Kartı", "Yumuşak Durum Rozeti", "Geniş Dokunma Alanlı CTA", "Yüzen Form Kartı"],
      avoid: ["Sert kaplama çizgileri", "Klinik soğuk tablolar", "Küçük sıkışık dokunma alanı", "Göz yoran zıt renkler"],
      compositionPatterns: ["Sakin Özet: ilham verici başlık + 2 insani metrik + yumuşak aksiyon", "Akış Taraması: nefes alan kartlar + yumuşak geçiş", "Form Girişi: geniş etiketli alanlar + insani yönlendirme", "Gelişim Takibi: lüks dairesel grafik + özet"]
    }
  },
  {
    id: "terracotta-market",
    version: "2.0.0",
    name: "Terracotta Atelier",
    category: "WARM · TACTILE · LAYERED",
    previewColor: "#40251c",
    description: "Sıcak krem ve terracotta tonları, editoryal serif vurguları ve zengin katmanlı dokunsal yüzeyler.",
    strategy: { palette: "terracotta", cardStyle: "layered", density: "comfortable", navigationStyle: "solid", visualDirection: "Dokunsal sıcaklık, editoryal lüks vurgular ve premium küratöryel sunum" },
    system: {
      typography: "Zarif display serif başlıklar + rafine sans gövde metinleri",
      colorIntent: "Krem zemin, terracotta aksiyon, kakao tipografi ve doğal toprak tonları",
      layoutRhythm: "16px katmanlı ritim; görsellerle derinleşen dokunsal kartlar ve editoryal çerçeve",
      signatureComponents: ["Serif Başlıklı Hero Kart", "Dokunsal Katman Kartı", "Toprak Tonlu Rozet", "Editoryal Çerçeve"],
      avoid: ["Soğuk siber tonlar", "Steril kurumsal grid", "Düz katmansız duvar", "Tipografik hiyerarşisizlik"],
      compositionPatterns: ["Küratör Özet: editoryal hero + seçilmiş koleksiyon kartları", "Koleksiyon Gridi: asimetrik kartlar + editoryal filtre", "Detay Sunumu: büyük görsel alanı + serif metrik + tek CTA", "Katmanlı Özet: katmanlı kart yığını + lüks altlık"]
    }
  },
  {
    id: "electric-learning",
    version: "2.0.0",
    name: "Electric Pulse",
    category: "VIVID · PLAYFUL · DYNAMIC",
    previewColor: "#29135d",
    description: "Canlı mor ve lime neon gradyanlar, dinamik kart siluetleri ve enerjik aksiyon sırası.",
    strategy: { palette: "electric", cardStyle: "playful", density: "comfortable", navigationStyle: "floating", visualDirection: "Canlı ve dinamik enerji, yüksek kontrastlı gradyan aksiyonlar ve motive edici görsel ritim" },
    system: {
      typography: "Dinamik yuvarlak grotesk; vurucu sayılar ve enerjik aksiyon etiketleri",
      colorIntent: "Gece moru ana yüzey, canlı lime/magenta gradyan vurgular ve ışıltılı rozetler",
      layoutRhythm: "12px enerjik ritim; asimetrik eğlenceli kartlar ve dikkat çekici aksiyonlar",
      signatureComponents: ["Gradyan Aksan Hero", "Dinamik İlerleme Çubuğu", "Lime Glow Rozet", "Yüzen Navigasyon"],
      avoid: ["Donuk gri tonlar", "Statik monoton listeler", "Belirsiz aksiyon butonları", "Aksiyonsuz boş alanlar"],
      compositionPatterns: ["Enerjik Özet: canlı hero + hedef barı + sıradaki görev", "Görev Haritası: eğlenceli adım kartları + aksiyon", "İlerleme Paneli: ışıltılı başarı rozeti + anlık geri bildirim", "Kazanım Ekranı: renkli tebrik card'ı + paylaşım CTA"]
    }
  },
  {
    id: "editorial-culture",
    version: "2.0.0",
    name: "Editorial Grid",
    category: "TYPE-LED · MINIMAL · ASYMMETRIC",
    previewColor: "#171614",
    description: "Dramatik serif tipografi, mürekkep siyahı ayırıcılar, minimal kontrast ve asimetrik küratöryel ritim.",
    strategy: { palette: "editorial", cardStyle: "minimal", density: "spacious", navigationStyle: "minimal", visualDirection: "Yüksek editoryal kontrast, tipografik zarafet ve rafine asimetrik sadelik" },
    system: {
      typography: "Dramatik display serif dev başlıklar + ultra temiz sans metadata",
      colorIntent: "Kâğıt beyazı zemin, mürekkep siyahı tipografi ve tek bir kontrollü canlı aksan",
      layoutRhythm: "20px ferah ritim; ince mürekkep çizgileri, numaralandırılmış listeler ve asimetrik grid",
      signatureComponents: ["Dramatik Serif Header", "İnce Mürekkep Çizgili Kart", "Numaralı Satır", "Minimalist Tab"],
      avoid: ["Yuvarlak renkli kartlar", "Kaba kutu gölgeleri", "Gereksiz kapalı container'lar", "Eşit monoton grid"],
      compositionPatterns: ["Kapak Özet: dev serif başlık + tek odak kartı + editoryal veri", "Keşif Gridi: asimetrik numaralı satırlar + ince çizgiler", "Detay Okuma: geniş tipografik alan + minimal aksiyon", "Arşiv Görünümü: kronolojik çizgi + minimal filtre"]
    }
  }
] as const;

const V3_PROFILES: Record<DesignTemplateId, Omit<StyleSystemProfile, "typography" | "colorIntent" | "layoutRhythm" | "signatureComponents" | "avoid" | "compositionPatterns">> = {
  "obsidian-precision": {
    cardTypes: ["metric", "glass", "split", "timeline"], cardGeometry: { radius: "8px", border: "1px solid translucent", shadow: "0 12px 30px black/40", elevation: "layered", padding: "12px", aspectRatio: "16/10" },
    chartRules: { types: ["line", "bar", "sparkline", "heatmap"], grid: "subtle", tooltip: "rich", palette: "single-accent", density: "dense", animation: "subtle" }, controlTypes: ["segmented", "toggle", "disclosure"], pillTypes: ["status", "filter", "notification"], buttonStyles: ["solid", "outline", "icon-only"], formFieldStyles: ["outlined", "compact"], navigationModes: ["glass"], typographyRules: { family: "Inter, sans-serif", displayFamily: "IBM Plex Mono, monospace", weight: 500, headingWeight: 750, letterSpacing: "-0.02em", headingSize: "22px", lineHeight: "1.15", uppercaseLabels: true }, layoutPatterns: ["strict-grid", "bento"], groupingStyle: "nested", iconStyle: "geometric", avatarShape: "square", imageTreatment: "masked", surfaceStyle: "glass", dividerStyle: "thin", statusStyle: "pill", dataPresentation: "comparison", interactionStyle: "precise", screenComposition: { dashboard: "bento", list: "strict-grid", detail: "bento", analytics: "strict-grid" }, emptyStateStyle: "minimal", modalStyle: "side-panel", motion: { duration: "160ms", easing: "standard", cardOpen: "lift", chartAnimation: "draw", navigationTransition: "crossfade" }
  },
  "serene-health": {
    cardTypes: ["metric", "hero", "list", "media"], cardGeometry: { radius: "24px", border: "1px solid soft", shadow: "0 14px 34px rgba(15,118,110,.08)", elevation: "soft", padding: "22px", aspectRatio: "4/3" }, chartRules: { types: ["area", "radial", "line", "donut"], grid: "none", tooltip: "compact", palette: "semantic", density: "sparse", animation: "subtle" }, controlTypes: ["switch", "segmented", "accordion"], pillTypes: ["status", "category", "tag"], buttonStyles: ["solid", "ghost", "floating"], formFieldStyles: ["soft", "touch-large"], navigationModes: ["floating"], typographyRules: { family: "Inter, sans-serif", displayFamily: "Nunito Sans, sans-serif", weight: 450, headingWeight: 700, letterSpacing: "-0.01em", headingSize: "23px", lineHeight: "1.3", uppercaseLabels: false }, layoutPatterns: ["stacked", "grid"], groupingStyle: "card-clusters", iconStyle: "minimal", avatarShape: "circle", imageTreatment: "masked", surfaceStyle: "soft-shadow", dividerStyle: "invisible", statusStyle: "semantic", dataPresentation: "trend-delta", interactionStyle: "tactile", screenComposition: { dashboard: "stacked", list: "grid", detail: "stacked", form: "stacked" }, emptyStateStyle: "illustrated", modalStyle: "bottom-sheet", motion: { duration: "280ms", easing: "spring", cardOpen: "scale", chartAnimation: "grow", navigationTransition: "spring" }
  },
  "terracotta-market": {
    cardTypes: ["hero", "editorial", "media", "split"], cardGeometry: { radius: "18px", border: "1px solid warm hairline", shadow: "0 10px 0 #ffedd5, 0 18px 36px rgba(124,45,18,.08)", elevation: "layered", padding: "18px", aspectRatio: "3/2" }, chartRules: { types: ["bar", "area", "segmented"], grid: "subtle", tooltip: "compact", palette: "single-accent", density: "balanced", animation: "subtle" }, controlTypes: ["segmented", "disclosure", "accordion"], pillTypes: ["category", "tag", "status"], buttonStyles: ["solid", "outline", "ghost"], formFieldStyles: ["filled", "soft", "touch-large"], navigationModes: ["solid"], typographyRules: { family: "Inter, sans-serif", displayFamily: "Playfair Display, Georgia, serif", weight: 450, headingWeight: 600, letterSpacing: "-0.03em", headingSize: "26px", lineHeight: "1.1", uppercaseLabels: false }, layoutPatterns: ["editorial-asymmetry", "grid"], groupingStyle: "sectioned", iconStyle: "duotone", avatarShape: "masked", imageTreatment: "editorial-crop", surfaceStyle: "paper", dividerStyle: "accent", statusStyle: "pill", dataPresentation: "hero-metric", interactionStyle: "tactile", screenComposition: { dashboard: "editorial-asymmetry", list: "grid", detail: "editorial-asymmetry", analytics: "editorial-asymmetry" }, emptyStateStyle: "cta-led", modalStyle: "centered", motion: { duration: "240ms", easing: "ease-out", cardOpen: "slide", chartAnimation: "grow", navigationTransition: "slide" }
  },
  "electric-learning": {
    cardTypes: ["hero", "metric", "split", "timeline"], cardGeometry: { radius: "24px 14px 24px 14px", border: "2px solid accent/15", shadow: "0 8px 0 accent/22", elevation: "playful", padding: "16px", aspectRatio: "1/1" }, chartRules: { types: ["radial", "bar", "donut", "sparkline"], grid: "none", tooltip: "rich", palette: "gradient", density: "balanced", animation: "energetic" }, controlTypes: ["toggle", "segmented", "switch", "accordion"], pillTypes: ["status", "notification", "category", "filter"], buttonStyles: ["gradient", "solid", "floating"], formFieldStyles: ["filled", "touch-large"], navigationModes: ["floating"], typographyRules: { family: "Inter, sans-serif", displayFamily: "Inter, sans-serif", weight: 600, headingWeight: 850, letterSpacing: "-0.04em", headingSize: "25px", lineHeight: "1.05", uppercaseLabels: true }, layoutPatterns: ["bento", "editorial-asymmetry"], groupingStyle: "card-clusters", iconStyle: "filled", avatarShape: "circle", imageTreatment: "gradient-placeholder", surfaceStyle: "neon", dividerStyle: "invisible", statusStyle: "bar", dataPresentation: "percentage", interactionStyle: "energetic", screenComposition: { dashboard: "bento", list: "bento", detail: "stacked", analytics: "bento" }, emptyStateStyle: "illustrated", modalStyle: "bottom-sheet", motion: { duration: "360ms", easing: "spring", cardOpen: "scale", chartAnimation: "pulse", navigationTransition: "spring" }
  },
  "editorial-culture": {
    cardTypes: ["editorial", "list", "timeline", "media"], cardGeometry: { radius: "0", border: "0 0 1.5px", shadow: "none", elevation: "flat", padding: "0 0 16px", aspectRatio: "auto" }, chartRules: { types: ["line", "sparkline", "segmented"], grid: "none", tooltip: "none", palette: "monochrome", density: "sparse", animation: "none" }, controlTypes: ["segmented", "disclosure"], pillTypes: ["tag", "category"], buttonStyles: ["ghost", "outline", "solid"], formFieldStyles: ["underline", "compact"], navigationModes: ["minimal"], typographyRules: { family: "Inter, sans-serif", displayFamily: "Playfair Display, Georgia, serif", weight: 400, headingWeight: 600, letterSpacing: "-0.04em", headingSize: "28px", lineHeight: "1.04", uppercaseLabels: true }, layoutPatterns: ["editorial-asymmetry", "strict-grid"], groupingStyle: "divider-led", iconStyle: "minimal", avatarShape: "none", imageTreatment: "editorial-crop", surfaceStyle: "flat", dividerStyle: "ink", statusStyle: "timeline", dataPresentation: "mini-chart", interactionStyle: "reduced", screenComposition: { dashboard: "editorial-asymmetry", list: "editorial-asymmetry", detail: "editorial-asymmetry", analytics: "strict-grid" }, emptyStateStyle: "typographic", modalStyle: "full-screen", motion: { duration: "0ms", easing: "editorial", cardOpen: "none", chartAnimation: "none", navigationTransition: "none" }
  }
};

export function findDesignTemplate(id: string | undefined): DesignTemplate | undefined {
  const template = DESIGN_TEMPLATES.find((candidate) => candidate.id === id);
  if (!template) return undefined;
  return { ...template, system: { ...template.system, ...V3_PROFILES[template.id] } };
}
