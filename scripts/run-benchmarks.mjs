import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const catalogPath = new URL("../docs/benchmarks/catalog.json", import.meta.url);
const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
const localEnv = Object.fromEntries((await readFile(new URL("../apps/web/.env.local", import.meta.url), "utf8")).split(/\r?\n/).flatMap((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  return match ? [[match[1], match[2].replace(/^"|"$/g, "")]] : [];
}));
const execute = process.argv.includes("--execute");
const outputArg = process.argv.find((argument) => argument.startsWith("--output="));
const outputPath = resolve(outputArg?.slice("--output=".length) ?? `docs/benchmarks/results/${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
const resumeArg = process.argv.find((argument) => argument.startsWith("--resume="));
const intervalArg = process.argv.find((argument) => argument.startsWith("--interval-ms="));
const intervalMs = Number(intervalArg?.slice("--interval-ms=".length) ?? 0);
const commitSha = process.env.GIT_COMMIT_SHA ?? "local-uncommitted";

const allRuns = catalog.benchmarks.flatMap((benchmark) => catalog.styleVariants.map((styleVariant) => ({
  benchmarkId: benchmark.id,
  brief: benchmark.brief,
  designMode: styleVariant === "auto" ? "auto" : "template",
  ...(styleVariant === "auto" ? {} : { stylePresetId: styleVariant }),
})));
const prior = resumeArg ? JSON.parse(await readFile(resolve(resumeArg.slice("--resume=".length)), "utf8")) : undefined;
const completedKeys = new Set((prior?.results ?? []).filter((result) => result.status === "completed").map(runKey));
const runs = allRuns.filter((run) => !completedKeys.has(runKey(run)));

if (!execute) {
  console.log(`Dry run: ${runs.length} generation requests planned (${catalog.benchmarks.length} domains × ${catalog.styleVariants.length} style variants).`);
  console.log("Use --execute only with BENCHMARK_GENERATE_URL, BENCHMARK_ANON_KEY, and BENCHMARK_PROJECT_ID configured.");
  process.exit(0);
}

const generateUrl = configuration("BENCHMARK_GENERATE_URL");
const anonKey = configuration("BENCHMARK_ANON_KEY");
const projectId = configuration("BENCHMARK_PROJECT_ID", "benchmark-v1-baseline-2026-08-09");
const results = [...(prior?.results ?? []).filter((result) => result.status === "completed")];

for (const [index, run] of runs.entries()) {
  const idempotencyKey = `benchmark-${run.benchmarkId}-${run.designMode}-${run.stylePresetId ?? "auto"}-${crypto.randomUUID()}`;
  const jobToken = `${crypto.randomUUID()}${crypto.randomUUID()}`;
  try {
    const response = await fetch(generateUrl, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
        "X-Job-Token": jobToken,
      },
      body: JSON.stringify({
        projectId,
        brief: run.brief,
        platform: "ios",
        designMode: run.designMode,
        ...(run.stylePresetId ? { stylePresetId: run.stylePresetId } : {}),
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(String(payload.error ?? `HTTP ${response.status}`));
    results.push({ ...run, status: payload.status, qualityReport: payload.qualityReport ?? null, generationId: payload.id ?? null });
    console.log(`[${index + 1}/${runs.length}] ${run.benchmarkId}/${run.stylePresetId ?? "auto"}: ${payload.status}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    results.push({ ...run, status: "failed", qualityReport: null, generationId: null, error: message });
    console.log(`[${index + 1}/${runs.length}] ${run.benchmarkId}/${run.stylePresetId ?? "auto"}: failed`);
  }
  await writeCheckpoint();
  if (intervalMs > 0 && index < runs.length - 1) await new Promise((resolve) => setTimeout(resolve, intervalMs));
}

await writeCheckpoint();
const failedCount = results.filter((result) => result.status !== "completed").length;
console.log(`Benchmark results written to ${outputPath} (${results.length - failedCount} completed, ${failedCount} failed).`);

async function writeCheckpoint() {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify({
  catalogVersion: catalog.version,
  sourceRevision: commitSha,
  generatedAt: new Date().toISOString(),
  results,
}, null, 2)}\n`, "utf8");
}

function configuration(name, fallback) {
  const aliases = { BENCHMARK_GENERATE_URL: "VITE_SUPABASE_URL", BENCHMARK_ANON_KEY: "VITE_SUPABASE_ANON_KEY" };
  const raw = process.env[name] ?? localEnv[aliases[name]];
  const value = name === "BENCHMARK_GENERATE_URL" && raw ? `${raw.replace(/\/$/, "")}/functions/v1/generate` : raw ?? fallback;
  if (!value) throw new Error(`${name} must be set when using --execute.`);
  return value;
}

function runKey(run) {
  return `${run.benchmarkId}/${run.stylePresetId ?? "auto"}`;
}
