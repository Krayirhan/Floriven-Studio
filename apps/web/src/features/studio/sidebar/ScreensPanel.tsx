import styles from "../StudioPage.module.css";

const screens = [
  {
    id: "scr_home",
    name: "Ana Sayfa",
    components: 6,
    variants: 3,
    time: "Şimdi",
  },
  {
    id: "scr_tx",
    name: "İşlemler",
    components: 4,
    variants: 1,
    time: "5 dk önce",
  },
  {
    id: "scr_bgt",
    name: "Bütçe Detayı",
    components: 4,
    variants: 1,
    time: "12 dk önce",
  },
];

export function ScreensPanel({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <div className={styles.scList}>
        {screens.map((screen) => (
          <div
            className={`${styles.scCard} ${screen.id === activeId ? styles.scCardActive : ""}`}
            key={screen.id}
            onClick={() => onSelect(screen.id)}
          >
            <div className={styles.scThumb}>
              <div className={styles.scThumbBar}>
                <span />
                <span />
              </div>
              <div className={styles.scThumbBody}>
                <div />
                <div />
                <div />
                <div />
                <div />
              </div>
            </div>
            <div className={styles.scInfo}>
              <div className={styles.scName}>{screen.name}</div>
              <div className={styles.scMeta}>
                <span>{screen.components} bileşen</span>
                <span>{screen.variants} varyasyon</span>
                <span>{screen.time}</span>
              </div>
            </div>
            <div className={styles.scHover}>
              <button className={styles.scHoverBtn} title="Çoğalt">
                ⧉
              </button>
              <button className={styles.scHoverBtn} title="Varyasyon">
                ✦
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.scActions}>
        <button className={styles.sBtn}>+ Yeni ekran</button>
        <button className={`${styles.sBtn} ${styles.sBtnAccent}`}>
          ✦ AI ile ekran üret
        </button>
      </div>
    </>
  );
}
