import type { Screen } from "@floriven/design-spec";
import styles from "../StudioPage.module.css";
import type { LeftTab } from "../studio.types";
import { AssetsPanel } from "./AssetsPanel";
import { ComponentsPanel } from "./ComponentsPanel";
import { LayersPanel } from "./LayersPanel";
import { ScreensPanel } from "./ScreensPanel";

type SidebarTab = Exclude<LeftTab, "ai">;

const labels: Record<SidebarTab, string> = {
  screens: "Ekranlar",
  layers: "Katmanlar",
  components: "Bileşenler",
  assets: "Varlıklar",
};

export function StudioSidebar({
  tab,
  screens,
  screen,
  activeScreenId,
  selectedNodeId,
  onSelectScreen,
  onSelectNode,
  onDeleteScreen,
  onDuplicateScreen,
  onCreateBlankScreen,
}: {
  tab: SidebarTab;
  screens: Screen[];
  screen: Screen;
  activeScreenId: string;
  selectedNodeId: string;
  onSelectScreen: (id: string) => void;
  onSelectNode: (id: string) => void;
  onDeleteScreen: (screenId: string) => void;
  onDuplicateScreen: (screenId: string) => void;
  onCreateBlankScreen: () => void;
}) {
  return (
    <aside className={styles.leftSidebar}>
      <div className={styles.drawerHeader}>
        <span className={styles.drawerTitle}>{labels[tab]}</span>
      </div>
      <div className={styles.leftContent}>
        {tab === "screens" && (
          <ScreensPanel
            screens={screens}
            activeId={activeScreenId}
            onSelect={onSelectScreen}
            onDelete={onDeleteScreen}
            onDuplicate={onDuplicateScreen}
            onCreateBlank={onCreateBlankScreen}
          />
        )}
        {tab === "layers" && (
          <LayersPanel
            screen={screen}
            selectedNodeId={selectedNodeId}
            onSelect={onSelectNode}
          />
        )}
        {tab === "components" && <ComponentsPanel />}
        {tab === "assets" && <AssetsPanel />}
      </div>
    </aside>
  );
}
