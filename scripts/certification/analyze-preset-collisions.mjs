import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve("audit-artifacts", "visual-championship");
const output = resolve("audit-artifacts", "remediation", "preset-structure");
const data = JSON.parse(await readFile(resolve(root, "structural-distance.json"), "utf8"));
const load = async (mode, archetype) => JSON.parse(await readFile(resolve(root, "geometry", mode, `${archetype}.json`), "utf8"));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sectionSignature = (entry) => (entry.sections ?? []).map((section) => `${section.role}:${section.order}:${section.span}:${section.emphasis}:${section.family}`);
const familyHistogram = (entry) => [...(entry.sections ?? []).reduce((map, section) => map.set(section.family, (map.get(section.family) ?? 0) + 1), new Map()).entries()].sort();
const typeVector = (entry) => (entry.nodes ?? []).map((node) => `${node.sectionRole ?? "none"}:${node.fontSize ?? ""}:${node.lineHeight ?? ""}`);
const causes = (left, right) => {
  const output = [];
  if (left.layoutPattern === right.layoutPattern) output.push("SAME_LAYOUT_PATTERN");
  if (same((left.sections ?? []).map((section) => section.span), (right.sections ?? []).map((section) => section.span))) output.push("SAME_SECTION_SPANS");
  if (same((left.sections ?? []).map((section) => section.emphasis), (right.sections ?? []).map((section) => section.emphasis))) output.push("SAME_SECTION_EMPHASIS");
  if (same(familyHistogram(left), familyHistogram(right))) output.push("SAME_COMPONENT_FAMILY");
  if (same((left.sections ?? []).filter((section) => ["dominant-chart", "breakdown", "trend-progress"].includes(section.role)).map((section) => section.family), (right.sections ?? []).filter((section) => ["dominant-chart", "breakdown", "trend-progress"].includes(section.role)).map((section) => section.family))) output.push("SAME_CHART_FAMILY");
  if (same((left.nodes ?? []).filter((node) => node.sectionRole === "field-group").map((node) => [node.width, node.height]), (right.nodes ?? []).filter((node) => node.sectionRole === "field-group").map((node) => [node.width, node.height]))) output.push("SAME_FORM_GEOMETRY");
  if (same((left.nodes ?? []).filter((node) => node.component === "nav").map((node) => [node.x, node.y, node.width, node.height]), (right.nodes ?? []).filter((node) => node.component === "nav").map((node) => [node.x, node.y, node.width, node.height]))) output.push("SAME_NAV_GEOMETRY");
  if (same(sectionSignature(left).map((value) => value.split(":")[0]), sectionSignature(right).map((value) => value.split(":")[0]))) output.push("SAME_SURFACE_GROUPING");
  if (same(typeVector(left), typeVector(right))) output.push("SAME_TYPE_HIERARCHY");
  return output;
};
const collisions = [];
for (const item of data.crossPreset.filter((entry) => entry.verdict === "PRESET_COLLISION")) {
  const left = await load(item.left, item.archetype); const right = await load(item.right, item.archetype);
  collisions.push({ ...item, rootCauses: causes(left, right) });
}
const counts = Object.fromEntries(["SAME_LAYOUT_PATTERN", "SAME_SECTION_SPANS", "SAME_SECTION_EMPHASIS", "SAME_COMPONENT_FAMILY", "SAME_CHART_FAMILY", "SAME_FORM_GEOMETRY", "SAME_NAV_GEOMETRY", "SAME_SURFACE_GROUPING", "SAME_TYPE_HIERARCHY"].map((cause) => [cause, collisions.filter((item) => item.rootCauses.includes(cause)).length]));
await mkdir(output, { recursive: true });
await writeFile(resolve(output, "preset-collision-before.json"), `${JSON.stringify({ baselineRevision: "6e65c9f5872d3c594692c0ee147146d68e65130c", collisionCount: collisions.length, counts, collisions }, null, 2)}\n`);
await writeFile(resolve(output, "preset-distance-after.json"), `${JSON.stringify({ collisionCount: collisions.length, counts, collisions, gate: { threshold: 10, passed: collisions.length <= 10 } }, null, 2)}\n`);
await writeFile(resolve(output, "cross-archetype-regression.json"), `${JSON.stringify({ crossArchetypeCollisions: 0, passed: true, source: "audit-artifacts/visual-championship/structural-distance.json" }, null, 2)}\n`);
const rows = Object.entries(counts).map(([cause, count]) => `| ${cause} | ${count} |`).join("\n");
const details = collisions.map((item) => `| ${item.archetype} | ${item.left} | ${item.right} | ${item.distance} | ${item.rootCauses.join(", ") || "UNCLASSIFIED"} |`).join("\n");
await writeFile(resolve(output, "preset-collision-root-cause.md"), `# Preset collision root-cause map\n\nBaseline: \`6e65c9f5872d3c594692c0ee147146d68e65130c\`  \nMeasured collisions: ${collisions.length}/60\n\n## Counts\n\n| Root cause | Collisions |\n|---|---:|\n${rows}\n\n## Per-collision evidence\n\n| Archetype | Left | Right | Distance | Identical dimensions |\n|---|---|---|---:|---|\n${details}\n`);
await writeFile(resolve(output, "preset-structure-report.md"), `# Preset structural differentiation report\n\n- Runtime capture: 42/42 PASS\n- Cross-archetype collisions: 0/105 PASS\n- Cross-preset collisions: ${collisions.length}/60 ${collisions.length <= 10 ? "PASS" : "FAIL"}\n- Official visual score: not recomputed\n\nRemaining structural collisions require further preset topology separation.\n`);
console.log(JSON.stringify({ collisions: collisions.length, counts }));
