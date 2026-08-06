import styles from "../StudioPage.module.css";

export function PrototypeInspector() {
  return (
    <div className={styles.rContent}>
      <section className={styles.inspSection}>
        <div className={styles.inspHead}>Akış bağlantıları</div>
        <div className={styles.inspBody}>
          {[
            ["Ana Sayfa", "İşlemler"],
            ["Ana Sayfa", "Bütçe Detayı"],
          ].map(([from, to]) => (
            <div key={to} className={styles.inspRow}>
              <span style={{ color: "var(--fv-accent)" }}>
                {from} → {to}
              </span>
              <span className={styles.inspRowVal}>On tap</span>
            </div>
          ))}
        </div>
      </section>
      <section className={styles.inspSection}>
        <div className={styles.inspHead}>Geçiş</div>
        <div className={styles.inspBody}>
          <label className={styles.inspField}>
            <span className={styles.inspLbl}>Animasyon</span>
            <select className={styles.inspFld}>
              <option>Akıllı geçiş</option>
              <option>Push</option>
              <option>Modal</option>
            </select>
          </label>
          <label className={styles.inspField}>
            <span className={styles.inspLbl}>Süre</span>
            <input className={styles.inspFld} defaultValue="250 ms" readOnly />
          </label>
        </div>
      </section>
    </div>
  );
}
