# 21 — Release Candidate Certification Runbook

## Preconditions

- clean workspace
- candidate SHA recorded
- build reproducible
- migration status known
- feature flags frozen

## Static stage

Run:
- typecheck
- lint
- unit
- integration
- generation fixtures
- structural quality

Expected:
- all PASS

## Visual stage

For each canonical preset:
- 6 core screens
- real 390×844 runtime
- fonts ready
- screenshot
- bounds
- geometry report

Expected:
- zero critical geometry violation

## Cross-screen stage

Check:
- archetype distance
- repeated skeleton collision
- nav consistency
- hierarchy diversity

## Cross-preset stage

Check:
- grayscale screenshots
- layout distance
- component family distance
- chart family distance

## Accessibility

- focus
- keyboard
- contrast
- touch targets
- reduced motion

## Runtime certification

1. request certification session
2. open read-only Studio
3. verify candidate hash
4. hydrate real screens
5. capture evidence
6. persist RuntimeQualityReport
7. compute server final eligibility

## Final release report

```text
STATIC: PASS/FAIL
PRESENTATION: PASS/FAIL
GEOMETRY: PASS/FAIL
VISUAL: PASS/FAIL
CROSS_SCREEN: PASS/FAIL
CROSS_PRESET: PASS/FAIL
A11Y: PASS/FAIL
SECURITY: PASS/FAIL
FINAL_ELIGIBLE: true/false
```
