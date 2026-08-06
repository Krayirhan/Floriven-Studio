import type { Screen } from "@floriven/design-spec";
import styles from "../StudioPage.module.css";
import { FlowConnections } from "./FlowConnections";
import { PhoneScreen } from "./PhoneScreen";

export function StudioCanvas({
  screens,
  activeScreenId,
  selectedNodeId,
  onSelectScreen,
  onSelectNode,
  onClearSelection,
}: {
  screens: Screen[];
  activeScreenId: string;
  selectedNodeId: string;
  onSelectScreen: (id: string) => void;
  onSelectNode: (id: string) => void;
  onClearSelection: () => void;
}) {
  return (
    <section className={styles.canvas} onClick={onClearSelection}>
      <div className={styles.canvasGrid} aria-hidden="true" />
      <FlowConnections screenCount={screens.length} />
      <div className={styles.canvasScreens}>
        {screens.map((screen) => {
          const active = screen.id === activeScreenId;
          return (
            <div
              className={styles.screenCol}
              key={screen.id}
              onClick={(event) => {
                event.stopPropagation();
                onSelectScreen(screen.id);
              }}
            >
              <div className={styles.scrLabel}>
                <span className={styles.scrLabelDot} />
                {screen.name}
                <span className={styles.scrLabelVars}>
                  {active ? "3 varyasyon" : "1 varyasyon"}
                </span>
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
