import { readFile } from "node:fs/promises";

const localEnv = Object.fromEntries((await readFile(new URL("../apps/web/.env.local", import.meta.url), "utf8")).split(/\r?\n/).flatMap((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  return match ? [[match[1], match[2].replace(/^"|"$/g, "")]] : [];
}));

const generateUrl = `${(process.env.VITE_SUPABASE_URL ?? localEnv.VITE_SUPABASE_URL).replace(/\/$/, "")}/functions/v1/generate`;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY ?? localEnv.VITE_SUPABASE_ANON_KEY;
const idempotencyKey = `live-smoke-finance-auto-${crypto.randomUUID()}`;
const jobToken = `${crypto.randomUUID()}${crypto.randomUUID()}`;
const headers = {
  apikey: anonKey,
  Authorization: `Bearer ${anonKey}`,
  "Content-Type": "application/json",
  "Idempotency-Key": idempotencyKey,
  "X-Job-Token": jobToken,
};

const created = await fetch(generateUrl, {
  method: "POST",
  headers,
  body: JSON.stringify({
    projectId: `live-smoke-finance-auto-${crypto.randomUUID()}`,
    brief: "Serbest çalışanların gelir, müşteriler, faturalar ve ödeme takibini yönetebileceği sade bir finans uygulaması tasarla.",
    platform: "ios",
    designMode: "auto",
  }),
});
const job = await created.json();
if (created.status !== 202 || !job.id) throw new Error(`Expected HTTP 202 with job id, received ${created.status}`);
console.log(JSON.stringify({ httpStatus: created.status, jobId: job.id, status: job.status, stage: job.stage }));

for (let attempt = 0; attempt < 120; attempt += 1) {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const response = await fetch(`${generateUrl}?id=${encodeURIComponent(job.id)}`, { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, "X-Job-Token": jobToken } });
  const current = await response.json();
  if (!response.ok) throw new Error(current.error ?? `Polling failed with HTTP ${response.status}`);
  console.log(JSON.stringify({ jobId: current.id, status: current.status, stage: current.stage, progress: current.progress, errorCode: current.errorCode ?? null }));
  if (current.status === "completed" || current.status === "failed") process.exit(0);
}

throw new Error("Smoke polling reached its bounded observation window without a terminal job state");
