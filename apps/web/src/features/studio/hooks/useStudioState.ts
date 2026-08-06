import { useCallback, useMemo, useState } from "react";
import { INITIAL_STUDIO_DOCUMENT } from "../studio.data";
import type { LeftTab, RightTab } from "../studio.types";
import { findNode, updateNode } from "../studio.utils";

export function useStudioState() {
  const [document, setDocument] = useState(INITIAL_STUDIO_DOCUMENT);
  const [activeScreenId, setActiveScreenId] = useState("scr_home");
  const [selectedNodeId, setSelectedNodeId] = useState("n_greet");
  const [leftTab, setLeftTab] = useState<LeftTab>("screens");
  const [rightTab, setRightTab] = useState<RightTab>("design");
  const [revision, setRevision] = useState(14);
  const [prompt, setPrompt] = useState("");

  const activeScreen = useMemo(
    () =>
      document.screens.find((screen) => screen.id === activeScreenId) ??
      document.screens[0],
    [document.screens, activeScreenId],
  );
  const selectedNode = useMemo(
    () =>
      activeScreen ? findNode(activeScreen.root, selectedNodeId) : undefined,
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
            ? {
                ...screen,
                root: updateNode(screen.root, selectedNodeId, patch),
              }
            : screen,
        ),
      }));
      setRevision((current) => current + 1);
    },
    [activeScreen, selectedNodeId],
  );

  return {
    document,
    activeScreen,
    selectedNode,
    activeScreenId,
    selectedNodeId,
    leftTab,
    rightTab,
    revision,
    prompt,
    setLeftTab,
    setRightTab,
    setPrompt,
    selectScreen,
    selectNode,
    updateSelectedNode,
  };
}
