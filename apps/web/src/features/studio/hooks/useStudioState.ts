import { useCallback, useMemo, useState } from "react";
import { INITIAL_STUDIO_DOCUMENT } from "../studio.data";
import type { JournalEntry, LeftTab, RightTab } from "../studio.types";
import { findNode, updateNode } from "../studio.utils";

const INITIAL_JOURNAL: JournalEntry[] = [
  { id: "j0", type: "analyze", message: "Brief analiz edildi", detail: "Kişisel finans uygulaması · iOS öncelikli", timestamp: Date.now() - 600000 },
  { id: "j1", type: "generate", message: "Ana Sayfa oluşturuldu", detail: "6 bileşen, 3 varyasyon üretildi", timestamp: Date.now() - 480000, screenIds: ["scr_home"] },
  { id: "j2", type: "variant", message: "3 varyasyon üretildi", detail: "Original · Editorial · Soft Futurism", timestamp: Date.now() - 360000, screenIds: ["scr_home"] },
  { id: "j3", type: "generate", message: "İşlemler ekranı oluşturuldu", detail: "4 bileşen, arama ve segmentler", timestamp: Date.now() - 240000, screenIds: ["scr_tx"] },
  { id: "j4", type: "apply", message: "Bütçe Detayı iyileştirildi", detail: "Trend grafik ve AI insight eklendi", timestamp: Date.now() - 120000, screenIds: ["scr_bgt"] },
];

export function useStudioState() {
  const [document, setDocument] = useState(INITIAL_STUDIO_DOCUMENT);
  const [activeScreenId, setActiveScreenId] = useState("scr_home");
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [leftTab, setLeftTab] = useState<LeftTab>("screens");
  const [rightTab, setRightTab] = useState<RightTab>("design");
  const [revision, setRevision] = useState(14);
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>(INITIAL_JOURNAL);
  const [brief, setBrief] = useState(
    "Kişisel finans uygulaması, 25–40 yaş arası profesyoneller için. iOS öncelikli mobil uygulama. Stil: clean, modern, güven veren. Accent renk: turuncu. Ekranlar: Ana Sayfa, İşlemler, Bütçe Detayı."
  );

  const addJournalEntry = useCallback((entry: Omit<JournalEntry, "id" | "timestamp">) => {
    setJournal((prev) => [{ ...entry, id: `j${Date.now()}`, timestamp: Date.now() }, ...prev].slice(0, 20));
  }, []);

  const generate = useCallback(() => {
    if (prompt.trim()) {
      setHistory((items) => [prompt.trim(), ...items].slice(0, 8));
      addJournalEntry({ type: "generate", message: `"${prompt.trim().slice(0, 40)}" uygulandı`, detail: "AI işleniyor..." });
    }
  }, [prompt, addJournalEntry]);

  const undo = useCallback(() => setRevision((value) => Math.max(1, value - 1)), []);
  const redo = useCallback(() => setRevision((value) => value + 1), []);

  const activeScreen = useMemo(
    () => document.screens.find((screen) => screen.id === activeScreenId) ?? document.screens[0],
    [document.screens, activeScreenId],
  );

  const selectedNode = useMemo(
    () => (activeScreen ? findNode(activeScreen.root, selectedNodeId) : undefined),
    [activeScreen, selectedNodeId],
  );

  const selectScreen = useCallback(
    (id: string) => {
      setActiveScreenId(id);
      const screen = document.screens.find((item) => item.id === id);
      setSelectedNodeId(screen?.root.children?.[0]?.id ?? "");
    },
    [document.screens],
  );

  const selectNode = useCallback((id: string) => {
    setSelectedNodeId(id);
    setRightTab("design");
  }, []);

  const updateSelectedNode = useCallback(
    (patch: Record<string, unknown>) => {
      if (!activeScreen) return;
      setDocument((current) => ({
        ...current,
        screens: current.screens.map((screen) =>
          screen.id === activeScreen.id
            ? { ...screen, root: updateNode(screen.root, selectedNodeId, patch) }
            : screen,
        ),
      }));
      setRevision((current) => current + 1);
    },
    [activeScreen, selectedNodeId],
  );

  return {
    document, activeScreen, selectedNode, activeScreenId, selectedNodeId,
    leftTab, rightTab, revision, prompt, history, journal, brief,
    setLeftTab, setRightTab, setPrompt, setBrief, addJournalEntry,
    generate, undo, redo, selectScreen, selectNode, updateSelectedNode,
  };
}
