import type { DesignNode, DesignSpec } from "@floriven/design-spec";
import styles from "../StudioPage.module.css";
import type { RightTab } from "../studio.types";
import { DesignInspector } from "./DesignInspector";
import { PrototypeInspector } from "./PrototypeInspector";

const TABS: { key: RightTab; label: string }[] = [
  { key: "design", label: "Tasarım" },
  { key: "prototype", label: "Prototip" },
];

export function InspectorPanel({
  tab,
  node,
  activeScreenId: _activeScreenId,
  onTabChange,
  onUpdateNode,
}: {
  tab: RightTab;
  node: DesignNode | undefined;
  document: DesignSpec;
  activeScreenId: string;
  onTabChange: (tab: RightTab) => void;
  onUpdateNode?: (patch: Record<string, unknown>) => void;
}) {
  return (
    <aside className={styles.rightSidebar}>
      <nav className={styles.rTabs}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            className={`${styles.rTab} ${tab === key ? styles.rTabActive : ""}`}
            onClick={() => onTabChange(key)}
          >
            {label}
          </button>
        ))}
        {node && (
          <span className={styles.rTabNode} title={node.type}>
            {node.type === "Greeting" ? "Text" : node.type}
          </span>
        )}
      </nav>
      {tab === "design" && <DesignInspector node={node} onUpdate={onUpdateNode} />}
      {tab === "prototype" && <PrototypeInspector />}
    </aside>
  );
}
