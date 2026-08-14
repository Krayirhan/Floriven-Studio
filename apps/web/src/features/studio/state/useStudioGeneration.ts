import { useCallback, useState } from "react";
import type { Screen } from "@floriven/design-spec";
import { generationService, type GenerationJob } from "../../../services/generationService";
import {
  generationServiceV3,
  toGenerationJob,
  toV2Screens,
  V3_CANONICAL_RENDERER_VERSION,
  type GenerationV3Job,
  type V3DesignSpecScreen,
  type V3ScreenRenderEvidence,
} from "../../../services/generationServiceV3";
import { verifyV3Runtime } from "../../../services/runtimeVerificationV3";
import type { JournalEntry } from "../studio.types";

const INITIAL_JOURNAL: JournalEntry[] = [];

export type GenerationEngine = "v2" | "v3";

type GenerationUiState = {
  prompt: string;
  brief: string;
  setPrompt: (value: string) => void;
  setBrief: (value: string) => void;
};

type AddHistoryEntry = (entry: string) => void;

/** Two animation-frame ticks give React and the browser layout engine a chance to commit and paint before we measure. */
function waitForPaint(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

/**
 * Renders the awaiting-render V3 screens into the real Studio canvas (the same DOM path the user
 * sees), then captures each one's actual layout geometry with capturePhoneRuntime/
 * measureRuntimeVisualIdentity — the identical trusted recorder V2's runtime quality gate uses.
 * Never fabricates a metric: a screen that fails to mount at the canonical 390x844 viewport throws
 * rather than submitting a guessed value, so a real DOM failure surfaces as a real error instead of
 * a false VERIFIED.
 */
async function captureRenderEvidence(screens: V3DesignSpecScreen[], screenJobIds: string[]): Promise<V3ScreenRenderEvidence[]> {
  await waitForPaint();
  return screens.map((screen, index) => {
    const screenJobId = screenJobIds[index] ?? screen.id;
    const root = document.querySelector<HTMLElement>(`[data-floriven-screen-id="${screen.id}"]`);
    if (!root) throw new Error(`Ekran render edilemedi (${screen.id}) — DOM'da bulunamadı.`);
    const { metrics } = verifyV3Runtime(screenJobId, root);
    return {
      screenJobId,
      screenId: screen.id,
      rendererVersion: V3_CANONICAL_RENDERER_VERSION,
      contentHash: "",
      viewport: metrics.viewport,
      metrics,
    };
  });
}

export function useStudioGeneration(
  ui: GenerationUiState,
  addHistoryEntry: AddHistoryEntry,
  setGeneratedScreens: (screens: Screen[]) => void,
  projectId: string,
  getCurrentScreens: () => Screen[],
  engine: GenerationEngine = "v3",
) {
  const [journal, setJournal] = useState<JournalEntry[]>(INITIAL_JOURNAL);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerationJob, setLastGenerationJob] = useState<GenerationJob | null>(null);
  const [lastV3Job, setLastV3Job] = useState<GenerationV3Job | null>(null);

  const addJournalEntry = useCallback((entry: Omit<JournalEntry, "id" | "timestamp">) => {
    setJournal((prev) => [{ ...entry, id: `j${Date.now()}`, timestamp: Date.now() }, ...prev].slice(0, 20));
  }, []);

  const generate = useCallback(async () => {
    const trimmed = ui.prompt.trim();
    if (!trimmed || isGenerating) return;

    const currentScreens = getCurrentScreens();
    const isEdit = currentScreens.length > 0;
    const useV3 = engine === "v3";

    setIsGenerating(true);
    setLastGenerationJob(null);
    addHistoryEntry(trimmed);
    addJournalEntry({
      type: "analyze",
      message: isEdit
        ? useV3 ? "V3 Patch Engine ile düzenleme işleniyor..." : "Düzenleme isteği işleniyor..."
        : useV3 ? "Prompt V3 ile işleniyor..." : "Prompt işleniyor...",
      detail: trimmed.slice(0, 60),
    });

    try {
      let job: GenerationJob;

      if (useV3) {
        if (isEdit && lastV3Job?.jobId) {
          // V3 Patch Edit workflow — the user's own revision text is sent as-is; the server plans
          // and validates the actual patch operations (patch-planner.ts), the client never guesses them.
          const currentRevision = (lastV3Job.acceptedDesignSpec?.metadata as { revision?: number } | undefined)?.revision ?? 1;
          const targetScreen = currentScreens[0];
          if (!targetScreen) throw new Error("Düzenlenecek ekran bulunamadı.");
          const patchResult = await generationServiceV3.edit(lastV3Job.jobId, targetScreen.id, trimmed, currentRevision);
          setLastV3Job(patchResult);
          job = toGenerationJob(patchResult);
        } else {
          // V3 Creation with full render-evidence loop
          let v3Job = await generationServiceV3.create(projectId, { brief: trimmed, platform: "ios" });
          v3Job = await generationServiceV3.waitForTerminal(v3Job);

          // If awaiting_render, mount the real screens in the canvas and submit actual DOM evidence
          if (v3Job.status === "awaiting_render" && v3Job.acceptedDesignSpec?.screens) {
            const v3Screens = v3Job.acceptedDesignSpec.screens;
            addJournalEntry({
              type: "apply",
              message: "DOM render geometrisi ve görsel kanıt doğrulanıyor...",
              detail: `${v3Screens.length} ekran kanıtı gönderiliyor`,
            });
            setGeneratedScreens(toV2Screens(v3Screens));
            const evidence = await captureRenderEvidence(v3Screens, v3Job.acceptedDesignSpec.metadata.screenJobIds);
            v3Job = await generationServiceV3.submitRenderEvidence(v3Job.jobId, evidence);
            v3Job = await generationServiceV3.waitForTerminal(v3Job);
          }

          setLastV3Job(v3Job);
          job = toGenerationJob(v3Job);
        }
      } else {
        // Fallback V2 workflow
        job = await generationService.waitForTerminal(await generationService.create(projectId, {
          brief: trimmed,
          platform: "ios",
          designMode: "auto",
          ...(isEdit ? { editScreens: currentScreens } : {}),
        }));
      }

      setLastGenerationJob(job);

      if (job.status === "completed" && job.resultScreens?.length) {
        setGeneratedScreens(job.resultScreens);
        addJournalEntry({
          type: "generate",
          message: useV3
            ? `${job.resultScreens.length} ekran V3 (Production Certified) ile oluşturuldu`
            : job.degraded
              ? `${job.resultScreens.length} ekranlık güvenli taslak oluşturuldu`
              : `${job.resultScreens.length} ekran AI tarafından oluşturuldu`,
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
  }, [addHistoryEntry, addJournalEntry, engine, getCurrentScreens, isGenerating, lastV3Job, projectId, setGeneratedScreens, ui]);

  return {
    prompt: ui.prompt,
    brief: ui.brief,
    setPrompt: ui.setPrompt,
    setBrief: ui.setBrief,
    journal,
    addJournalEntry,
    generate,
    isGenerating,
    lastGenerationJob,
  };
}
