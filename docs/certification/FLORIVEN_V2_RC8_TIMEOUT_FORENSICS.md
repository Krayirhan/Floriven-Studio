# Floriven Studio — RC8 Smoke Timeout Forensics

## 1. RC8 Identity

- Branch: `master`
- Current SHA: `ecbdd2eacd8f084fa7cbf0e1d98e5ca7e40fc2cd`
- Tag: `floriven-v2-rc8`
- Tag SHA: `ecbdd2eacd8f084fa7cbf0e1d98e5ca7e40fc2cd`
- Workspace: clean
- Deployed `generate`: active, Supabase function version 70. The deployment command completed from the exact RC8 SHA.

## 2. Timed-Out Invocation

The invocation was the single Finance / Auto request issued immediately after RC8 deployment with project id `rc8-finance-auto`. The caller did not receive an HTTP response before its 120-second command limit. No invocation request ID, eventual HTTP status, or server duration was returned to the caller.

The exact idempotency key was generated in-memory by the smoke harness and was not persisted in the repository output. Therefore, the specific remote invocation cannot be correlated deterministically from local artifacts alone.

## 3. Google Authentication Result

- Google request started: NOT VERIFIED
- Google response received: NOT VERIFIED
- Google HTTP status: N/A
- Google auth 401: NOT VERIFIED
- Live auth fix proven: NO — the timeout alone is not evidence of either success or failure.

## 4. Google Provider Result

No provider response body, provider timing, or Edge Function invocation log was available from the timed-out client result. The RC8 code path now constructs native Gemini headers with only `x-goog-api-key`; this is covered by a zero-model regression test, but it is not live proof.

## 5. Generation Job Record

The exact timed-out job row could not be recovered from local output because the generated idempotency key and job id were not persisted. Anonymous REST access is not sufficient to enumerate protected `generation_jobs` rows, and no provider/model call was made to probe the original request.

- Job row: NOT VERIFIED
- Job ID: NOT VERIFIED
- Status: NOT VERIFIED
- Error/rejection code: NOT VERIFIED
- Result screens: NOT VERIFIED
- Static quality: NOT VERIFIED
- Runtime quality: NOT VERIFIED
- Final eligible: NOT VERIFIED

## 6. Furthest Pipeline Stage

| Stage | Result |
|---|---|
| Request accepted | NOT VERIFIED |
| Auth / job row creation | NOT VERIFIED |
| Google request / response | NOT VERIFIED |
| Provider parsing through static quality | NOT VERIFIED |
| Candidate persistence | NOT VERIFIED |
| Runtime quality / final eligibility | NOT VERIFIED |

## 7. 120s Timeout Owner

The observed 120-second limit belonged to the local PowerShell smoke command (`timeout_ms: 120000`). Repository inspection found:

- Web generation create timeout: `GENERATION_TIMEOUT_MS = 180_000`.
- Provider request timeout: `AbortSignal.timeout(45_000)`.
- Playwright test timeout: `120_000`.

Therefore the strongest confirmed classification is **local smoke harness timeout**. Whether the backend continued after the client process stopped is NOT VERIFIED.

## 8. Async Job Contract

The current `generate` Edge Function creates a job row, but then performs the full generation pipeline synchronously before returning the mapped final job. The web service polls only after the create request returns. Thus the production implementation is currently synchronous from the caller’s perspective, with persisted job state used for access/idempotency and later reads.

## 9. Duplicate Cost Risk

Repeating the exact request with the same `(project_id, idempotency_key)` is protected by a unique index and returns the existing job when the matching job token is supplied. Repeating with a new idempotency key would create another job and could issue another provider call. Because the original key was not persisted, a safe recovery lookup is unavailable from local artifacts.

## 10. Existing Evidence Recoverability

No local job id, request id, server log, or final response was captured. Existing RC8 evidence proves deployment identity and header behavior, not this live invocation’s outcome.

## 11. Whether Another Model Call Is Actually Needed

**Not now.** The timeout owner is identified as the local 120-second harness, but the remote job/provider outcome remains unverified. A second call would risk duplicate provider cost and cannot be justified until Supabase invocation logs or the original job record are recovered.

## 12. Exact Next Action

Recover the original invocation through Supabase dashboard/log access or a privileged, read-only database query using the original idempotency key/job token. Inspect the job status and function logs. Do not deploy, modify production code, run the benchmark, or start another model call before that evidence is available.
