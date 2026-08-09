# Floriven Studio — Async Generation Architecture

## 1. Previous timeout architecture

`POST /generate` created a job and then awaited provider calls, planning, composition, normalization, static quality, and persistence before returning. This coupled generation completion to the caller and platform request lifetime.

## 2. New async architecture

`POST /generate` now validates the request, inserts the job in `queued` state, schedules `processGenerationJob` through `EdgeRuntime.waitUntil`, and returns immediately. The existing generation pipeline remains in the background function and retains its quality gates.

## 3. Initial HTTP response contract

Successful creation returns HTTP `202` with the mapped job and `jobId`. The initial job state is `queued`, progress `0`, and `finalEligible=false`.

## 4. Job state machine

Coarse status remains compatible with the existing schema: `queued`, `processing`, `completed`, `failed`. Observable `stage` now records `queued`, `provider_pending`, `provider_complete`, `validating`, `static_quality`, `candidate_ready`, `QUALITY_REJECTED`, or `failed`.

## 5. Provider error normalization

Native provider 401/403 responses map to `PROVIDER_AUTH_FAILED`; 5xx responses map to `PROVIDER_UNAVAILABLE`; other non-success responses map to `PROVIDER_BAD_RESPONSE`. The background catch persists the normalized error code and sanitized message. No automatic reroll was added.

## 6. Provider timeout

The provider fetch keeps its explicit 45-second `AbortSignal.timeout`. Provider timeout remains distinct from caller timeout and is persisted as a technical failure unless a more specific provider error is raised.

## 7. Idempotency

The existing `(project_id, idempotency_key)` unique index and input hash remain in place. Duplicate creation with the same key returns the existing job and does not start a second provider-backed generation.

## 8. Background failure handling

`processGenerationJob` has a top-level catch that writes `failed`, `stage=failed`, `error_code`, sanitized `error_message`, progress `100`, and `final_eligible=false`, preventing permanently opaque processing jobs.

## 9. Polling behavior

`generationService.create` returns the queued job immediately. `waitForTerminal` and `useGenerationJob` poll short-lived GET requests with a bounded 120-attempt window. Studio’s redesign flow now uses the same bounded terminal polling path.

## 10. Smoke harness behavior

`scripts/run-live-smoke.mjs` now expects HTTP 202, captures the returned job ID and token, and polls that same job until `completed` or `failed`. It never creates a second idempotency key because polling takes time. It was not executed against a provider during this implementation.

## 11. Wall-clock analysis

The initial HTTP request no longer holds the provider pipeline open. Background execution still has platform wall-clock limits; if real generation exceeds the deployed Edge Runtime limit, the next boundary is a queue/worker split. This implementation establishes the observable/idempotent job boundary without pretending `waitUntil` is unlimited.

## 12. Tests

- Zero-model client tests: PASS (5 tests in generation service suite).
- Full unit suite: PASS (103 tests across existing packages).
- Type-check: PASS.
- Lint: PASS.
- Build: PASS.
- Security audit: PASS.
- Remote CORS preflight: HTTP 200.
- Provider/model calls during implementation: 0.

The requested complete A-001–A-012 mocked worker matrix is not fully present; the current tests cover the client’s 202/idempotency behavior and existing quality contracts. This remains a follow-up test-hardening item.

## 13. New RC SHA/tag

- Async implementation commit: `3ebf2626b3ac635fb2e939d3fecfc96ca19f40a1`, tag `floriven-v2-rc9`.
- Final client polling correction: `f90c8e6d1acaf71130a36f6ddc26c21e12bf5c84`, tag `floriven-v2-rc10`.

RC8 and RC9 were not moved.

## 14. Deployment

- Migration `20260809193000_async_generation_job_state.sql` applied to the linked Supabase project.
- `generate` deployed again from the final RC10 code line; active function version reported as 72.
- `record-generation-runtime-quality` was unchanged and not redeployed.

## 15. Remaining risk

The background function’s actual wall-clock duration and live terminal transitions are not yet provider-verified. The first live smoke must validate the new 202 + same-job polling contract. No live call was made here.

## 16. Authorization required for ONE live smoke

The architecture is ready for exactly one authorized Finance/Auto live smoke using the new polling harness. That smoke should begin only after confirming the final RC SHA/tag and should use one idempotency key throughout.
