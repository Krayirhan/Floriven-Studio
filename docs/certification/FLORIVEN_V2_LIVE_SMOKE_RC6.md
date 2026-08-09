# Floriven Studio Design Engine V2 — RC6 Live Smoke

## 1. Smoke Verdict

**PARTIAL** — the real provider-backed candidate reached the corrected static quality rejection contract. It did not continue to runtime rendering because static quality correctly failed.

## 2. RC Identity

- Branch: `master`
- SHA: `64555468bf3f74eefdf75e6b591f93b1e925f37e`
- Tag: `floriven-v2-rc6`
- Workspace: clean before smoke

## 3. Model Call Accounting

- Certification cases: 1
- Provider/model calls: 2 total (one initial provider quota failure plus one permitted infrastructure retry)
- Technical retries: 1
- No second domain or preset was run.

## 4. Request / Job

- Case: Finance / Auto
- Final job ID: `fb0042d3-16cd-4ed3-8461-7ffb3d23e928`
- Job status: `failed`
- Request and job evidence: `docs/certification/evidence/RC6-LIVE-SMOKE-01/`

## 5. Provider Result

The first request failed before a candidate because all configured providers reported minute quota exhaustion. The single allowed infrastructure retry produced a candidate and reached static quality evaluation.

## 6. Generation Path

Confirmed through database evidence: request → provider-backed generation → candidate processing → static quality report persistence → controlled quality rejection. No runtime renderer stage was reached.

## 7. Static Quality

- Score: **70/100**
- Passed: **false**
- Issues: inconsistent bottom navigation; two sparse screens
- `nestedCardCount`: 0
- `invalidFabCount`: 0
- `focusedFlowBottomNavViolations`: 0
- `oversizedHeadingCount`: 0
- Screen count metric: 7

## 8. RC6 Quality Rejection Contract

**PASS**. The candidate was not converted into a generic HTTP 500. The remote job contains `error_code = QUALITY_REJECTED`, `status = failed`, `progress = 100`, quality report, and `final_eligible = false`.

## 9. Candidate Persistence

The job row and quality report were persisted. Runtime candidate screens were not inspected further because the contract terminates at static rejection.

## 10. Trusted Renderer

NOT REACHED — static quality rejected the candidate before runtime rendering.

## 11. Geometry

NOT REACHED.

## 12. Visual Critic

NOT REACHED.

## 13. Cross-Screen Critic

NOT REACHED.

## 14. Runtime Quality

NOT PERSISTED for this candidate because static quality rejected before runtime evidence collection.

## 15. final_eligible

Server/database state: **false**. The client did not author or override this value.

## 16. F-001

**NOT VERIFIED** — static rejection correctly stopped the candidate before runtime finalization. No evidence suggests FINAL occurred without runtime evidence.

## 17. F-002

- Trusted screenshot: NOT VERIFIED
- Node bounds: NOT VERIFIED
- Geometry: NOT VERIFIED
- Visual critic: NOT VERIFIED
- Cross-screen critic: NOT VERIFIED
- Runtime persistence: NOT VERIFIED for this smoke

## 18. F-003

FIXED LOCALLY — NEGATIVE LIVE SABOTAGE PENDING.

## 19. F-004

FIXED LOCALLY — NEGATIVE LIVE SABOTAGE PENDING.

## 20. Remaining Blockers

- Finance/Auto static quality remains below release threshold.
- Runtime/critic chain is not exercised by a statically rejected candidate.
- Full benchmark remains unstarted.

## 21. Exact Next Action

Do not reroll this case. Investigate the Finance/Auto quality deficiencies deterministically, or request authorization for the next controlled smoke only after deciding how to address the failing navigation/sparse-screen output.
