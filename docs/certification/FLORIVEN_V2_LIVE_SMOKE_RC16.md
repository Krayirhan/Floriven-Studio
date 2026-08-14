# Floriven Studio — RC16 Live Smoke

## Verdict

**FAIL** — the one authorized Finance/Auto job reached `planning` and again ended with `PROVIDER_TRUNCATED_RESPONSE`. No reroll was performed.

## Release identity

- SHA: `122244491110787c36034aef2b60f75e221d05fa`
- Tag: `floriven-v2-rc16`
- Deployed `generate`: version `79`
- Preflight: SHA/tag/deploy/workspace all matched

## Observed job

- Job ID: `969e6afa-c472-4841-a132-e728368ad516`
- Initial HTTP: `202`
- Initial response latency: `21506 ms`
- Observed stages: `queued` → `planning` → `failed`
- Provider complete: NO
- Truncation fix live: FAIL
- Finish reason and token usage: NOT EXPOSED by the polling response

## Certification gates

- Async architecture: PASS (`202` returned before provider; same job polled)
- Static quality, generated screens, batching completion, merge, runtime evidence and server-derived `final_eligible`: NOT VERIFIED
- F-001: NOT VERIFIED
- F-002: NOT VERIFIED

The harness did not preserve the generated idempotency key or timestamp; these values are not inferred. Full available poll evidence is in `evidence/RC16-LIVE-SMOKE-01/`.
