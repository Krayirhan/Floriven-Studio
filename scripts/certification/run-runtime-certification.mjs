import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from '../../apps/web/node_modules/@playwright/test/index.mjs';
import { CANONICAL_VIEWPORT } from '@floriven/design-spec';

const hierarchyContract = JSON.parse(await fs.readFile(new URL('../../contracts/runtime-hierarchy-profiles.json', import.meta.url), 'utf8'));
const hierarchyProfileHash = crypto.createHash('sha256').update(JSON.stringify(hierarchyContract)).digest('hex');

const jobId = process.env.RUNTIME_JOB_ID;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const grant = process.env.RUNTIME_INSPECTOR_GRANT;
const appUrl = process.env.RUNTIME_APP_URL ?? 'http://127.0.0.1:4173';
const replayOutputDir = process.env.RUNTIME_REPLAY_OUTPUT_DIR ? path.resolve(process.env.RUNTIME_REPLAY_OUTPUT_DIR) : undefined;
if (!jobId || !supabaseUrl || !anonKey || !grant) throw new Error('RUNTIME_JOB_ID, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY and RUNTIME_INSPECTOR_GRANT are required');

const functionUrl = `${supabaseUrl.replace(/\/$/, '')}/functions/v1`;
const headers = { apikey: anonKey, Authorization: `Bearer ${anonKey}` };
const issue = await fetch(`${functionUrl}/issue-runtime-certification-token`, { method: 'POST', headers: { ...headers, 'content-type': 'application/json', 'x-inspector-grant': grant }, body: JSON.stringify({ jobId }) });
if (!issue.ok) throw new Error(`Token issue failed: ${issue.status} ${await issue.text()}`);
const issued = await issue.json();

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await page.goto(`${appUrl}/app/projeler/runtime/studio?jobId=${encodeURIComponent(jobId)}&runtimeCertificationToken=${encodeURIComponent(issued.token)}`, { waitUntil: 'networkidle' });
  await page.locator('[data-runtime-evidence-ready="true"]').waitFor({ state: 'visible', timeout: 30000 });
  const phones = page.locator('[data-floriven-screen-id]');
  const count = await phones.count();
  if (count !== 6) throw new Error(`Expected 6 screens, found ${count}`);
  const evidenceScreens = [];
  const replayFiles = [];
  for (let index = 0; index < count; index += 1) {
    const phone = phones.nth(index);
    const screenId = await phone.getAttribute('data-floriven-screen-id');
    const archetype = await phone.getAttribute('data-screen-composition');
    const dimensions = await phone.evaluate((element) => { const rect = element.getBoundingClientRect(); return { logicalWidth: element.offsetWidth, logicalHeight: element.offsetHeight, transformedWidth: rect.width, transformedHeight: rect.height, scaleX: rect.width / element.offsetWidth, scaleY: rect.height / element.offsetHeight }; });
    if (dimensions.logicalWidth !== CANONICAL_VIEWPORT.width || dimensions.logicalHeight !== CANONICAL_VIEWPORT.height) throw new Error(`Non-canonical logical viewport: ${dimensions.logicalWidth}x${dimensions.logicalHeight}`);
    const bounds = await phone.locator('[data-floriven-node-id]').evaluateAll((elements) => elements.map((element) => {
      const root = element.closest('[data-floriven-screen-id]');
      const rootBox = root.getBoundingClientRect();
      const box = element.getBoundingClientRect();
      const scaleX = rootBox.width / root.offsetWidth;
      const scaleY = rootBox.height / root.offsetHeight;
      const sectionRole = element.getAttribute('data-section-role');
      return { nodeId: element.getAttribute('data-floriven-node-id') ?? 'unknown', screenId: root.getAttribute('data-floriven-screen-id') ?? 'unknown', x: (box.left - rootBox.left) / scaleX, y: (box.top - rootBox.top) / scaleY, width: box.width / scaleX, height: box.height / scaleY, semanticContainer: element.getAttribute('data-semantic-container') === 'true', ...(sectionRole ? { sectionRole } : {}) };
    }));
    const scaleLayer = phone.locator('xpath=..');
    const originalTransform = await scaleLayer.evaluate((element) => element.style.transform);
    await scaleLayer.evaluate((element) => { element.style.transform = 'none'; });
    const png = await phone.screenshot({ animations: 'disabled' });
    await scaleLayer.evaluate((element, transform) => { element.style.transform = transform; }, originalTransform);
    evidenceScreens.push({ screenId, archetype, screenshotData: `data:image/png;base64,${png.toString('base64')}`, screenshotSha256: crypto.createHash('sha256').update(png).digest('hex'), screenshotBytes: png.byteLength, bounds, viewport: { width: CANONICAL_VIEWPORT.width, height: CANONICAL_VIEWPORT.height }, preview: dimensions, rendererVersion: 'phone-screen-v4' });
    replayFiles.push({ screenId, archetype, png, bounds });
  }
  const evidence = { candidateHash: await page.locator('[data-runtime-candidate-hash]').getAttribute('data-runtime-candidate-hash'), evaluationVersion: 'v2', screens: evidenceScreens };
  const result = await fetch(`${functionUrl}/record-generation-runtime-quality`, { method: 'POST', headers: { ...headers, 'content-type': 'application/json', 'x-runtime-certification-token': issued.token }, body: JSON.stringify({ jobId, evidence }) });
  const body = await result.text();
  if (!result.ok) throw new Error(`Runtime certification failed: ${result.status} ${body}`);
  if (replayOutputDir) {
    await fs.mkdir(replayOutputDir, { recursive: true });
    const safeScreens = [];
    for (const item of replayFiles) {
      const safeId = String(item.screenId).replace(/[^a-zA-Z0-9_-]/g, '_');
      await fs.writeFile(path.join(replayOutputDir, `${safeId}.png`), item.png);
      await fs.writeFile(path.join(replayOutputDir, `${safeId}.bounds.json`), JSON.stringify(item.bounds, null, 2));
      const evidenceScreen = evidenceScreens.find((screen) => screen.screenId === item.screenId);
      safeScreens.push({ screenId: item.screenId, archetype: item.archetype, screenshotSha256: evidenceScreen.screenshotSha256, screenshotBytes: evidenceScreen.screenshotBytes, bounds: item.bounds.map(({ nodeId, x, y, width, height }) => ({ nodeId, x, y, width, height })), viewport: evidenceScreen.viewport, hierarchyScore: hierarchyScore(item.archetype, item.bounds, evidenceScreen.viewport) });
    }
    const manifest = { version: '2.0.0', rendererVersion: 'phone-screen-v4', candidateHash: evidence.candidateHash, capturedAt: new Date().toISOString(), hierarchyProfileVersion: hierarchyContract.version, hierarchyProfileHash, screens: safeScreens };
    await fs.writeFile(path.join(replayOutputDir, 'runtime-replay-manifest.json'), JSON.stringify(manifest, null, 2));
  }
  console.log(body);
} finally { await browser.close(); }

function hierarchyScore(archetype, bounds, viewport) {
  const visible = bounds.filter((bound) => bound.width > 0 && bound.height > 0);
  const sections = visible.filter((bound) => bound.semanticContainer && bound.sectionRole);
  const area = viewport.width * viewport.height;
  const coverage = sections.reduce((sum, bound) => sum + bound.width * bound.height, 0) / area;
  const top = visible.length ? Math.min(...visible.map((bound) => bound.y)) : 0;
  const bottom = visible.length ? Math.max(...visible.map((bound) => bound.y + bound.height)) : 0;
  const density = visible.length / (area / 100000);
  const heights = sections.map((bound) => bound.height); const mean = heights.length ? heights.reduce((sum, value) => sum + value, 0) / heights.length : 0;
  const variation = mean ? Math.sqrt(heights.reduce((sum, value) => sum + (value - mean) ** 2, 0) / heights.length) / mean : 0;
  const profile = hierarchyContract.profiles[archetype] ?? hierarchyContract.profiles.default;
  const checks = [sections.length >= profile.minimumSectionCount, coverage >= profile.minimumSectionAreaCoverage && coverage <= profile.maximumSectionAreaCoverage, (bottom - top) / viewport.height >= profile.minimumVerticalOccupancy, density >= profile.minimumNodeDensityPer100k && density <= profile.maximumNodeDensityPer100k, sections.length < profile.minimumSectionCount || variation >= profile.minimumSectionHeightVariation];
  return Math.round((checks.filter(Boolean).length / checks.length) * 1000) / 1000;
}
