import { useEffect, useRef, useState } from "react";
import { AppShell } from "./AppShell";
import styles from "./DashboardPage.module.css";

export type VisualDirection =
  | "Professional Finance"
  | "Soft Futurism"
  | "Warm Organic"
  | "Calm Wellness"
  | "Playful Education"
  | "Editorial Minimal";

interface TemplateItem {
  id: string;
  title: string;
  category: string;
  direction: VisualDirection;
  screenCount: number;
  description: string;
  themeColor: string;
  prompt: string;
}

interface UploadedScreen {
  name: string;
  previewUrl: string;
}

const templates: TemplateItem[] = [
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

interface ProjectItem {
  id: string;
  name: string;
  direction: VisualDirection;
  screens: number;
  lastUpdated: string;
  description: string;
}

const projectsList: ProjectItem[] = [
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

const quickStarts = [
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

/* REALISTIC 3-SCREEN FEATURED HERO PREVIEW RENDERER */
function FinanceScreens3() {
  return (
    <div className={styles.screenStack3}>
      <div className={`${styles.mobilePhoneFrame3} ${styles.frameFinance3_1}`}>
        <div className={styles.notch} />
        <div className={styles.phoneHeader}>
          <span>09:41</span>
          <span className={styles.badgePill}>Pro</span>
        </div>
        <div className={styles.financeCard}>
          <small>Toplam Varlık</small>
          <b>₺184.250</b>
          <span className={styles.upTrend}>+₺14.200 bu ay</span>
        </div>
        <div className={styles.quickActions}>
          <div className={styles.actionPill}>Gönder</div>
          <div className={styles.actionPill}>İste</div>
          <div className={styles.actionPill}>Yatırım</div>
        </div>
        <div className={styles.miniChart}>
          <div style={{ height: "45%" }} />
          <div style={{ height: "65%" }} />
          <div style={{ height: "40%" }} />
          <div style={{ height: "85%" }} />
          <div style={{ height: "100%", background: "#10b981" }} />
        </div>
      </div>

      <div className={`${styles.mobilePhoneFrame3} ${styles.frameFinance3_2}`}>
        <div className={styles.notch} />
        <div className={styles.phoneHeader}>
          <span>Varlıklar</span>
          <span className={styles.dotIndicator} />
        </div>
        <div className={styles.donutPlaceholder}>
          <div className={styles.donutCenter}>%68</div>
        </div>
        <div className={styles.listRows}>
          <div className={styles.rowItem}><span className={styles.rowDotEmerald} />Hisse Senedi</div>
          <div className={styles.rowItem}><span className={styles.rowDotCyan} />Kripto Portföy</div>
          <div className={styles.rowItem}><span className={styles.rowDotGold} />Altın & Döviz</div>
        </div>
      </div>

      <div className={`${styles.mobilePhoneFrame3} ${styles.frameFinance3_3}`}>
        <div className={styles.notch} />
        <div className={styles.phoneHeader}>
          <span>İşlemler</span>
          <span>Tümü</span>
        </div>
        <div className={styles.txList}>
          <div className={styles.txRow}>
            <span>Market Hacmi</span>
            <b style={{ color: "#ef4444" }}>-₺340</b>
          </div>
          <div className={styles.txRow}>
            <span>Maaş Yatırımı</span>
            <b style={{ color: "#10b981" }}>+₺42.000</b>
          </div>
          <div className={styles.txRow}>
            <span>Borsa Alım</span>
            <b style={{ color: "#ef4444" }}>-₺1.200</b>
          </div>
        </div>
      </div>
    </div>
  );
}

function FinanceScreens() {
  return (
    <div className={styles.screenStack}>
      <div className={`${styles.mobilePhoneFrame} ${styles.frameFinance1}`}>
        <div className={styles.notch} />
        <div className={styles.phoneHeader}>
          <span>09:41</span>
          <span className={styles.badgePill}>Pro</span>
        </div>
        <div className={styles.financeCard}>
          <small>Toplam Varlık</small>
          <b>₺184.250</b>
          <span className={styles.upTrend}>+₺14.200 bu ay</span>
        </div>
        <div className={styles.quickActions}>
          <div className={styles.actionPill}>Gönder</div>
          <div className={styles.actionPill}>İste</div>
        </div>
      </div>
      <div className={`${styles.mobilePhoneFrame} ${styles.frameFinance2}`}>
        <div className={styles.notch} />
        <div className={styles.phoneHeader}>Analiz</div>
        <div className={styles.donutPlaceholder}><div className={styles.donutCenter}>%68</div></div>
      </div>
    </div>
  );
}

function FuturismScreens() {
  return (
    <div className={styles.screenStack}>
      <div className={`${styles.mobilePhoneFrame} ${styles.frameFuturism1}`}>
        <div className={styles.notch} />
        <div className={styles.phoneHeader}>
          <span className={styles.glowText}>AETHER AI</span>
        </div>
        <div className={styles.chatBubbleUser}><p>Mobil akış üret...</p></div>
        <div className={styles.chatBubbleAi}><p>3 ekranlı ödeme akışı hazır.</p></div>
      </div>
      <div className={`${styles.mobilePhoneFrame} ${styles.frameFuturism2}`}>
        <div className={styles.notch} />
        <div className={styles.phoneHeader}>Node Graph</div>
        <div className={styles.nodeBoxActive}><b>Claude 3.5</b></div>
      </div>
    </div>
  );
}

function OrganicScreens() {
  return (
    <div className={styles.screenStack}>
      <div className={`${styles.mobilePhoneFrame} ${styles.frameOrganic1}`}>
        <div className={styles.notch} />
        <div className={styles.phoneHeader}><span style={{ fontFamily: "serif" }}>NORA</span></div>
        <div className={styles.organicHeroBanner}>
          <small>Özel Kavrum</small>
          <h4>Ethiopia</h4>
        </div>
      </div>
      <div className={`${styles.mobilePhoneFrame} ${styles.frameOrganic2}`}>
        <div className={styles.notch} />
        <div className={styles.buyButtonOrganic}>Sipariş Ver</div>
      </div>
    </div>
  );
}

function WellnessScreens() {
  return (
    <div className={styles.screenStack}>
      <div className={`${styles.mobilePhoneFrame} ${styles.frameWellness1}`}>
        <div className={styles.notch} />
        <div className={styles.phoneHeader}>Günlük Özet</div>
        <div className={styles.ringContainer}><div className={styles.ringOuter}><div className={styles.ringInner}>8.4k</div></div></div>
      </div>
      <div className={`${styles.mobilePhoneFrame} ${styles.frameWellness2}`}>
        <div className={styles.notch} />
        <div className={styles.playButtonWellness}>▶ Başlat</div>
      </div>
    </div>
  );
}

function EducationScreens() {
  return (
    <div className={styles.screenStack}>
      <div className={`${styles.mobilePhoneFrame} ${styles.frameEdu1}`}>
        <div className={styles.notch} />
        <div className={styles.phoneHeader}>🔥 14 Gün</div>
        <div className={styles.eduCard}><b>UX Prensipleri</b></div>
      </div>
      <div className={`${styles.mobilePhoneFrame} ${styles.frameEdu2}`}>
        <div className={styles.notch} />
        <div className={styles.quizOption}>Fitts Yasası</div>
      </div>
    </div>
  );
}

function EditorialScreens() {
  return (
    <div className={styles.screenStack}>
      <div className={`${styles.mobilePhoneFrame} ${styles.frameEditorial1}`}>
        <div className={styles.notch} />
        <div className={styles.phoneHeader}>KÜRATÖR</div>
        <div className={styles.editorialPhotoHero}><span>MİMARİ</span></div>
      </div>
      <div className={`${styles.mobilePhoneFrame} ${styles.frameEditorial2}`}>
        <div className={styles.notch} />
        <div className={styles.edFrame} />
      </div>
    </div>
  );
}

function MultiScreenRenderer({ direction }: { direction: VisualDirection }) {
  switch (direction) {
    case "Professional Finance":
      return <FinanceScreens />;
    case "Soft Futurism":
      return <FuturismScreens />;
    case "Warm Organic":
      return <OrganicScreens />;
    case "Calm Wellness":
      return <WellnessScreens />;
    case "Playful Education":
      return <EducationScreens />;
    case "Editorial Minimal":
      return <EditorialScreens />;
    default:
      return <FinanceScreens />;
  }
}

const DEMO_PROJECT_ID = "prj_finance_01";

export function DashboardPage() {
  const [creationMode, setCreationMode] = useState<"mobile" | "web" | "redesign">("mobile");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [selectedQuickStart, setSelectedQuickStart] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const previewDialogRef = useRef<HTMLDivElement>(null);
  const [referenceName, setReferenceName] = useState<string | null>(null);

  // Latest Project Quick Actions & Preview State
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Advanced Options Accordion State
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [selectedPlatform, setSelectedPlatform] = useState("iOS");
  const [screenScope, setScreenScope] = useState("Temel akış");
  const [advancedDirection, setAdvancedDirection] = useState("Otomatik");
  const [advancedVariations, setAdvancedVariations] = useState(3);
  const [qualityMode, setQualityMode] = useState("Standart");

  // Web UI Contextual Settings
  const [webLayoutType, setWebLayoutType] = useState("Dashboard");
  const [webResponsiveTarget, setWebResponsiveTarget] = useState("Full responsive");
  const [webPageScope, setWebPageScope] = useState("Temel sayfalar");

  // Specialized AI Redesign Workflow State
  const [uploadedScreen, setUploadedScreen] = useState<UploadedScreen | null>(null);
  const [isDraggingScreenshot, setIsDraggingScreenshot] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [redesignStage, setRedesignStage] = useState<"upload" | "analyzing" | "ready" | "generated">("upload");
  const [preservationRules, setPreservationRules] = useState<string[]>([
    "İçeriği koru",
    "Kullanıcı aksiyonlarını koru",
    "Navigasyonu koru",
    "Veri alanlarını koru",
  ]);
  const [designDirection, setDesignDirection] = useState<string>("Otomatik");
  const [variationCount, setVariationCount] = useState<number>(3);
  const [redesignInstruction, setRedesignInstruction] = useState<string>("");

  const advancedSummary = [
    selectedPlatform !== "iOS" ? selectedPlatform : null,
    screenScope !== "Temel akış" ? screenScope : null,
    advancedDirection !== "Otomatik" ? advancedDirection : null,
    advancedVariations !== 3 ? `${advancedVariations} varyasyon` : null,
    qualityMode !== "Standart" ? qualityMode : null,
  ].filter(Boolean).join(" · ");

  const togglePreservationRule = (rule: string) => {
    setPreservationRules((prev) =>
      prev.includes(rule) ? prev.filter((r) => r !== rule) : [...prev, rule]
    );
  };

  const startGeneration = () => {
    setGenerating(true);
    window.setTimeout(() => {
      window.location.href = `/app/projeler/${DEMO_PROJECT_ID}/studio`;
    }, 650);
  };

  const handleSelectQuickStart = (chipPrompt: string) => {
    setPrompt(chipPrompt);
    setSelectedQuickStart(chipPrompt);
    const textarea = document.getElementById("design-prompt");
    if (textarea) {
      textarea.focus();
    }
  };

  const handlePromptChange = (value: string, textarea: HTMLTextAreaElement) => {
    setPrompt(value);
    setSelectedQuickStart(null);
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
  };

  const selectScreenshot = (file?: File) => {
    if (!file) return;

    const supportedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!supportedTypes.includes(file.type)) {
      setUploadError("Yalnızca PNG, JPG veya WebP dosyaları yükleyebilirsin.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Ekran görüntüsü en fazla 10 MB olabilir.");
      return;
    }

    if (uploadedScreen) URL.revokeObjectURL(uploadedScreen.previewUrl);
    setUploadedScreen({ name: file.name, previewUrl: URL.createObjectURL(file) });
    setUploadError(null);
    setRedesignStage("analyzing");
    window.setTimeout(() => setRedesignStage("ready"), 650);
  };

  const clearScreenshot = () => {
    if (uploadedScreen) URL.revokeObjectURL(uploadedScreen.previewUrl);
    setUploadedScreen(null);
    setUploadError(null);
    setRedesignStage("upload");
    if (uploadInputRef.current) uploadInputRef.current.value = "";
  };

  const selectReference = (file?: File) => {
    if (file) setReferenceName(file.name);
  };

  const startRedesign = () => {
    if (!uploadedScreen || redesignStage !== "ready") return;
    setGenerating(true);
    window.setTimeout(() => {
      setGenerating(false);
      setRedesignStage("generated");
    }, 800);
  };

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setShowPreviewModal(false);
      setShowProjectMenu(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    if (showPreviewModal) previewDialogRef.current?.focus();
  }, [showPreviewModal]);

  const handleSelectTemplate = (templatePrompt: string) => {
    setCreationMode("mobile");
    setPrompt(templatePrompt);
    const textarea = document.getElementById("design-prompt");
    if (textarea) {
      textarea.focus();
      textarea.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <AppShell>
      <main className={styles.page}>
        {/* HERO HEADER — FUNCTIONAL AND CLEAN (NO INTERNAL MARKETING) */}
        <section className={styles.hero}>
          <h1>Ne tasarlamak istiyorsun?</h1>
          <p>Mobil veya web fikrini anlat, mevcut ekranını yükle ya da kaldığın projeyle devam et.</p>
        </section>

        {/* FLOATING AI PROMPT CONSOLE (CONFIDENT DESKTOP CANVAS) */}
        <section className={styles.composerConsole} aria-labelledby="composer-title">
          <h2 id="composer-title" className={styles.srOnly}>Floriven tasarım oluşturucu</h2>
          {/* Mode Switcher Bar */}
          <div className={styles.modeBar}>
            <button
              className={creationMode === "mobile" ? styles.modeActive : ""}
              onClick={() => setCreationMode("mobile")}
              aria-pressed={creationMode === "mobile"}
            >
              <span>📱</span> Mobil Uygulama
            </button>
            <button
              className={creationMode === "web" ? styles.modeActive : ""}
              onClick={() => setCreationMode("web")}
              aria-pressed={creationMode === "web"}
            >
              <span>🌐</span> Web UI & Dashboard
            </button>
            <button
              className={creationMode === "redesign" ? styles.modeActive : ""}
              onClick={() => setCreationMode("redesign")}
              aria-pressed={creationMode === "redesign"}
            >
              <span>⚡</span> Ekranı Yeniden Tasarla
            </button>
          </div>

          {/* MODE 1 & MODE 2: MOBILE & WEB PROMPT CONSOLE */}
          {creationMode !== "redesign" ? (
            <>
              <div className={styles.consoleBody}>
                <textarea
                  id="design-prompt"
                  value={prompt}
                  onChange={(e) => handlePromptChange(e.target.value, e.currentTarget)}
                  placeholder={
                    creationMode === "mobile"
                      ? "Nasıl bir mobil uygulama tasarlamak istiyorsun?"
                      : "Nasıl bir web arayüzü veya dashboard tasarlamak istiyorsun?"
                  }
                  rows={3}
                />

                {/* INTEGRATED "Hızlı Başlangıçlar" PROMPT CHIPS */}
                <div className={styles.quickStartSection}>
                  <span className={styles.quickStartLabel}>Hızlı başlangıçlar</span>
                  <div className={styles.chipScrollRow}>
                    {quickStarts.map((chip) => (
                      <button
                        key={chip.label}
                        className={`${styles.quickChip} ${selectedQuickStart === chip.prompt ? styles.quickChipSelected : ""}`}
                        onClick={() => handleSelectQuickStart(chip.prompt)}
                        title={chip.prompt}
                        aria-label={`${chip.label}: öneri promptunu düzenleyiciye yerleştir`}
                      >
                        ✦ {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* COLLAPSIBLE ADVANCED OPTIONS (CONTEXTUAL TO MODE) */}
              {showAdvanced && (
                <div
                  id="advanced-options"
                  className={styles.advancedOptionsAccordion}
                  hidden={!showAdvanced}
                  aria-hidden={!showAdvanced}
                >
                  {creationMode === "mobile" ? (
                    <div className={styles.advancedGrid}>
                      <div className={styles.advancedGroup}>
                        <label className={styles.advancedLabel}>PLATFORM</label>
                        <div className={styles.advancedPillRow}>
                          {["iOS", "Android", "Her ikisi"].map((p) => (
                            <button
                              key={p}
                              className={`${styles.advPill} ${selectedPlatform === p ? styles.advPillActive : ""}`}
                              onClick={() => setSelectedPlatform(p)}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className={styles.advancedGroup}>
                        <label className={styles.advancedLabel}>EKRAN KAPSAMI</label>
                        <div className={styles.advancedPillRow}>
                          {["Tek ekran", "Temel akış", "Tam akış"].map((s) => (
                            <button
                              key={s}
                              className={`${styles.advPill} ${screenScope === s ? styles.advPillActive : ""}`}
                              onClick={() => setScreenScope(s)}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className={styles.advancedGroup}>
                        <label className={styles.advancedLabel}>TASARIM YÖNÜ</label>
                        <div className={styles.advancedPillRow}>
                          {[
                            "Otomatik",
                            "Editorial Minimal",
                            "Soft Futurism",
                            "Warm Organic",
                            "Professional",
                            "Experimental",
                          ].map((d) => (
                            <button
                              key={d}
                              className={`${styles.advPill} ${advancedDirection === d ? styles.advPillActive : ""}`}
                              onClick={() => setAdvancedDirection(d)}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className={styles.advancedGroup}>
                        <label className={styles.advancedLabel}>VARYASYON VE KALİTE</label>
                        <div className={styles.advancedPillRow}>
                          {[1, 2, 3].map((v) => (
                            <button
                              key={v}
                              className={`${styles.advPill} ${advancedVariations === v ? styles.advPillActive : ""}`}
                              onClick={() => setAdvancedVariations(v)}
                            >
                              {v} Varyasyon
                            </button>
                          ))}
                          {["Hızlı", "Standart", "Yüksek"].map((q) => (
                            <button
                              key={q}
                              className={`${styles.advPill} ${qualityMode === q ? styles.advPillActive : ""}`}
                              onClick={() => setQualityMode(q)}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* WEB UI CONTEXTUAL SETTINGS */
                    <div className={styles.advancedGrid}>
                      <div className={styles.advancedGroup}>
                        <label className={styles.advancedLabel}>LAYOUT TİPİ</label>
                        <div className={styles.advancedPillRow}>
                          {["Landing page", "Dashboard", "SaaS application", "E-commerce", "Admin panel"].map((l) => (
                            <button
                              key={l}
                              className={`${styles.advPill} ${webLayoutType === l ? styles.advPillActive : ""}`}
                              onClick={() => setWebLayoutType(l)}
                            >
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className={styles.advancedGroup}>
                        <label className={styles.advancedLabel}>RESPONSIVE HEDEF</label>
                        <div className={styles.advancedPillRow}>
                          {["Desktop", "Desktop + tablet", "Full responsive"].map((r) => (
                            <button
                              key={r}
                              className={`${styles.advPill} ${webResponsiveTarget === r ? styles.advPillActive : ""}`}
                              onClick={() => setWebResponsiveTarget(r)}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className={styles.advancedGroup}>
                        <label className={styles.advancedLabel}>SAYFA KAPSAMI</label>
                        <div className={styles.advancedPillRow}>
                          {["Tek sayfa", "Temel sayfalar", "Tam ürün akışı"].map((ps) => (
                            <button
                              key={ps}
                              className={`${styles.advPill} ${webPageScope === ps ? styles.advPillActive : ""}`}
                              onClick={() => setWebPageScope(ps)}
                            >
                              {ps}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CONSOLE FOOTER */}
              <footer className={styles.consoleFooter}>
                <div className={styles.optionPills}>
                  <button
                    className={`${styles.pillBtn} ${showAdvanced ? styles.pillBtnActive : ""}`}
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    aria-expanded={showAdvanced}
                    aria-controls="advanced-options"
                  >
                    <span>Gelişmiş seçenekler</span>
                    {advancedSummary && <small className={styles.advancedSummary}>{advancedSummary}</small>}
                    <span aria-hidden="true">{showAdvanced ? "▴" : "▾"}</span>
                  </button>
                </div>

                <div className={styles.actionButtons}>
                  <input
                    ref={referenceInputRef}
                    className={styles.fileInput}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) => selectReference(event.target.files?.[0])}
                  />
                  <button className={`${styles.refBtn} ${referenceName ? styles.refBtnAttached : ""}`} onClick={() => referenceInputRef.current?.click()} title="Görsel veya stil referansı ekle">
                    <span>+</span> Referans
                  </button>
                  {referenceName && <span className={styles.referenceStatus}>{referenceName}</span>}
                  <button
                    className={styles.generateBtn}
                    onClick={startGeneration}
                    disabled={generating || !prompt.trim()}
                  >
                    {generating ? (
                      <>
                        <span className={styles.spinner} /> Tasarlanıyor…
                      </>
                    ) : (
                      <>Floriven ile Üret ✦</>
                    )}
                  </button>
                </div>
              </footer>
            </>
          ) : (
            /* MODE 3: SPECIALIZED SCREENSHOT-TO-REDESIGN WORKFLOW */
            <div className={styles.redesignWorkflowContainer}>
              <div className={styles.redesignHeader}>
                <h2>Mevcut ekranını yeniden tasarla</h2>
                <p>
                  Floriven mevcut içerikleri, kullanıcı eylemlerini ve bilgi hiyerarşisini analiz eder;
                  işlevleri koruyarak yeni tasarım yönleri oluşturur.
                </p>
              </div>

              <div className={styles.redesignUploadSection}>
                {!uploadedScreen ? (
                  <div
                    className={`${styles.largeDropzone} ${isDraggingScreenshot ? styles.dropzoneDragging : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => uploadInputRef.current?.click()}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        uploadInputRef.current?.click();
                      }
                    }}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      setIsDraggingScreenshot(true);
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDragLeave={() => setIsDraggingScreenshot(false)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setIsDraggingScreenshot(false);
                      selectScreenshot(event.dataTransfer.files[0]);
                    }}
                    aria-label="Ekran görüntüsü yükle"
                  >
                    <input
                      ref={uploadInputRef}
                      className={styles.fileInput}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => selectScreenshot(event.target.files?.[0])}
                    />
                    <div className={styles.dropzoneIcon}>📸</div>
                    <b>Ekran görüntüsünü buraya bırak veya dosya seç</b>
                    <span className={styles.formatTag}>PNG · JPG · WebP</span>
                    <button
                      className={styles.secondaryUploadBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        uploadInputRef.current?.click();
                      }}
                    >
                      + Birden fazla ekran yükle
                    </button>
                  </div>
                ) : (
                  <div className={styles.uploadedPreviewBox}>
                    <div className={styles.previewThumbFrame}>
                      <div className={styles.notch} />
                      <img src={uploadedScreen.previewUrl} alt="Yüklenen ekran görüntüsü önizlemesi" />
                    </div>

                    <div className={styles.uploadedMeta}>
                      <div className={styles.fileTitleRow}>
                        <b>{uploadedScreen.name}</b>
                        <button
                          className={styles.changeFileBtn}
                          onClick={clearScreenshot}
                        >
                          Değiştir
                        </button>
                      </div>

                      {redesignStage === "analyzing" && <p className={styles.analysisPending} role="status">Ekran analiz ediliyor…</p>}
                      <div className={styles.aiAnalysisBox} aria-live="polite">
                        <span className={styles.analysisHeader}>Floriven şunları algıladı:</span>
                        <div className={styles.analysisBadgeGrid}>
                          <span className={styles.analysisBadgeOk}>✓ 4 ana aksiyon</span>
                          <span className={styles.analysisBadgeOk}>✓ 3 içerik bölümü</span>
                          <span className={styles.analysisBadgeOk}>✓ 1 alt navigasyon</span>
                          <span className={styles.analysisBadgeWarn}>⚠ 2 erişilebilirlik uyarısı</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {uploadError && <p className={styles.uploadError} role="alert">{uploadError}</p>}
              </div>

              <div className={styles.redesignControlsGrid}>
                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>KORUMA AYARLARI</label>
                  <div className={styles.pillsRow}>
                    {[
                      "İçeriği koru",
                      "Kullanıcı aksiyonlarını koru",
                      "Navigasyonu koru",
                      "Veri alanlarını koru",
                    ].map((rule) => {
                      const isChecked = preservationRules.includes(rule);
                      return (
                        <button
                          key={rule}
                          className={`${styles.togglePill} ${isChecked ? styles.pillChecked : ""}`}
                          onClick={() => togglePreservationRule(rule)}
                        >
                          {isChecked ? "✓" : "+"} {rule}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>TASARIM YÖNÜ</label>
                  <div className={styles.pillsRow}>
                    {[
                      "Otomatik",
                      "Editorial Minimal",
                      "Soft Futurism",
                      "Warm Organic",
                      "Modern Native",
                      "Experimental",
                    ].map((dir) => (
                      <button
                        key={dir}
                        className={`${styles.optionSelectPill} ${designDirection === dir ? styles.pillSelected : ""}`}
                        onClick={() => setDesignDirection(dir)}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>VARYASYONLAR</label>
                  <div className={styles.pillsRow}>
                    {[1, 2, 3].map((count) => (
                      <button
                        key={count}
                        className={`${styles.optionSelectPill} ${variationCount === count ? styles.pillSelected : ""}`}
                        onClick={() => setVariationCount(count)}
                        aria-pressed={variationCount === count}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.controlGroup}>
                  <label className={styles.controlLabel}>NEYİ DEĞİŞTİRMEK İSTİYORSUN?</label>
                  <input
                    type="text"
                    className={styles.redesignInstructionInput}
                    value={redesignInstruction}
                    onChange={(e) => setRedesignInstruction(e.target.value)}
                    placeholder="Örn: Kart kullanımını azalt, daha editoryal bir hiyerarşi kur ve premium bir finans ürünü hissi ver."
                  />
                </div>
              </div>

              <div className={styles.redesignFooter}>
                <button
                  className={styles.redesignPrimaryCta}
                  onClick={startRedesign}
                  disabled={generating || !uploadedScreen || redesignStage !== "ready"}
                >
                  {generating ? (
                    <>
                      <span className={styles.spinner} /> Yeniden tasarlanıyor…
                    </>
                  ) : (
                    <>✦ Yeniden tasarla</>
                  )}
                </button>
              </div>
              {redesignStage === "generated" && uploadedScreen && (
                <section className={styles.redesignResults} aria-labelledby="redesign-results-title">
                  <div>
                    <span className={styles.subHeader}>YENİDEN TASARIM SONUÇLARI</span>
                    <h3 id="redesign-results-title">İşlevleri koruyan {variationCount} tasarım yönü hazır</h3>
                  </div>
                  <div className={styles.redesignComparisonGrid}>
                    <figure className={styles.comparisonCard}>
                      <img src={uploadedScreen.previewUrl} alt="Yeniden tasarım için yüklenen orijinal ekran" />
                      <figcaption>Orijinal ekran</figcaption>
                    </figure>
                    {Array.from({ length: variationCount }, (_, index) => (
                      <figure className={styles.comparisonCard} key={index}>
                        <div className={`${styles.generatedScreen} ${styles[`generatedScreen${index + 1}`]}`} aria-hidden="true">
                          <span>{designDirection === "Otomatik" ? "Floriven" : designDirection}</span>
                          <b>{index + 1}. yön</b>
                          <i /><i /><i />
                        </div>
                        <figcaption>{index + 1}. alternatif</figcaption>
                      </figure>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </section>

        {/* 2. "KALDIĞIN YERDEN DEVAM ET" LATEST PROJECT SECTION (45% PREVIEW / 55% META) */}
        <section className={styles.continueSection}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.subHeader}>KALDIĞIN YERDEN DEVAM ET</span>
              <h2>Son Çalışılan Proje</h2>
            </div>
          </div>

          <article className={styles.continueHeroCardLarge}>
            {/* 45% VISUAL PREVIEW CONTAINER WITH 3 REAL MOBILE SCREENS */}
            <div className={styles.heroPreviewWindowLarge}>
              <div className={styles.previewGlowLarge} />
              <FinanceScreens3 />
            </div>

            {/* 55% PROJECT INFORMATION & ACTIONS */}
            <div className={styles.heroProjectMetaLarge}>
              <div className={styles.badgeGroup}>
                <span className={styles.readyBadge}>
                  <span className={styles.liveDot} /> Düzenlemeye hazır
                </span>
                <span className={styles.directionBadge}>Editorial Minimal</span>
              </div>
              <h3>Kişisel Finans</h3>
              <p>Genç profesyoneller için bütçe, gelir ve harcama yönetimi mobil deneyimi.</p>

              <div className={styles.projectTagsDetailed}>
                <span>📱 3 ekran</span>
                <span>🎨 3 varyasyon</span>
                <span>⏱ 5 dk önce düzenlendi</span>
              </div>

              {/* ACTION GROUP */}
              <div className={styles.heroActionGroup}>
                <a href={`/app/projeler/${DEMO_PROJECT_ID}/studio`} className={styles.heroPrimaryBtn}>
                  Düzenlemeye devam et
                </a>
                <button
                  className={styles.heroSecondaryBtn}
                  onClick={() => setShowPreviewModal(true)}
                >
                  Önizle
                </button>

                {/* Additional Quick Action Menu */}
                <div className={styles.menuWrapper}>
                  <button
                    className={styles.heroMenuBtn}
                    onClick={() => setShowProjectMenu(!showProjectMenu)}
                    aria-label="Proje seçenekleri"
                    aria-expanded={showProjectMenu}
                    aria-controls="project-actions-menu"
                  >
                    •••
                  </button>
                  {showProjectMenu && (
                    <div id="project-actions-menu" className={styles.heroDropdownMenu} role="menu">
                      <button onClick={() => setShowProjectMenu(false)}>✦ Varyasyon üret</button>
                      <button onClick={() => setShowProjectMenu(false)}>🔗 Paylaş</button>
                      <button onClick={() => setShowProjectMenu(false)}>📋 Çoğalt</button>
                      <button onClick={() => setShowProjectMenu(false)}>ℹ Proje detayları</button>
                      <button onClick={() => setShowProjectMenu(false)}>📦 Arşivle</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>
        </section>

        {/* QUICK PREVIEW MODAL */}
        {showPreviewModal && (
          <div className={styles.previewModalOverlay} onClick={() => setShowPreviewModal(false)}>
            <div ref={previewDialogRef} tabIndex={-1} className={styles.previewModalContent} role="dialog" aria-modal="true" aria-label="KiÅŸisel Finans ekran önizlemesi" onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div>
                  <h3>Kişisel Finans — 3 Ekran Önizleme</h3>
                  <span className={styles.modalSubtitle}>Editorial Minimal · 3 Varyasyon</span>
                </div>
                <button className={styles.closeModalBtn} onClick={() => setShowPreviewModal(false)} aria-label="Önizlemeyi kapat">
                  ✕
                </button>
              </div>
              <div className={styles.modalBodyScreens}>
                <FinanceScreens3 />
              </div>
              <div className={styles.modalFooter}>
                <a href={`/app/projeler/${DEMO_PROJECT_ID}/studio`} className={styles.heroPrimaryBtn}>
                  Düzenlemeye devam et →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 3. RECENT PROJECTS GRID ("DİĞER PROJELERİN" - 3 COLUMNS ON DESKTOP) */}
        <section className={styles.projectsSection}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.subHeader}>PROJELERİM</span>
              <h2>Diğer projelerin</h2>
            </div>
            <a href="/app/projeler" className={styles.linkMore}>Tümünü gör →</a>
          </div>

          <div className={styles.projectGrid}>
            {projectsList.map((project) => (
              <a
                key={project.id}
                href={`/app/projeler/${project.id}/studio`}
                className={styles.projectCard}
              >
                <div className={styles.projectCardPreviewHeader}>
                  <div className={styles.cardPreviewGlow} />
                  <MultiScreenRenderer direction={project.direction} />
                </div>
                <div className={styles.projectCardBody}>
                  <div className={styles.cardDirectionPill}>{project.direction}</div>
                  <div className={styles.cardTitleRow}>
                    <h3>{project.name}</h3>
                    <span className={styles.screenCountBadge}>{project.screens} ekran</span>
                  </div>
                  <p>{project.description}</p>
                  <div className={styles.cardFooterMeta}>
                    <span>{project.lastUpdated}</span>
                    <span className={styles.cardArrow}>Düzenle →</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* 4. TEMPLATE GALLERY ("POPÜLER TASARIM STİLLERİ") */}
        <section className={styles.inspirationSection}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.subHeader}>İlham ve şablonlar</span>
              <h2>Popüler tasarım stilleri</h2>
            </div>
          </div>

          <div className={styles.templateGrid}>
            {templates.map((tpl) => (
              <div key={tpl.id} className={styles.templateCard}>
                <div className={styles.templatePreviewWindow} style={{ background: tpl.themeColor }}>
                  <div className={styles.templatePreviewGlow} />
                  <MultiScreenRenderer direction={tpl.direction} />
                </div>

                <div className={styles.templateMeta}>
                  <div className={styles.templateHeaderRow}>
                    <span className={styles.templateCategory}>{tpl.category}</span>
                    <span className={styles.templateDirectionTag}>{tpl.direction}</span>
                  </div>
                  <h3>{tpl.title}</h3>
                  <p>{tpl.description}</p>

                  <div className={styles.templateFooterRow}>
                    <span className={styles.templateScreenTag}>📱 {tpl.screenCount} ekranlık akış</span>
                    <button
                      className={styles.useStyleBtn}
                      onClick={() => handleSelectTemplate(tpl.prompt)}
                    >
                      Bu stille başla
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
