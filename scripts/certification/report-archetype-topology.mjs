import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const audit = resolve("audit-artifacts");
const remediation = resolve(audit, "remediation");
const modes = ["obsidian", "serene", "terracotta", "electric", "editorial", "auto", "deterministic"];
const archetypes = ["dashboard", "management-list", "detail", "form", "analytics", "settings"];
const geometry = async (base, mode, archetype) => JSON.parse(await readFile(resolve(base, mode, `${archetype}.json`), "utf8"));
const signature = (entry, archetype) => ({
  archetype,
  sectionRoleSequence: (entry.sections ?? []).map((section) => section.role),
  sectionCount: (entry.sections ?? []).length,
  layoutPattern: entry.layoutPattern,
  sectionSpans: (entry.sections ?? []).map((section) => section.span),
  dominantRegionCount: (entry.sections ?? []).filter((section) => section.emphasis === "primary").length,
  componentFamilyHistogram: Object.fromEntries((entry.sections ?? []).reduce((counts, section) => counts.set(section.family, (counts.get(section.family) ?? 0) + 1), new Map()).entries()),
  chartFamilies: (entry.sections ?? []).filter((section) => ["trend-progress", "dominant-chart", "breakdown"].includes(section.role)).map((section) => section.family),
  fieldCount: (entry.nodes ?? []).filter((node) => node.sectionRole === "field-group").length,
  navigationPolicy: (entry.nodes ?? []).some((node) => node.component === "nav") ? "persistent" : "focused",
  surfaceGroupCount: (entry.sections ?? []).length,
});
const collect = async (base) => Promise.all(modes.flatMap((mode) => archetypes.map(async (archetype) => {
  const entry = await geometry(base, mode, archetype);
  return { mode, ...signature(entry, archetype) };
})));
const before = await collect(resolve(remediation, "before-after", "geometry-before"));
const after = await collect(resolve(audit, "visual-championship", "geometry"));
const distance = JSON.parse(await readFile(resolve(remediation, "archetype-distance-after.json"), "utf8"));
const beforeDistance = JSON.parse(await readFile(resolve(remediation, "structural-distance-before.json"), "utf8"));
await mkdir(remediation, { recursive: true });
await writeFile(resolve(remediation, "archetype-topology-before.json"), `${JSON.stringify({ baselineRevision: "6e65c9f5872d3c594692c0ee147146d68e65130c", entries: before }, null, 2)}\n`);
await writeFile(resolve(remediation, "archetype-topology-after.json"), `${JSON.stringify({ entries: after }, null, 2)}\n`);
const beforeCount = beforeDistance.crossArchetype.filter((entry) => entry.verdict === "CROSS_ARCHETYPE_COLLISION").length;
const afterCount = distance.crossArchetype.filter((entry) => entry.verdict === "CROSS_ARCHETYPE_COLLISION").length;
const required = [["dashboard", "form"], ["dashboard", "settings"], ["dashboard", "analytics"], ["management-list", "form"], ["detail", "settings"]];
const rows = required.map(([left, right]) => { const pairs = distance.crossArchetype.filter((entry) => entry.left === left && entry.right === right); return `| ${left} vs ${right} | ${Math.min(...pairs.map((entry) => entry.distance)).toFixed(4)} | ${pairs.every((entry) => entry.verdict === "PASS") ? "PASS" : "FAIL"} |`; }).join("\n");
await writeFile(resolve(remediation, "archetype-topology-report.md"), `# Archetype topology remediation\n\nBaseline revision: \`6e65c9f5872d3c594692c0ee147146d68e65130c\`\n\n| Metric | Before | After | Gate |\n|---|---:|---:|---:|\n| Cross-archetype collisions | ${beforeCount}/105 | ${afterCount}/105 | <= 15 |\n\nThe production path now emits explicit semantic roles, spans, emphasis, resolved families and layout patterns. PhoneScreen uses those spans as CSS grid geometry; LayoutEngine consumes the same RenderPlan topology.\n\n## Required pair evidence\n\n| Pair | Minimum distance | Result |\n|---|---:|---|\n${rows}\n\n## Scope\n\nNo preset styling or preset-specific grammar remediation was performed. Cross-preset evidence remains out of scope for this sprint.\n`);
console.log(JSON.stringify({ before: beforeCount, after: afterCount, requiredPairs: required.length }));
