# Floriven Studio — RC14 Live Smoke

## Verdict

**FAIL** — the single authorized Finance/Auto job reached Google provider processing but failed with `PROVIDER_TRUNCATED_RESPONSE`. No reroll was performed.

## Release identity

- SHA: `10e0e096a50a2f547d614f2d2c7bc765db08fb1c`
- Tag: `floriven-v2-rc14`
- Deployed `generate`: version `77`
- Workspace: clean before invocation

## Observed job

- Job ID: `90b4f8dc-a422-40c1-97c1-d2c91845d4a7`
- Initial HTTP: `202`
- Initial response latency: `12659 ms`
- POST returned before provider: YES
- Same job polled: YES
- Duplicate job: NO
- Observed stages: `queued` → `provider_pending` → `failed`
- Provider: Google
- Provider complete: NO
- Parser result: `PROVIDER_TRUNCATED_RESPONSE`

## Quality and runtime

Static quality, generated screens, trusted screenshot, node bounds, geometry, visual critic, cross-screen critic, runtime persistence, and server-derived `final_eligible`: **NOT VERIFIED**.

F-001: NOT VERIFIED  
F-002: NOT VERIFIED  
Async architecture live: PASS for early `202` and same-job polling  
Terminal state: `failed`

The harness did not preserve the generated idempotency key or a timestamp; these are explicitly not inferred. Full raw poll evidence is in `evidence/RC14-LIVE-SMOKE-01/`.
