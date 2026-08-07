import { useCallback, useState } from "react";
import type { JournalEntry } from "../studio.types";

const INITIAL_JOURNAL: JournalEntry[] = [
  { id: "j0", type: "analyze", message: "Brief analiz edildi", detail: "Kişisel finans uygulaması · iOS öncelikli", timestamp: Date.now() - 600000 },
  { id: "j1", type: "generate", message: "Ana Sayfa oluşturuldu", detail: "6 bileşen, 3 varyasyon üretildi", timestamp: Date.now() - 480000, screenIds: ["scr_home"] },
  { id: "j2", type: "variant", message: "3 varyasyon üretildi", detail: "Original · Editorial · Soft Futurism", timestamp: Date.now() - 360000, screenIds: ["scr_home"] },
  { id: "j3", type: "generate", message: "İşlemler ekranı oluşturuldu", detail: "4 bileşen, arama ve segmentler", timestamp: Date.now() - 240000, screenIds: ["scr_tx"] },
  { id: "j4", type: "apply", message: "Bütçe Detayı iyileştirildi", detail: "Trend grafik ve AI insight eklendi", timestamp: Date.now() - 120000, screenIds: ["scr_bgt"] },
];

type GenerationUiState = {
  prompt: string;
  brief: string;
  setPrompt: (value: string) => void;
  setBrief: (value: string) => void;
};

type AddHistoryEntry = (entry: string) => void;

export function useStudioGeneration(ui: GenerationUiState, addHistoryEntry: AddHistoryEntry) {
  const [journal, setJournal] = useState<JournalEntry[]>(INITIAL_JOURNAL);

  const addJournalEntry = useCallback((entry: Omit<JournalEntry, "id" | "timestamp">) => {
    setJournal((prev) => [{ ...entry, id: `j${Date.now()}`, timestamp: Date.now() }, ...prev].slice(0, 20));
  }, []);

  const generate = useCallback(() => {
    if (ui.prompt.trim()) {
      addHistoryEntry(ui.prompt.trim());
      addJournalEntry({ type: "generate", message: `"${ui.prompt.trim().slice(0, 40)}" uygulandı`, detail: "AI işleniyor..." });
    }
  }, [addHistoryEntry, addJournalEntry, ui.prompt]);

  return {
    prompt: ui.prompt,
    brief: ui.brief,
    setPrompt: ui.setPrompt,
    setBrief: ui.setBrief,
    journal,
    addJournalEntry,
    generate,
  };
}
