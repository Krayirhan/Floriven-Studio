import { useEffect, useRef, useState } from "react";
import { CANONICAL_VIEWPORT, compileVisualScreen, createCandidateHash, DESIGN_TEMPLATES, findDesignTemplate, type CompiledVisualScreen, type DesignStrategy, type Screen } from "@floriven/design-spec";
import styles from "../StudioPage.module.css";
import { FlowConnections } from "./FlowConnections";
import { PhoneScreen } from "./PhoneScreen";

type Tool = "select" | "hand" | "comment";

const TOOLS: { key: Tool; icon: string; label: string; shortcut: string }[] = [
  { key: "select", icon: "↖", label: "Seç", shortcut: "V" },
  { key: "hand", icon: "✥", label: "El", shortcut: "H" },
  { key: "comment", icon: "◎", label: "Yorum", shortcut: "C" },
];

const SCREEN_META: Record<string, { device: string; dims: string }> = {
  scr_home: { device: "iPhone 15 Pro", dims: "390 × 844" },
  scr_tx: { device: "iPhone 15 Pro", dims: "390 × 844" },
  scr_bgt: { device: "iPhone 15 Pro", dims: "390 × 844" },
};

const PALETTE_LABELS: Record<string, string> = {
  obsidian: "Obsidian", serene: "Serene", terracotta: "Terracotta", electric: "Electric", editorial: "Editorial",
};
const STUDIO_PHONE_PREVIEW_SCALE = 0.7;

/** What the screen's own data says its style is — never a label decoupled from the render. */
function screenPaletteLabel(screen: Screen): string {
  const strategy = screen.root.props.strategy;
  const palette = strategy && typeof strategy === "object" && !Array.isArray(strategy)
    ? (strategy as Record<string, unknown>).palette
    : undefined;
  const mode = strategy && typeof strategy === "object" && !Array.isArray(strategy)
    ? (strategy as Record<string, unknown>).mode
    : undefined;
  if (mode !== "template") return "Auto";
  if (typeof palette === "string" && PALETTE_LABELS[palette]) return PALETTE_LABELS[palette];
  const theme = screen.root.props.theme;
  return typeof theme === "string" && theme.length > 0 ? theme.charAt(0).toUpperCase() + theme.slice(1) : "Original";
}

function designStrategy(screen: Screen | undefined) {
  const value = screen?.root.props.strategy;
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const strategy = value as Record<string, unknown>;
  return {
    direction: typeof strategy.visualDirection === "string" ? strategy.visualDirection : "Otomatik tasarım yönü",
    mode: strategy.mode === "template" ? "Şablon" : "AI otomatik",
    rationale: Array.isArray(strategy.rationale) ? strategy.rationale.filter((item): item is string => typeof item === "string").slice(0, 2) : [],
  };
}

function screenStrategy(screen: Screen): DesignStrategy {
  const value = screen.root.props.strategy;
  const fallbackTemplate = DESIGN_TEMPLATES[0]!;
  if (!value || typeof value !== "object" || Array.isArray(value)) return { mode: "auto", ...fallbackTemplate.strategy, rationale: ["Eksik strategy için güvenli compiler fallback'i"] };
  const strategy = value as Record<string, unknown>;
  const template = (typeof strategy.stylePresetId === "string" ? findDesignTemplate(strategy.stylePresetId) : undefined)
    ?? DESIGN_TEMPLATES.find((candidate) => candidate.strategy.palette === strategy.palette)
    ?? fallbackTemplate;
  return {
    mode: strategy.mode === "template" ? "template" : "auto",
    ...(strategy.mode === "template" ? { stylePresetId: template.id } : {}),
    palette: template.strategy.palette,
    cardStyle: template.strategy.cardStyle,
    density: template.strategy.density,
    navigationStyle: template.strategy.navigationStyle,
    visualDirection: typeof strategy.visualDirection === "string" ? strategy.visualDirection : template.strategy.visualDirection,
    rationale: Array.isArray(strategy.rationale) ? strategy.rationale.filter((item): item is string => typeof item === "string") : [],
  };
}

function compileScreen(screen: Screen): CompiledVisualScreen {
  const strategy = screenStrategy(screen);
  const template = (strategy.stylePresetId ? findDesignTemplate(strategy.stylePresetId) : undefined)
    ?? DESIGN_TEMPLATES.find((candidate) => candidate.strategy.palette === strategy.palette)
    ?? DESIGN_TEMPLATES[0]!;
  return compileVisualScreen({ screen, strategy, styleSystemProfile: template.system });
}

export function StudioCanvas({
  screens,
  activeScreenId,
  selectedNodeId,
  mode,
  onSelectScreen,
  onSelectNode,
  onClearSelection,
  onDeleteScreen,
  onDuplicateScreen,
  readOnly = false,
  runtimeCandidate,
}: {
  screens: Screen[];
  activeScreenId: string;
  selectedNodeId: string;
  mode?: "design" | "flow" | "compare";
  onSelectScreen: (id: string) => void;
  onSelectNode: (id: string) => void;
  onClearSelection: () => void;
  onDeleteScreen?: (screenId: string) => void;
  onDuplicateScreen?: (screenId: string) => void;
  readOnly?: boolean;
  runtimeCandidate?: { jobId: string; staticQualityPassed: boolean; runtimePending: boolean } | undefined;
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<Tool>("select");
  const strategy = designStrategy(screens[0]);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const [runtimeReady, setRuntimeReady] = useState(false);
  const candidateHash = screens.length ? createCandidateHash(screens) : undefined;

  useEffect(() => {
    setRuntimeReady(false);
    if (!runtimeCandidate || !runtimeCandidate.staticQualityPassed || !runtimeCandidate.runtimePending || !candidateHash || screens.length === 0) return;
    let cancelled = false;
    const markReady = () => requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!cancelled) setRuntimeReady(true);
    }));
    if (document.fonts?.status === 'loaded') markReady();
    else void document.fonts?.ready.then(markReady);
    return () => { cancelled = true; };
  }, [candidateHash, runtimeCandidate, screens.length]);

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
  const fitAll = () => { setZoom(0.85); setPan({ x: 0, y: 0 }); };

  return (
    <section
      className={styles.canvas}
      data-runtime-evidence-ready={runtimeReady ? 'true' : undefined}
      data-runtime-job-id={runtimeReady ? runtimeCandidate?.jobId : undefined}
      data-runtime-candidate-hash={runtimeReady ? candidateHash : undefined}
      style={{ cursor: tool === "hand" ? "grab" : "default" }}
      onClick={onClearSelection}
      onWheel={(e) => {
        if ((e.target as HTMLElement).closest(`.${styles.phBody}`)) return;
        e.preventDefault();
        setZoom((v) => Math.min(1.5, Math.max(0.4, v - e.deltaY * 0.001)));
      }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget || tool === "hand") {
          drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }
      }}
      onPointerMove={(e) => {
        if (drag.current) setPan({ x: drag.current.px + e.clientX - drag.current.x, y: drag.current.py + e.clientY - drag.current.y });
      }}
      onPointerUp={() => { drag.current = null; }}
    >
      <div className={styles.canvasGrid} aria-hidden="true" />

      {strategy && <aside className={styles.strategySummary} onClick={(event) => event.stopPropagation()}><span>{strategy.mode}</span><strong>{strategy.direction}</strong>{strategy.rationale.map((reason) => <small key={reason}>✦ {reason}</small>)}</aside>}

      {/* Canvas mini-toolbar */}
      <div className={styles.canvasTool} onClick={(e) => e.stopPropagation()}>
        {TOOLS.map((t) => (
          <button
            key={t.key}
            className={`${styles.canvasToolBtn} ${tool === t.key ? styles.canvasToolBtnActive : ""}`}
            onClick={() => setTool(t.key)}
            title={`${t.label} (${t.shortcut})`}
          >
            {t.icon}
          </button>
        ))}
        <span className={styles.canvasToolDiv} />
        <button className={styles.canvasToolBtn} onClick={() => setZoom((v) => Math.max(0.4, v - 0.1))}>−</button>
        <span className={styles.canvasZoomVal}>{Math.round(zoom * 100)}%</span>
        <button className={styles.canvasToolBtn} onClick={() => setZoom((v) => Math.min(1.5, v + 0.1))}>+</button>
        <span className={styles.canvasToolDiv} />
        <button className={styles.canvasToolBtn} onClick={fitAll} title="Tümünü sığdır (Shift+1)">⤢</button>
      </div>

      {/* Bottom-right zoom controls */}
      <div className={styles.canvasControls} aria-label="Canvas kontrolleri" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setZoom((v) => Math.max(0.4, v - 0.1))}>−</button>
        <span>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom((v) => Math.min(1.5, v + 0.1))}>+</button>
        <button onClick={resetView}>Fit</button>
        <button onClick={fitAll}>Tümü</button>
      </div>

      {mode === "flow" && <FlowConnections screenCount={screens.length} />}

      <div
        className={styles.canvasScreens}
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
      >
        {screens.map((screen) => {
          const active = screen.id === activeScreenId;
          const compiled = compileScreen(screen);
          const meta = SCREEN_META[screen.id] ?? { device: "iPhone", dims: "390 × 844" };
          return (
            <div
              className={styles.screenCol}
              key={screen.id}
              onClick={(e) => { e.stopPropagation(); onSelectScreen(screen.id); }}
            >
              <div className={styles.scrHeader}>
                <div className={styles.scrLabel}>
                  <span className={`${styles.scrLabelDot} ${active ? styles.scrLabelDotActive : ""}`} />
                  <span className={styles.scrName}>{screen.name}</span>
                  <span className={styles.scrLabelVars} title="Bu ekranın gerçek stili">{screenPaletteLabel(screen)}</span>
                </div>
                <div className={styles.scrMeta2}>
                  <span className={styles.scrDims}>{meta.dims}</span>
                  <span className={styles.scrMetaDot}>·</span>
                  <span className={styles.scrDevice}>{meta.device}</span>
                </div>
                <div className={styles.scrHeaderActions}>
                  {!readOnly && <button
                    className={styles.scrHeaderBtn}
                    onClick={(e) => { e.stopPropagation(); onDuplicateScreen?.(screen.id); }}
                  >
                    Çoğalt
                  </button>}
                  {!readOnly && <button
                    className={styles.scrHeaderBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`"${screen.name}" ekranını silmek istediğine emin misin?`)) onDeleteScreen?.(screen.id);
                    }}
                  >
                    Sil
                  </button>}
                </div>
              </div>
              <div className={styles.phonePreview} data-preview-scale={STUDIO_PHONE_PREVIEW_SCALE} style={{ width: `${CANONICAL_VIEWPORT.width * STUDIO_PHONE_PREVIEW_SCALE}px`, height: `${CANONICAL_VIEWPORT.height * STUDIO_PHONE_PREVIEW_SCALE}px` }}>
                <div className={styles.phonePreviewScale} style={{ width: `${CANONICAL_VIEWPORT.width}px`, height: `${CANONICAL_VIEWPORT.height}px`, transform: `scale(${STUDIO_PHONE_PREVIEW_SCALE})` }}>
                  <PhoneScreen
                    screen={screen}
                    compiled={compiled}
                    active={active}
                    selectedNodeId={selectedNodeId}
                    onSelect={onSelectNode}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
