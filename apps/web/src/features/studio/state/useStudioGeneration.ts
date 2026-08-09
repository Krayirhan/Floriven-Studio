import { useCallback, useState } from "react";
import type { Screen } from "@floriven/design-spec";
import { generationService } from "../../../services/generationService";
import type { JournalEntry } from "../studio.types";

const INITIAL_JOURNAL: JournalEntry[] = [];

type GenerationUiState = {
  prompt: string;
  brief: string;
  setPrompt: (value: string) => void;
  setBrief: (value: string) => void;
};

type AddHistoryEntry = (entry: string) => void;

export function useStudioGeneration(
  ui: GenerationUiState,
  addHistoryEntry: AddHistoryEntry,
  setGeneratedScreens: (screens: Screen[]) => void,
  projectId: string,
  getCurrentScreens: () => Screen[],
) {
  const [journal, setJournal] = useState<JournalEntry[]>(INITIAL_JOURNAL);
  const [isGenerating, setIsGenerating] = useState(false);

  const addJournalEntry = useCallback((entry: Omit<JournalEntry, "id" | "timestamp">) => {
    setJournal((prev) => [{ ...entry, id: `j${Date.now()}`, timestamp: Date.now() }, ...prev].slice(0, 20));
  }, []);

  const generate = useCallback(async () => {
    const trimmed = ui.prompt.trim();
    if (!trimmed || isGenerating) return;

    // A project that already has screens is being edited, not created — send the
    // current document as the edit target instead of treating the instruction
    // ("Dark mode yap", "Hiyerarşiyi iyileştir"...) as a brand-new product brief.
    const currentScreens = getCurrentScreens();
    const isEdit = currentScreens.length > 0;

    setIsGenerating(true);
    addHistoryEntry(trimmed);
    addJournalEntry({
      type: "analyze",
      message: isEdit ? "Düzenleme isteği işleniyor..." : "Prompt işleniyor...",
      detail: trimmed.slice(0, 60),
    });

    try {
      const job = await generationService.create(projectId, {
        brief: trimmed,
        platform: "ios",
        designMode: "auto",
        ...(isEdit ? { editScreens: currentScreens } : {}),
      });

      if (job.status === "completed" && job.resultScreens?.length) {
        setGeneratedScreens(job.resultScreens);
        addJournalEntry({
          type: "generate",
          message: `${job.resultScreens.length} ekran oluşturuldu`,
          detail: trimmed.slice(0, 60),
          screenIds: job.resultScreens.map((s) => s.id),
        });
        ui.setPrompt("");
      } else if (job.status === "failed") {
        addJournalEntry({
          type: "generate",
          message: "Üretim başarısız",
          detail: job.errorMessage ?? "Bilinmeyen hata",
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addJournalEntry({ type: "generate", message: "Hata oluştu", detail: msg });
    } finally {
      setIsGenerating(false);
    }
  }, [addHistoryEntry, addJournalEntry, getCurrentScreens, isGenerating, projectId, setGeneratedScreens, ui]);

  return {
    prompt: ui.prompt,
    brief: ui.brief,
    setPrompt: ui.setPrompt,
    setBrief: ui.setBrief,
    journal,
    addJournalEntry,
    generate,
    isGenerating,
  };
}
