import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createRuntimeCandidateHash } from '../_shared/runtime-hash.ts';
import { googleRuntimeCritic, RuntimeCriticError } from './runtime-critic.ts';
import { evaluateRuntimeMetricGates } from './runtime-metrics.ts';
import { isRuntimeEvidence, validateRuntimeEvidence, type RuntimeCertificationEvidence } from './runtime-evidence.ts';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-generation-runtime-secret, x-runtime-certification-token' };

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const certificationToken = request.headers.get('x-runtime-certification-token')?.trim();
  if (!authorized(request) && !certificationToken) return json({ error: 'Runtime quality writer is not authorized' }, 403);
  const body = await request.json().catch(() => undefined);
  if (!isRecord(body) || typeof body.jobId !== 'string' || !isRuntimeEvidence(body.evidence) || hasClientDecisionFields(body)) return json({ error: 'jobId and trusted runtime evidence are required' }, 400);

  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  const { data: job, error: jobError } = await supabase.from('generation_jobs').select('id,result_screens,quality_report,runtime_quality_report').eq('id', body.jobId).single();
  if (jobError || !Array.isArray(job?.result_screens)) return json({ error: 'Runtime candidate was not found' }, 404);
  if (job.quality_report?.passed !== true) return json({ error: 'Static quality must pass before runtime certification' }, 409);
  const screens = job.result_screens as Array<{ id?: unknown }>;
  if (screens.length !== 6) return json({ error: 'Exactly six screens are required for runtime certification' }, 409);
  const expectedScreenIds = screens.map((screen) => typeof screen.id === 'string' ? screen.id : '').filter(Boolean);
  const candidateHash = createRuntimeCandidateHash(screens);
  if (certificationToken && !(await verifyCertificationToken(certificationToken, job.id, candidateHash))) return json({ error: 'Certification token denied or expired' }, 403);
  const evidenceIssues = await validateRuntimeEvidence(body.evidence, expectedScreenIds, candidateHash);
  if (evidenceIssues.length) return json({ error: 'Runtime evidence rejected', issues: evidenceIssues }, 422);
  const existing = isRecord(job.runtime_quality_report) ? job.runtime_quality_report : undefined;
  if (existing?.candidateHash === candidateHash && existing.evaluationVersion === body.evidence.evaluationVersion) return json({ id: job.id, runtimeQualityReport: existing, idempotent: true });

  try {
    const visualScores = await googleRuntimeCritic(body.evidence, 'visual');
    const crossScreenScores = await googleRuntimeCritic(body.evidence, 'cross_screen');
    const report = evaluateRuntimeCertification(body.evidence, visualScores, crossScreenScores);
    const persisted = { ...report, recordedAt: new Date().toISOString() };
    const { data, error } = await supabase.from('generation_jobs').update({ runtime_quality_report: persisted, final_eligible: report.passed, final_decision_reason: report.passed ? 'ALL_RUNTIME_GATES_PASSED' : 'RUNTIME_GATE_FAILED' }).eq('id', body.jobId).select('id,runtime_quality_report,final_eligible').single();
    if (error) return json({ error: error.message }, 500);
    return json({ id: data.id, runtimeQualityReport: data.runtime_quality_report, finalEligible: data.final_eligible });
  } catch (error) {
    const criticError = error instanceof RuntimeCriticError ? error : new RuntimeCriticError('RUNTIME_CRITIC_INVALID_RESPONSE', error instanceof Error ? error.message : 'Runtime critic failed');
    await supabase.from('generation_jobs').update({ runtime_quality_report: { candidateHash, evaluationVersion: body.evidence.evaluationVersion, passed: false, criticalIssues: [criticError.code], recordedAt: new Date().toISOString() }, final_eligible: false, final_decision_reason: criticError.code }).eq('id', body.jobId);
    return json({ error: criticError.message, code: criticError.code }, 502);
  }
});

function authorized(request: Request) { const expected = Deno.env.get('GENERATION_RUNTIME_QUALITY_SECRET'); return !!expected && request.headers.get('x-generation-runtime-secret') === expected; }
async function verifyCertificationToken(token: string, jobId: string, candidateHash: string) {
  const secret = Deno.env.get('RUNTIME_INSPECTOR_GRANT');
  if (!secret) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || signature !== await sha256(`${payload}.${secret}`)) return false;
  try {
    const claims = JSON.parse(atob(payload)) as { purpose?: string; jobId?: string; candidateHash?: string; exp?: number };
    return claims.purpose === 'runtime_certification' && claims.jobId === jobId && claims.candidateHash === candidateHash && typeof claims.exp === 'number' && claims.exp > Math.floor(Date.now() / 1000);
  } catch { return false; }
}
async function sha256(value: string) { const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)); return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(''); }
function hasClientDecisionFields(body: Record<string, unknown>) { return ['finalEligible', 'runtimePassed', 'geometryPassed', 'visualCriticPassed', 'crossScreenPassed', 'qualityScore'].some((key) => key in body); }
function evaluateRuntimeCertification(evidence: RuntimeCertificationEvidence, visualScores: Record<string, number>, crossScores: Record<string, number>) { const geometry = evidence.screens.map((screen) => ({ screenId: screen.screenId, report: { issues: screen.bounds.flatMap((bound) => bound.width <= 0 || bound.height <= 0 || bound.x < 0 || bound.y < 0 || bound.x + bound.width > screen.viewport.width || bound.y + bound.height > screen.viewport.height ? ['INVALID_DIMENSION'] : []) } })); const critic = (scores: Record<string, number>) => ({ scores, failures: scores.taskClarity >= 7 && scores.navigation >= 7 && scores.patternSuitability >= 7 && Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length >= 7.5 ? [] : ['CRITIC_THRESHOLD_FAILED'] }); const visualCritic = critic(visualScores); const crossScreenCritic = critic(crossScores); const { layoutIdentity, visualHierarchy } = evaluateRuntimeMetricGates(evidence.screens); const criticalIssues = [...geometry.flatMap((item) => item.report.issues.map((issue) => `${item.screenId}:${issue}`)), ...visualCritic.failures, ...crossScreenCritic.failures, ...layoutIdentity.issues, ...visualHierarchy.issues]; return { candidateHash: evidence.candidateHash, evaluationVersion: evidence.evaluationVersion, evidenceScreenCount: evidence.screens.length, geometry, visualCritic, crossScreenCritic, layoutIdentity, visualHierarchy, passed: criticalIssues.length === 0, criticalIssues }; }
function isRecord(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value); }
function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json' } }); }
