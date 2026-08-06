import type { DesignNode } from "@floriven/design-spec";
import styles from "../StudioPage.module.css";
import { propString } from "../studio.utils";

export function DesignInspector({ node }: { node: DesignNode | undefined }) {
  if (!node)
    return (
      <div className={styles.rContent}>
        <div
          style={{
            color: "var(--fv-text-muted)",
            fontSize: 12,
            paddingTop: 20,
          }}
        >
          Düzenlemek için canvas'ta bir bileşen seç.
        </div>
      </div>
    );
  return (
    <div className={styles.rContent}>
      <div className={styles.inspBadge}>
        {node.type === "Greeting" ? "Text" : node.type}
      </div>
      <section className={styles.inspSection}>
        <div className={styles.inspHead}>Bileşen</div>
        <div className={styles.inspBody}>
          <div className={styles.inspRow}>
            <span>Ad</span>
            <b className={styles.inspRowVal}>
              {node.type === "Greeting" ? "GreetingText" : node.id}
            </b>
          </div>
          <div className={styles.inspRow}>
            <span>Tür</span>
            <b className={styles.inspRowVal}>Text</b>
          </div>
          <div className={styles.inspRow}>
            <span>Parent</span>
            <b className={styles.inspRowVal}>Header</b>
          </div>
        </div>
      </section>
      <section className={styles.inspSection}>
        <div className={styles.inspHead}>Düzen</div>
        <div className={styles.inspBody}>
          <div className={styles.inspGrid}>
            {[
              ["X", "16"],
              ["Y", "20"],
              ["Genişlik", "Auto"],
              ["Yükseklik", "Auto"],
            ].map(([label, value]) => (
              <div className={styles.inspGridItem} key={label}>
                <span>{label}</span>
                <b>{value}</b>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className={styles.inspSection}>
        <div className={styles.inspHead}>Tipografi</div>
        <div className={styles.inspBody}>
          <label className={styles.inspField}>
            <span className={styles.inspLbl}>Metin</span>
            <input
              className={styles.inspFld}
              value={propString(node, "text", "Günaydın, Emre")}
              readOnly
            />
          </label>
          <div className={styles.inspGrid}>
            {[
              ["Font", "Inter"],
              ["Ağırlık", "Bold"],
              ["Boyut", "24px"],
              ["Satır yük.", "1.15"],
            ].map(([label, value]) => (
              <div className={styles.inspGridItem} key={label}>
                <span>{label}</span>
                <b>{value}</b>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className={styles.inspSection}>
        <div className={styles.inspHead}>Görünüm</div>
        <div className={styles.inspBody}>
          <div className={styles.inspRow}>
            <span>Renk</span>
            <b className={styles.inspRowVal}>var(--color-text)</b>
          </div>
          <div className={styles.inspRow}>
            <span>Opaklık</span>
            <b className={styles.inspRowVal}>%100</b>
          </div>
        </div>
      </section>
      <section className={styles.inspSection}>
        <div className={styles.inspHead}>Tasarım token'ları</div>
        <div className={styles.inspBody}>
          <div className={styles.inspToken}>
            <span
              className={styles.inspSwatch}
              style={{ background: "var(--color-text)" }}
            />
            typography.titleLarge
          </div>
          <div className={styles.inspToken}>
            <span
              className={styles.inspSwatch}
              style={{ background: "var(--color-primary)" }}
            />
            color.primary
          </div>
        </div>
      </section>
      <section className={styles.inspSection}>
        <div className={styles.inspHead}>Erişilebilirlik</div>
        <div className={styles.inspBody}>
          <div className={styles.inspPass}>✓ Semantik rol: heading</div>
          <div className={styles.inspPass}>✓ Erişilebilir isim tanımlı</div>
          <div className={styles.inspPass}>✓ Kontrast oranı: 14.2:1</div>
          <div className={styles.inspWarn}>⚠ Okuma sırası doğrulanmadı</div>
        </div>
      </section>
    </div>
  );
}
