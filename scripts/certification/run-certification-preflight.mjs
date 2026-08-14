import { mkdir, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const exec = promisify(execFile);
const root = new URL("../../", import.meta.url);
const cwd = fileURLToPath(root);
const evidenceRoot = new URL("../../docs/certification/evidence/", import.meta.url);
const packageManager = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const commands = [
  ["build", packageManager, ["build"]],
  ["type-check", packageManager, ["type-check"]],
  ["lint", packageManager, ["lint"]],
  ["unit-tests", packageManager, ["test"]],
  ["benchmark-validate", packageManager, ["benchmarks:validate"]],
  ["security-audit", packageManager, ["certification:security"]],
  ["runtime-hierarchy-contract", packageManager, ["contracts:runtime-hierarchy"]],
  ["runtime-evidence-integrity", packageManager, ["--filter", "@floriven/web", "exec", "vitest", "--root", "../..", "run", "supabase/functions/record-generation-runtime-quality"]],
  ["runtime-replay-contract", packageManager, ["--filter", "@floriven/design-spec", "exec", "vitest", "run", "src/runtime-live-preflight.test.ts", "src/runtime-replay.test.ts", "src/runtime-replay-cli.test.ts", "src/runtime-release-evidence.test.ts"]],
  ["e2e", packageManager, ["test:e2e"]],
  ["generation-architecture", packageManager, ["test:generation-architecture"]],
];

await Promise.all(["commands", "unit", "integration", "runtime", "benchmark", "screenshots"].map((name) => mkdir(new URL(`${name}/`, evidenceRoot), { recursive: true })));

const results = [];
for (const [name, executable, args] of commands) {
  const startedAt = new Date().toISOString();
  try {
    const command = process.platform === "win32" ? (process.env.ComSpec ?? "cmd.exe") : executable;
    const commandArgs = process.platform === "win32" ? ["/d", "/s", "/c", [executable, ...args].join(" ")] : args;
    const result = await exec(command, commandArgs, { cwd, windowsHide: true, maxBuffer: 20 * 1024 * 1024 });
    const output = `${result.stdout}${result.stderr ? `\n${result.stderr}` : ""}`;
    await writeFile(new URL(`commands/${name}.log`, evidenceRoot), output, "utf8");
    results.push({ name, status: "PASS", startedAt });
  } catch (error) {
    const output = `${error.stdout ?? ""}${error.stderr ? `\n${error.stderr}` : `\n${error.message}`}`;
    await writeFile(new URL(`commands/${name}.log`, evidenceRoot), output, "utf8");
    results.push({ name, status: "FAIL", startedAt });
  }
}

const git = process.platform === "win32" ? (process.env.GIT_PATH ?? "C:\\Program Files\\Git\\cmd\\git.exe") : "git";
let revision = "NOT_VERIFIED";
let dirty = true;
try {
  const revisionResult = await exec(git, ["rev-parse", "HEAD"], { cwd, windowsHide: true });
  const statusResult = await exec(git, ["status", "--short"], { cwd, windowsHide: true });
  revision = revisionResult.stdout.trim();
  dirty = statusResult.stdout.trim().length > 0;
} catch (error) {
  await writeFile(new URL("commands/git.log", evidenceRoot), `${error.message}\n`, "utf8");
}
const evidence = { generatedAt: new Date().toISOString(), revision, dirty, commands: results };
await writeFile(new URL("commands/preflight.json", evidenceRoot), `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
console.log(JSON.stringify(evidence, null, 2));
if (results.some((result) => result.status === "FAIL")) process.exitCode = 1;
