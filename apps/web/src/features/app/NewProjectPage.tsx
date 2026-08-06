import { useState } from "react";
import { AppShell } from "./AppShell";
import { mockProjectService } from "../../services/mockProjectService";
import styles from "./ProductPages.module.css";

export function NewProjectPage() {
  const [name, setName] = useState("");
  const [brief, setBrief] = useState("");
  const [platform, setPlatform] = useState<"iOS" | "Android" | "Web">("iOS");
  const [screensCount, setScreensCount] = useState<number>(3);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const project = mockProjectService.create(name || "Yeni Proje", brief);
    window.location.href = `/app/projeler/${project.id}/studio`;
  };

  return (
    <AppShell>
      <div className={styles.formPage}>
        <a href="/app" className={styles.back}>
          ← Dashboard'a Dön
        </a>
        <div className={styles.newProjectGrid}>
          <div>
            <span className={styles.kicker}>YENİ PROJE OLUŞTUR</span>
            <h1>Fikrini arayüze dönüştür.</h1>
            <p className={styles.formIntro}>
              Uygulamanı birkaç cümleyle anlat. Floriven Studio ilk ekran akışını ve renk paletini anında hazırlasın.
            </p>
            <form className={styles.projectForm} onSubmit={submit}>
              <label>
                Proje Adı
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn. Kişisel Finans & Cüzdan"
                />
              </label>

              <label>
                Platform Seçimi
                <div className={styles.platformGrid}>
                  {[
                    { id: "iOS", label: "Apple iOS", icon: "📱", desc: "SF Pro Font & Human Interface" },
                    { id: "Android", label: "Android UI", icon: "🤖", desc: "Material Design 3" },
                    { id: "Web", label: "Web & SaaS", icon: "🌐", desc: "Responsive Dashboard Grid" },
                  ].map((p) => (
                    <div
                      key={p.id}
                      className={`${styles.platformTile} ${platform === p.id ? styles.platformActive : ""}`}
                      onClick={() => setPlatform(p.id as any)}
                    >
                      <span className={styles.platformIcon}>{p.icon}</span>
                      <b>{p.label}</b>
                      <small>{p.desc}</small>
                    </div>
                  ))}
                </div>
              </label>

              <label>
                Ürün Brief'i (Tasarım Komutu)
                <textarea
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="Genç profesyonellerin gelir ve giderlerini takip edebileceği, koyu temalı, harcama grafikleri ve bütçe detay ekranları olan bir mobil finans uygulaması..."
                  rows={5}
                  required
                />
              </label>

              <label>
                Hedef Ekran Sayısı
                <div className={styles.screenPillGrid}>
                  {[
                    { count: 3, label: "3 Ekran (Hızlı Prototip)" },
                    { count: 5, label: "5 Ekran (Ana Akış)" },
                    { count: 8, label: "8+ Ekran (Komple App)" },
                  ].map((s) => (
                    <button
                      type="button"
                      key={s.count}
                      className={`${styles.screenPill} ${screensCount === s.count ? styles.screenPillActive : ""}`}
                      onClick={() => setScreensCount(s.count)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </label>

              <div className={styles.templateRow}>
                <span>Hazır Brief Şablonu:</span>
                {(
                  [
                    ["Wellness", "Günlük su, uyku ve kalori takibi yapan sakin bir healt-tech uygulaması."],
                    ["E-ticaret", "Lüks giyim ve aksesuar markası için sepet ve ödeme ekranları olan mobil market."],
                    ["Kişisel Finans", "Bütçe hedefleri ve harcama grafikleri olan sade finans cüzdanı."],
                  ] as const
                ).map(([label, text]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setName(`${label} Uygulaması`);
                      setBrief(text);
                    }}
                  >
                    + {label}
                  </button>
                ))}
              </div>

              <button className={styles.primarySubmit} type="submit">
                <span>Floriven Studio ile Üret</span> <span>✦ →</span>
              </button>
            </form>
          </div>

          <aside className={styles.aiContextPanel}>
            <div className={styles.aiContextInner}>
              <span className={styles.aiContextHeader}>
                ✦ AI Tasarım Analizi
              </span>
              {brief.length > 15 ? (
                <div className={styles.aiContextSummary}>
                  <p>Algılanan Parametreler:</p>
                  <ul>
                    <li>Hedef Platform: <b>{platform}</b></li>
                    <li>Ekran Akışı: <b>{screensCount} Ekran</b></li>
                    <li>
                      Kategori:{" "}
                      <b>
                        {brief.toLowerCase().includes("finans") || brief.toLowerCase().includes("bütçe")
                          ? "Fintech / Finans"
                          : brief.toLowerCase().includes("wellness") || brief.toLowerCase().includes("sağlık")
                          ? "Wellness / Health"
                          : brief.toLowerCase().includes("ticaret") || brief.toLowerCase().includes("market")
                          ? "E-Ticaret / Shopping"
                          : "Genel Mobil UI"}
                      </b>
                    </li>
                  </ul>

                  <div className={styles.suggestedPalette}>
                    <small>Önerilen Renk Teması:</small>
                    <div className={styles.paletteDots}>
                      <span style={{ background: "var(--template-finance)" }} title="Primary Accent" />
                      <span style={{ background: "var(--color-success)" }} title="Success Green" />
                      <span style={{ background: "#090913" }} title="Obsidian Canvas" />
                    </div>
                  </div>

                  <div className={styles.creditEstimate}>
                    <small>Tahmini Harcama:</small>
                    <b>{screensCount * 3} Kredi</b>
                  </div>
                </div>
              ) : (
                <div className={styles.aiContextEmpty}>
                  <span className={styles.emptySparkle}>✨</span>
                  <p>Brief yazdıkça Floriven'in otomatik algıladığı stil, renk paleti ve kategori özeti burada belirecek.</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

