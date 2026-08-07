import { useState } from "react";
import type { JournalEntry } from "../studio.types";
import styles from "../StudioPage.module.css";

const TYPE_COLORS: Record<JournalEntry["type"], string> = {
  generate: "#ff5722",
  edit: "#6366f1",
  analyze: "#62d6a8",
  apply: "#f59e0b",
  variant: "#a78bfa",
};

const TYPE_LABELS: Record<JournalEntry["type"], string> = {
  generate: "Üret",
  edit: "Düzenle",
  analyze: "Analiz",
  apply: "Uygula",
  variant: "Varyasyon",
};

function relativeTime(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "az önce";
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
  return `${Math.floor(diff / 86400)} gün önce`;
}

export function AiPanel({
  journal,
  brief,
  onBriefChange,
}: {
  journal: JournalEntry[];
  brief: string;
  onBriefChange: (brief: string) => void;
}) {
  const [editingBrief, setEditingBrief] = useState(false);
  const [briefDraft, setBriefDraft] = useState(brief);

  const saveBrief = () => {
    onBriefChange(briefDraft);
    setEditingBrief(false);
  };

  return (
    <div className={styles.aiPanelWrap}>
      {/* Master Brief */}
      <div className={styles.aiPanelSection}>
        <div className={styles.aiPanelSectionHead}>
          <span className={styles.aiPanelSectionTitle}>Proje Brief'i</span>
          {!editingBrief && (
            <button
              className={styles.aiPanelActionBtn}
              onClick={() => { setBriefDraft(brief); setEditingBrief(true); }}
            >
              Düzenle
            </button>
          )}
        </div>
        {editingBrief ? (
          <div className={styles.briefEditArea}>
            <textarea
              className={styles.briefTextarea}
              value={briefDraft}
              onChange={(e) => setBriefDraft(e.target.value)}
              rows={5}
              autoFocus
            />
            <div className={styles.briefEditActions}>
              <button className={styles.briefSaveBtn} onClick={saveBrief}>Kaydet</button>
              <button className={styles.briefCancelBtn} onClick={() => setEditingBrief(false)}>İptal</button>
            </div>
          </div>
        ) : (
          <p className={styles.briefContent}>{brief}</p>
        )}
      </div>

      {/* AI Journal */}
      <div className={styles.aiPanelSection}>
        <div className={styles.aiPanelSectionHead}>
          <span className={styles.aiPanelSectionTitle}>AI Geçmişi</span>
          <span className={styles.aiPanelBadge}>{journal.length}</span>
        </div>
        <div className={styles.journalList}>
          {journal.map((entry) => (
            <div key={entry.id} className={styles.journalEntry}>
              <span
                className={styles.journalDot}
                style={{ background: TYPE_COLORS[entry.type] }}
                title={TYPE_LABELS[entry.type]}
              />
              <div className={styles.journalContent}>
                <div className={styles.journalMsg}>{entry.message}</div>
                {entry.detail && <div className={styles.journalDetail}>{entry.detail}</div>}
                <div className={styles.journalMeta}>
                  <span className={styles.journalTypeBadge} style={{ color: TYPE_COLORS[entry.type] }}>
                    {TYPE_LABELS[entry.type]}
                  </span>
                  <span className={styles.journalTime}>{relativeTime(entry.timestamp)}</span>
                </div>
              </div>
              <div className={styles.journalActions}>
                <button className={styles.journalActionBtn} title="Önizle">↗</button>
                <button className={styles.journalActionBtn} title="Geri al">↩</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
