import styles from "../StudioPage.module.css";

const assets = [
  { name: "logo.svg", type: "Vektör" },
  { name: "hero-bg.png", type: "Görsel" },
  { name: "icon-set.svg", type: "Simge seti" },
];

export function AssetsPanel() {
  return (
    <>
      {assets.map((asset) => (
        <div className={styles.asItem} key={asset.name}>
          <span className={styles.asPreview}>◆</span>
          <div>
            <div
              style={{ fontSize: 11, fontWeight: 500, color: "var(--fv-text)" }}
            >
              {asset.name}
            </div>
            <div
              style={{
                fontSize: 9,
                color: "var(--fv-text-muted)",
                marginTop: 1,
              }}
            >
              {asset.type}
            </div>
          </div>
        </div>
      ))}
      <div className={styles.scActions}>
        <button className={styles.sBtn}>+ Varlık yükle</button>
      </div>
    </>
  );
}
