# Floriven Studio — RC12 Final Single Live Smoke

## Verdict

**PARTIAL / BLOCKED FOR RELEASE CERTIFICATION.** The async request architecture is proven live, but this single job terminated with `TECHNICAL_FAILURE` during `provider_pending`. Static quality and runtime evidence were not reached. No rerun was performed.

## Release identity

- Certification SHA: `25050ca052f1f1911d262b0608edbea5c09912c2`
- Tag: `floriven-v2-rc12`
- Deployed `generate`: active version 73
- Production tree match: PASS

## Live async proof

- One generation job created: `157548e9-50e8-42b8-b2e5-688987bcc77c`
- Initial response: HTTP 202, queued job returned promptly
- Same job polled: YES
- Duplicate job: NO
- Observed stages: `queued` → `provider_pending` → `failed`
- Job reached deterministic terminal state: YES
- Caller timeout affected backend: NO evidence of caller timeout; polling observed the terminal job

## Provider

The returned job payload exposed no provider HTTP status or provider attempt count. The job failed from `provider_pending` with `TECHNICAL_FAILURE`; Google 2xx/401/timeout cannot be positively classified from the available returned evidence. Google auth success: **NOT VERIFIED**.

## Static quality and runtime

- Static quality score: NOT REACHED
- Static quality passed: NOT REACHED
- Quality rejection code: NONE
- Generated screen count: NOT VERIFIED
- Trusted screenshot: NOT VERIFIED
- Node bounds: NOT VERIFIED
- Geometry: NOT VERIFIED
- Visual critic: NOT VERIFIED
- Cross-screen critic: NOT VERIFIED
- Runtime quality persisted: NO / NOT REACHED
- Server-derived `final_eligible`: false in the returned terminal state
- F-001: NOT VERIFIED
- F-002: NOT VERIFIED

## Cost accounting

- Generation jobs created: 1
- Harness POST submissions: 1 successful POST; no retry POST
- Additional certification job: 0
- Benchmark/holdout: not run

## Next action

Do not reroll this smoke. Inspect the existing job’s server-side error/log evidence using the same job ID and determine why `TECHNICAL_FAILURE` was persisted while still at `provider_pending`. No further provider call is authorized by this report.
