import type { DesignNode, DesignSpec } from "@floriven/design-spec";
import styles from "../StudioPage.module.css";
import type { RightTab } from "../studio.types";
import { AccessibilityInspector } from "./AccessibilityInspector";
import { AiInspector } from "./AiInspector";
import { ContentInspector } from "./ContentInspector";
import { DesignInspector } from "./DesignInspector";
import { PrototypeInspector } from "./PrototypeInspector";

const labels: Record<RightTab, string> = {
  design: "Tasarım",
  prototype: "Prototip",
  content: "İçerik",
  accessibility: "Erişilebilirlik",
  ai: "Yapay Zekâ",
};

export function InspectorPanel({
  tab,
  node,
  document,
  activeScreenId,
  onTabChange,
}: {
  tab: RightTab;
  node: DesignNode | undefined;
  document: DesignSpec;
  activeScreenId: string;
  onTabChange: (tab: RightTab) => void;
}) {
  return (
    <aside className={styles.rightSidebar}>
      <nav className={styles.rTabs}>
        {(Object.keys(labels) as RightTab[]).map((item) => (
          <button
            key={item}
            className={`${styles.rTab} ${tab === item ? styles.rTabActive : ""}`}
            onClick={() => onTabChange(item)}
          >
            {labels[item]}
          </button>
        ))}
      </nav>
      {tab === "design" && <DesignInspector node={node} />}
      {tab === "prototype" && <PrototypeInspector />}
      {tab === "content" && <ContentInspector node={node} />}
      {tab === "accessibility" && <AccessibilityInspector node={node} />}
      {tab === "ai" && (
        <AiInspector
          node={node}
          screens={document.screens}
          activeScreenId={activeScreenId}
        />
      )}
    </aside>
  );
}
