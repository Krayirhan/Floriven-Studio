export type VisualDirection =
  | "Professional Finance"
  | "Soft Futurism"
  | "Warm Organic"
  | "Calm Wellness"
  | "Playful Education"
  | "Editorial Minimal";

export interface TemplateItem {
  id: string;
  title: string;
  category: string;
  direction: VisualDirection;
  screenCount: number;
  description: string;
  themeColor: string;
  prompt: string;
}

export interface UploadedScreen {
  name: string;
  previewUrl: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  direction: VisualDirection;
  screens: number;
  lastUpdated: string;
  description: string;
}

export const templates: TemplateItem[] = [
  {
    id: "finance_pro",
    title: "Apex Wealth - Kişisel Finans OS",
    category: "FINTECH",
    direction: "Professional Finance",
    screenCount: 5,
    description: "Koyu obsidian tema, varlık halkaları, harcama grafikleri ve hızlı transfer ekranları.",
    themeColor: "#0f172a",
    prompt: "Genç profesyoneller için koyu obsidian temalı, harcama grafikleri, varlık dağılım halkaları ve bütçe analizi içeren modern bir kişisel finans uygulaması tasarla.",
  },
  {
    id: "soft_futurism",
    title: "Aether AI Asistan & Chat OS",
    category: "AI & SAAS",
    direction: "Soft Futurism",
    screenCount: 8,
    description: "Frosted glass UI, neon cyan vurular, canlı token sayaçları ve prompt studio akışı.",
    themeColor: "#0a0b1e",
    prompt: "Yapay zeka sohbet ve kod üretimi için frosted glass temalı, neon cyan/violet vurulu, sesli asistan ve node graph ekranları içeren futuristik bir SaaS uygulaması tasarla.",
  },
  {
    id: "warm_organic",
    title: "Nora Artisanal Coffee & Market",
    category: "E-COMMERCE",
    direction: "Warm Organic",
    screenCount: 6,
    description: "Sıcak terracotta & krem palet, kıvrımlı ürün kartları ve gurme roast detay ekranları.",
    themeColor: "#2c221e",
    prompt: "Özel kavrum kahve ve gurme lezzetler için terracotta ve sıcak kum tonlarında, serif başlıklar ve kıvrımlı ürün kartları olan yüksek kaliteli bir e-ticaret uygulaması tasarla.",
  },
  {
    id: "calm_wellness",
    title: "Melo Habit & Mindful Tracker",
    category: "WELLNESS",
    direction: "Calm Wellness",
    screenCount: 6,
    description: "Adaçayı yeşili, su ve uyku halkaları, dalga ses visualizer ve meditasyon çaları.",
    themeColor: "#192c24",
    prompt: "Zihin ve vücut sağlığı için adaçayı yeşili tonlarında, alışkanlık halkaları, meditasyon ses çaları ve uyku analiz ekranları içeren sakin bir wellness uygulaması tasarla.",
  },
  {
    id: "playful_edu",
    title: "LingoQuest Gamified Education",
    category: "EDTECH",
    direction: "Playful Education",
    screenCount: 7,
    description: "Canlı mercan & kehribar, 14 gün flame streak, XP yol haritası ve seviye rozetleri.",
    themeColor: "#2e1065",
    prompt: "Dil ve beceri öğrenimi için canlı mor ve kehribar tonlarında, 14 gün streak sayacı, XP ilerleme çubuğu ve quiz roadmap ekranları içeren eğlenceli bir eğitim uygulaması tasarla.",
  },
  {
    id: "editorial_minimal",
    title: "Küratör Architecture & Art",
    category: "MEDIA",
    direction: "Editorial Minimal",
    screenCount: 5,
    description: "Yüksek kontrast monokrom, geniş tipografi, dergi fotoğraf çerçeveleri ve makale stili.",
    themeColor: "#121212",
    prompt: "Mimari ve çağdaş sanat dergisi için monokrom, tam ekran fotoğraf çerçeveleri ve zarif dergi tipografisi içeren minimal bir editoryal içerik uygulaması tasarla.",
  },
];

export const projectsList: ProjectItem[] = [
  {
    id: "prj_finance_01",
    name: "Kişisel Finans",
    direction: "Editorial Minimal",
    screens: 3,
    lastUpdated: "5 dk önce",
    description: "Genç profesyoneller için bütçe, gelir ve harcama yönetimi mobil deneyimi.",
  },
  {
    id: "prj_wellness_02",
    name: "Melo Wellness",
    direction: "Calm Wellness",
    screens: 6,
    lastUpdated: "1 sa. önce",
    description: "Zihin ve vücut sağlığı için alışkanlık takip ve meditasyon akışı.",
  },
  {
    id: "prj_shop_03",
    name: "Nora Market",
    direction: "Warm Organic",
    screens: 4,
    lastUpdated: "Dün",
    description: "Kahve çekirdeği seçimi ve abonelik e-ticaret sepeti.",
  },
  {
    id: "prj_ai_04",
    name: "Aether AI",
    direction: "Soft Futurism",
    screens: 8,
    lastUpdated: "2 gün önce",
    description: "Prompt studio ve agent workflow yönetim ekranları.",
  },
];

export const quickStarts = [
  {
    label: "Kişisel finans",
    prompt: "Genç profesyoneller için kişisel finans uygulaması oluştur. Ana sayfa, işlemler ve bütçe detay ekranlarını tasarla. Güçlü tipografi, sade veri görselleştirmeleri ve güven veren bir tasarım sistemi kullan.",
  },
  {
    label: "Wellness tracker",
    prompt: "Zihin ve vücut sağlığı için wellness tracker uygulaması oluştur. Günlük özet, meditasyon çaları ve uyku analiz ekranlarını tasarla.",
  },
  {
    label: "E-ticaret",
    prompt: "Lüks giyim ve aksesuar markası için e-ticaret uygulaması oluştur. Ürün listesi, ürün detay ve sepet ödeme ekranlarını tasarla.",
  },
  {
    label: "AI asistan",
    prompt: "Yapay zeka sohbet ve kod üretimi için AI asistan uygulaması oluştur. Sohbet akışı, komut geçmişi ve ayarlar ekranlarını tasarla.",
  },
  {
    label: "Eğitim",
    prompt: "Dil ve beceri öğrenimi için gamified eğitim platformu oluştur. Yol haritası, pratik sınavı ve başarı ekranlarını tasarla.",
  },
  {
    label: "Sosyal topluluk",
    prompt: "Tasarımcılar ve yaratıcılar için sosyal topluluk uygulaması oluştur. Keşfet akışı, profil ve etkinlik detay ekranlarını tasarla.",
  },
];
