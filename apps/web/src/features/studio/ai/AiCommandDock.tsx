import React, { useState } from "react";
import styles from "../StudioPage.module.css";

const QUICK_CHIPS = [
  { label: "Daha minimal", prompt: "Daha minimal yap" },
  { label: "Dark mode", prompt: "Dark mode oluştur" },
  { label: "Hiyerarşiyi iyileştir", prompt: "Hiyerarşiyi iyileştir, kart sayısını azalt" },
  { label: "Erişilebilirlik", prompt: "Erişilebilirliği düzelt" },
  { label: "Varyasyon üret", prompt: "3 yeni varyasyon üret" },
  { label: "Renkleri modernleştir", prompt: "Renk paletini modernleştir" },
  { label: "Tipografiyi büyüt", prompt: "Font boyutlarını artır, okunabilirliği iyileştir" },
];

export function AiCommandDock({
  prompt,
  onPromptChange,
  onGenerate,
  composerRef,
  isGenerating = false,
}: {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onGenerate?: () => void;
  composerRef?: React.RefObject<HTMLInputElement>;
  isGenerating?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onGenerate?.();
    }
    if (e.key === "Escape") {
      setExpanded(false);
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <footer className={`${styles.aiDock} ${expanded ? styles.aiDockExpanded : ""}`}>
      {expanded && (
        <div className={styles.aiDockSecRow}>
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip.label}
              className={styles.aiDockChip}
              onMouseDown={(e) => {
                e.preventDefault();
                onPromptChange(chip.prompt);
                composerRef?.current?.focus();
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
      <div className={styles.aiDockMain}>
        <div className={styles.aiDockBrand}>
          <img src="/logo/icon-color.png" alt="" className={styles.aiDockBrandIcon} aria-hidden="true" />
          Floriven AI
        </div>
        <span className={styles.aiDockDiv} />
        <input
          ref={composerRef}
          className={styles.aiDockInput}
          placeholder="Floriven'e neyi değiştirmek istediğini anlat..."
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          onFocus={() => setExpanded(true)}
          onBlur={() => setTimeout(() => setExpanded(false), 200)}
          onKeyDown={handleKeyDown}
        />
        <button className={styles.aiDockGenerate} onClick={onGenerate} disabled={isGenerating}>
          {isGenerating ? "⏳ Üretiliyor..." : "✦ Üret"}
        </button>
      </div>
    </footer>
  );
}
