export function createRuntimeCandidateHash(screens: unknown[]): string {
  const snapshot = screens.map((screen) => {
    const value = screen as { id?: string; name?: string; route?: string; root?: unknown };
    return { id: value.id, name: value.name, ...(value.route ? { route: value.route } : {}), root: snapshotNode(value.root) };
  });
  return fnv1a(JSON.stringify({ screens: snapshot, flows: [] }));
}
function snapshotNode(node: unknown): unknown {
  const value = (node ?? {}) as { id?: string; type?: string; props?: Record<string, unknown>; a11y?: { role?: unknown }; interactions?: Array<{ event?: unknown; action?: { type?: unknown; targetScreenId?: unknown } }>; children?: unknown[] };
  const props = value.props ?? {};
  const stringValue = (item: unknown) => typeof item === 'string' ? item : undefined;
  const semanticContent: Record<string, unknown> = {};
  for (const key of ['label', 'title', 'text', 'content', 'placeholder', 'value', 'field', 'name', 'intent', 'importance']) if (key in props) semanticContent[key] = props[key];
  return { id: value.id, type: value.type, role: stringValue(props.role) ?? stringValue(value.a11y?.role), patternId: stringValue(props.patternId) ?? stringValue(props.pattern), semanticContent, action: value.interactions?.map((item) => ({ event: item.event, type: item.action?.type, targetScreenId: item.action?.targetScreenId })), children: value.children?.map(snapshotNode) };
}
function fnv1a(value: string) { let hash = 2166136261; for (let index = 0; index < value.length; index += 1) { hash ^= value.charCodeAt(index); hash = Math.imul(hash, 16777619); } return (hash >>> 0).toString(16).padStart(8, '0'); }
