import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import process from 'node:process';

const requiredEnvironment = ['RUNTIME_JOB_ID', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'RUNTIME_INSPECTOR_GRANT', 'RUNTIME_APP_URL'];
const captureEnvironmentReady = requiredEnvironment.every((name) => Boolean(process.env[name]?.trim())) ? true : null;
const baselinePath = path.resolve('docs/certification/baselines/runtime-replay-manifest.json');
const approvalPath = path.resolve('docs/certification/baselines/runtime-replay-approval.json');
const hierarchyContractPath = path.resolve('contracts/runtime-hierarchy-profiles.json');
const baselineBytes = await readOptional(baselinePath);
const approvalBytes = await readOptional(approvalPath);
const hierarchyContractBytes = await readOptional(hierarchyContractPath);
const baseline = parseOptionalJson(baselineBytes);
const approval = parseOptionalJson(approvalBytes);
const hierarchyContract = parseOptionalJson(hierarchyContractBytes);
const hierarchyProfileHash = hierarchyContract && hierarchyContract !== false ? crypto.createHash('sha256').update(JSON.stringify(hierarchyContract)).digest('hex') : undefined;
const baselineManifestValid = baseline === null ? null : baseline !== false && validateBaselineManifest(baseline, hierarchyContract?.version, hierarchyProfileHash);
const baselineHash = baselineBytes ? crypto.createHash('sha256').update(baselineBytes).digest('hex') : undefined;
const baselineApprovalValid = approval === null ? null : approval !== false && typeof approval.approvedBy === 'string' && approval.approvedBy.trim().length > 0 && typeof approval.reviewReference === 'string' && approval.reviewReference.trim().length > 0 && !Number.isNaN(Date.parse(approval.approvedAt)) && approval.baselineSha256 === baselineHash;
const replayPassed = parseOptionalBoolean(process.env.RUNTIME_REPLAY_PASSED);
const runtimeFinalEligible = parseOptionalBoolean(process.env.RUNTIME_FINAL_ELIGIBLE);
const input = { captureEnvironmentReady, baselineManifestValid, baselineApprovalValid, replayPassed, runtimeFinalEligible };
const entries = Object.entries(input);
const failedChecks = entries.filter(([, value]) => value === false).map(([key]) => key);
const pendingChecks = entries.filter(([, value]) => value === null).map(([key]) => key);
const status = failedChecks.length ? 'BLOCKED' : pendingChecks.length ? 'NOT_VERIFIED' : 'VERIFIED';
const report = { version: '1.0.0', generatedAt: new Date().toISOString(), status, releaseEligible: status === 'VERIFIED', checks: input, failedChecks, pendingChecks };
const outputPath = process.env.RUNTIME_RELEASE_EVIDENCE_OUTPUT ? path.resolve(process.env.RUNTIME_RELEASE_EVIDENCE_OUTPUT) : undefined;
if (outputPath) { await fs.mkdir(path.dirname(outputPath), { recursive: true }); await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`); }
console.log(JSON.stringify(report, null, 2));
if (process.env.RUNTIME_RELEASE_EVIDENCE_STRICT === 'true' && status !== 'VERIFIED') process.exitCode = 1;

async function readOptional(filePath) { try { return await fs.readFile(filePath); } catch { return null; } }
function parseOptionalJson(bytes) { if (!bytes) return null; try { return JSON.parse(bytes.toString('utf8')); } catch { return false; } }
function parseOptionalBoolean(value) { return value === 'true' ? true : value === 'false' ? false : null; }
function validateBaselineManifest(manifest, profileVersion, profileHash) {
  if (!isRecord(manifest) || manifest.version !== '2.0.0' || manifest.rendererVersion !== 'phone-screen-v4' || manifest.hierarchyProfileVersion !== profileVersion || manifest.hierarchyProfileHash !== profileHash || !/^[a-f0-9]{8}$/i.test(manifest.candidateHash ?? '') || !isIsoTimestamp(manifest.capturedAt) || !Array.isArray(manifest.screens) || manifest.screens.length !== 6) return false;
  const ids = new Set();
  return manifest.screens.every((screen) => {
    if (!isRecord(screen) || !nonEmpty(screen.screenId) || ids.has(screen.screenId)) return false; ids.add(screen.screenId);
    return nonEmpty(screen.archetype) && /^[a-f0-9]{64}$/i.test(screen.screenshotSha256 ?? '') && Number.isInteger(screen.screenshotBytes) && screen.screenshotBytes > 0 && isRecord(screen.viewport) && screen.viewport.width === 390 && screen.viewport.height === 844 && finite(screen.hierarchyScore) && screen.hierarchyScore >= 0 && screen.hierarchyScore <= 1 && Array.isArray(screen.bounds) && screen.bounds.length > 0 && screen.bounds.every(validBound);
  });
}
function isRecord(value) { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function nonEmpty(value) { return typeof value === 'string' && value.trim().length > 0; }
function finite(value) { return typeof value === 'number' && Number.isFinite(value); }
function isIsoTimestamp(value) { return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && !Number.isNaN(Date.parse(value)); }
function validBound(bound) { return isRecord(bound) && nonEmpty(bound.nodeId) && finite(bound.x) && finite(bound.y) && finite(bound.width) && finite(bound.height) && bound.x >= 0 && bound.y >= 0 && bound.width > 0 && bound.height > 0 && bound.x + bound.width <= 390 && bound.y + bound.height <= 844; }
