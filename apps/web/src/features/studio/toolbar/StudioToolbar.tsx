import styles from "../StudioPage.module.css";

export function StudioToolbar({ revision }: { revision: number }) {
  return (
    <header className={styles.toolbar}>
      <div className={styles.tbLeft}>
        <a href="/" className={styles.tbLogo}>
          <span className={styles.tbLogoMark}>◆</span>Floriven
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
        <button className={styles.tbBtn} aria-label="Geri al">
          ↩
        </button>
        <button className={styles.tbBtn} aria-label="Yinele">
          ↪
        </button>
        <span className={styles.tbDiv} />
        <button className={styles.tbSelect}>iPhone 15 Pro ▾</button>
        <div className={styles.tbZoom}>
          <button aria-label="Uzaklaştır">−</button>
          <span className={styles.tbZoomVal}>{revision ? "85%" : "100%"}</span>
          <button aria-label="Yakınlaştır">+</button>
        </div>
      </div>
      <div className={styles.tbGroup}>
        <button className={styles.tbLabel}>Sürüm geçmişi</button>
        <button className={styles.tbLabel}>Önizle</button>
        <button className={styles.tbLabel}>Paylaş</button>
        <button className={styles.tbLabel}>Dışa aktar</button>
        <span className={styles.tbDiv} />
        <button className={`${styles.tbLabel} ${styles.tbLabelPrimary}`}>
          ✦ Üret
        </button>
      </div>
    </header>
  );
}
