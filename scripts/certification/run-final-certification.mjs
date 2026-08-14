import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const exec = promisify(execFile);
const root = new URL('../../', import.meta.url);
const cwd = fileURLToPath(root);
const evidenceRoot = new URL('../../docs/certification/evidence/commands/', import.meta.url);
const preflightPath = new URL('preflight.json', evidenceRoot);
const runtimePath = new URL('runtime-release-evidence.json', evidenceRoot);
const finalPath = new URL('final-certification.json', evidenceRoot);
const packageManager = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
await mkdir(evidenceRoot, { recursive: true });

await runPackageScript('certification:preflight');
await runPackageScript('certification:runtime-release-evidence', { RUNTIME_RELEASE_EVIDENCE_OUTPUT: fileURLToPath(runtimePath) });

const preflight = await readJson(preflightPath);
const runtime = await readJson(runtimePath);
const failedLocalChecks = Array.isArray(preflight?.commands) ? preflight.commands.filter((item) => item.status !== 'PASS').map((item) => item.name) : ['preflightEvidence'];
const revisionClean = preflight?.dirty === false && typeof preflight?.revision === 'string' && preflight.revision !== 'NOT_VERIFIED';
const runtimeStatus = runtime?.status === 'VERIFIED' || runtime?.status === 'BLOCKED' || runtime?.status === 'NOT_VERIFIED' ? runtime.status : 'NOT_VERIFIED';
const status = failedLocalChecks.length ? 'BLOCKED' : runtimeStatus === 'BLOCKED' ? 'BLOCKED' : runtimeStatus !== 'VERIFIED' || !revisionClean ? 'NOT_VERIFIED' : 'VERIFIED';
const report = {
  version: '1.0.0', generatedAt: new Date().toISOString(), status, releaseEligible: status === 'VERIFIED',
  revision: preflight?.revision ?? 'NOT_VERIFIED', revisionClean,
  localChecksPassed: failedLocalChecks.length === 0, failedLocalChecks,
  runtimeStatus, runtimePendingChecks: runtime?.pendingChecks ?? [], runtimeFailedChecks: runtime?.failedChecks ?? [],
};
await writeFile(finalPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));
if (status !== 'VERIFIED') process.exitCode = 1;

async function runPackageScript(name, extraEnv = {}) {
  try {
    if (process.platform === 'win32') await exec(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', `${packageManager} ${name}`], { cwd, windowsHide: true, maxBuffer: 30 * 1024 * 1024, env: { ...process.env, ...extraEnv } });
    else await exec(packageManager, [name], { cwd, maxBuffer: 30 * 1024 * 1024, env: { ...process.env, ...extraEnv } });
  } catch { /* Child evidence records the exact failed checks; final gate remains fail-closed. */ }
}
async function readJson(url) { try { return JSON.parse(await readFile(url, 'utf8')); } catch { return undefined; } }
