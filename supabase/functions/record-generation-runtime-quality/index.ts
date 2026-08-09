import { createClient } from "jsr:@supabase/supabase-js@2";
import { evaluateRuntimeQuality, isRuntimeQualityEvidence } from "../generate/runtime-quality.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-generation-runtime-secret",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const expectedSecret = Deno.env.get("GENERATION_RUNTIME_QUALITY_SECRET");
  const providedSecret = request.headers.get("x-generation-runtime-secret");
  if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
    return json({ error: "Runtime quality writer is not authorized" }, 403);
  }

  const body = await request.json().catch(() => undefined);
  if (!isRecord(body) || typeof body.jobId !== "string" || !isRuntimeQualityEvidence(body.evidence)) {
    return json({ error: "jobId and valid runtime quality evidence are required" }, 400);
  }

  const report = evaluateRuntimeQuality(body.evidence);
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
  const { data, error } = await supabase
    .from("generation_jobs")
    .update({ runtime_quality_report: { ...report, recordedAt: new Date().toISOString() }, final_eligible: report.finalEligible, final_decision_reason: report.finalEligible ? 'ALL_RUNTIME_GATES_PASSED' : 'RUNTIME_GATE_FAILED' })
    .eq("id", body.jobId)
    .select("id, runtime_quality_report")
    .single();
  if (error) return json({ error: error.message }, 500);
  return json({ id: data.id, runtimeQualityReport: data.runtime_quality_report });
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
