import styles from "./StudioPage.module.css";
import { AiCommandDock } from "./ai/AiCommandDock";
import { StudioCanvas } from "./canvas/StudioCanvas";
import { useStudioState } from "./hooks/useStudioState";
import { InspectorPanel } from "./inspector/InspectorPanel";
import { StudioSidebar } from "./sidebar/StudioSidebar";
import { StudioToolbar } from "./toolbar/StudioToolbar";

export function StudioPage() {
  const studio = useStudioState();

  if (!studio.activeScreen) return null;

  return (
    <div className={styles.studio}>
      <StudioToolbar revision={studio.revision} />
      <div className={styles.workspace}>
        <StudioSidebar
          tab={studio.leftTab}
          screen={studio.activeScreen}
          activeScreenId={studio.activeScreenId}
          selectedNodeId={studio.selectedNodeId}
          onTabChange={studio.setLeftTab}
          onSelectScreen={studio.selectScreen}
          onSelectNode={studio.selectNode}
        />
        <StudioCanvas
          screens={studio.document.screens}
          activeScreenId={studio.activeScreenId}
          selectedNodeId={studio.selectedNodeId}
          onSelectScreen={studio.selectScreen}
          onSelectNode={studio.selectNode}
          onClearSelection={() => studio.selectNode("")}
        />
        <InspectorPanel
          tab={studio.rightTab}
          node={studio.selectedNode}
          document={studio.document}
          activeScreenId={studio.activeScreenId}
          onTabChange={studio.setRightTab}
        />
      </div>
      <AiCommandDock prompt={studio.prompt} onPromptChange={studio.setPrompt} />
    </div>
  );
}
