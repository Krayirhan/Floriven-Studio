import type { DesignNode } from "@floriven/design-spec";
import styles from "../StudioPage.module.css";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.inspRow}>
      <span>{label}</span>
      <b className={styles.inspRowVal}>{value}</b>
    </div>
  );
}

function EditableRow({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: string;
  onCommit: (v: string) => void;
}) {
  return (
    <label className={styles.inspField}>
      <span className={styles.inspLbl}>{label}</span>
      <input
        className={styles.inspFld}
        defaultValue={value}
        onBlur={(e) => onCommit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
      />
    </label>
  );
}

export function DesignInspector({
  node,
  onUpdate,
}: {
  node: DesignNode | undefined;
  onUpdate?: (patch: Record<string, unknown>) => void;
}) {
  if (!node)
    return (
      <div className={styles.rContent}>
        <div style={{ color: "var(--fv-text-muted)", fontSize: 12, paddingTop: 20 }}>
          Düzenlemek için canvas'ta bir bileşen seç.
        </div>
      </div>
    );

  const displayType = node.type === "Greeting" ? "Text" : node.type;
  const stringProps = Object.entries(node.props).filter(
    ([, v]) => typeof v === "string" || typeof v === "number",
  ) as [string, string | number][];

  return (
    <div className={styles.rContent}>
      <div className={styles.inspBadge}>{displayType}</div>

      {/* Bileşen */}
      <section className={styles.inspSection}>
        <div className={styles.inspHead}>Bileşen</div>
        <div className={styles.inspBody}>
          <Row label="ID" value={node.id} />
          <Row label="Tür" value={displayType} />
          {node.a11y?.role && <Row label="Rol" value={node.a11y.role} />}
          {node.children && <Row label="Alt bileşen" value={String(node.children.length)} />}
        </div>
      </section>

      {/* Düzen */}
      {node.layout && (
        <section className={styles.inspSection}>
          <div className={styles.inspHead}>Düzen</div>
          <div className={styles.inspBody}>
            <Row label="Mod" value={node.layout.mode} />
            {node.layout.gap && <Row label="Gap" value={node.layout.gap} />}
            {node.layout.padding && <Row label="Padding" value={node.layout.padding} />}
          </div>
        </section>
      )}

      {/* Props */}
      {stringProps.length > 0 && (
        <section className={styles.inspSection}>
          <div className={styles.inspHead}>Özellikler</div>
          <div className={styles.inspBody}>
            {stringProps.map(([key, value]) =>
              onUpdate ? (
                <EditableRow
                  key={`${key}:${value}`}
                  label={key}
                  value={String(value)}
                  onCommit={(v) => onUpdate({ [key]: v })}
                />
              ) : (
                <Row key={key} label={key} value={String(value)} />
              ),
            )}
          </div>
        </section>
      )}

      {/* Erişilebilirlik */}
      {node.a11y && (
        <section className={styles.inspSection}>
          <div className={styles.inspHead}>Erişilebilirlik</div>
          <div className={styles.inspBody}>
            <Row label="Rol" value={node.a11y.role} />
            <Row label="Etiket" value={node.a11y.label} />
            {node.a11y.hint && <Row label="İpucu" value={node.a11y.hint} />}
          </div>
        </section>
      )}
    </div>
  );
}
