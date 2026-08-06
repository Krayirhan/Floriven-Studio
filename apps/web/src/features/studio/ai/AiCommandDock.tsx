import styles from "../StudioPage.module.css";

export function AiCommandDock({
  prompt,
  onPromptChange,
}: {
  prompt: string;
  onPromptChange: (prompt: string) => void;
}) {
  return (
    <footer className={styles.aiDock}>
      <div className={styles.aiDockBrand}>
        <span>✦</span> Floriven AI
      </div>
      <span className={styles.aiDockDiv} />
      <input
        className={styles.aiDockInput}
        placeholder="Floriven'e neyi değiştirmek istediğini anlat..."
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
      />
      <div className={styles.aiDockChips}>
        <button
          className={styles.aiDockChip}
          onClick={() => onPromptChange("Daha minimal yap")}
        >
          Daha minimal
        </button>
        <button
          className={styles.aiDockChip}
          onClick={() => onPromptChange("Dark mode oluştur")}
        >
          Dark mode
        </button>
        <button
          className={styles.aiDockChip}
          onClick={() =>
            onPromptChange("Hiyerarşiyi iyileştir, kart sayısını azalt")
          }
        >
          Hiyerarşiyi iyileştir
        </button>
        <button
          className={styles.aiDockChip}
          onClick={() => onPromptChange("Erişilebilirliği düzelt")}
        >
          Erişilebilirlik
        </button>
      </div>
      <div className={styles.aiDockRight}>
        <button className={styles.aiDockBtn}>Seçili akış ▾</button>
        <button className={styles.aiDockBtn}>3 varyasyon ▾</button>
        <button className={styles.aiDockBtn}>Standart ▾</button>
        <button className={styles.aiDockGenerate}>✦ Üret</button>
      </div>
    </footer>
  );
}
