import crypto from 'node:crypto';
import process from 'node:process';
import { chromium } from '../../apps/web/node_modules/@playwright/test/index.mjs';

const jobId = process.env.RUNTIME_JOB_ID;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const grant = process.env.RUNTIME_INSPECTOR_GRANT;
const appUrl = process.env.RUNTIME_APP_URL ?? 'http://127.0.0.1:4173';
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
  for (let index = 0; index < count; index += 1) {
    const phone = phones.nth(index);
    const screenId = await phone.getAttribute('data-floriven-screen-id');
    const png = await phone.screenshot({ animations: 'disabled' });
    const bounds = await phone.locator('[data-floriven-node-id]').evaluateAll((elements) => elements.map((element) => {
      const box = element.getBoundingClientRect();
      return { nodeId: element.getAttribute('data-floriven-node-id') ?? 'unknown', screenId: element.closest('[data-floriven-screen-id]')?.getAttribute('data-floriven-screen-id') ?? 'unknown', x: box.x, y: box.y, width: box.width, height: box.height };
    }));
    const box = await phone.boundingBox();
    evidenceScreens.push({ screenId, screenshotData: `data:image/png;base64,${png.toString('base64')}`, screenshotSha256: crypto.createHash('sha256').update(png).digest('hex'), screenshotBytes: png.byteLength, bounds, viewport: { width: box?.width ?? 390, height: box?.height ?? 844 }, rendererVersion: 'phone-screen-v2' });
  }
  const evidence = { candidateHash: await page.locator('[data-runtime-candidate-hash]').getAttribute('data-runtime-candidate-hash'), evaluationVersion: 'v1', screens: evidenceScreens };
  const result = await fetch(`${functionUrl}/record-generation-runtime-quality`, { method: 'POST', headers: { ...headers, 'content-type': 'application/json', 'x-runtime-certification-token': issued.token }, body: JSON.stringify({ jobId, evidence }) });
  const body = await result.text();
  if (!result.ok) throw new Error(`Runtime certification failed: ${result.status} ${body}`);
  console.log(body);
} finally { await browser.close(); }
