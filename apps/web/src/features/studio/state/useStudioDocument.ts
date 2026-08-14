import { useCallback, useMemo, useReducer } from "react";
import type { Screen } from "@floriven/design-spec";
import { INITIAL_STUDIO_DOCUMENT } from "../studio.data";
import type { StudioDocument } from "../studio.types";
import { findNode, remapNodeIds, updateNode } from "../studio.utils";

const MAX_HISTORY = 50;

type HistoryState = {
  past: StudioDocument[];
  present: StudioDocument;
  future: StudioDocument[];
};

type HistoryAction =
  | { type: "UPDATE_NODE"; screenId: string; nodeId: string; patch: Record<string, unknown> }
  | { type: "SET_SCREENS"; screens: Screen[] }
  | { type: "DELETE_SCREEN"; screenId: string }
  | { type: "DUPLICATE_SCREEN"; screenId: string; newScreen: Screen }
  | { type: "ADD_SCREEN"; screen: Screen }
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
    case "SET_SCREENS": {
      const next = {
        ...state.present,
        screens: action.screens,
      };
      return {
        past: [...state.past.slice(-(MAX_HISTORY - 1)), state.present],
        present: next,
        future: [],
      };
    }
    case "DELETE_SCREEN": {
      const next = {
        ...state.present,
        screens: state.present.screens.filter((screen) => screen.id !== action.screenId),
      };
      return {
        past: [...state.past.slice(-(MAX_HISTORY - 1)), state.present],
        present: next,
        future: [],
      };
    }
    case "DUPLICATE_SCREEN": {
      const index = state.present.screens.findIndex((screen) => screen.id === action.screenId);
      if (index === -1) return state;
      const screens = [...state.present.screens];
      screens.splice(index + 1, 0, action.newScreen);
      return {
        past: [...state.past.slice(-(MAX_HISTORY - 1)), state.present],
        present: { ...state.present, screens },
        future: [],
      };
    }
    case "ADD_SCREEN": {
      return {
        past: [...state.past.slice(-(MAX_HISTORY - 1)), state.present],
        present: { ...state.present, screens: [...state.present.screens, action.screen] },
        future: [],
      };
    }
    case "UNDO": {
      if (state.past.length === 0) return state;
      const previous = state.past.at(-1);
      if (!previous) return state;
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      };
    }
    case "REDO": {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      if (!next) return state;
      return {
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1),
      };
    }
    default:
      return state;
  }
}

const INITIAL_STATE: HistoryState = {
  past: [],
  present: INITIAL_STUDIO_DOCUMENT,
  future: [],
};

type RevisionChange = () => void;

export function useStudioDocument(
  projectId: string,
  activeScreenId: string,
  selectedNodeId: string,
  onRevisionChange: RevisionChange,
) {
  const [state, dispatch] = useReducer(reducer, {
    ...INITIAL_STATE,
    present: { ...INITIAL_STUDIO_DOCUMENT, projectId },
  });
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

  const setGeneratedScreens = useCallback(
    (screens: Screen[]) => {
      dispatch({ type: "SET_SCREENS", screens });
      onRevisionChange();
    },
    [onRevisionChange],
  );

  const deleteScreen = useCallback(
    (screenId: string) => {
      dispatch({ type: "DELETE_SCREEN", screenId });
      onRevisionChange();
    },
    [onRevisionChange],
  );

  const duplicateScreen = useCallback(
    (screenId: string) => {
      const source = document.screens.find((screen) => screen.id === screenId);
      if (!source) return;
      const slug = `${source.id}_copy${Date.now().toString(36)}`;
      const newScreen: Screen = {
        ...source,
        id: slug,
        name: `${source.name} (Kopya)`,
        ...(source.route ? { route: `${source.route}-kopya` } : {}),
        root: remapNodeIds(source.root, slug, { current: 1 }),
      };
      dispatch({ type: "DUPLICATE_SCREEN", screenId, newScreen });
      onRevisionChange();
      return newScreen.id;
    },
    [document.screens, onRevisionChange],
  );

  const createBlankScreen = useCallback(() => {
    const slug = `screen_${Date.now().toString(36)}`;
    const name = `Yeni Ekran ${document.screens.length + 1}`;
    const screen: Screen = {
      id: slug,
      name,
      route: `/${slug}`,
      root: {
        id: `${slug}_root`,
        type: "Screen",
        props: {},
        layout: { mode: "column", gap: "space.4" },
        a11y: { role: "main", label: name },
        children: [
          { id: `${slug}_bar`, type: "TopAppBar", props: { title: name }, a11y: { role: "banner", label: `${name} üst çubuğu` } },
          { id: `${slug}_ttl`, type: "Text", props: { text: name, variant: "title" }, a11y: { role: "heading", label: name } },
        ],
      },
    };
    dispatch({ type: "ADD_SCREEN", screen });
    onRevisionChange();
    return screen.id;
  }, [document.screens.length, onRevisionChange]);

  return {
    document,
    activeScreen,
    selectedNode,
    updateSelectedNode,
    setGeneratedScreens,
    deleteScreen,
    duplicateScreen,
    createBlankScreen,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
