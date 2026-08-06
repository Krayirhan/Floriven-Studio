import { useEffect, useRef, useState } from "react";
import styles from "./ScrollFeatures.module.css";

const FEATURES = [
  {
    id: "dashboard",
    tag: "Ekran 1",
    title: "Dashboard — her şey tek bakışta",
    desc: "AI, brief'ten navigasyon yapısını çıkarır ve dashboard ekranını otomatik oluşturur. İstatistikler, son aktiviteler ve hızlı erişim — hepsi token sistemiyle tutarlı.",
    screen: "dashboard",
  },
  {
    id: "tasklist",
    tag: "Ekran 2",
    title: "Görev Listesi — arama, filtre, sıralama",
    desc: "Her liste ekranı için arama çubuğu, kategori filtreleri ve durum göstergeleri otomatik üretilir. DesignSpec v1 ile her eleman denetlenebilir ve düzenlenebilir.",
    screen: "tasklist",
  },
  {
    id: "newTask",
    tag: "Ekran 3",
    title: "Yeni Görev Formu — tam input desteği",
    desc: "Form ekranları text input, dropdown, tarih seçici ve submit butonuyla tam olarak çıkar. Validation kuralları ve hata mesajları DesignSpec içinde tanımlı.",
    screen: "newTask",
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
        {screen === "dashboard" && (
          <>
            <div
              className={styles.pRow}
              style={{ width: "60%", height: 8, marginBottom: 10 }}
            />
            <div
              className={styles.pRow}
              style={{ width: "40%", height: 6, marginBottom: 16 }}
            />
            <div className={styles.pGrid3}>
              <div className={styles.pStat} />
              <div className={styles.pStat} />
              <div className={styles.pStat} />
            </div>
            <div className={styles.pLabel} />
            {[80, 65, 90, 55].map((w, i) => (
              <div key={i} className={styles.pTaskRow}>
                <div className={styles.pDot} />
                <div className={styles.pRow} style={{ width: `${w}%` }} />
              </div>
            ))}
          </>
        )}
        {screen === "tasklist" && (
          <>
            <div className={styles.pNavRow}>
              <div
                className={styles.pRow}
                style={{ width: "30%", height: 7 }}
              />
              <div className={styles.pAccentDot} />
            </div>
            <div className={styles.pSearch} />
            {(
              [
                ["75%", "todo"],
                ["60%", "doing"],
                ["80%", "done"],
                ["50%", "todo"],
              ] as const
            ).map(([w, s], i) => (
              <div key={i} className={styles.pTaskItem}>
                <div className={`${styles.pSmDot} ${styles[s]}`} />
                <div>
                  <div
                    className={styles.pRow}
                    style={{ width: w, marginBottom: 4 }}
                  />
                  <div
                    className={styles.pRow}
                    style={{ width: "45%", height: 5, opacity: 0.5 }}
                  />
                </div>
              </div>
            ))}
          </>
        )}
        {screen === "newTask" && (
          <>
            <div className={styles.pNavRow}>
              <div
                className={styles.pRow}
                style={{ width: "25%", height: 7 }}
              />
            </div>
            <div className={styles.pFieldLbl} />
            <div className={styles.pInput} />
            <div className={styles.pFieldLbl} />
            <div className={styles.pInputTall} />
            <div className={styles.pRow2}>
              <div className={styles.pSelect} />
              <div className={styles.pSelect} />
            </div>
            <div className={styles.pSubmit} />
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
      { threshold: 0.55 },
    );
    blockRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section}>
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
