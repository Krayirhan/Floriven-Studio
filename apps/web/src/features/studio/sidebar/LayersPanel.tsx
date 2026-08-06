import type { Screen } from "@floriven/design-spec";
import styles from "../StudioPage.module.css";
import { typeIcon, propString } from "../studio.utils";

export function LayersPanel({
  screen,
  selectedNodeId,
  onSelect,
}: {
  screen: Screen;
  selectedNodeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className={styles.lyTree}>
      {screen.root.children?.map((node) => (
        <button
          key={node.id}
          className={`${styles.lyItem} ${selectedNodeId === node.id ? styles.lyItemActive : ""}`}
          onClick={() => onSelect(node.id)}
        >
          <span className={styles.lyIcon}>{typeIcon(node.type)}</span>
          {node.type === "Greeting"
            ? "GreetingText"
            : node.type === "SectionTitle"
              ? propString(node, "text", "Başlık")
              : node.type}
        </button>
      ))}
    </div>
  );
}
