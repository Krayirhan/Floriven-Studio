import type { Screen } from "@floriven/design-spec";
import styles from "../StudioPage.module.css";
import type { LeftTab } from "../studio.types";
import { AssetsPanel } from "./AssetsPanel";
import { ComponentsPanel } from "./ComponentsPanel";
import { LayersPanel } from "./LayersPanel";
import { ScreensPanel } from "./ScreensPanel";

const labels: Record<LeftTab, string> = {
  screens: "Ekranlar",
  layers: "Katmanlar",
  components: "Bileşenler",
  assets: "Varlıklar",
};

export function StudioSidebar({
  tab,
  screen,
  activeScreenId,
  selectedNodeId,
  onTabChange,
  onSelectScreen,
  onSelectNode,
}: {
  tab: LeftTab;
  screen: Screen;
  activeScreenId: string;
  selectedNodeId: string;
  onTabChange: (tab: LeftTab) => void;
  onSelectScreen: (id: string) => void;
  onSelectNode: (id: string) => void;
}) {
  return (
    <aside className={styles.leftSidebar}>
      <nav className={styles.leftTabs}>
        {(Object.keys(labels) as LeftTab[]).map((item) => (
          <button
            key={item}
            className={`${styles.lTab} ${tab === item ? styles.lTabActive : ""}`}
            onClick={() => onTabChange(item)}
          >
            {labels[item]}
          </button>
        ))}
      </nav>
      <div className={styles.leftContent}>
        {tab === "screens" && (
          <ScreensPanel activeId={activeScreenId} onSelect={onSelectScreen} />
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
