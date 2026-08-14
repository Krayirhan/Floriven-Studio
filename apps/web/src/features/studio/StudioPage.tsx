import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import styles from "./StudioPage.module.css";
import { AiCommandDock } from "./ai/AiCommandDock";
import { StudioCanvas } from "./canvas/StudioCanvas";
import { useStudioState } from "./hooks/useStudioState";
import { InspectorPanel } from "./inspector/InspectorPanel";
import { AiPanel } from "./sidebar/AiPanel";
import { StudioSidebar } from "./sidebar/StudioSidebar";
import { StudioToolbar } from "./toolbar/StudioToolbar";
import type { LeftTab } from "./studio.types";
import { useGenerationJob } from "./state/useGenerationJob";
import { generationProvenanceMessage, isFinalEligibleGeneration } from "../../services/generationService";
import html2canvas from "html2canvas";
import { capturePhoneBaseline } from "./canvas/runtimeCapture";

export function StudioPage() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  // Opt-in only (?engine=v3): V2 stays the default generation path until V3 clears its ADR-0009 benchmark gates.
  const engine = searchParams.get("engine") === "v3" ? "v3" : "v2";
  const studio = useStudioState(projectId ?? "", engine);
  const runtimeCertificationToken = searchParams.get("runtimeCertificationToken") ?? undefined;
  const readOnly = Boolean(runtimeCertificationToken);
  const generation = useGenerationJob(searchParams.get("jobId"), runtimeCertificationToken);
  const [leftOpen, setLeftOpen] = useState(true);
  const [mode, setMode] = useState<"design" | "flow" | "compare">("design");
  const [exportMessage, setExportMessage] = useState<string>("");
  const composerRef = useRef<HTMLInputElement>(null);
  const screensAddedRef = useRef(false);

  const handleDeleteScreen = (screenId: string) => {
    const wasActive = screenId === studio.activeScreenId;
    studio.deleteScreen(screenId);
    if (wasActive) {
      const remaining = studio.document.screens.filter((screen) => screen.id !== screenId);
      studio.selectScreen(remaining[0]?.id ?? "");
    }
  };

  const handleDuplicateScreen = (screenId: string) => {
    const newId = studio.duplicateScreen(screenId);
    if (newId) studio.selectScreen(newId);
  };

  const handleExportPngs = async () => {
    setExportMessage("");
    const phones = Array.from(document.querySelectorAll<HTMLElement>("[data-floriven-screen-id]"));
    if (phones.length === 0) {
      setExportMessage("Dışa aktarılacak ekran bulunamadı.");
      return;
    }
    let exported = 0;
    try {
      for (const phone of phones) {
        const screenId = phone.dataset.florivenScreenId ?? `screen-${exported + 1}`;
        const baseline = await capturePhoneBaseline({
          mode: "auto",
          archetype: "dashboard",
          screenId,
          screenshotPath: `baselines/${screenId}.png`,
          boundsPath: `baselines/${screenId}.json`,
          root: phone,
          renderScreenshot: async (root) => {
            const canvas = await html2canvas(root, { backgroundColor: "#ffffff", scale: 2, useCORS: true, logging: false, foreignObjectRendering: true, onclone: (clone) => { clone.querySelectorAll("[data-scroll-viewport]").forEach((node) => { (node as HTMLElement).style.overflow = "visible"; }); } });
            return canvas.toDataURL("image/png");
          },
        });
        if (!baseline.entry.candidateHash) throw new Error("BASELINE_ENTRY_HASH_MISSING");
        const blob = await (await fetch(baseline.screenshotDataUrl)).blob();
        if (!blob.size) throw new Error("PNG blob oluşturulamadı");
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `floriven-${screenId}.png`;
        link.href = url;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        exported += 1;
      }
      setExportMessage(`${exported} PNG dışa aktarıldı.`);
    } catch (error) {
      setExportMessage(`PNG dışa aktarılamadı (${exported}/${phones.length}). Ekranı yenileyip tekrar deneyin.`);
      console.error("PNG export failed", error);
    }
  };

  useEffect(() => {
    if (
      (generation.job?.status === "completed" || generation.job?.status === "failed") &&
      generation.job.resultScreens?.length &&
      !screensAddedRef.current
    ) {
      screensAddedRef.current = true;
      studio.setGeneratedScreens(generation.job.resultScreens);
      const firstScreen = generation.job.resultScreens[0];
      if (firstScreen) studio.selectScreen(firstScreen.id);
    }
  }, [generation.job, studio]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ctrl = e.metaKey || e.ctrlKey;
      if (ctrl && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          studio.redo();
        } else {
          studio.undo();
        }
      }
      if (ctrl && e.key.toLowerCase() === "k") {
        e.preventDefault();
        composerRef.current?.focus();
      }
      if (!e.target || (e.target as HTMLElement).tagName !== "INPUT") {
        if (e.key === "v" || e.key === "V") return;
        if (e.key === "Escape") studio.selectNode("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [studio]);

  const toggleRail = (tab: LeftTab) => {
    if (studio.leftTab === tab && leftOpen) {
      setLeftOpen(false);
    } else {
      studio.setLeftTab(tab);
      setLeftOpen(true);
    }
  };


  const isAiTab = studio.leftTab === "ai";
  const visibleGenerationJob = generation.job ?? studio.lastGenerationJob;

  return (
    <div className={styles.studio}>
      {visibleGenerationJob && (visibleGenerationJob.status === "queued" || visibleGenerationJob.status === "processing") && (
        <div className={styles.jobStatus} role="status" aria-live="polite">
          AI üretimi devam ediyor · %{visibleGenerationJob.progress}
        </div>
      )}
      {visibleGenerationJob?.status === "completed" && !isFinalEligibleGeneration(visibleGenerationJob) && (
        <div className={styles.jobStatus} role="status" aria-live="polite">
          {generationProvenanceMessage(visibleGenerationJob)} Statik kalite: {visibleGenerationJob.qualityReport?.score ?? "—"}/100 · Görsel/runtime kalite henüz ölçülmedi.
        </div>
      )}
      {visibleGenerationJob && isFinalEligibleGeneration(visibleGenerationJob) && (
        <div className={styles.jobStatus} role="status" aria-live="polite">
          Final kalite kapısı geçti. {generationProvenanceMessage(visibleGenerationJob)} Statik kalite: {visibleGenerationJob.qualityReport?.score ?? "—"}/100 · Runtime kalite kanıtı mevcut.
        </div>
      )}
      {generation.error && <div className={styles.jobError} role="alert">{generation.error}</div>}
      {visibleGenerationJob?.status === "failed" && visibleGenerationJob.errorCode === "QUALITY_REJECTED" && (
        <div className={styles.jobStatus} role="status" aria-live="polite">Ekranlar oluşturuldu; statik kalite kapısı adayı reddetti. Statik kalite: {visibleGenerationJob.qualityReport?.score ?? "—"}/100. Bu skor görsel/runtime kalite skoru değildir. Önizleme gösteriliyor.</div>
      )}
      {exportMessage && <div className={styles.jobStatus} role="status" aria-live="polite">{exportMessage}</div>}
      <StudioToolbar
        revision={studio.revision}
        mode={mode}
        onModeChange={setMode}
        onUndo={studio.undo}
        onRedo={studio.redo}
        canUndo={studio.canUndo}
        canRedo={studio.canRedo}
        onComposerFocus={() => composerRef.current?.focus()}
        onExport={() => { void handleExportPngs(); }}
      />

      <div className={styles.workspace}>
        {/* Icon Rail */}
        <div className={styles.toolRail} aria-label="Studio panelleri">
          <button
            className={styles.railButton}
            aria-label="Ekranlar"
            aria-pressed={leftOpen && studio.leftTab === "screens"}
            onClick={() => toggleRail("screens")}
          >
            ▦<span>Ekranlar</span>
          </button>
          <button
            className={styles.railButton}
            aria-label="Katmanlar"
            aria-pressed={leftOpen && studio.leftTab === "layers"}
            onClick={() => toggleRail("layers")}
          >
            ≡<span>Katmanlar</span>
          </button>
          <button
            className={styles.railButton}
            aria-label="Bileşenler"
            aria-pressed={leftOpen && studio.leftTab === "components"}
            onClick={() => toggleRail("components")}
          >
            ◈<span>Bileşenler</span>
          </button>
          <button
            className={styles.railButton}
            aria-label="Varlıklar"
            aria-pressed={leftOpen && studio.leftTab === "assets"}
            onClick={() => toggleRail("assets")}
          >
            ▧<span>Varlıklar</span>
          </button>
          <div className={styles.railSpacer} />
          <button
            className={`${styles.railButton} ${leftOpen && isAiTab ? styles.railButtonAi : ""}`}
            aria-label="AI Geçmişi"
            aria-pressed={leftOpen && isAiTab}
            onClick={() => toggleRail("ai")}
          >
            ✦<span>AI</span>
          </button>
        </div>

        {/* Left Drawer */}
        <div className={`${styles.panelDrawer} ${leftOpen ? styles.panelDrawerOpen : ""}`}>
          {isAiTab ? (
            <div className={styles.aiDrawerWrap}>
              <AiPanel
                journal={studio.journal}
                brief={studio.brief}
                onBriefChange={studio.setBrief}
              />
            </div>
          ) : studio.activeScreen ? (
            <StudioSidebar
              tab={studio.leftTab as Exclude<LeftTab, "ai">}
              screens={studio.document.screens}
              screen={studio.activeScreen}
              activeScreenId={studio.activeScreenId}
              selectedNodeId={studio.selectedNodeId}
              onSelectScreen={studio.selectScreen}
              onSelectNode={studio.selectNode}
              onDeleteScreen={handleDeleteScreen}
              onDuplicateScreen={handleDuplicateScreen}
              onCreateBlankScreen={() => studio.selectScreen(studio.createBlankScreen())}
            />
          ) : (
            <div className={styles.aiDrawerWrap}>Henüz ekran oluşturulmadı.</div>
          )}
        </div>

        {/* Canvas */}
        <StudioCanvas
          screens={studio.document.screens}
          activeScreenId={studio.activeScreenId}
          selectedNodeId={studio.selectedNodeId}
          mode={mode}
          onSelectScreen={studio.selectScreen}
          onSelectNode={studio.selectNode}
          onClearSelection={() => studio.selectNode("")}
          onDeleteScreen={handleDeleteScreen}
          onDuplicateScreen={handleDuplicateScreen}
          readOnly={readOnly}
          runtimeCandidate={visibleGenerationJob?.status === 'completed' && visibleGenerationJob.qualityReport?.passed === true ? {
            jobId: visibleGenerationJob.id,
            staticQualityPassed: true,
            runtimePending: visibleGenerationJob.runtimeQualityReport?.finalEligible !== true,
          } : undefined}
        />

        {/* Flow mode banner */}
        {mode === "flow" && (
          <div className={styles.modeBanner}>
            <strong>Akış modu</strong>
            <span>Ekranlar arasındaki bağlantıları ve geçişleri düzenleyin.</span>
            <button>+ Bağlantı ekle</button>
          </div>
        )}

        {/* Compare mode: Design System board */}
        {mode === "compare" && (
          <section className={styles.designBoard} aria-label="Design System">
            <header>
              <strong>Design System</strong>
              <span>Bu proje için kullanılan temel tokenlar</span>
            </header>
            <div className={styles.tokenGrid}>
              <div><i style={{ background: "#ff5722" }} />Primary</div>
              <div><i style={{ background: "#18181b" }} />Surface</div>
              <div><i style={{ background: "#f4f4f5" }} />Text</div>
              <div><i style={{ background: "#62d6a8" }} />Success</div>
            </div>
            <div className={styles.boardRow}><span>Typography</span><b>Inter · 12 / 14 / 20 / 32</b></div>
            <div className={styles.boardRow}><span>Radius</span><b>8 · 12 · 16 px</b></div>
            <div className={styles.boardRow}><span>Spacing</span><b>4 · 8 · 12 · 16 · 24 · 32</b></div>
          </section>
        )}

        {/* Right Inspector Drawer */}
        <div className={`${styles.inspectorDrawer} ${studio.selectedNode ? styles.inspectorDrawerOpen : ""}`}>
          <button
            className={styles.inspectorClose}
            onClick={() => studio.selectNode("")}
            aria-label="Inspector'ı kapat"
          >
            ×
          </button>
          <InspectorPanel
            tab={studio.rightTab}
            node={studio.selectedNode}
            document={studio.document}
            activeScreenId={studio.activeScreenId}
            onTabChange={studio.setRightTab}
            onUpdateNode={studio.updateSelectedNode}
          />
        </div>
      </div>

      {/* Floating AI Composer */}
      {!readOnly && <AiCommandDock
        prompt={studio.prompt}
        onPromptChange={studio.setPrompt}
        onGenerate={studio.generate}
        composerRef={composerRef}
        isGenerating={studio.isGenerating}
      />}
    </div>
  );
}
