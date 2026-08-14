import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import process from 'node:process';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);

const contractUrl = new URL('../../contracts/runtime-hierarchy-profiles.json', import.meta.url);
const targets = [
  new URL('../../packages/design-spec/src/runtime-hierarchy-profiles.generated.ts', import.meta.url),
  new URL('../../supabase/functions/_shared/runtime-hierarchy-profiles.generated.ts', import.meta.url),
];
const contract = JSON.parse(await fs.readFile(contractUrl, 'utf8'));
validate(contract);
await validateVersionTransition(contract);
const contractHash = crypto.createHash('sha256').update(JSON.stringify(contract)).digest('hex');
const output = `export type RuntimeVisualHierarchyThresholds = { minimumSectionCount: number; minimumSectionAreaCoverage: number; maximumSectionAreaCoverage: number; minimumVerticalOccupancy: number; minimumNodeDensityPer100k: number; maximumNodeDensityPer100k: number; minimumSectionHeightVariation: number }\nexport const RUNTIME_VISUAL_HIERARCHY_PROFILE_VERSION = '${contract.version}'\nexport const RUNTIME_VISUAL_HIERARCHY_PROFILE_HASH = '${contractHash}'\nexport const RUNTIME_VISUAL_HIERARCHY_PROFILES: Record<string, RuntimeVisualHierarchyThresholds> = ${JSON.stringify(contract.profiles)}\n`;
const write = process.argv.includes('--write');
const drift = [];
for (const target of targets) {
  const current = await fs.readFile(target, 'utf8').catch(() => '');
  if (current === output) continue;
  if (write) await fs.writeFile(target, output);
  else drift.push(target.pathname);
}
if (drift.length) { console.error(JSON.stringify({ passed: false, issue: 'RUNTIME_HIERARCHY_PROFILE_DRIFT', targets: drift }, null, 2)); process.exitCode = 1; }
else console.log(JSON.stringify({ passed: true, version: contract.version, contractHash, profileCount: Object.keys(contract.profiles).length }));

function validate(value) {
  const keys = ['minimumSectionCount', 'minimumSectionAreaCoverage', 'maximumSectionAreaCoverage', 'minimumVerticalOccupancy', 'minimumNodeDensityPer100k', 'maximumNodeDensityPer100k', 'minimumSectionHeightVariation'];
  if (!value || !/^\d+\.\d+\.\d+$/.test(value.version) || !value.profiles?.default || Object.keys(value).some((key) => !['version', 'profiles'].includes(key))) throw new Error('Runtime hierarchy contract metadata is invalid');
  for (const [name, profile] of Object.entries(value.profiles)) {
    if (Object.keys(profile).length !== keys.length || !keys.every((key) => Number.isFinite(profile[key]))) throw new Error(`Runtime hierarchy profile is invalid: ${name}`);
    if (!Number.isInteger(profile.minimumSectionCount) || profile.minimumSectionCount < 1 || profile.minimumSectionAreaCoverage < 0 || profile.maximumSectionAreaCoverage > 1 || profile.minimumSectionAreaCoverage >= profile.maximumSectionAreaCoverage || profile.minimumVerticalOccupancy < 0 || profile.minimumVerticalOccupancy > 1 || profile.minimumNodeDensityPer100k < 0 || profile.minimumNodeDensityPer100k >= profile.maximumNodeDensityPer100k || profile.minimumSectionHeightVariation < 0 || profile.minimumSectionHeightVariation > 1) throw new Error(`Runtime hierarchy profile range is invalid: ${name}`);
  }
}

async function validateVersionTransition(next) {
  const baseRef = process.env.RUNTIME_HIERARCHY_BASE_REF;
  if (!baseRef) return;
  let previous;
  try { previous = JSON.parse((await exec('git', ['show', `${baseRef}:contracts/runtime-hierarchy-profiles.json`])).stdout); } catch { return; }
  const change = classify(previous.profiles, next.profiles);
  if (!satisfies(previous.version, next.version, change)) throw new Error(`RUNTIME_HIERARCHY_SEMVER_VIOLATION:${change}:${previous.version}->${next.version}`);
}
function classify(previous, next) {
  if (JSON.stringify(previous) === JSON.stringify(next)) return 'none';
  for (const [name, profile] of Object.entries(previous)) { const candidate = next[name]; if (!candidate) return 'major'; for (const [key, value] of Object.entries(profile)) { const nextValue = candidate[key]; if (nextValue === undefined || (key.startsWith('minimum') ? nextValue > value : key.startsWith('maximum') ? nextValue < value : nextValue !== value)) return 'major'; } }
  return 'minor';
}
function satisfies(previous, next, change) { const a = previous.split('.').map(Number), b = next.split('.').map(Number); if (change === 'none') return previous === next; if (change === 'major') return b[0] > a[0]; return b[0] > a[0] || (b[0] === a[0] && b[1] > a[1]); }
