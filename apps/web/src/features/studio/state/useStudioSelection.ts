import { useCallback, useState, type RefObject } from "react";
import type { Screen } from "@floriven/design-spec";
import type { RightTab } from "../studio.types";

type SetRightTab = (tab: RightTab) => void;

export function useStudioSelection(
  screensRef: RefObject<Screen[]>,
  setRightTab: SetRightTab,
) {
  const [activeScreenId, setActiveScreenId] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState("");

  const selectScreen = useCallback(
    (id: string) => {
      setActiveScreenId(id);
      const screen = screensRef.current?.find((item) => item.id === id);
      setSelectedNodeId(screen?.root.children?.[0]?.id ?? "");
    },
    [screensRef],
  );

  const selectNode = useCallback(
    (id: string) => {
      setSelectedNodeId(id);
      setRightTab("design");
    },
    [setRightTab],
  );

  return { activeScreenId, selectedNodeId, selectScreen, selectNode };
}
