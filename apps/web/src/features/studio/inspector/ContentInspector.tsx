import type { DesignNode } from "@floriven/design-spec";
import styles from "../StudioPage.module.css";
import { propString } from "../studio.utils";

export function ContentInspector({ node }: { node: DesignNode | undefined }) {
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
          Seçim yap.
        </div>
      </div>
    );
  return (
    <div className={styles.rContent}>
      <section className={styles.inspSection}>
        <div className={styles.inspHead}>İçerik</div>
        <div className={styles.inspBody}>
          <label className={styles.inspField}>
            <span className={styles.inspLbl}>Metin</span>
            <input
              className={styles.inspFld}
              value={propString(node, "text", "Günaydın, Emre")}
              readOnly
            />
          </label>
          <label className={styles.inspField}>
            <span className={styles.inspLbl}>Yerelleştirme anahtarı</span>
            <input className={styles.inspFld} value="home.greeting" readOnly />
          </label>
        </div>
      </section>
    </div>
  );
}
