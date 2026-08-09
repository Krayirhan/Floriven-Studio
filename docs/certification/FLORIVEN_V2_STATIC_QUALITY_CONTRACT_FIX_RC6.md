# Floriven Studio — Static Quality Rejection Contract Fix

## 1. Confirmed RC5 Failure

RC5 Finance/Auto live job `29af9f9e-db21-4e3a-b0cb-c0526e04481c` reached static quality, scored 65/100, and returned HTTP 500 after the quality gate rejected inconsistent navigation and three sparse screens.

## 2. Root Cause

The deterministic quality rejection was thrown as an exception and routed through the generic top-level 500 handler.

## 3. Previous Behavior

`qualityReport.passed === false` threw an error, marked the job failed with only `error_message`, and returned HTTP 500. The quality report had already been persisted, but the API did not distinguish quality rejection from infrastructure failure.

## 4. Correct Domain Contract

Quality rejection is now a terminal `failed` job outcome with:

- `error_code = QUALITY_REJECTED`
- `error_message` containing score and issues
- `final_eligible = false`
- `final_decision_reason = STATIC_QUALITY_REJECTED`
- `quality_version = v2`
- `progress = 100`
- `result_screens` preserved for diagnostics

The POST returns the mapped terminal job as a controlled domain result instead of generic HTTP 500.

## 5. Production Changes

- Added `error_code` migration.
- Updated `generate/index.ts` quality rejection branch.
- Added `errorCode` to the client job contract.
- Studio displays a distinct controlled quality rejection status.

Thresholds and quality rules were not changed.

## 6. Job State Changes

Quality failure terminates deterministically as `failed`; it cannot remain queued/processing and cannot become final.

## 7. API / HTTP Contract

Infrastructure exceptions still use the existing error path. Static quality rejection returns a structured terminal job payload with machine-readable `errorCode`.

## 8. Client Handling

The client preserves the terminal failed job, records the quality reason, and does not treat it as final. Studio distinguishes `QUALITY_REJECTED` from an unavailable generation service.

## 9. Regression Fixture

The client test fixture represents a score-65 candidate with `QUALITY_REJECTED`, sparse-screen issue, and `finalEligible: false`.

## 10. Regression Tests

- Controlled quality rejection is terminal.
- Quality rejection remains non-final.
- Quality score/issues are retained in the job contract.
- Polling cannot remain stuck because status is `failed`.
- Existing technical/network error and successful generation tests remain green.

## 11. final_eligible Verification

`isFinalEligibleGeneration()` requires `status === completed` and runtime `finalEligible === true`; a quality-rejected failed job is always false.

## 12. Commands Executed

- `pnpm test`: PASS — DesignSpec 25 files / 73 tests; Web 6 files / 30 tests
- `pnpm type-check`: PASS
- `pnpm lint`: PASS
- `pnpm build`: PASS
- `pnpm certification:security`: PASS
- `pnpm test:generation-architecture`: PASS — 22 tests
- `supabase db push --linked`: PASS

## 13. RC6 Revision

- Production fix commit: `221705d9f2e834af68eebfc6c6b5a6381aa96e34`
- Final RC6 SHA: verified by `git rev-parse HEAD` and `git rev-parse floriven-v2-rc6^{} ` to be identical.
- Tag: `floriven-v2-rc6`

## 14. Deployment Results

- `generate`: redeployed successfully after migration.
- `record-generation-runtime-quality`: unchanged; redeploy not required.
- Remote migration `20260809170000_generation_quality_rejection_contract.sql`: applied.

## 15. Zero-Model Remote Verification

- Remote migration list matches local migrations: PASS.
- `generate` function active and reachable: PASS.
- No provider/model call was made after the RC5 smoke.
- Deployment retained the known non-runtime type-only upload warning; it was not changed in this task.

## 16. Remaining Certification Risk

The corrected rejection contract has not been exercised by a new live generation. The next smoke requires explicit authorization and a new RC6 clean SHA/tag.

## 17. Authorization Required for Next Model Call

Do not run the next live smoke automatically. Explicit provider/model authorization is required.
