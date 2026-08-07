import type { Screen } from "@floriven/design-spec";
import { useRef, useState } from "react";
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

export function StudioCanvas({
  screens,
  activeScreenId,
  selectedNodeId,
  mode,
  onSelectScreen,
  onSelectNode,
  onClearSelection,
}: {
  screens: Screen[];
  activeScreenId: string;
  selectedNodeId: string;
  mode?: "design" | "flow" | "compare";
  onSelectScreen: (id: string) => void;
  onSelectNode: (id: string) => void;
  onClearSelection: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<Tool>("select");
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
  const fitAll = () => { setZoom(0.85); setPan({ x: 0, y: 0 }); };

  return (
    <section
      className={styles.canvas}
      style={{ cursor: tool === "hand" ? "grab" : "default" }}
      onClick={onClearSelection}
      onWheel={(e) => {
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
                  <span className={styles.scrLabelVars}>
                    <select
                      aria-label={`${screen.name} varyasyonu`}
                      defaultValue={active ? "Original" : "Editorial"}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option>Original</option>
                      <option>Editorial</option>
                      <option>Soft Futurism</option>
                    </select>
                  </span>
                </div>
                <div className={styles.scrMeta2}>
                  <span className={styles.scrDims}>{meta.dims}</span>
                  <span className={styles.scrMetaDot}>·</span>
                  <span className={styles.scrDevice}>{meta.device}</span>
                </div>
                <div className={styles.scrHeaderActions}>
                  <button className={styles.scrHeaderBtn} onClick={(e) => e.stopPropagation()}>Önizle</button>
                  <button className={styles.scrHeaderBtn} onClick={(e) => e.stopPropagation()}>Çoğalt</button>
                  <button className={styles.scrHeaderBtn} onClick={(e) => e.stopPropagation()}>✦ Varyasyon</button>
                  <button className={styles.scrHeaderBtn} onClick={(e) => e.stopPropagation()}>Sil</button>
                </div>
              </div>
              <PhoneScreen
                screen={screen}
                active={active}
                selectedNodeId={selectedNodeId}
                onSelect={onSelectNode}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
