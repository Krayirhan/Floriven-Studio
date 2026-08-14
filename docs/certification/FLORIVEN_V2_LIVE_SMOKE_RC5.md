# Floriven Studio Design Engine V2 — RC5 Live Smoke

## 1. Smoke Verdict

**FAIL** — the single live generation returned HTTP 500 before a valid candidate was produced.

## 2. Release Candidate

- Branch: `master`
- SHA: `f2d18f076be7ad96c9a98227072b5aaccddc39e1`
- Tag: `floriven-v2-rc5`
- Clean: YES before smoke; report artifacts make the workspace dirty afterward.
- Supabase project: `ndhuwqzznivzscjqtxbj`

## 3. Model Call Accounting

- Authorized certification cases: 1
- Cases attempted: 1
- Provider/model retries: 0
- Provider/model identifier: NOT AVAILABLE

## 4. Request / Job

- Design mode: `auto`
- Domain: Finance
- Request timestamp: `2026-08-09` audit session
- Job ID: NOT AVAILABLE — the function returned HTTP 500 without a valid response payload.
- Idempotency key: recorded in `evidence/RC5-LIVE-SMOKE-01/request.json`
- Secrets: not recorded.

## 5. Live Production Path Trace

The request reached the deployed `generate` Edge Function boundary, which returned HTTP 500. No valid runtime candidate was returned, so downstream stages cannot be claimed as executed.

## 6. Generated Screen Set

NOT AVAILABLE — no valid candidate response.

## 7. Static Quality

NOT AVAILABLE for a live candidate. Local precheck was green.

## 8. Semantic Hash / Auto Presentation

NOT AVAILABLE for a live candidate.

## 9. Trusted Renderer Evidence

### Screenshot

NOT AVAILABLE.

### Bounds

NOT AVAILABLE.

### Geometry

NOT AVAILABLE.

## 10. Visual Critic

NOT AVAILABLE.

## 11. Cross-Screen Critic

NOT AVAILABLE.

## 12. Runtime Quality Persistence

NOT VERIFIED — no job ID or valid candidate response was returned.

## 13. final_eligible Proof

NOT VERIFIED for this smoke job. No valid job record was exposed by the failed request.

## 14. F-001 Status

**NOT VERIFIED**. The live candidate did not reach runtime finalization. No retry was made.

## 15. F-002 Status

- Trusted screenshot: NOT VERIFIED
- Node bounds: NOT VERIFIED
- Geometry: NOT VERIFIED
- Visual critic: NOT VERIFIED
- Cross-screen critic: NOT VERIFIED
- Runtime evidence persistence: NOT VERIFIED

## 16. F-003 Observation

FIXED LOCALLY — NEGATIVE LIVE SABOTAGE STILL PENDING. This normal request produced no candidate and cannot prove the negative case.

## 17. F-004 Observation

FIXED LOCALLY — NEGATIVE LIVE SABOTAGE STILL PENDING. This normal request produced no candidate and cannot prove the negative case.

## 18. Quality Metrics

All live candidate metrics: NOT AVAILABLE.

## 19. Runtime / Performance

Only the request failure is known: HTTP 500. Provider identity, timings, and cost are NOT AVAILABLE.

## 20. Missing Evidence

ProductBlueprint, UXSpec, semantic DesignSpec, semantic hash, PresentationSpec, result screens, static quality, screenshot, bounds, geometry, critics, runtime quality, final decision, job record.

## 21. Exact Next Action

Do not retry under this smoke authorization. Investigate the deployed function’s HTTP 500 using Supabase server logs and deployment diagnostics. A future retry requires a new explicit one-case authorization.
