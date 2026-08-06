import type { DesignNode, Screen } from "@floriven/design-spec";
import styles from "../StudioPage.module.css";

export function AiInspector({
  node,
  screens,
  activeScreenId,
}: {
  node: DesignNode | undefined;
  screens: Screen[];
  activeScreenId: string;
}) {
  const screen = screens.find((item) => item.id === activeScreenId);
  return (
    <div className={styles.rContent}>
      <div className={styles.aiCtx}>
        <span className={styles.aiCtxLbl}>Bağlam</span>
        <div className={styles.aiCtxItem}>
          <span
            className={styles.aiCtxDot}
            style={{ background: "var(--fv-accent)" }}
          />
          {node ? "GreetingText · Text" : "Bileşen seçilmedi"}
        </div>
        <div className={styles.aiCtxItem}>
          <span
            className={styles.aiCtxDot}
            style={{ background: "var(--fv-success)" }}
          />
          {screen?.name ?? "—"}
        </div>
        <div className={styles.aiCtxItem}>
          <span
            className={styles.aiCtxDot}
            style={{ background: "var(--fv-text-muted)" }}
          />
          {screens.length} ekran · 8 token
        </div>
      </div>
      <div className={styles.aiScope}>
        {[
          "Bileşen",
          "Ekran",
          "Seçili akış",
          "Tüm ekranlar",
          "Tasarım sistemi",
        ].map((scope) => (
          <button
            key={scope}
            className={`${styles.aiScopeChip} ${scope === "Seçili akış" ? styles.aiScopeChipActive : ""}`}
          >
            {scope}
          </button>
        ))}
      </div>
      <div className={styles.aiOpts}>
        Varyasyon{" "}
        <select>
          <option>3</option>
          <option>1</option>
          <option>5</option>
        </select>
        <select>
          <option>Standart</option>
          <option>Hızlı</option>
          <option>Yüksek</option>
        </select>
      </div>
      <div className={styles.aiSuggs}>
        {[
          "Daha premium yap",
          "Hiyerarşiyi iyileştir",
          "Dark mode oluştur",
          "Üç varyasyon üret",
          "Erişilebilirliği düzelt",
          "iOS kurallarına uyarla",
        ].map((suggestion) => (
          <button key={suggestion} className={styles.aiChip}>
            {suggestion}
          </button>
        ))}
      </div>
      <div className={styles.aiActions}>
        <button className={`${styles.aiBtn} ${styles.aiBtnCancel}`}>
          İptal
        </button>
        <button className={`${styles.aiBtn} ${styles.aiBtnApply}`}>
          ✦ Üret
        </button>
      </div>
    </div>
  );
}
