import { useEffect, useRef, useState } from "react";
import styles from "./ScrollFeatures.module.css";

const FEATURES = [
  {
    id: "home",
    tag: "Ekran 1",
    title: "Ana Sayfa — bakiye tek bakışta",
    desc: "AI, brief'ten navigasyon yapısını çıkarır ve ana ekranı otomatik oluşturur. Toplam bakiye, son harcamalar ve hızlı işlem kısayolları — hepsi token sistemiyle tutarlı.",
    screen: "home",
  },
  {
    id: "transactions",
    tag: "Ekran 2",
    title: "İşlemler — arama, filtre, geçmiş",
    desc: "Her işlem ekranı için arama çubuğu, tarih filtreleri ve kategori göstergeleri otomatik üretilir. DesignSpec v1 ile her eleman denetlenebilir ve düzenlenebilir.",
    screen: "transactions",
  },
  {
    id: "budget",
    tag: "Ekran 3",
    title: "Bütçe — kategori bazlı takip",
    desc: "Bütçe ekranları harcama kategorisi, doluluk göstergesi ve limit uyarılarıyla tam olarak çıkar. Renk kodlaması ve uyarı eşikleri DesignSpec içinde tanımlı.",
    screen: "budget",
  },
];

function MiniPhone({ screen }: { screen: string }) {
  return (
    <div className={styles.miniPhone}>
      <div className={styles.phoneSb}>
        <span>9:41</span>
        <span>●●● ▲</span>
      </div>
      <div className={styles.phoneBody}>
        {screen === "home" && (
          <>
            <div className={styles.pBalCard}>
              <div className={styles.pRow} style={{ width: "45%", height: 5 }} />
              <div className={styles.pRow} style={{ width: "65%", height: 12, marginTop: 4 }} />
              <div className={styles.pMiniChart} />
            </div>
            <div className={styles.pSection} />
            <div className={styles.pQuickRow}>
              {[0, 1, 2, 3].map((i) => <div key={i} className={styles.pQuick} />)}
            </div>
            <div className={styles.pSection} />
            {[80, 65, 72].map((w, i) => (
              <div key={i} className={styles.pTxRow}>
                <div className={`${styles.pDot} ${i === 2 ? styles.pDotGreen : ""}`} />
                <div className={styles.pRow} style={{ width: `${w}%` }} />
              </div>
            ))}
          </>
        )}
        {screen === "transactions" && (
          <>
            <div className={styles.pNavRow}>
              <div className={styles.pRow} style={{ width: "30%", height: 7 }} />
              <div className={styles.pAccentDot} />
            </div>
            <div className={styles.pSearch} />
            <div className={styles.pRow} style={{ width: "45%", height: 5, opacity: 0.4, marginBottom: 4 }} />
            {([
              { w: "75%", pos: false },
              { w: "60%", pos: false },
              { w: "70%", pos: true },
              { w: "55%", pos: false },
              { w: "65%", pos: false },
            ] as const).map(({ w, pos }, i) => (
              <div key={i} className={styles.pTxRow}>
                <div className={`${styles.pDot} ${pos ? styles.pDotGreen : ""}`} />
                <div className={styles.pRow} style={{ width: w }} />
              </div>
            ))}
          </>
        )}
        {screen === "budget" && (
          <>
            <div className={styles.pNavRow}>
              <div className={styles.pRow} style={{ width: "25%", height: 7 }} />
            </div>
            <div className={styles.pRow} style={{ width: "50%", height: 5, opacity: 0.4, marginBottom: 2 }} />
            <div className={styles.pRow} style={{ width: "65%", height: 11, marginBottom: 5 }} />
            <div className={styles.pProgressBar}>
              <div className={styles.pProgressFill} style={{ width: "65%" }} />
            </div>
            {[
              { w: "68%", over: false },
              { w: "55%", over: false },
              { w: "72%", over: false },
              { w: "100%", over: true },
            ].map(({ w, over }, i) => (
              <div key={i} className={styles.pBudgetItem}>
                <div className={styles.pRow} style={{ width: "45%", height: 4, opacity: 0.4, marginBottom: 3 }} />
                <div className={styles.pBudgetBar}>
                  <div className={over ? styles.pBudgetFillOver : styles.pBudgetFill} style={{ width: w }} />
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export function ScrollFeatures() {
  const [active, setActive] = useState(0);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = blockRefs.current.indexOf(
              entry.target as HTMLDivElement,
            );
            if (idx !== -1) setActive(idx);
          }
        });
      },
      { threshold: 0.35 },
    );
    blockRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} id="urun">
      <div className={styles.head}>
        <div className={styles.label}>Ekran gezisi</div>
        <h2>
          Brief'ten üç ekrana,
          <br />
          <em>adım adım.</em>
        </h2>
      </div>
      <div className={styles.layout}>
        <div className={styles.sticky}>
          <div className={styles.studioWrap}>
            <div className={styles.studioChrome}>
              <div className={styles.dots}>
                <span style={{ background: "#FF5F57" }} />
                <span style={{ background: "#FFBD2E" }} />
                <span style={{ background: "#28CA41" }} />
              </div>
              <div className={styles.chromeLabel}>Floriven Studio</div>
            </div>
            <div className={styles.studioScreen}>
              {FEATURES.map((f, i) => (
                <div
                  key={f.id}
                  className={`${styles.screenSlide} ${active === i ? styles.screenActive : ""}`}
                >
                  <MiniPhone screen={f.screen} />
                </div>
              ))}
            </div>
            <div className={styles.dots3}>
              {FEATURES.map((_, i) => (
                <span
                  key={i}
                  className={`${styles.dot3} ${active === i ? styles.dot3Active : ""}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={styles.scroll}>
          {FEATURES.map((f, i) => (
            <div
              key={f.id}
              ref={(el) => {
                blockRefs.current[i] = el;
              }}
              className={`${styles.block} ${active === i ? styles.blockActive : ""}`}
            >
              <div className={styles.blockTag}>{f.tag}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <div className={styles.blockNum}>
                {String(i + 1).padStart(2, "0")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
