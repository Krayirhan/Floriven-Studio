# Floriven Studio — RC5 Generate HTTP 500 Root Cause

## 1. Verdict

**ROOT CAUSE CONFIRMED**

The HTTP 500 was not caused by provider transport, JSON parsing, deployment import resolution, or database persistence. The provider-backed generation reached static quality evaluation, produced a quality report, failed the quality gate with score **65/100**, and the top-level handler returned HTTP 500.

Primary category: **GENERATION LOGIC / STATIC QUALITY GATE**.

## 2. Release / Deployment Identity

- Branch: `master`
- SHA: `f2d18f076be7ad96c9a98227072b5aaccddc39e1`
- Tag: `floriven-v2-rc5`
- Workspace at pre-smoke check: clean
- Supabase project: `ndhuwqzznivzscjqtxbj`
- `generate`: ACTIVE, version 65
- `record-generation-runtime-quality`: ACTIVE, version 6
- Both functions were deployed before the smoke from the RC5 workspace.

The audit workspace is dirty now only because diagnostic evidence/report files were created after the smoke. No production code was changed during this audit.

## 3. Failed Invocation

- Project marker: `rc5-live-smoke-01`
- Mode: `auto`
- Case: Finance
- Job ID: `29af9f9e-db21-4e3a-b0cb-c0526e04481c`
- Job created: `2026-08-09 16:29:04.734923+00`
- Job updated: `2026-08-09 16:29:12.668335+00`
- Final HTTP response: 500
- Idempotency key: recorded in `docs/certification/evidence/RC5-LIVE-SMOKE-01/request.json`

## 4. Edge Function Logs

The CLI version available in the workspace has no `supabase functions logs` command, so platform invocation logs/stack trace were not retrievable through the installed CLI. The database record provides a deterministic server-generated error message and exact failing stage.

## 5. Furthest Confirmed Pipeline Stage

| Stage | Result | Evidence |
|---|---|---|
| Request validation | PASS | Job row created |
| Auth/configuration | PASS | Function reached generation |
| Provider invocation | PASS / inferred from completed generation stages | Quality report exists |
| Provider response parse | PASS / inferred | Blueprint/normalization reached quality |
| ProductBlueprint/planning | PASS | `quality_report.metrics.blueprintAlignment = 1` |
| Normalization | PASS / inferred | Static metrics produced |
| Static quality evaluation | **FAIL** | score 65, two issues |
| Candidate persistence | NOT REACHED | `result_screens` is null |
| Response serialization | NOT REACHED | error path returned 500 |

## 6. Provider Status

The provider was called once as part of the single authorized smoke. A valid upstream result was processed far enough to produce a ProductBlueprint-aligned screen set and persisted static quality report. The failure occurred after provider processing, at the local static quality gate. No retry was performed.

## 7. Database Side Effects

Actual remote query result for `generation_jobs`:

- Job row: **EXISTS**
- Status: `failed`
- Progress: `85`
- Result screens: `null`
- Static quality report: **PERSISTED**
- Error message: `Tasarım kalite kapısını geçemedi (65/100): Alt navigasyon tüm ekranlarda aynı değil. 3 ekran yeterli içerik yoğunluğuna sahip değil.`
- `final_eligible`: `false`
- `final_decision_reason`: `null`
- `quality_version`: `v2`

## 8. Deployment Dependency Investigation

The deploy emitted a warning while uploading the dependency graph: `failed to read file: open packages/design-spec/src/types: no such file or directory`. Local source inspection shows `identity-validator.ts` imports `DesignNode` and `DesignSpec` with `import type`, so the import is erased at runtime. `strategy.ts` does not import `./types` at runtime. The live job reached static quality and persisted its report, so this warning is **not the observed HTTP 500 root cause**.

## 9. Environment Verification

- Supabase function was active and reachable: PASS.
- Supabase schema columns `final_eligible`, `final_decision_reason`, and `quality_version`: present and queryable.
- Provider credentials: not exposed; provider processing reached quality evaluation.
- Exact provider environment values: NOT VERIFIED without exposing secrets.

## 10. Failing Source Path

The failing path is:

`supabase/functions/generate/index.ts` → `evaluateGenerationQuality(...)` → `if (!qualityReport.passed)` at approximately line 194 → `throw new Error(...)` → top-level catch → `update({ status: 'failed', error_message: msg })` → HTTP 500.

The source path is corroborated by the exact persisted database error message.

## 11. Root Cause

**GENERATION LOGIC / STATIC QUALITY**

The generated Finance/Auto candidate failed two static quality invariants:

1. `navigationConsistency = 0`: bottom navigation was not consistent across screens.
2. `sparseScreens = 3`: three screens did not meet the required content density.

The resulting quality report was `passed: false`, `score: 65`. The function intentionally converts this quality rejection into HTTP 500.

## 12. Contributing Causes

- The client receives an internal-server-error-shaped response for a deterministic candidate quality rejection.
- The failed job does not persist `final_decision_reason` for this static rejection.
- `result_screens` is not persisted on failed static quality, limiting post-failure renderer evidence.

These are secondary observability/contract concerns; they are not the root cause of this invocation’s failure.

## 13. Required Fix

No fix was applied during this diagnostic audit. A separate approved development task should decide whether static quality rejection remains HTTP 500 or becomes a structured failed-candidate response, and whether rejected candidate evidence should be retained safely.

## 14. Required Regression Test

Add a zero-model generation-quality regression fixture asserting that a Finance/Auto-shaped candidate with inconsistent navigation and three sparse screens:

- produces the exact quality issues,
- remains `passed: false`,
- cannot become `final_eligible`,
- persists a deterministic failure reason.

## 15. Redeployment Requirement

**Not required for this diagnostic conclusion.** Redeployment is required only after an approved production-code fix.

## 16. New RC Requirement

If production code or the quality contract is changed, create a new clean RC tag and rerun zero-model checks before any new provider smoke.

## 17. Safe Next Action

Do not retry the provider call. Create a separate implementation task for the static quality failure/HTTP error contract, add deterministic regression coverage, run the zero-model suite, redeploy, and create a new RC before requesting another single smoke.
