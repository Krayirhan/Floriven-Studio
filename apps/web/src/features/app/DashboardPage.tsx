import { useState } from "react";
import { AppShell } from "./AppShell";
import styles from "./DashboardPage.module.css";

type ProjectColor = "violet" | "mint" | "orange" | "cyan";

interface InspirationCard {
  id: string;
  title: string;
  category: string;
  badge: string;
  description: string;
  gradient: string;
  prompt: string;
}

const inspirationCards: InspirationCard[] = [
  {
    id: "finance",
    title: "Kişisel Finans & Cüzdan",
    category: "Fintech",
    badge: "Terracotta Glass",
    description: "Koyu tema, harcama grafikleri, varlık özeti ve hızlı transfer ekranları.",
    gradient: "#3d2921",
    prompt: "Genç profesyoneller için koyu temalı, harcama grafikleri ve bütçe takibi olan modern bir kişisel finans uygulaması tasarla.",
  },
  {
    id: "wellness",
    title: "Health & Fitness Tracker",
    category: "Wellness",
    badge: "Warm Amber",
    description: "Günlük aktivite halkaları, su takibi, uyku kalitesi ve antrenman akışı.",
    gradient: "#26352a",
    prompt: "Spor ve sağlık takibi yapan, günlük halka grafikleri, kalori ve uyku analiz ekranları içeren minimalist bir wellness uygulaması tasarla.",
  },
  {
    id: "ecom",
    title: "E-Ticaret & Moda Market",
    category: "Shopping",
    badge: "Coral Bronze",
    description: "Öne çıkan ürünler, filtreleme, sepet detay ve hızlı ödeme adımları.",
    gradient: "#39262a",
    prompt: "Lüks giyim ve aksesuar markası için modern kart dizilimli, sepet ve ödeme ekranları olan yüksek kaliteli bir e-ticaret uygulaması tasarla.",
  },
  {
    id: "saas",
    title: "AI Asistan & Chat OS",
    category: "Productivity",
    badge: "Obsidian Gold",
    description: "Sohbet akışı, komut geçmişi, doküman özetleme ve ayarlar ekranı.",
    gradient: "#3b301d",
    prompt: "Yapay zeka sohbet asistanı için obsidian temalı, sesli komut ve doküman analiz ekranları içeren premium bir SaaS uygulaması tasarla.",
  },
];

const projects: Array<{ id: string; name: string; meta: string; color: ProjectColor; screens: number }> = [
  { id: "prj_finance_01", name: "Kişisel Finans", meta: "5 dk önce güncellendi", color: "violet", screens: 3 },
  { id: "prj_wellness_02", name: "Melo Wellness", meta: "1 saat önce güncellendi", color: "mint", screens: 6 },
  { id: "prj_shop_03", name: "Nora Market", meta: "Dün güncellendi", color: "orange", screens: 4 },
];

function MobileScreen({ color, detail = false }: { color: ProjectColor; detail?: boolean }) {
  const colorClass = {
    violet: styles.screenViolet,
    mint: styles.screenMint,
    orange: styles.screenOrange,
    cyan: styles.screenCyan,
  }[color];

  return (
    <div className={`${styles.mobileScreen} ${colorClass}`} aria-hidden="true">
      <i className={styles.phoneNotch} />
      <div className={styles.screenTop}>
        <span>{detail ? "Analiz" : "Bakiye"}</span>
        <i />
      </div>
      {detail ? (
        <>
          <div className={styles.screenChart}>
            <i /><i /><i /><i /><i />
          </div>
          <div className={styles.screenRows}><i /><i /></div>
        </>
      ) : (
        <>
          <div className={styles.screenHero}>
            <small>Varlıklarım</small>
            <b>₺48.250</b>
            <span>+%12,4</span>
          </div>
          <div className={styles.screenRows}><i /><i /><i /></div>
        </>
      )}
    </div>
  );
}

export function DashboardPage() {
  const [platform, setPlatform] = useState<"mobile" | "web" | "redesign">("mobile");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  const startGeneration = () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    window.setTimeout(() => {
      window.location.href = "/app/projeler/prj_finance_01/studio";
    }, 650);
  };

  const handleSelectInspiration = (cardPrompt: string) => {
    setPrompt(cardPrompt);
    const textarea = document.getElementById("design-prompt");
    if (textarea) {
      textarea.focus();
    }
  };

  return (
    <AppShell>

      <main className={styles.page}>
        {/* HERO HEADER */}
        <section className={styles.hero}>
          <div className={styles.heroBadge}>
            <span>FLORIVEN AI STUDIO v2.0</span>
          </div>
          <h1>Ne tasarlamak istiyorsun?</h1>
          <p>Hayalindeki mobil veya web uygulamasını tarif et; Floriven ekranları ve tasarım sistemini anında üretsin.</p>
        </section>

        {/* FLOATING AI PROMPT CONSOLE */}
        <section className={styles.composerConsole} aria-labelledby="composer-title">
          {/* Mode Pill Bar */}
          <div className={styles.modeBar}>
            <button
              className={platform === "mobile" ? styles.modeActive : ""}
              onClick={() => setPlatform("mobile")}
            >
              <span>📱</span> Mobil Uygulama
            </button>
            <button
              className={platform === "web" ? styles.modeActive : ""}
              onClick={() => setPlatform("web")}
            >
              <span>🌐</span> Web UI & Dashboard
            </button>
            <button
              className={platform === "redesign" ? styles.modeActive : ""}
              onClick={() => setPlatform("redesign")}
            >
              <span>⚡</span> Ekranı Yeniden Tasarla
            </button>
          </div>

          {/* Console Main Body */}
          <div className={styles.consoleBody}>
            {platform !== "redesign" ? (
              <textarea
                id="design-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Örn: Koyu temalı, harcama grafikleri ve bütçe detayları içeren modern bir kişisel finans uygulaması tasarla..."
                rows={3}
              />
            ) : (
              <div className={styles.uploadZone}>
                <div className={styles.uploadIcon}>📸</div>
                <div className={styles.uploadText}>
                  <b>Mevcut ekran görüntünü sürükle veya seç</b>
                  <p>Floriven mevcut bileşen dizilimini analiz eder ve modern bir UI versiyonuna dönüştürür.</p>
                </div>
                <button className={styles.uploadBtn}>Dosya Seç</button>
              </div>
            )}
          </div>

          {/* Console Action Bar */}
          <footer className={styles.consoleFooter}>
            <div className={styles.optionPills}>
              <button className={styles.pillBtn}>
                <span>iOS 27</span> ▾
              </button>
              <button className={styles.pillBtn}>
                <span>Temel Akış (3-5 Ekran)</span> ▾
              </button>
              <button className={styles.pillBtn}>
                <span>Otomatik Tema</span> ▾
              </button>
            </div>

            <div className={styles.actionButtons}>
              <button className={styles.refBtn} title="Görsel veya stil referansı ekle">
                <span>+</span> Referans
              </button>
              <button
                className={styles.generateBtn}
                onClick={startGeneration}
                disabled={generating || (platform !== "redesign" && !prompt.trim())}
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
        </section>

        {/* VISUAL INSPIRATION GALLERY */}
        <section className={styles.inspirationSection}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.subHeader}>İLHAM ALIN</span>
              <h2>Popüler Tasarım Stilleri & Şablonlar</h2>
            </div>
            <span className={styles.headerTag}>Hazır Promptlar</span>
          </div>

          <div className={styles.inspirationGrid}>
            {inspirationCards.map((card) => (
              <div
                key={card.id}
                className={styles.inspirationCard}
                style={{ background: card.gradient }}
                onClick={() => handleSelectInspiration(card.prompt)}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.categoryBadge}>{card.category}</span>
                  <span className={styles.styleBadge}>{card.badge}</span>
                </div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <div className={styles.cardFooter}>
                  <span>Bu stili kullan</span>
                  <span className={styles.arrowIcon}>→</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HERO RECENT PROJECT CARD */}
        <section className={styles.continueSection}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.subHeader}>KALDIĞIN YERDEN DEVAM ET</span>
              <h2>Son Çalışılan Proje</h2>
            </div>
            <a href="/app/projeler" className={styles.linkMore}>Tüm Projeler →</a>
          </div>

          <article className={styles.continueHeroCard}>
            <div className={styles.heroPreviewWindow}>
              <div className={styles.previewGlow} />
              <MobileScreen color="violet" />
              <MobileScreen color="violet" detail />
            </div>

            <div className={styles.heroProjectMeta}>
              <div className={styles.readyBadge}>
                <span className={styles.liveDot} /> Düzenlemeye Hazır
              </div>
              <h3>Kişisel Finans Uygulaması</h3>
              <p>Genç profesyoneller için bütçe, gelir ve harcama yönetimi mobil deneyimi.</p>
              <div className={styles.projectTags}>
                <span>3 Ekran</span>
                <span>3 Varyasyon</span>
                <span>5 dakika önce</span>
              </div>
            </div>

            <a href="/app/projeler/prj_finance_01/studio" className={styles.heroOpenBtn}>
              Projeyi Aç →
            </a>
          </article>
        </section>

        {/* OTHER RECENT PROJECTS GRID */}
        <section className={styles.projectsSection}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.subHeader}>PROJELERİM</span>
              <h2>Diğer Çalışmaların</h2>
            </div>
            <a href="/app/projeler" className={styles.linkMore}>Tümünü Gör →</a>
          </div>

          <div className={styles.projectGrid}>
            {projects.map((project) => (
              <a
                key={project.id}
                href={`/app/projeler/${project.id}/studio`}
                className={styles.projectCard}
              >
                <div className={styles.projectCardThumb}>
                  <MobileScreen color={project.color} />
                </div>
                <div className={styles.projectCardInfo}>
                  <div className={styles.cardTitleRow}>
                    <h3>{project.name}</h3>
                    <span className={styles.screenCount}>{project.screens} ekran</span>
                  </div>
                  <p>{project.meta}</p>
                </div>
                <span className={styles.cardArrow}>→</span>
              </a>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
