import { readFile } from "node:fs/promises";

const catalogPath = new URL("../docs/benchmarks/catalog.json", import.meta.url);
const catalog = JSON.parse(await readFile(catalogPath, "utf8"));

if (!Array.isArray(catalog.requiredScreenTypes) || !Array.isArray(catalog.styleVariants) || !Array.isArray(catalog.benchmarks)) {
  throw new Error("Benchmark catalog must define requiredScreenTypes, styleVariants, and benchmarks arrays.");
}
if (catalog.benchmarks.length < 6) throw new Error("Benchmark catalog must contain at least six domains.");
if (catalog.styleVariants.length < 6) throw new Error("Benchmark catalog must contain six style variants.");

for (const benchmark of catalog.benchmarks) {
  if (!benchmark || typeof benchmark.id !== "string" || !/^[a-z][a-z0-9-]*$/.test(benchmark.id)) {
    throw new Error("Every benchmark must have a URL-safe id.");
  }
  if (typeof benchmark.brief !== "string" || benchmark.brief.trim().length < 20) {
    throw new Error(`Benchmark ${benchmark.id} must have a fixed, substantive brief.`);
  }
  if (!Array.isArray(benchmark.screenTypes)) throw new Error(`Benchmark ${benchmark.id} must define screenTypes.`);
  const missing = catalog.requiredScreenTypes.filter((screenType) => !benchmark.screenTypes.includes(screenType));
  if (missing.length) throw new Error(`Benchmark ${benchmark.id} is missing required screen types: ${missing.join(", ")}.`);
}

console.log(`Benchmark catalog valid: ${catalog.benchmarks.length} domains × ${catalog.styleVariants.length} style variants.`);
