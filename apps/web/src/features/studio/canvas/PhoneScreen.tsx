import type { CSSProperties, MouseEvent } from "react";
import { CANONICAL_VIEWPORT, type CompiledVisualScreen, type DesignNode, type PresentationSpecV2, type Screen } from "@floriven/design-spec";
import styles from "../StudioPage.module.css";
import { isComponentType } from "./componentRegistry";

type RendererProps = {
  node: DesignNode;
  selectedNodeId: string;
  onSelect: (id: string) => void;
  activeNavItem?: string | undefined;
  presentation: PresentationSpecV2;
  chartTypeOverride?: string;
};

function stringProp(node: DesignNode, key: string, fallback = ""): string {
  const value = node.props[key];
  return typeof value === "string" ? value : fallback;
}

function stringList(node: DesignNode, key: string): string[] {
  const value = node.props[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function numberList(node: DesignNode, key: string): number[] {
  const value = node.props[key];
  return Array.isArray(value) ? value.filter((item): item is number => typeof item === "number" && Number.isFinite(item)) : [];
}

function numberProp(node: DesignNode, key: string, fallback = 0): number {
  const value = node.props[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function healthStateClass(value: string): string {
  const normalized = value === "overdue" || value === "critical" ? "critical" : value === "due" || value === "attention" ? "attention" : "normal";
  return styles[`healthState${normalized[0]?.toUpperCase() ?? ""}${normalized.slice(1)}`] ?? "";
}

function toneClass(node: DesignNode): string {
  const tone = stringProp(node, "tone", "neutral");
  return styles[`generatedTone${tone[0]?.toUpperCase() ?? ""}${tone.slice(1)}`] ?? "";
}

function presentationVariables(presentation: PresentationSpecV2): CSSProperties {
  return {
    "--gen-accent": presentation.palette.accent,
    "--gen-accent-soft": `color-mix(in srgb, ${presentation.palette.accent} 14%, ${presentation.palette.background})`,
    "--gen-on-accent": presentation.palette.background,
    "--gen-radius-lg": presentation.geometry.radius,
    "--gen-card-padding": presentation.geometry.padding,
    "--gen-card-border": presentation.geometry.border.startsWith("0") ? "0" : `1px solid color-mix(in srgb, ${presentation.palette.foreground} 14%, transparent)`,
    "--gen-card-shadow": presentation.geometry.elevation === "flat" ? "none" : presentation.geometry.elevation === "playful" ? `0 8px 0 color-mix(in srgb, ${presentation.palette.accent} 22%, transparent)` : `0 12px 30px color-mix(in srgb, ${presentation.palette.foreground} 14%, transparent)`,
    "--gen-heading-size": presentation.typography.roles.display.size,
    "--gen-heading-weight": presentation.typography.roles.display.weight,
    "--gen-heading-line-height": presentation.typography.roles.display.lineHeight,
    "--gen-body-size": presentation.typography.roles.body.size,
    "--gen-body-line-height": presentation.typography.roles.body.lineHeight,
    "--gen-metric-size": presentation.typography.roles.metric.size,
    "--gen-meta-size": presentation.typography.roles.metadata.size,
    "--gen-type-weight": presentation.typography.roles.body.weight,
    "--gen-label-transform": presentation.typography.uppercaseLabels ? "uppercase" : "none",
    "--gen-chart-grid-opacity": presentation.charts.grid === "none" ? 0 : presentation.charts.grid === "strong" ? 1 : .45,
    "--gen-chart-height": presentation.charts.density === "dense" ? "88px" : presentation.charts.density === "sparse" ? "58px" : "72px",
    "--gen-control-radius": presentation.controls.types[0] === "segmented" ? "8px" : presentation.geometry.radius,
    "--gen-field-radius": presentation.fields.styles[0] === "underline" ? "0px" : presentation.geometry.radius,
    "--gen-divider-width": presentation.surfaces.divider === "strong" || presentation.surfaces.divider === "ink" ? "2px" : "1px",
    "--gen-interaction-scale": presentation.behavior.interaction === "energetic" ? "1.02" : "1",
    "--gen-space-4": `${presentation.spacing.sectionGap}px`,
    "--gen-navigation-radius": presentation.navigation.active === "floating" ? "24px" : presentation.navigation.active === "minimal" ? "0px" : presentation.geometry.radius,
    "--fv-phone-bg": presentation.palette.background,
    "--fv-phone-text": presentation.palette.foreground,
    "--floriven-font-body": presentation.typography.family,
    "--floriven-font-display": presentation.typography.displayFamily,
    "--floriven-motion-duration": presentation.motion.duration,
  } as CSSProperties;
}

function selectionProps(node: DesignNode, onSelect: (id: string) => void): { className: string; onClick: (event: MouseEvent) => void; "data-node-id": string; "data-floriven-node-id": string; "data-section-role"?: string; "data-semantic-container"?: "true" } {
  const semanticContainer = node.props?.semanticContainer === true
  const sectionRole = typeof node.props?.contractSectionRole === "string" ? node.props.contractSectionRole : undefined
  return {
    className: styles.generatedNode ?? "",
    "data-node-id": node.id,
    "data-floriven-node-id": node.id,
    ...(semanticContainer ? { "data-semantic-container": "true" as const } : {}),
    ...(semanticContainer && sectionRole ? { "data-section-role": sectionRole } : {}),
    onClick: (event) => { event.stopPropagation(); onSelect(node.id); },
  };
}

function children(node: DesignNode, selectedNodeId: string, onSelect: (id: string) => void, activeNavItem: string | undefined, presentation: PresentationSpecV2) {
  return node.children?.map((child) => <DesignNodeRenderer key={child.id} node={child} selectedNodeId={selectedNodeId} onSelect={onSelect} activeNavItem={activeNavItem} presentation={presentation} />);
}

function isBottomNavigation(node: DesignNode): boolean {
  return node.type === "BottomNavigation" || node.type === "TabBar";
}

/**
 * Pulls the bottom navigation and any floating action button out of the
 * scrollable content so they can be rendered as fixed overlays anchored to
 * the phone frame. Left inline, a `position: sticky` FAB pins itself at its
 * last scroll position and rides over whatever content passes beneath it —
 * that overlap is what "sticky-in-a-flex-column" actually means, not a
 * rendering bug on the browser's part.
 */
export function splitScreenNavigation(root: DesignNode): { contentRoot: DesignNode; navigation?: DesignNode; fab?: DesignNode } {
  const navigation = root.children?.find(isBottomNavigation);
  const fab = root.children?.find((node) => node.type === "FloatingActionButton");
  const appBar = root.children?.find((node) => node.type === "TopAppBar");
  const appBarTitle = appBar && typeof appBar.props.title === "string" ? appBar.props.title : undefined;
  const duplicateTitle = appBarTitle
    ? root.children?.find((node) => node.type === "Text" && node.props.variant === "title" && node.props.text === appBarTitle)
    : undefined;
  if (!navigation && !fab && !duplicateTitle) return { contentRoot: root };
  return {
    contentRoot: { ...root, children: root.children?.filter((node) => node.id !== navigation?.id && node.id !== fab?.id && node.id !== duplicateTitle?.id) ?? [] },
    ...(navigation ? { navigation } : {}),
    ...(fab ? { fab } : {}),
  };
}

/**
 * Picks the nav glyph from the tab's own label first (a "Faturalar" tab should
 * never draw a house), falling back to a position-based cycle only when the
 * label carries no recognizable keyword.
 */
function NavigationIcon({ index, label }: { index: number; label?: string }) {
  const normalized = (label ?? "").toLocaleLowerCase("tr-TR");
  const byKeyword =
    /ana|genel|bakış|özet|home/.test(normalized) ? "home"
    : /takvim|planlama|tarih|calendar/.test(normalized) ? "calendar"
    : /harcama|işlem|hareket|takip|liste/.test(normalized) ? "list"
    : /bütçe|cüzdan|kart|ödeme|wallet|finans/.test(normalized) ? "wallet"
    : /rapor|analiz|grafik|istatistik|chart/.test(normalized) ? "chart"
    : /fatura|hatırlat|bildirim|bell/.test(normalized) ? "bell"
    : /ayar|profil|hesap|settings/.test(normalized) ? "settings"
    : undefined;
  const icon = byKeyword ?? (["home", "calendar", "chart", "settings"][index % 4]);
  return <svg className={styles.generatedNavigationIcon} viewBox="0 0 24 24" aria-hidden="true">
    {icon === "home" && <><path d="M3.5 10.5 12 3.8l8.5 6.7" /><path d="M5.5 9.5v10h13v-10M9.5 19.5v-6h5v6" /></>}
    {icon === "calendar" && <><rect x="3.5" y="4.5" width="17" height="16" rx="3" /><path d="M8 2.8v3.5M16 2.8v3.5M3.5 9h17M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" /></>}
    {icon === "chart" && <><path d="M4 19.5V14M10 19.5V9M16 19.5V4M22 19.5H2" /></>}
    {icon === "settings" && <><circle cx="12" cy="8" r="4" /><path d="M4.5 20c.8-4 3.3-6 7.5-6s6.7 2 7.5 6" /></>}
    {icon === "list" && <><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></>}
    {icon === "wallet" && <><path d="M3.5 7.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-9Z" /><path d="M15.5 12.5h3.5" /></>}
    {icon === "bell" && <><path d="M6 10.5a6 6 0 0 1 12 0c0 4 1.4 5.3 1.4 5.3H4.6S6 14.5 6 10.5Z" /><path d="M10 19.5a2 2 0 0 0 4 0" /></>}
  </svg>;
}

function ActionGlyph({ name }: { name: string }) {
  const normalized = name.toLocaleLowerCase("tr-TR");
  const kind = normalized.includes("filter") || normalized.includes("filtre") ? "filter"
    : normalized.includes("search") || normalized.includes("ara") ? "search"
      : normalized.includes("edit") || normalized.includes("düzen") ? "edit"
        : normalized.includes("check") || normalized.includes("onay") ? "check"
          : normalized.includes("arrow") || normalized.includes("ileri") ? "arrow"
            : "plus";
  return <svg className={styles.generatedActionIcon} viewBox="0 0 24 24" aria-hidden="true">
    {kind === "plus" && <path d="M12 5v14M5 12h14" />}
    {kind === "filter" && <path d="M4 6h16l-6.2 7v4.5l-3.6 1.8V13L4 6Z" />}
    {kind === "search" && <><circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 5 5" /></>}
    {kind === "edit" && <><path d="m5 16-.8 4 4-.8L19 8.4 15.6 5 5 16Z" /><path d="m13.8 6.8 3.4 3.4" /></>}
    {kind === "check" && <path d="m5 12.5 4.2 4.2L19 7" />}
    {kind === "arrow" && <><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>}
  </svg>;
}

/** Small vector glyph set for leaf icon props — replaces bare-letter/dot fallbacks. */
function LeafGlyph({ name }: { name: string }) {
  const normalized = name.toLocaleLowerCase("tr-TR");
  const kind = normalized.includes("kalp") || normalized.includes("heart") || normalized.includes("favor") ? "heart"
    : normalized.includes("yıldız") || normalized.includes("star") ? "star"
      : normalized.includes("saat") || normalized.includes("clock") || normalized.includes("time") ? "clock"
        : normalized.includes("çan") || normalized.includes("bell") || normalized.includes("bildirim") ? "bell"
          : normalized.includes("kalkan") || normalized.includes("shield") || normalized.includes("güven") ? "shield"
            : normalized.includes("etiket") || normalized.includes("tag") ? "tag"
              : "dot";
  return <svg className={styles.generatedLeafIcon} viewBox="0 0 24 24" aria-hidden="true">
    {kind === "heart" && <path d="M12 20.5s-7.5-4.6-9.7-9.3C.7 7.7 2.6 4.5 6 4.2c2-.2 3.6.9 6 3.3 2.4-2.4 4-3.5 6-3.3 3.4.3 5.3 3.5 3.7 7C19.5 15.9 12 20.5 12 20.5Z" />}
    {kind === "star" && <path d="m12 3 2.6 5.8 6.4.6-4.8 4.3 1.4 6.3L12 16.9 6.4 20l1.4-6.3-4.8-4.3 6.4-.6L12 3Z" />}
    {kind === "clock" && <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>}
    {kind === "bell" && <><path d="M6 10.5a6 6 0 0 1 12 0c0 4 1.4 5.3 1.4 5.3H4.6S6 14.5 6 10.5Z" /><path d="M10 19.5a2 2 0 0 0 4 0" /></>}
    {kind === "shield" && <path d="M12 3.3 19 6v5.4c0 5-3 8-7 9.3-4-1.3-7-4.3-7-9.3V6l7-2.7Z" />}
    {kind === "tag" && <><path d="M11.5 3.5H5a1.5 1.5 0 0 0-1.5 1.5v6.5L13 21l7-7-9.5-9.5Z" /><circle cx="8" cy="8" r="1.3" /></>}
    {kind === "dot" && <circle cx="12" cy="12" r="3.5" />}
  </svg>;
}

function layoutStyle(node: DesignNode): CSSProperties {
  const mode = node.layout?.mode;
  if (mode === "row") return { display: "flex", flexDirection: "row", gap: 10 };
  if (mode === "grid") return { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 };
  return { display: "flex", flexDirection: "column", gap: 12 };
}

function sectionNodeColumns(section: CompiledVisualScreen["renderPlan"]["sections"][number]): number {
  if (section.role === "secondary-metrics") return Math.min(2, Math.max(1, section.nodes.length));
  if (section.role === "breakdown") return Math.min(2, Math.max(1, section.nodes.length));
  return 1;
}

export function DesignNodeRenderer({ node, selectedNodeId, onSelect, activeNavItem, presentation, chartTypeOverride }: RendererProps) {
  if (!isComponentType(node.type)) {
    return <div role="alert" data-renderer-error="UNSUPPORTED_RENDERER_COMPONENT">Unsupported component: {node.type}</div>;
  }
  const isSelected = node.id === selectedNodeId;
  const selectedClass = isSelected ? styles.phSelected : "";
  const selectable = selectionProps(node, onSelect);
  const childNodes = children(node, selectedNodeId, onSelect, activeNavItem, presentation);

  switch (node.type) {
    case "Screen":
    case "SafeArea":
    case "ScrollView":
    case "Stack":
    case "Row":
    case "Grid":
    case "Form":
      return <div {...selectable} className={`${selectable.className} ${styles[`generated${node.type}`] ?? ""} ${selectedClass}`} style={layoutStyle(node)}>{childNodes}</div>;
    case "Text": {
      const variant = stringProp(node, "variant", "body");
      const Tag = variant === "title" ? "h1" : variant === "heading" ? "h2" : "p";
      return <Tag {...selectable} className={`${styles.generatedText} ${styles[`generatedText${variant[0]?.toUpperCase() ?? ""}${variant.slice(1)}`] ?? ""} ${selectedClass}`}>{stringProp(node, "text")}</Tag>;
    }
    case "TopAppBar":
      return <header {...selectable} className={`${styles.generatedTopBar} ${selectedClass}`}>
        <span className={styles.generatedTopBarTitle}>{stringProp(node, "title")}</span>
        <span className={styles.generatedTopBarAction}>{stringProp(node, "action", "•••")}</span>
      </header>;
    case "Card": {
      const variant = stringProp(node, "variant", "elevated");
      const variantClass = styles[`generatedCard${variant[0]?.toUpperCase() ?? ""}${variant.slice(1)}`] ?? "";
      const family = stringProp(node, "family", presentation.cards.types[0] ?? "");
      return <section {...selectable} data-component-family={family || undefined} data-surface-style={presentation.surfaces.style} className={`${styles.generatedCard} ${variantClass} ${toneClass(node)} ${selectedClass}`}>{childNodes}</section>;
    }
    case "Button":
      return <button {...selectable} type="button" data-button-style={presentation.controls.buttons[0]} className={`${styles.generatedButton} ${selectedClass}`}>{stringProp(node, "label", stringProp(node, "icon", "Devam"))}</button>;
    case "IconButton":
      return <button {...selectable} type="button" className={`${styles.generatedIconButton} ${selectedClass}`} aria-label={node.a11y?.label ?? "Aksiyon"}><ActionGlyph name={stringProp(node, "icon", "plus")} /></button>;
    case "TextField":
    case "SearchField":
      return <label {...selectable} data-field-style={presentation.fields.styles[0]} className={`${styles.generatedInput} ${selectedClass}`}><span className={styles.generatedFieldLabel}>{stringProp(node, "label", stringProp(node, "placeholder"))}</span>{node.type === "SearchField" && <ActionGlyph name="search" />}<span className={styles.generatedFieldValue}>{stringProp(node, "placeholder")}</span></label>;
    case "ListItem": {
      const title = stringProp(node, "title");
      return <div {...selectable} className={`${styles.generatedListItem} ${toneClass(node)} ${selectedClass}`}>
        <i className={styles.generatedLeadingIcon} aria-hidden="true">{stringProp(node, "icon") ? <LeafGlyph name={stringProp(node, "icon")} /> : title.slice(0, 1).toLocaleUpperCase("tr-TR")}</i>
        <span className={styles.generatedListItemTitle}>{title}</span>
        <small className={styles.generatedListItemSubtitle}>{stringProp(node, "subtitle")}</small>
        <b className={styles.generatedListItemTrailing}>{stringProp(node, "trailing")}</b>
      </div>;
    }
    case "Divider":
      return <hr {...selectable} data-divider-style={presentation.surfaces.divider} className={`${styles.generatedDivider} ${selectedClass}`} />;
    case "Badge":
      return <span {...selectable} data-pill-type={presentation.pills.types[0]} data-status-style={presentation.pills.status} className={`${styles.generatedBadge} ${toneClass(node)} ${selectedClass}`}>{stringProp(node, "label")}</span>;
    case "Avatar":
      return <div {...selectable} data-avatar-shape={presentation.media.avatarShape} className={`${styles.generatedAvatar} ${selectedClass}`}><span>{stringProp(node, "initials", "•")}</span></div>;
    case "Image":
      return <div {...selectable} data-image-treatment={presentation.media.treatment} className={`${styles.generatedImage} ${selectedClass}`} aria-label={stringProp(node, "alt", "Görsel")}><span>{stringProp(node, "alt", "Görsel")}</span></div>;
    case "Icon":
      return <span {...selectable} data-icon-style={presentation.icons.style} className={`${styles.generatedIcon} ${selectedClass}`}><LeafGlyph name={stringProp(node, "name", "dot")} /></span>;
    case "Progress": {
      const rawValue = node.props.value;
      const value = typeof rawValue === "number" ? Math.max(0, Math.min(100, rawValue)) : 0;
      return <div {...selectable} className={`${styles.generatedProgress} ${toneClass(node)} ${selectedClass}`}><div className={styles.generatedProgressTrack}><div className={styles.generatedProgressFill} style={{ width: `${value}%` }} /></div><small>{stringProp(node, "label")}</small></div>;
    }
    case "Metric": {
      const tone = stringProp(node, "tone", "neutral");
      return <article {...selectable} className={`${styles.generatedMetric} ${toneClass(node)} ${selectedClass}`}>
        <div className={styles.generatedMetricLabelRow}>
          {tone !== "neutral" && tone !== "primary" && <i className={styles.generatedMetricDot} aria-hidden="true" />}
          <small>{stringProp(node, "label")}</small>
        </div>
        <strong>{stringProp(node, "value")}</strong>
        <span>{stringProp(node, "caption")}</span>
      </article>;
    }
    case "Chart": {
      const values = numberList(node, "values").slice(0, 8);
      const max = Math.max(...values, 1);
      const min = Math.min(...values, 0);
      const span = Math.max(max - min, 1);
      const xAt = (index: number) => index * (100 / Math.max(values.length - 1, 1));
      const yAt = (value: number) => 52 - ((value - min) / span) * 44;
      const points = values.map((value, index) => `${xAt(index)},${yAt(value)}`).join(" ");
      const areaPoints = `0,56 ${points} 100,56`;
      const gradientId = `chart-fill-${node.id}`;
      const chartStyle = chartTypeOverride ?? stringProp(node, "chartType", presentation.charts.types[0] ?? "line");
      const barWidth = 100 / Math.max(values.length, 1) * 0.62;
      const total = Math.max(values.reduce((sum, value) => sum + Math.max(value, 0), 0), 1);
      let donutOffset = 0;
      const radialValue = Math.max(0, Math.min(100, values[0] ?? 0));
      return <figure {...selectable} data-chart-type={chartStyle} className={`${styles.generatedChart} ${toneClass(node)} ${selectedClass}`}>
        <figcaption>{stringProp(node, "label")}</figcaption>
        <svg viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
          <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--node-tone)" stopOpacity="0.32" /><stop offset="100%" stopColor="var(--node-tone)" stopOpacity="0" /></linearGradient></defs>
          <path className={styles.generatedChartGrid} d="M0 16H100M0 32H100M0 48H100" />
          {chartStyle === "area" && <polygon className={styles.generatedChartArea} points={areaPoints} fill={`url(#${gradientId})`} />}
          {chartStyle === "bar" && values.map((value, index) => <rect key={`${value}-${index}`} x={xAt(index) - barWidth / 2} y={yAt(value)} width={barWidth} height={56 - yAt(value)} rx="1.5" />)}
          {chartStyle === "donut" && <g transform="rotate(-90 50 30)">{values.map((value, index) => { const length = Math.max(value, 0) / total * 138.23; const offset = donutOffset; donutOffset += length; return <circle key={`${value}-${index}`} cx="50" cy="30" r="22" fill="none" stroke="var(--node-tone, var(--gen-accent))" strokeOpacity={Math.max(.3, 1 - index * .15)} strokeWidth="9" strokeDasharray={`${length} ${138.23 - length}`} strokeDashoffset={-offset} />; })}</g>}
          {chartStyle === "radial" && <g transform="rotate(-90 50 30)"><circle cx="50" cy="30" r="22" fill="none" stroke="var(--gen-border)" strokeWidth="8" /><circle cx="50" cy="30" r="22" fill="none" stroke="var(--node-tone, var(--gen-accent))" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${radialValue * 1.3823} 138.23`} /></g>}
          {!["bar", "donut", "radial"].includes(chartStyle) && <polyline points={points} />}
          {chartStyle !== "bar" && chartStyle !== "donut" && values.map((value, index) => <circle key={`${value}-${index}`} cx={xAt(index)} cy={yAt(value)} r={chartStyle === "radial" ? "2.4" : "1.8"} />)}
        </svg>
      </figure>;
    }
    case "SegmentedControl": {
      const items = stringList(node, "items");
      return <div {...selectable} className={`${styles.generatedSegments} ${selectedClass}`}>{items.map((item, index) => <span className={index === 0 ? styles.generatedSegmentActive : ""} key={item}>{item}</span>)}</div>;
    }
    case "Calendar": {
      const days = stringList(node, "days").slice(0, 7);
      const events = stringList(node, "events").slice(0, 6);
      return <section {...selectable} className={`${styles.experienceCalendar} ${selectedClass}`}><header><strong>{stringProp(node, "label")}</strong><span>Hafta</span></header><div className={styles.experienceCalendarDays}>{days.map((day, index) => <span className={index === 2 ? styles.experienceCalendarActive : ""} key={day}>{day.split(" ")[0]}<b>{day.split(" ")[1] ?? index + 1}</b></span>)}</div><div className={styles.experienceCalendarEvents}>{events.map((event, index) => <div key={`${event}-${index}`}><time>{`${9 + index * 2}:00`}</time><i /><span>{event}</span></div>)}</div></section>;
    }
    case "Timeline":
      return <section {...selectable} className={`${styles.experienceTimeline} ${selectedClass}`}><h3>{stringProp(node, "label")}</h3>{stringList(node, "events").map((event, index) => <div key={`${event}-${index}`}><b>{String(index + 1).padStart(2, "0")}</b><i /><span>{event}</span></div>)}</section>;
    case "Gallery":
      return <section {...selectable} className={`${styles.experienceGallery} ${selectedClass}`}><h3>{stringProp(node, "label")}</h3><div>{stringList(node, "items").map((item, index) => <figure key={`${item}-${index}`} className={index === 0 ? styles.experienceGalleryLead : ""}><i /><figcaption>{item}</figcaption></figure>)}</div></section>;
    case "KanbanBoard": {
      const columns = stringList(node, "columns").slice(0, 3); const cards = stringList(node, "cards");
      return <section {...selectable} className={`${styles.experienceBoard} ${selectedClass}`}><h3>{stringProp(node, "label")}</h3><div>{columns.map((column, index) => <article key={column}><strong>{column}</strong>{cards.filter((_, cardIndex) => cardIndex % Math.max(columns.length, 1) === index).map((card) => <span key={card}>{card}</span>)}</article>)}</div></section>;
    }
    case "MapView":
      return <figure {...selectable} className={`${styles.experienceMap} ${selectedClass}`}><figcaption>{stringProp(node, "label")}</figcaption><div>{stringList(node, "markers").map((marker, index) => <span style={{ left: `${18 + (index * 23) % 68}%`, top: `${20 + (index * 31) % 58}%` }} key={marker}><i />{marker}</span>)}</div></figure>;
    case "FloatingActionButton":
      return <button {...selectable} type="button" className={`${styles.generatedFab} ${selectedClass}`} aria-label={node.a11y?.label ?? "Aksiyon"}><ActionGlyph name={stringProp(node, "icon", "plus")} /></button>;
    case "CareSummary": {
      const progress = Math.max(0, Math.min(100, numberProp(node, "progress")));
      const status = stringProp(node, "status", "normal");
      return <section {...selectable} className={`${styles.healthCareSummary} ${healthStateClass(status)} ${selectedClass}`}><div><small>BUGÜNKÜ BAKIM</small><strong>{stringProp(node, "title")}</strong><p>{stringProp(node, "subtitle")}</p></div><span>{progress}%</span><div className={styles.healthCareProgress}><i style={{ width: `${progress}%` }} /></div></section>;
    }
    case "MedicationTimeline": {
      const items = stringList(node, "items").slice(0, 5);
      return <section {...selectable} className={`${styles.healthTimeline} ${selectedClass}`}><h3>{stringProp(node, "label")}</h3>{items.map((item, index) => <div key={`${item}-${index}`}><i /><span>{item}</span></div>)}</section>;
    }
    case "MedicationDoseRow": {
      const status = stringProp(node, "status", "scheduled");
      return <article {...selectable} className={`${styles.healthDoseRow} ${healthStateClass(status)} ${selectedClass}`}><i aria-hidden="true">{status === "taken" ? "✓" : status === "overdue" ? "!" : "•"}</i><div><strong>{stringProp(node, "name")}</strong><span>{stringProp(node, "dose")} · {stringProp(node, "instruction")}</span></div><time>{stringProp(node, "time")}</time><b>{status === "taken" ? "Alındı" : status === "overdue" ? "Gecikti" : status === "due" ? "Şimdi" : "Planlı"}</b></article>;
    }
    case "HealthMetric": {
      const status = stringProp(node, "status", "normal");
      return <article {...selectable} className={`${styles.healthMetric} ${healthStateClass(status)} ${selectedClass}`}><small>{stringProp(node, "label")}</small><strong>{stringProp(node, "value")} <em>{stringProp(node, "unit")}</em></strong><span>{status === "critical" ? "▲" : status === "attention" ? "●" : "✓"} {stringProp(node, "caption")}</span></article>;
    }
    case "UnitInput":
      return <label {...selectable} className={`${styles.healthUnitInput} ${selectedClass}`}><span>{stringProp(node, "label")}</span><div><strong>{stringProp(node, "value")}</strong><b>{stringProp(node, "unit")}</b></div>{stringProp(node, "hint") && <small>{stringProp(node, "hint")}</small>}</label>;
    case "RangeChart": {
      const values = numberList(node, "values").slice(0, 10);
      const minimum = numberProp(node, "minimum");
      const maximum = Math.max(numberProp(node, "maximum", 100), minimum + 1);
      const points = values.map((value, index) => `${index * (100 / Math.max(values.length - 1, 1))},${58 - ((value - minimum) / (maximum - minimum)) * 48}`).join(" ");
      const targetMinimum = numberProp(node, "targetMinimum", minimum);
      const targetMaximum = numberProp(node, "targetMaximum", maximum);
      const bandTop = 58 - ((targetMaximum - minimum) / (maximum - minimum)) * 48;
      const bandHeight = ((targetMaximum - targetMinimum) / (maximum - minimum)) * 48;
      return <figure {...selectable} className={`${styles.healthRangeChart} ${selectedClass}`}><figcaption><strong>{stringProp(node, "label")}</strong><span>{minimum}–{maximum} {stringProp(node, "unit")}</span></figcaption><svg viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true"><rect x="0" y={bandTop} width="100" height={bandHeight} /><path d="M0 16H100M0 32H100M0 48H100" /><polyline points={points} />{values.map((value, index) => <circle key={`${value}-${index}`} cx={index * (100 / Math.max(values.length - 1, 1))} cy={58 - ((value - minimum) / (maximum - minimum)) * 48} r="1.8" />)}</svg><small>Hedef aralık {targetMinimum}–{targetMaximum} {stringProp(node, "unit")}</small></figure>;
    }
    case "TargetRange": {
      const value = numberProp(node, "value"); const minimum = numberProp(node, "minimum"); const maximum = numberProp(node, "maximum", 100);
      const position = Math.max(0, Math.min(100, ((value - minimum) / Math.max(maximum - minimum, 1)) * 100));
      return <div {...selectable} className={`${styles.healthTargetRange} ${selectedClass}`}><span>{stringProp(node, "label")}</span><strong>{value} {stringProp(node, "unit")}</strong><div><i style={{ left: `${position}%` }} /></div><small>Hedef {minimum}–{maximum} {stringProp(node, "unit")}</small></div>;
    }
    case "StatusAlert": {
      const severity = stringProp(node, "severity", "normal");
      return <aside {...selectable} className={`${styles.healthAlert} ${healthStateClass(severity)} ${selectedClass}`}><i>{severity === "critical" ? "!" : severity === "attention" ? "●" : "✓"}</i><div><strong>{stringProp(node, "title")}</strong><p>{stringProp(node, "message")}</p></div></aside>;
    }
    case "SafetyNotice":
      return <aside {...selectable} className={`${styles.healthSafetyNotice} ${selectedClass}`}><i>i</i><div><strong>{stringProp(node, "title")}</strong><p>{stringProp(node, "message")}</p></div></aside>;
    case "SuccessFeedback":
      return <section {...selectable} className={`${styles.healthSuccess} ${selectedClass}`}><i>✓</i><strong>{stringProp(node, "title")}</strong><p>{stringProp(node, "message")}</p></section>;
    case "EditorialHero":
      return <article {...selectable} className={`${styles.editorialHero} ${selectedClass}`}><span>{stringProp(node, "kicker")}</span><h2>{stringProp(node, "headline")}</h2><p>{stringProp(node, "dek")}</p><footer>{stringProp(node, "issue")} · {stringProp(node, "date")}</footer></article>;
    case "FeatureStory":
      return <article {...selectable} className={`${styles.editorialFeature} ${selectedClass}`}><div aria-hidden="true"><span>{stringProp(node, "category")}</span></div><small>{stringProp(node, "category")}</small><h3>{stringProp(node, "title")}</h3><p>{stringProp(node, "summary")}</p></article>;
    case "StoryCard":
      return <article {...selectable} className={`${styles.editorialStoryCard} ${selectedClass}`}><span>{stringProp(node, "index")}</span><div><small>{stringProp(node, "category")}</small><strong>{stringProp(node, "title")}</strong><p>{stringProp(node, "summary")}</p></div></article>;
    case "Byline":
      return <div {...selectable} className={`${styles.editorialByline} ${selectedClass}`}><i>{stringProp(node, "author", "Y").slice(0, 1)}</i><span><strong>{stringProp(node, "author")}</strong><small>{stringProp(node, "role")}</small></span></div>;
    case "MetadataStrip":
      return <div {...selectable} className={`${styles.editorialMetadata} ${selectedClass}`}><span>{stringProp(node, "date")}</span><span>{stringProp(node, "readingTime")}</span><span>{stringProp(node, "edition")}</span></div>;
    case "PullQuote":
      return <blockquote {...selectable} className={`${styles.editorialQuote} ${selectedClass}`}><p>“{stringProp(node, "quote")}”</p><cite>{stringProp(node, "attribution")}</cite></blockquote>;
    case "SectionIndex":
      return <nav {...selectable} className={`${styles.editorialSections} ${selectedClass}`} aria-label={node.a11y?.label}>{stringList(node, "items").map((item, index) => <span key={item}><b>{String(index + 1).padStart(2, "0")}</b>{item}</span>)}</nav>;
    case "ArchiveEntry":
      return <article {...selectable} className={`${styles.editorialArchive} ${selectedClass}`}><b>{stringProp(node, "number")}</b><div><small>{stringProp(node, "date")}</small><strong>{stringProp(node, "title")}</strong><span>{stringProp(node, "theme")}</span></div></article>;
    case "CommerceHero":
      return <article {...selectable} className={`${styles.commerceHero} ${selectedClass}`}><small>{stringProp(node,"eyebrow")}</small><h2>{stringProp(node,"title")}</h2><p>{stringProp(node,"subtitle")}</p><b>{stringProp(node,"cta")}</b></article>;
    case "ProductCard":
      return <article {...selectable} className={`${styles.commerceProduct} ${selectedClass}`}><div aria-hidden="true"><span>{stringProp(node,"badge")}</span></div><small>{stringProp(node,"maker")}</small><strong>{stringProp(node,"name")}</strong><p>{stringProp(node,"description")}</p><footer><b>{stringProp(node,"price")}</b><span>{stringProp(node,"status")}</span></footer></article>;
    case "PriceBlock":
      return <div {...selectable} className={`${styles.commercePrice} ${selectedClass}`}><span>{stringProp(node,"label")}</span><strong>{stringProp(node,"price")}</strong>{stringProp(node,"compareAt")&&<del>{stringProp(node,"compareAt")}</del>}<small>{stringProp(node,"taxNote")}</small></div>;
    case "ProductGallery":
      return <figure {...selectable} className={`${styles.commerceGallery} ${selectedClass}`}><div><span>{stringProp(node,"alt")}</span></div><figcaption>{numberProp(node,"current",1)} / {numberProp(node,"total",3)}</figcaption></figure>;
    case "VariantSelector":
      return <fieldset {...selectable} className={`${styles.commerceVariants} ${selectedClass}`}><legend>{stringProp(node,"label")}</legend>{stringList(node,"options").map((item,index)=><span className={index===0?styles.commerceVariantActive:""} key={item}>{item}</span>)}</fieldset>;
    case "CartLine":
      return <article {...selectable} className={`${styles.commerceCartLine} ${selectedClass}`}><i aria-hidden="true"/><div><strong>{stringProp(node,"name")}</strong><span>{stringProp(node,"variant")}</span><small>Adet {numberProp(node,"quantity",1)}</small></div><b>{stringProp(node,"price")}</b></article>;
    case "OrderSummary":
      return <section {...selectable} className={`${styles.commerceSummary} ${selectedClass}`}><h3>{stringProp(node,"title")}</h3><span>Ara toplam <b>{stringProp(node,"subtotal")}</b></span><span>Kargo <b>{stringProp(node,"shipping")}</b></span><strong>Toplam <b>{stringProp(node,"total")}</b></strong></section>;
    case "DeliveryPromise":
      return <aside {...selectable} className={`${styles.commerceDelivery} ${selectedClass}`}><i>↗</i><div><strong>{stringProp(node,"title")}</strong><p>{stringProp(node,"detail")}</p></div></aside>;
    case "LearningHero":
      return <section {...selectable} className={`${styles.learningHero} ${selectedClass}`}><small>{stringProp(node,"eyebrow")}</small><h2>{stringProp(node,"title")}</h2><p>{stringProp(node,"mission")}</p><b>{stringProp(node,"reward")}</b></section>;
    case "XpProgress":{const value=Math.max(0,Math.min(100,numberProp(node,"value")));return <div {...selectable} className={`${styles.learningXp} ${selectedClass}`}><header><strong>{stringProp(node,"label")}</strong><span>{stringProp(node,"current")} / {stringProp(node,"target")} XP</span></header><div><i style={{width:`${value}%`}}/></div><small>{stringProp(node,"nextReward")}</small></div>}
    case "StreakBadge":
      return <div {...selectable} className={`${styles.learningStreak} ${selectedClass}`}><i>⚡</i><strong>{numberProp(node,"days")} gün</strong><span>{stringProp(node,"message")}</span></div>;
    case "LessonCard":
      return <article {...selectable} className={`${styles.learningLesson} ${selectedClass}`}><span>{stringProp(node,"level")}</span><div><small>{stringProp(node,"topic")}</small><strong>{stringProp(node,"title")}</strong><p>{stringProp(node,"duration")} · {stringProp(node,"status")}</p></div><b>→</b></article>;
    case "RoadmapStep":
      return <article {...selectable} className={`${styles.learningRoadmap} ${stringProp(node,"state")==="locked"?styles.learningLocked:""} ${selectedClass}`}><i>{stringProp(node,"state")==="completed"?"✓":stringProp(node,"order")}</i><div><strong>{stringProp(node,"title")}</strong><span>{stringProp(node,"description")}</span></div><b>{stringProp(node,"state")}</b></article>;
    case "QuizChoice":
      return <button {...selectable} type="button" className={`${styles.learningChoice} ${stringProp(node,"state")==="selected"?styles.learningChoiceSelected:""} ${selectedClass}`}><b>{stringProp(node,"key")}</b><span>{stringProp(node,"label")}</span></button>;
    case "AnswerFeedback":
      return <aside {...selectable} className={`${styles.learningFeedback} ${stringProp(node,"result")==="correct"?styles.learningCorrect:styles.learningIncorrect} ${selectedClass}`}><i>{stringProp(node,"result")==="correct"?"✓":"!"}</i><div><strong>{stringProp(node,"title")}</strong><p>{stringProp(node,"explanation")}</p></div></aside>;
    case "AchievementBadge":
      return <article {...selectable} className={`${styles.learningAchievement} ${selectedClass}`}><i>{stringProp(node,"icon","★")}</i><strong>{stringProp(node,"title")}</strong><span>{stringProp(node,"description")}</span><small>{stringProp(node,"earnedAt")}</small></article>;
    case "CommandSummary":
      return <section {...selectable} className={`${styles.precisionCommand} ${selectedClass}`}><header><small>{stringProp(node,"eyebrow")}</small><b>{stringProp(node,"status")}</b></header><strong>{stringProp(node,"value")}</strong><h2>{stringProp(node,"title")}</h2><p>{stringProp(node,"detail")}</p></section>;
    case "SignalChart":{const values=numberList(node,"values").slice(0,10),max=Math.max(...values,1),points=values.map((v,i)=>`${i*(100/Math.max(values.length-1,1))},${58-(v/max)*48}`).join(" ");return <figure {...selectable} className={`${styles.precisionSignal} ${selectedClass}`}><figcaption><strong>{stringProp(node,"label")}</strong><span>{stringProp(node,"window")} · {stringProp(node,"unit")}</span></figcaption><svg viewBox="0 0 100 60" preserveAspectRatio="none"><path d="M0 15H100M0 30H100M0 45H100"/><polyline points={points}/></svg><small>{stringProp(node,"annotation")}</small></figure>}
    case "RiskIndicator":
      return <aside {...selectable} className={`${styles.precisionRisk} ${styles[`precisionRisk${stringProp(node,"severity","low")}`]??""} ${selectedClass}`}><i>{stringProp(node,"severity")==="critical"?"!":"◆"}</i><div><small>{stringProp(node,"label")}</small><strong>{stringProp(node,"value")}</strong><p>{stringProp(node,"explanation")}</p></div></aside>;
    case "OperationRow":
      return <article {...selectable} className={`${styles.precisionOperation} ${selectedClass}`}><i/><div><strong>{stringProp(node,"name")}</strong><span>{stringProp(node,"owner")} · {stringProp(node,"updatedAt")}</span></div><b>{stringProp(node,"status")}</b><small>{stringProp(node,"metric")}</small></article>;
    case "IncidentTimeline":
      return <section {...selectable} className={`${styles.precisionTimeline} ${selectedClass}`}><h3>{stringProp(node,"label")}</h3>{stringList(node,"events").map((event,index)=><div key={`${event}-${index}`}><time>{String(index+1).padStart(2,"0")}</time><i/><span>{event}</span></div>)}</section>;
    case "DataMatrix":
      return <section {...selectable} className={`${styles.precisionMatrix} ${selectedClass}`}><header>{stringList(node,"columns").map(item=><b key={item}>{item}</b>)}</header>{stringList(node,"rows").map((item,index)=><div key={`${item}-${index}`}><span>{item}</span><b>{index%2===0?"NOMINAL":"İZLE"}</b></div>)}</section>;
    case "ControlToggle":
      return <article {...selectable} className={`${styles.precisionControl} ${selectedClass}`}><div><strong>{stringProp(node,"label")}</strong><p>{stringProp(node,"description")}</p></div><b>{stringProp(node,"state")}</b><small>{stringProp(node,"guard")}</small></article>;
    case "AuditEntry":
      return <article {...selectable} className={`${styles.precisionAudit} ${selectedClass}`}><time>{stringProp(node,"time")}</time><div><strong>{stringProp(node,"actor")}</strong><span>{stringProp(node,"action")}</span><small>{stringProp(node,"target")}</small></div></article>;
    case "TabBar":
    case "BottomNavigation": {
      const items = stringList(node, "items");
      const activeIndex = Math.max(0, items.findIndex((item) => item === activeNavItem));
      return <nav {...selectable} data-fixed-navigation="true" data-navigation-mode={presentation.navigation.active} data-navigation-geometry={presentation.navigation.geometry} className={`${styles.generatedNavigation} ${selectedClass}`} aria-label={node.a11y?.label ?? "Alt gezinme"}>{items.map((item, index) => <button type="button" key={item} className={index === activeIndex ? styles.generatedNavigationActive : ""} aria-current={index === activeIndex ? "page" : undefined}><NavigationIcon index={index} label={item} /><span>{item}</span></button>)}</nav>;
    }
    case "Checkbox":
    case "Switch":
      return <label {...selectable} className={`${styles.generatedToggle} ${selectedClass}`}><i aria-hidden="true" />{stringProp(node, "label")}</label>;
    case "Modal":
      return <section {...selectable} data-modal-style={presentation.behavior.modal} className={`${styles.generatedModal} ${selectedClass}`}>{childNodes}</section>;
  }
}

export function PhoneScreen({ screen, compiled, selectedNodeId, active, onSelect }: { screen: Screen; compiled: CompiledVisualScreen; selectedNodeId: string; active: boolean; onSelect: (id: string) => void }) {
  const presentation = compiled.presentation;
  const theme = stringProp(screen.root, "theme", "ocean");
  const themeClass = styles[`generatedTheme${theme[0]?.toUpperCase() ?? ""}${theme.slice(1)}`] ?? "";
  const presentationStyle = presentationVariables(presentation);
  const logicalViewportStyle = { ...presentationStyle, width: `${CANONICAL_VIEWPORT.width}px`, height: `${CANONICAL_VIEWPORT.height}px` };
  const { contentRoot, navigation, fab } = splitScreenNavigation(screen.root);
  const nodesById = new Map((contentRoot.children ?? []).map((node) => [node.id, node]));
  return <div className={`${styles.phone} ${themeClass} ${active ? styles.phoneActive : ""}`} data-floriven-screen-id={screen.id} data-screen-composition={compiled.intent.archetype} data-layout-pattern={compiled.layout.pattern} data-layout-viewport-width={compiled.layout.viewport.width} data-layout-viewport-height={compiled.layout.viewport.height} data-available-layouts={presentation.composition.availablePatterns.join(" ")} data-grouping-style={presentation.composition.grouping} data-chart-grid={presentation.charts.grid} data-chart-palette={presentation.charts.palette} data-chart-animation={presentation.charts.animation} data-control-family={presentation.controls.types[0]} data-data-presentation={presentation.behavior.dataPresentation} data-interaction-style={presentation.behavior.interaction} data-empty-state-style={presentation.behavior.emptyState} data-motion-card={presentation.motion.cardOpen} data-presentation-version={presentation.version} data-viewport-width={CANONICAL_VIEWPORT.width} data-viewport-height={CANONICAL_VIEWPORT.height} data-renderer-version="phone-screen-v4" style={logicalViewportStyle}>
    <div className={styles.phStatus}><span>9:41</span><span>●●● ◒</span></div>
    <main className={`${styles.phBody} ${fab ? styles.phBodyReserveFab : ""}`} data-scroll-viewport="true" data-layout-pattern={compiled.layout.pattern} tabIndex={0} aria-label={`${screen.name} kaydırılabilir içeriği`} onWheel={(event) => event.stopPropagation()}>
      {compiled.renderPlan.sections.map((section) => {
        const box = compiled.layout.boxes.find((candidate) => candidate.id === section.id);
        return <section key={section.id} data-render-section-role={section.role} data-render-family={section.resolvedFamily} data-render-emphasis={section.emphasis} data-render-order={section.order} data-render-span={section.span} data-layout-x={box?.x} data-layout-y={box?.y} data-layout-width={box?.width} data-layout-height={box?.height} style={{ display: "grid", gridTemplateColumns: `repeat(${sectionNodeColumns(section)}, minmax(0, 1fr))`, gap: `${presentation.spacing.unit * 2}px`, gridColumn: section.span >= 12 ? "1 / -1" : `span ${section.span}` }}>
          {section.nodes.map((plannedNode) => {
            const node = nodesById.get(plannedNode.id) ?? plannedNode;
            const chartTypeOverride = section.role === "dominant-chart" || section.role === "breakdown" || section.role === "trend-progress" ? section.resolvedFamily?.includes("radial") ? "radial" : section.resolvedFamily?.includes("bar") ? "bar" : section.resolvedFamily?.includes("line") ? "line" : undefined : undefined;
            return <DesignNodeRenderer key={node.id} node={node} selectedNodeId={active ? selectedNodeId : ""} onSelect={onSelect} activeNavItem={screen.name} presentation={presentation} {...(chartTypeOverride ? { chartTypeOverride } : {})} />;
          })}
        </section>;
      })}
    </main>
    {fab && <div className={`${styles.generatedFabSlot} ${navigation ? styles.generatedFabSlotAboveNav : ""}`}><DesignNodeRenderer node={fab} selectedNodeId={active ? selectedNodeId : ""} onSelect={onSelect} presentation={presentation} /></div>}
    {navigation && <DesignNodeRenderer node={navigation} selectedNodeId={active ? selectedNodeId : ""} onSelect={onSelect} activeNavItem={screen.name} presentation={presentation} />}
  </div>;
}
