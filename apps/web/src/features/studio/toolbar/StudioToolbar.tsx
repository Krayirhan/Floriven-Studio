import styles from "../StudioPage.module.css";

export function StudioToolbar({
  mode,
  onModeChange,
  onUndo,
  onRedo,
  onComposerFocus,
}: {
  revision?: number;
  mode?: "design" | "flow" | "compare";
  onModeChange?: (mode: "design" | "flow" | "compare") => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onComposerFocus?: () => void;
}) {
  return (
    <header className={styles.toolbar}>
      <div className={styles.tbLeft}>
        <a href="/" className={styles.tbLogo} aria-label="Floriven">
          <img src="/logo/logo-white.png" alt="Floriven" className={styles.tbLogoImg} />
        </a>
        <span className={styles.tbDiv} />
        <div className={styles.tbCrumb}>
          Studio <b>/</b> <b>Kişisel Finans</b>
        </div>
        <span className={styles.tbDiv} />
        <div className={styles.tbSaved}>
          <span className={styles.tbSavedDot} />
          Tüm değişiklikler kaydedildi
        </div>
      </div>

      <div className={styles.tbGroup}>
        <div className={styles.tbModes} role="tablist" aria-label="Editör modu">
          {([["design", "Tasarım"], ["flow", "Akış"], ["compare", "Karşılaştır"]] as const).map(
            ([value, label]) => (
              <button
                key={value}
                role="tab"
                aria-selected={mode === value}
                className={`${styles.tbLabel} ${mode === value ? styles.tbModeActive : ""}`}
                onClick={() => onModeChange?.(value)}
              >
                {label}
              </button>
            )
          )}
        </div>
        <span className={styles.tbDiv} />
        <button className={styles.tbBtn} aria-label="Geri al" onClick={onUndo} title="Geri al (Ctrl+Z)">↩</button>
        <button className={styles.tbBtn} aria-label="Yinele" onClick={onRedo} title="Yinele (Ctrl+Y)">↪</button>
      </div>

      <div className={styles.tbGroup}>
        <button className={styles.tbLabel}>Önizle</button>
        <button className={styles.tbLabel}>Paylaş</button>
        <button className={styles.tbLabel}>Dışa aktar</button>
        <span className={styles.tbDiv} />
        <button
          className={`${styles.tbLabel} ${styles.tbLabelPrimary}`}
          onClick={onComposerFocus}
          title="AI Composer'a odaklan (Ctrl+K)"
        >
          ✦ Üret
        </button>
      </div>
    </header>
  );
}
