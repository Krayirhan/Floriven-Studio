import { useState } from "react";
import styles from "../StudioPage.module.css";

const screens = [
  { id: "scr_home", name: "Ana Sayfa", components: 6, variants: 3, time: "Şimdi" },
  { id: "scr_tx", name: "İşlemler", components: 4, variants: 1, time: "5 dk önce" },
  { id: "scr_bgt", name: "Bütçe Detayı", components: 4, variants: 1, time: "12 dk önce" },
];

const NEW_SCREEN_OPTIONS = [
  { icon: "📱", label: "Boş ekran" },
  { icon: "✦", label: "AI ile oluştur" },
  { icon: "⧉", label: "Seçiliyi çoğalt" },
  { icon: "📐", label: "Şablondan" },
];

export function ScreensPanel({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const [showNewMenu, setShowNewMenu] = useState(false);

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
              <button className={styles.scHoverBtn} title="Çoğalt" onClick={(e) => e.stopPropagation()}>⧉</button>
              <button className={styles.scHoverBtn} title="Varyasyon üret" onClick={(e) => e.stopPropagation()}>✦</button>
              <button className={styles.scHoverBtn} title="Sil" onClick={(e) => e.stopPropagation()}>✕</button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.scActions}>
        <div className={styles.scNewWrap}>
          {showNewMenu && (
            <div className={styles.newScreenMenu}>
              {NEW_SCREEN_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  className={styles.newScreenMenuItem}
                  onClick={() => setShowNewMenu(false)}
                >
                  <span>{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
          <button
            className={styles.sBtn}
            onClick={() => setShowNewMenu((v) => !v)}
          >
            + Yeni ekran ▾
          </button>
        </div>
      </div>
    </>
  );
}
