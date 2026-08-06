import { useEffect, useRef, useState } from "react";
import styles from "./Hero.module.css";

const PROMPT =
  "Genç kullanıcılar için sade ve güven veren bir kişisel finans uygulaması tasarla. Ana sayfa, işlemler ve bütçe ekranı oluştur.";

function TypingPrompt() {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const idx = useRef(0);
  useEffect(() => {
    const t = setInterval(() => {
      if (idx.current >= PROMPT.length) {
        setDone(true);
        clearInterval(t);
        return;
      }
      setDisplayed(PROMPT.slice(0, idx.current + 1));
      idx.current++;
    }, 28);
    return () => clearInterval(t);
  }, []);
  return (
    <span>
      {displayed}
      {!done && <span className={styles.cursor} aria-hidden="true" />}
    </span>
  );
}

function PhoneFinance({ screen }: { screen: 0 | 1 | 2 }) {
  if (screen === 0)
    return (
      <div className={styles.phoneBody}>
        <div className={styles.pTopBar}>
          <span className={styles.pGreeting}>Merhaba, Emre 👋</span>
          <div className={styles.pAvatar} aria-hidden="true" />
        </div>
        <div className={styles.pBalanceCard}>
          <div className={styles.pBalLabel}>Toplam Bakiye</div>
          <div className={styles.pBalAmount}>
            ₺24.850<span className={styles.pBalCents}>,00</span>
          </div>
          <div className={styles.pBalChange}>↑ %3,2 bu ay</div>
          <div className={styles.pMiniChart} aria-hidden="true">
            <svg
              viewBox="0 0 120 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polyline
                points="0,35 20,28 40,30 60,18 80,22 100,12 120,8"
                stroke="rgba(124,111,247,0.8)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="0,35 20,28 40,30 60,18 80,22 100,12 120,8 120,40 0,40"
                fill="rgba(124,111,247,0.12)"
                stroke="none"
              />
            </svg>
          </div>
        </div>
        <div className={styles.pSection}>Hızlı İşlemler</div>
        <div className={styles.pQuickRow}>
          {["Gönder", "Al", "Öde", "Tasarruf"].map((a) => (
            <div key={a} className={styles.pQuick}>
              <div className={styles.pQuickIcon} aria-hidden="true" />
              <span>{a}</span>
            </div>
          ))}
        </div>
        <div className={styles.pSection}>Son Harcamalar</div>
        {[
          { name: "Spotify", cat: "Eğlence", amt: "-₺54" },
          { name: "Market", cat: "Gıda", amt: "-₺312" },
          { name: "Maaş", cat: "Gelir", amt: "+₺8.500", positive: true },
        ].map((tx) => (
          <div key={tx.name} className={styles.pTxRow}>
            <div className={styles.pTxDot} aria-hidden="true" />
            <div className={styles.pTxInfo}>
              <span className={styles.pTxName}>{tx.name}</span>
              <span className={styles.pTxCat}>{tx.cat}</span>
            </div>
            <span className={tx.positive ? styles.pTxPos : styles.pTxNeg}>
              {tx.amt}
            </span>
          </div>
        ))}
      </div>
    );

  if (screen === 1)
    return (
      <div className={styles.phoneBody}>
        <div className={styles.pNavRow}>
          <span className={styles.pBack}>←</span>
          <span className={styles.pTitle}>İşlemler</span>
          <span className={styles.pFilter}>Filtre</span>
        </div>
        <div className={styles.pSearchBar}>🔍 Ara...</div>
        <div className={styles.pMonthLabel}>Ağustos 2026</div>
        {[
          {
            name: "Teknoloji Mağazası",
            cat: "Alışveriş",
            amt: "-₺2.199",
            d: "Bugün",
          },
          { name: "Netflix", cat: "Abonelik", amt: "-₺89", d: "Dün" },
          {
            name: "Freelance Ödeme",
            cat: "Gelir",
            amt: "+₺3.200",
            d: "2 gün önce",
            pos: true,
          },
          { name: "Restoran", cat: "Yemek", amt: "-₺145", d: "3 gün önce" },
          {
            name: "Elektrik Faturası",
            cat: "Fatura",
            amt: "-₺280",
            d: "4 gün önce",
          },
        ].map((tx) => (
          <div key={tx.name} className={styles.pTxRow}>
            <div className={styles.pTxDot} aria-hidden="true" />
            <div className={styles.pTxInfo}>
              <span className={styles.pTxName}>{tx.name}</span>
              <span className={styles.pTxCat}>
                {tx.cat} · {tx.d}
              </span>
            </div>
            <span className={tx.pos ? styles.pTxPos : styles.pTxNeg}>
              {tx.amt}
            </span>
          </div>
        ))}
      </div>
    );

  return (
    <div className={styles.phoneBody}>
      <div className={styles.pNavRow}>
        <span className={styles.pBack}>←</span>
        <span className={styles.pTitle}>Bütçe</span>
        <span className={styles.pFilter}>+</span>
      </div>
      <div className={styles.pBudgetHeader}>
        <div className={styles.pBudgetLabel}>Ağustos Harcaması</div>
        <div className={styles.pBudgetAmt}>
          ₺3.278 <span className={styles.pBudgetOf}>/ ₺5.000</span>
        </div>
      </div>
      <div className={styles.pProgressWrap}>
        <div className={styles.pProgressBar}>
          <div
            className={styles.pProgressFill}
            style={{ width: "65%" }}
            aria-label="Bütçenin %65'i harcandı"
          />
        </div>
        <span className={styles.pProgressPct}>%65</span>
      </div>
      {[
        { cat: "Yemek & İçecek", spent: 680, total: 1000, pct: 68 },
        { cat: "Ulaşım", spent: 220, total: 400, pct: 55 },
        { cat: "Eğlence", spent: 143, total: 200, pct: 72 },
        { cat: "Alışveriş", spent: 2199, total: 2000, pct: 100, over: true },
      ].map((b) => (
        <div key={b.cat} className={styles.pBudgetItem}>
          <div className={styles.pBudgetItemTop}>
            <span className={styles.pBudgetCat}>{b.cat}</span>
            <span className={b.over ? styles.pBudgetOver : styles.pBudgetRem}>
              ₺{b.spent} / ₺{b.total}
            </span>
          </div>
          <div className={styles.pBudgetItemBar}>
            <div
              className={
                b.over ? styles.pBudgetItemFillOver : styles.pBudgetItemFill
              }
              style={{ width: `${Math.min(b.pct, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Hero() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1800),
      setTimeout(() => setStep(2), 3000),
      setTimeout(() => setStep(3), 4200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section className={styles.hero} aria-label="Hero bölümü">
      <div className={styles.heroInner}>
        {/* ── Left: copy ── */}
        <div className={styles.left}>
          <div className={styles.badge} aria-label="Kategori">
            AI DESTEKLİ MOBİL ARAYÜZ TASARIM PLATFORMU
          </div>
          <h1 className={styles.headline}>
            Fikrini yaz.
            <br />
            <em className={styles.em}>Arayüzünü hemen gör.</em>
          </h1>
          <p className={styles.sub}>
            Bir ürün fikrini, düzenlenebilir mobil ekranlara ve tutarlı bir
            tasarım sistemine dönüştür. Başlangıç noktası saniyeler içinde
            hazır.
          </p>
          <div className={styles.ctas}>
            <a href="/studio" className={styles.ctaPrimary}>
              İlk brief'ini yaz <span aria-hidden="true">→</span>
            </a>
            <a href="#urun" className={styles.ctaSecondary}>
              Nasıl çalıştığını gör
            </a>
          </div>
          <p className={styles.trust}>
            Kredi kartı gerekmez · İlk proje ücretsiz
          </p>
        </div>

        {/* ── Right: product visualization ── */}
        <div className={styles.right} aria-label="Ürün önizlemesi">
          {/* Prompt input */}
          <div className={styles.promptCard}>
            <div className={styles.promptLabel}>Brief</div>
            <div className={styles.promptText}>
              <TypingPrompt />
            </div>
            <div className={styles.promptFooter}>
              <span className={styles.promptTokens}>247 karakter</span>
              <button className={styles.promptBtn} aria-label="Tasarım oluştur">
                Oluştur →
              </button>
            </div>
          </div>

          {/* Generation states */}
          <div className={styles.genSteps} aria-label="Üretim durumu">
            {[
              "Brief analiz ediliyor",
              "Tasarım sistemi oluşturuluyor",
              "Ekran akışı hazırlanıyor",
            ].map((label, i) => (
              <div
                key={label}
                className={`${styles.genStep} ${step > i ? styles.genDone : step === i ? styles.genActive : ""}`}
              >
                <span className={styles.genDot} aria-hidden="true" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div
            className={styles.graph}
            aria-label="Brief'in ekran akışına dönüşümü"
          >
            <div className={styles.graphLine} aria-hidden="true" />
            <div className={styles.graphNode}>
              <span className={styles.graphIcon}>✦</span>
              <span>Brief</span>
            </div>
            <div className={styles.graphNode}>
              <span className={styles.graphIcon}>⌘</span>
              <span>ScreenGraph</span>
            </div>
            <div className={styles.graphNode}>
              <span className={styles.graphIcon}>◈</span>
              <span>DesignSpec</span>
            </div>
          </div>

          {/* Phone screens */}
          <div className={styles.phones} aria-label="Üretilen ekranlar">
            {([0, 1, 2] as const).map((s, i) => (
              <div
                key={s}
                className={`${styles.phoneWrap} ${step >= 3 ? styles.phoneVisible : ""}`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className={styles.phone}>
                  <div className={styles.phoneBar}>
                    <span>9:41</span>
                    <span aria-hidden="true">●●● ▲</span>
                  </div>
                  <PhoneFinance screen={s} />
                </div>
                <div className={styles.phoneLabel}>
                  {["Ana Sayfa", "İşlemler", "Bütçe"][s]}
                </div>
              </div>
            ))}
          </div>

          {/* Token chips */}
          {step >= 3 && (
            <div className={styles.tokens} aria-label="Tasarım token'ları">
              {[
                { name: "Primary", color: "var(--color-primary)" },
                { name: "Surface", color: "#1C1A2E" },
                { name: "Text", color: "var(--color-text)" },
                { name: "Success", color: "var(--color-success)" },
              ].map((t) => (
                <div key={t.name} className={styles.token}>
                  <span
                    className={styles.tokenSwatch}
                    style={{ background: t.color }}
                    aria-hidden="true"
                  />
                  <span>{t.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
