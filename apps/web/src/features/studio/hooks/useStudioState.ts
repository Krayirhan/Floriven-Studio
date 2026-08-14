import { useRef } from "react";
import type { Screen } from "@floriven/design-spec";
import { INITIAL_STUDIO_DOCUMENT } from "../studio.data";
import { useStudioDocument } from "../state/useStudioDocument";
import { useStudioGeneration, type GenerationEngine } from "../state/useStudioGeneration";
import { useStudioHistory } from "../state/useStudioHistory";
import { useStudioSelection } from "../state/useStudioSelection";
import { useStudioUiState } from "../state/useStudioUiState";

export function useStudioState(projectId: string, engine: GenerationEngine = "v3") {
  const ui = useStudioUiState();
  const historyState = useStudioHistory();

  // Ref breaks the circular dep: selection needs screens to find first child on
  // screen switch; documentState needs selection's activeScreenId/selectedNodeId.
  const screensRef = useRef<Screen[]>(INITIAL_STUDIO_DOCUMENT.screens);

  const selection = useStudioSelection(screensRef, ui.setRightTab);
  const documentState = useStudioDocument(
    projectId,
    selection.activeScreenId,
    selection.selectedNodeId,
    historyState.incrementRevision,
  );

  screensRef.current = documentState.document.screens;

  const generation = useStudioGeneration(
    ui,
    historyState.addHistoryEntry,
    documentState.setGeneratedScreens,
    projectId,
    () => screensRef.current,
    engine,
  );
  const { revision, history } = historyState;

  return {
    ...documentState,
    ...selection,
    ...ui,
    revision,
    history,
    ...generation,
  };
}
