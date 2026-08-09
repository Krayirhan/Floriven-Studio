export const DESIGN_TEMPLATE_IDS = ["obsidian-precision", "serene-health", "terracotta-market", "electric-learning", "editorial-culture"] as const;

export type DesignTemplateId = (typeof DESIGN_TEMPLATE_IDS)[number];
export type GenerationDesignMode = "auto" | "template";
export type DesignPalette = "obsidian" | "serene" | "terracotta" | "electric" | "editorial";
export type CardStyle = "crisp" | "soft" | "layered" | "playful" | "minimal";
export type DesignDensity = "compact" | "comfortable" | "spacious";
export type NavigationStyle = "solid" | "floating" | "glass" | "minimal";

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

export function findDesignTemplate(id:string|undefined):DesignTemplate|undefined{return DESIGN_TEMPLATES.find((template)=>template.id===id)}
