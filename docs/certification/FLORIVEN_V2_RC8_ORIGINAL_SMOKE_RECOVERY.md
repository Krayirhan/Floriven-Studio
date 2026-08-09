# Floriven Studio — RC8 Original Smoke Evidence Recovery

## 1. Verdict

This read-only recovery did not find a persisted local timestamp, request ID, idempotency key, Supabase invocation record, or job ID for the original RC8 Finance/Auto smoke. No model/provider call, database write, Edge Function invocation, redeploy, or benchmark was performed during this recovery.

The only confirmed event remains the local PowerShell caller timing out after 120 seconds. The original server-side outcome is **NOT VERIFIED**.

## 2. RC8 Identity

- Branch: `master`
- Expected/current RC8 SHA: `ecbdd2eacd8f084fa7cbf0e1d98e5ca7e40fc2cd`
- `floriven-v2-rc8` resolves to the same SHA.
- The workspace was clean before this report was created; this report is intentionally uncommitted so RC8 identity and tag are not changed.
- Supabase `generate` was previously observed active at function version 70.

## 3. Original Client Invocation

PowerShell history contained no matching `rc8-finance-auto`, `functions/v1/generate`, or idempotency-key command entry. No local smoke output preserved the generated random idempotency key or job ID. The narrow timestamp window therefore cannot be reconstructed beyond the prior session’s observed 120-second timeout.

Timezone for the local session: Europe/Istanbul.

## 4. Supabase Invocation

No read-only Supabase invocation log source was available through the configured local CLI. The CLI exposed function deployment metadata but no function-log subcommand. Without the original timestamp or request ID, no candidate invocation could be correlated safely.

- Invocation found: NO
- Invocation correlation confidence: NONE
- HTTP status: NOT VERIFIED
- Provider-stage log: NOT VERIFIED

## 5. generation_jobs Correlation

The repository and previous timeout report contain no original job ID or persisted idempotency key. Anonymous application credentials cannot enumerate protected `generation_jobs` rows. No privileged read-only database credential was available locally.

- Job row: NOT VERIFIED
- Job correlation confidence: NONE
- Job ID: NOT VERIFIED
- At least two independent correlation signals: unavailable

## 6. Google Provider Authentication

- Google request started: NOT VERIFIED
- Google response received: NOT VERIFIED
- Google HTTP status: N/A
- 401: NOT VERIFIED
- Google auth fix proven live: NO

The native-header regression test proves the RC8 source behavior only; it is not positive evidence from the original live invocation.

## 7. Google Provider Response

No original provider response status, duration, body, or Edge log was recovered. Success cannot be inferred from the absence of a locally returned error.

## 8. Pipeline Stage Matrix

| Stage | Result |
|---|---|
| Request accepted | NOT VERIFIED |
| Authentication | NOT VERIFIED |
| generation_jobs row created | NOT VERIFIED |
| Google request started | NOT VERIFIED |
| Google response received | NOT VERIFIED |
| Provider response parsed | NOT VERIFIED |
| ProductBlueprint | NOT VERIFIED |
| UX/archetype planning | NOT VERIFIED |
| Semantic composition | NOT VERIFIED |
| Normalization | NOT VERIFIED |
| Identity validation | NOT VERIFIED |
| Static quality | NOT VERIFIED |
| Candidate/result persistence | NOT VERIFIED |
| Runtime quality | NOT VERIFIED |
| final_eligible decision | NOT VERIFIED |

## 9. Backend Activity After Client Timeout

NOT VERIFIED. There is no recovered client timestamp, invocation end timestamp, job `updated_at`, provider timestamp, or quality timestamp with which to compare activity.

## 10. Job Final State

- Final status: NOT VERIFIED
- Error/rejection code: NOT VERIFIED
- Result screens: NOT VERIFIED
- Existing candidate: NOT VERIFIED

## 11. Static Quality

No original RC8 static-quality record was recovered. The RC6 quality-rejection evidence is unrelated and must not be attributed to RC8.

## 12. Existing Candidate Evidence

No RC8 candidate or `result_screens` payload is available locally. No record was modified or replayed.

## 13. Runtime Evidence

No RC8 trusted-renderer, screenshot, bounds, geometry, visual-critic, cross-screen-critic, or runtime-quality evidence was recovered.

## 14. final_eligible

`final_eligible`: NOT VERIFIED.

## 15. Harness Analysis

The previous smoke was executed through a PowerShell command with a 120,000 ms outer command timeout. Repository inspection shows the web generation service allows 180,000 ms for the synchronous create call, while the provider fetch itself has a 45,000 ms abort timeout. The create endpoint performs the generation pipeline before returning; polling begins only after create returns. Therefore the smoke harness is at least **PARTIAL DEFECT**: its 120-second observation window is shorter than the production client’s configured 180-second generation window and cannot distinguish a still-running backend from a failed request.

## 16. Duplicate Call Risk

High if a new idempotency key is used: it can create a new job and issue another provider request. The original random idempotency key was not persisted, so safe replay/recovery through the idempotent path is not currently possible from local artifacts.

## 17. Remaining Certification Gap

The original invocation must be correlated using Supabase dashboard/log access or a privileged read-only database query. Required inputs are the original timestamp window, invocation ID/log record, or the original idempotency key/job token. Until then, Google live authentication and the generation outcome remain unproven.

## 18. Exact Next Action

Obtain read-only Supabase observability/database access, recover the original invocation and `generation_jobs` row, and correlate them with at least two independent signals. Do not run `generate`, create a new idempotency key, modify production, redeploy, create a new RC, or run benchmarks.
