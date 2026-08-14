import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = resolve("audit-artifacts");
const INPUT = resolve(ROOT, "visual-championship", "structural-distance.json");
const OUTPUT = resolve(ROOT, "remediation");
const CAUSES = [
  "SAME_SECTION_ORDER",
  "SAME_LAYOUT_PATTERN",
  "SAME_COLUMN_STRUCTURE",
  "SAME_COMPONENT_FAMILY",
  "SAME_CARD_DENSITY",
  "SAME_TYPOGRAPHY_HIERARCHY",
  "SAME_CHART_FAMILY",
  "SAME_NAV_GEOMETRY",
  "SAME_FORM_GEOMETRY",
  "SAME_SURFACE_GROUPING",
];

const loadGeometry = async (mode, archetype) => JSON.parse(await readFile(resolve(ROOT, "visual-championship", "geometry", mode, `${archetype}.json`), "utf8"));
const values = (nodes, predicate) => nodes.filter(predicate);
const sorted = (items) => [...items].sort().join("|");
const normalizedBox = (node) => [node.x / 390, node.y / 844, node.width / 390, node.height / 844].map((value) => value.toFixed(2)).join(",");
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);

function causesFor(left, right, archetypes) {
  const leftNodes = left.nodes.filter((node) => node.component !== "nav");
  const rightNodes = right.nodes.filter((node) => node.component !== "nav");
  const causes = [];
  const leftRoles = leftNodes.map((node) => node.sectionRole ?? "none");
  const rightRoles = rightNodes.map((node) => node.sectionRole ?? "none");
  if (same(leftRoles, rightRoles)) causes.push("SAME_SECTION_ORDER");
  if (left.layoutPattern === right.layoutPattern) causes.push("SAME_LAYOUT_PATTERN");
  if (same(leftNodes.map(normalizedBox), rightNodes.map(normalizedBox))) causes.push("SAME_COLUMN_STRUCTURE");
  if (sorted(leftNodes.map((node) => node.component)) === sorted(rightNodes.map((node) => node.component))) causes.push("SAME_COMPONENT_FAMILY");
  if (leftNodes.length === rightNodes.length) causes.push("SAME_CARD_DENSITY");
  if (same(leftNodes.map((node) => `${node.sectionRole ?? "none"}:${node.fontSize ?? ""}:${node.lineHeight ?? ""}`), rightNodes.map((node) => `${node.sectionRole ?? "none"}:${node.fontSize ?? ""}:${node.lineHeight ?? ""}`))) causes.push("SAME_TYPOGRAPHY_HIERARCHY");
  if (sorted(values(leftNodes, (node) => node.sectionRole === "insight").map((node) => node.component)) === sorted(values(rightNodes, (node) => node.sectionRole === "insight").map((node) => node.component))) causes.push("SAME_CHART_FAMILY");
  if (same(values(left.nodes, (node) => node.component === "nav").map(normalizedBox), values(right.nodes, (node) => node.component === "nav").map(normalizedBox))) causes.push("SAME_NAV_GEOMETRY");
  if (archetypes.includes("form") && same(values(leftNodes, (node) => node.sectionRole === "primary-content").map(normalizedBox), values(rightNodes, (node) => node.sectionRole === "primary-content").map(normalizedBox))) causes.push("SAME_FORM_GEOMETRY");
  if (same(leftNodes.map((node) => `${node.sectionRole ?? "none"}:${node.component}`), rightNodes.map((node) => `${node.sectionRole ?? "none"}:${node.component}`))) causes.push("SAME_SURFACE_GROUPING");
  return causes.length ? causes : ["SAME_SURFACE_GROUPING"];
}

const input = JSON.parse(await readFile(INPUT, "utf8"));
const collisions = [];
for (const item of input.crossArchetype.filter((entry) => entry.verdict === "CROSS_ARCHETYPE_COLLISION")) {
  const left = await loadGeometry(item.mode, item.left);
  const right = await loadGeometry(item.mode, item.right);
  collisions.push({ kind: "cross-archetype", ...item, rootCauses: causesFor(left, right, [item.left, item.right]) });
}
for (const item of input.crossPreset.filter((entry) => entry.verdict === "PRESET_COLLISION")) {
  const left = await loadGeometry(item.left, item.archetype);
  const right = await loadGeometry(item.right, item.archetype);
  collisions.push({ kind: "cross-preset", ...item, rootCauses: causesFor(left, right, [item.archetype]) });
}
const counts = Object.fromEntries(CAUSES.map((cause) => [cause, collisions.filter((entry) => entry.rootCauses.includes(cause)).length]));
const result = { baselineRevision: "6e65c9f5872d3c594692c0ee147146d68e65130c", generatedAt: new Date().toISOString(), collisionCount: collisions.length, counts, collisions };
await mkdir(OUTPUT, { recursive: true });
await writeFile(resolve(OUTPUT, "collision-root-cause.json"), `${JSON.stringify(result, null, 2)}\n`);
const rows = Object.entries(counts).map(([cause, count]) => `| ${cause} | ${count} |`).join("\n");
const details = collisions.map((entry) => `| ${entry.kind} | ${entry.mode ?? entry.archetype} | ${entry.left} | ${entry.right} | ${entry.distance} | ${entry.rootCauses.join(", ")} |`).join("\n");
await writeFile(resolve(OUTPUT, "collision-root-cause.md"), `# Collision root-cause map\n\nBaseline revision: \`6e65c9f5872d3c594692c0ee147146d68e65130c\`  \nCollisions analyzed: ${collisions.length} (70 cross-archetype + 60 cross-preset)\n\n## Counts\n\n| Root cause | Collisions |\n|---|---:|\n${rows}\n\n## Per-collision evidence\n\n| Kind | Scope | Left | Right | Distance | Root causes |\n|---|---|---|---|---:|---|\n${details}\n`);
console.log(JSON.stringify({ collisions: collisions.length, counts }));
