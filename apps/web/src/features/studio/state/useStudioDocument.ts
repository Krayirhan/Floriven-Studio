import { useCallback, useMemo, useReducer } from "react";
import { INITIAL_STUDIO_DOCUMENT } from "../studio.data";
import type { StudioDocument } from "../studio.types";
import { findNode, updateNode } from "../studio.utils";

const MAX_HISTORY = 50;

type HistoryState = {
  past: StudioDocument[];
  present: StudioDocument;
  future: StudioDocument[];
};

type HistoryAction =
  | { type: "UPDATE_NODE"; screenId: string; nodeId: string; patch: Record<string, unknown> }
  | { type: "UNDO" }
  | { type: "REDO" };

function reducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case "UPDATE_NODE": {
      const next = {
        ...state.present,
        screens: state.present.screens.map((screen) =>
          screen.id === action.screenId
            ? { ...screen, root: updateNode(screen.root, action.nodeId, action.patch) }
            : screen,
        ),
      };
      return {
        past: [...state.past.slice(-(MAX_HISTORY - 1)), state.present],
        present: next,
        future: [],
      };
    }
    case "UNDO": {
      if (state.past.length === 0) return state;
      return {
        past: state.past.slice(0, -1),
        present: state.past[state.past.length - 1],
        future: [state.present, ...state.future],
      };
    }
    case "REDO": {
      if (state.future.length === 0) return state;
      return {
        past: [...state.past, state.present],
        present: state.future[0],
        future: state.future.slice(1),
      };
    }
  }
}

const INITIAL_STATE: HistoryState = {
  past: [],
  present: INITIAL_STUDIO_DOCUMENT,
  future: [],
};

type RevisionChange = () => void;

export function useStudioDocument(
  activeScreenId: string,
  selectedNodeId: string,
  onRevisionChange: RevisionChange,
) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const { past, present: document, future } = state;

  const activeScreen = useMemo(
    () => document.screens.find((screen) => screen.id === activeScreenId) ?? document.screens[0],
    [document.screens, activeScreenId],
  );

  const selectedNode = useMemo(
    () => (activeScreen ? findNode(activeScreen.root, selectedNodeId) : undefined),
    [activeScreen, selectedNodeId],
  );

  const updateSelectedNode = useCallback(
    (patch: Record<string, unknown>) => {
      if (!activeScreen) return;
      dispatch({ type: "UPDATE_NODE", screenId: activeScreen.id, nodeId: selectedNodeId, patch });
      onRevisionChange();
    },
    [activeScreen, onRevisionChange, selectedNodeId],
  );

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" });
    onRevisionChange();
  }, [onRevisionChange]);

  const redo = useCallback(() => {
    dispatch({ type: "REDO" });
    onRevisionChange();
  }, [onRevisionChange]);

  return {
    document,
    activeScreen,
    selectedNode,
    updateSelectedNode,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
