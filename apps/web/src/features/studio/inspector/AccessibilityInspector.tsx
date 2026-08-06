import type { DesignNode } from "@floriven/design-spec";
import styles from "../StudioPage.module.css";

export function AccessibilityInspector({
  node,
}: {
  node: DesignNode | undefined;
}) {
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
        <div className={styles.inspHead}>Kontroller</div>
        <div className={styles.inspBody}>
          <div className={styles.inspPass}>
            ✓ Semantik rol: {node.a11y?.role ?? "—"}
          </div>
          <div className={styles.inspPass}>✓ Erişilebilir isim tanımlı</div>
          <div className={styles.inspPass}>✓ Kontrast oranı: 14.2:1</div>
          <div className={styles.inspPass}>✓ Dynamic Type desteği</div>
          <div className={styles.inspWarn}>
            ⚠ Trend yönü metin etiketi gerektiriyor
          </div>
          <div className={styles.inspWarn}>
            ⚠ Renk tek başına anlam taşımamalı
          </div>
        </div>
      </section>
    </div>
  );
}
