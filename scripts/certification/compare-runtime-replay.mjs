import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import process from 'node:process';

const baselinePath = process.env.RUNTIME_REPLAY_BASELINE;
const candidatePath = process.env.RUNTIME_REPLAY_CANDIDATE;
if (!baselinePath || !candidatePath) throw new Error('RUNTIME_REPLAY_BASELINE and RUNTIME_REPLAY_CANDIDATE are required');

const readManifest = async (filePath) => JSON.parse(await fs.readFile(path.resolve(filePath), 'utf8'));
const baseline = await readManifest(baselinePath);
const candidate = await readManifest(candidatePath);
const hierarchyContract = JSON.parse(await fs.readFile(new URL('../../contracts/runtime-hierarchy-profiles.json', import.meta.url), 'utf8'));
const hierarchyProfileHash = crypto.createHash('sha256').update(JSON.stringify(hierarchyContract)).digest('hex');
const validate = (manifest) => {
  const issues = [];
  if (!isRecord(manifest)) return ['INVALID_RUNTIME_REPLAY_MANIFEST'];
  if (manifest.version !== '2.0.0') issues.push('UNSUPPORTED_RUNTIME_REPLAY_VERSION');
  if (manifest.rendererVersion !== 'phone-screen-v4') issues.push('UNSUPPORTED_RUNTIME_REPLAY_RENDERER');
  if (manifest.hierarchyProfileVersion !== hierarchyContract.version) issues.push('RUNTIME_REPLAY_HIERARCHY_PROFILE_VERSION_UNTRUSTED');
  if (manifest.hierarchyProfileHash !== hierarchyProfileHash) issues.push('RUNTIME_REPLAY_HIERARCHY_PROFILE_HASH_UNTRUSTED');
  if (!/^[a-f0-9]{8}$/i.test(manifest.candidateHash ?? '') || !isIsoTimestamp(manifest.capturedAt)) issues.push('INCOMPLETE_RUNTIME_REPLAY_METADATA');
  if (!Array.isArray(manifest.screens)) return [...issues, 'INVALID_RUNTIME_REPLAY_SCREEN_COLLECTION'];
  if (manifest.screens.length !== 6) issues.push('RUNTIME_REPLAY_SCREEN_COUNT_INVALID');
  const ids = new Set();
  for (const screen of manifest.screens) {
    const id = isRecord(screen) && nonEmpty(screen.screenId) ? screen.screenId : 'unknown';
    if (ids.has(id)) issues.push(`DUPLICATE_RUNTIME_REPLAY_SCREEN:${id}`); ids.add(id);
    if (!validScreen(screen)) issues.push(`INVALID_RUNTIME_REPLAY_SCREEN:${id}`);
  }
  return issues;
};
const validationIssues = [...validate(baseline).map((issue) => `RUNTIME_REPLAY_BASELINE_INVALID:${issue}`), ...validate(candidate).map((issue) => `RUNTIME_REPLAY_CANDIDATE_INVALID:${issue}`)];
if (validationIssues.length) {
  console.error(JSON.stringify({ passed: false, validationIssues }, null, 2));
  process.exitCode = 1;
} else {
  const report = compareReplay(baseline, candidate);
  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) process.exitCode = 1;
}

function compareReplay(baseline, candidate) {
  const issues = [];
  if (baseline.rendererVersion !== candidate.rendererVersion) issues.push('RUNTIME_REPLAY_RENDERER_MISMATCH');
  if (baseline.hierarchyProfileVersion !== candidate.hierarchyProfileVersion || baseline.hierarchyProfileHash !== candidate.hierarchyProfileHash) issues.push('RUNTIME_REPLAY_HIERARCHY_PROFILE_MISMATCH');
  const actualById = new Map(candidate.screens.map((screen) => [screen.screenId, screen]));
  let missingScreenCount = 0, changedScreenshotCount = 0, byteDelta = 0, inventoryDelta = 0, geometryDelta = 0, hierarchyDelta = 0;
  for (const expected of baseline.screens) {
    const actual = actualById.get(expected.screenId); if (!actual) { missingScreenCount += 1; continue; }
    if (expected.screenshotSha256 !== actual.screenshotSha256) changedScreenshotCount += 1;
    byteDelta = Math.max(byteDelta, ratio(expected.screenshotBytes, actual.screenshotBytes));
    const expectedIds = new Set(expected.bounds.map((bound) => bound.nodeId)); const actualIds = new Set(actual.bounds.map((bound) => bound.nodeId));
    inventoryDelta = Math.max(inventoryDelta, ([...expectedIds].filter((id) => !actualIds.has(id)).length + [...actualIds].filter((id) => !expectedIds.has(id)).length) / Math.max(expectedIds.size, actualIds.size, 1));
    const actualBounds = new Map(actual.bounds.map((bound) => [bound.nodeId, bound])); const deltas = [];
    for (const bound of expected.bounds) { const other = actualBounds.get(bound.nodeId); if (other) deltas.push(Math.abs(bound.x-other.x)/expected.viewport.width, Math.abs(bound.y-other.y)/expected.viewport.height, Math.abs(bound.width-other.width)/expected.viewport.width, Math.abs(bound.height-other.height)/expected.viewport.height); }
    geometryDelta = Math.max(geometryDelta, deltas.length ? deltas.reduce((sum, value) => sum + value, 0) / deltas.length : 1);
    hierarchyDelta = Math.max(hierarchyDelta, Math.abs(expected.hierarchyScore - actual.hierarchyScore));
  }
  const extra = candidate.screens.filter((screen) => !baseline.screens.some((expected) => expected.screenId === screen.screenId)).length;
  if (missingScreenCount || extra) issues.push('RUNTIME_REPLAY_SCREEN_SET_DRIFT');
  if (changedScreenshotCount) issues.push('RUNTIME_REPLAY_SCREENSHOT_HASH_DRIFT');
  if (byteDelta > .08) issues.push('RUNTIME_REPLAY_SCREENSHOT_DRIFT'); if (inventoryDelta > .1) issues.push('RUNTIME_REPLAY_NODE_INVENTORY_DRIFT'); if (geometryDelta > .03) issues.push('RUNTIME_REPLAY_GEOMETRY_DRIFT'); if (hierarchyDelta > .1) issues.push('RUNTIME_REPLAY_HIERARCHY_DRIFT');
  return { passed: issues.length === 0, comparedScreenCount: Math.max(0, baseline.screens.length - missingScreenCount), missingScreenCount: missingScreenCount + extra, changedScreenshotCount, maximumScreenshotByteDelta: round(byteDelta), maximumNodeInventoryDelta: round(inventoryDelta), maximumGeometryDelta: round(geometryDelta), maximumHierarchyScoreDelta: round(hierarchyDelta), issues };
}
function ratio(left, right) { return Math.abs(left-right) / Math.max(left, right, 1); }
function round(value) { return Math.round(value * 1000) / 1000; }
function isRecord(value) { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function nonEmpty(value) { return typeof value === 'string' && value.trim().length > 0; }
function finite(value) { return typeof value === 'number' && Number.isFinite(value); }
function isIsoTimestamp(value) { return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && !Number.isNaN(Date.parse(value)); }
function validBound(bound) { return isRecord(bound) && nonEmpty(bound.nodeId) && finite(bound.x) && finite(bound.y) && finite(bound.width) && finite(bound.height) && bound.x >= 0 && bound.y >= 0 && bound.width > 0 && bound.height > 0 && bound.x + bound.width <= 390 && bound.y + bound.height <= 844; }
function validScreen(screen) { return isRecord(screen) && nonEmpty(screen.archetype) && /^[a-f0-9]{64}$/i.test(screen.screenshotSha256 ?? '') && Number.isInteger(screen.screenshotBytes) && screen.screenshotBytes > 0 && isRecord(screen.viewport) && screen.viewport.width === 390 && screen.viewport.height === 844 && finite(screen.hierarchyScore) && screen.hierarchyScore >= 0 && screen.hierarchyScore <= 1 && Array.isArray(screen.bounds) && screen.bounds.length > 0 && screen.bounds.every(validBound); }
