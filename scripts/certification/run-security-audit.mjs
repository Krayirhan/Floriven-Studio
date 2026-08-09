import { readFile } from "node:fs/promises";

const targets = [
  "supabase/functions/generate/index.ts",
  "supabase/functions/record-generation-runtime-quality/index.ts",
];
const source = (await Promise.all(targets.map((target) => readFile(new URL(`../../${target}`, import.meta.url), "utf8")))).join("\n");
const checks = [
  ["runtime evidence required", source.includes("RUNTIME_EVIDENCE_REQUIRED")],
  ["final eligibility is runtime-derived", source.includes("report.finalEligible")],
  ["client final flag is not trusted", !/body\.(finalEligible|final_eligible)|finalEligible\s*:\s*body/.test(source)],
  ["quality failure blocks completion", source.includes("if (!qualityReport.passed)")],
];
const failed = checks.filter(([, passed]) => !passed);
const result = { checks: Object.fromEntries(checks), passed: failed.length === 0, failed: failed.map(([name]) => name) };
console.log(JSON.stringify(result, null, 2));
if (failed.length) process.exitCode = 1;
