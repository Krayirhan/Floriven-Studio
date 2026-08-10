import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createRuntimeCandidateHash } from '../_shared/runtime-hash.ts';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type, x-inspector-grant' };

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const grant = Deno.env.get('RUNTIME_INSPECTOR_GRANT');
  if (!grant || request.headers.get('x-inspector-grant') !== grant) return json({ error: 'Inspector grant denied' }, 403);
  const body = await request.json().catch(() => undefined);
  if (!body || typeof body.jobId !== 'string') return json({ error: 'jobId is required' }, 400);
  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  const { data: job, error } = await supabase.from('generation_jobs').select('id,status,result_screens,quality_report').eq('id', body.jobId).single();
  if (error || !job || job.status !== 'completed' || job.quality_report?.passed !== true || job.quality_report?.score !== 100) return json({ error: 'Only completed 100/100 designs may be inspected' }, 409);
  if (!Array.isArray(job.result_screens) || job.result_screens.length !== 6) return json({ error: 'Exactly six screens are required for inspection' }, 409);
  const exp = Math.floor(Date.now() / 1000) + 600;
  const payload = btoa(JSON.stringify({ purpose: 'runtime_certification', jobId: job.id, candidateHash: createRuntimeCandidateHash(job.result_screens), exp }));
  const signature = await sha256(`${payload}.${grant}`);
  return json({ token: `${payload}.${signature}`, expiresAt: new Date(exp * 1000).toISOString(), jobId: job.id, screenCount: 6 });
});

async function sha256(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json' } }); }
