# Floriven Studio — Design Engine V2 Certification Report

## 1. Executive Verdict

**NOT CERTIFIED**

Certification spec’in zorunlu invariant’ları için production-path kanıtı eksik ve birden fazla release blocker bulundu. Bu rapor yalnızca audit evidence içerir; certification sırasında production davranışı değiştirilmemiştir.

## 2. Environment and Commands

| Alan | Bulunan komut | Sonuç |
|---|---|---|
| Package manager | `pnpm@9` | VERIFIED |
| Workspace | `pnpm-workspace.yaml`, Turbo | VERIFIED |
| Build | `pnpm build` | PASS |
| Unit tests | `pnpm test` | PASS — DesignSpec 22/63, Web 6/28 |
| Type-check | `pnpm type-check` | NOT RUN in this certification pass; package type-checks were previously green |
| Lint | `pnpm lint` | NOT VERIFIED — command exists but was not run |
| Benchmark catalog | `pnpm benchmarks:validate` | PASS — 7 domains × 6 styles |
| Benchmark generation | `pnpm benchmarks:run --execute` | NOT VERIFIED — external provider credentials/API required; forbidden for this no-model audit |
| E2E | `pnpm test:e2e` | NOT VERIFIED — no certification run evidence |
| Supabase integration | `pnpm test:generation-architecture` | NOT VERIFIED — no live Edge Function/runtime evidence |

The repository source-of-truth path requested by the pasted instruction, `docs/certification/FLORIVEN_V2_CERTIFICATION_SPEC.md`, is absent. The supplied external spec was used as the audit contract; the missing in-repo copy is itself a traceability finding.

## 3. Production Architecture Trace

| Stage | Source / function | Evidence | Status |
|---|---|---|---|
| Dashboard entry | `apps/web/src/features/app/dashboard/useDashboardComposer.ts` | Calls generation service | PARTIAL |
| Client generation adapter | `apps/web/src/services/generationService.ts` | Job request/polling contract | VERIFIED |
| Edge generation | `supabase/functions/generate/index.ts` | ProductBlueprint, planning, composition, normalize, static quality | PARTIAL |
| ProductBlueprint / archetype | `supabase/functions/generate/domain.ts` | Planning and fallback helpers | PARTIAL |
| Presentation renderer | `apps/web/src/features/studio/canvas/PhoneScreen.tsx` | `StudioCanvas → PhoneScreen`; CSS token bridge | VERIFIED |
| Static quality | `supabase/functions/generate/quality.ts` | Quality report persisted to `generation_jobs` | PARTIAL |
| Runtime geometry | `packages/design-spec/src/geometry-validator.ts` | Unit-level validator; no trusted DOM/screenshot adapter found | NOT VERIFIED |
| Visual critic | `packages/design-spec/src/critic-gate.ts` | Score gate exists; actual screenshot critic path not found | NOT VERIFIED |
| Runtime quality persistence | `supabase/functions/record-generation-runtime-quality/index.ts` | Separate write endpoint exists | PARTIAL |
| Final eligibility | `supabase/functions/generate/runtime-quality.ts` | Evaluator exists, but generate completion does not invoke it | RELEASE BLOCKER |

## 4. Release Blockers

### F-001 — Runtime quality is not part of generation finalization

- **Classification:** RELEASE BLOCKER
- **Subsystem:** Runtime quality / final eligibility
- **Files:** `supabase/functions/generate/index.ts`, `supabase/functions/generate/runtime-quality.ts`, `supabase/functions/record-generation-runtime-quality/index.ts`
- **Production path:** `generate/index.ts` computes static `qualityReport`, persists it, and completes the job; runtime quality is only exposed through a separate recorder endpoint.
- **Invariant / Rule:** Trusted renderer → geometry → visual critic → runtime quality → `finalEligible` must gate FINAL.
- **Reproduction:** `rg -n "finalEligible|runtime_quality_report" supabase/functions/generate/index.ts supabase/functions/record-generation-runtime-quality/index.ts`
- **Expected:** Every completed generation has trusted runtime evidence and server-derived final eligibility.
- **Actual:** `generate/index.ts` does not call `evaluateRuntimeQuality`; `if (false && !qualityReport.passed)` is a disabled quality failure branch.
- **Evidence:** `supabase/functions/generate/index.ts:188-195`; `supabase/functions/generate/runtime-quality.ts:34-50`.
- **Why it matters:** A generation can complete without geometry, screenshot critic, cross-screen critic, or runtime final gate evidence.
- **Recommended fix:** Make runtime evidence mandatory before completion/final eligibility and remove the disabled gate.
- **Blocks release:** Yes

### F-002 — Actual rendered-output visual critic is not verified

- **Classification:** RELEASE BLOCKER
- **Subsystem:** Trusted renderer / visual critic
- **Files:** `packages/design-spec/src/critic-gate.ts`, `packages/design-spec/src/runtime-quality.ts`
- **Production path:** No trusted screenshot or DOM-bounds producer is connected to the generation path in the audited repository.
- **Invariant / Rule:** Visual critic must judge actual rendered output, not only JSON/tree data.
- **Reproduction:** `rg -n "screenshot|page.screenshot|rendered bounds|visual critic" supabase/functions apps/web packages/design-spec`
- **Expected:** Rendered screenshots and geometry evidence are produced and persisted for each final candidate.
- **Actual:** Only score/evidence contracts and unit tests are present.
- **Evidence:** `packages/design-spec/src/critic-gate.ts:4-15`; no production screenshot producer found.
- **Why it matters:** Schema-valid but visually broken output can pass without trusted visual evidence.
- **Recommended fix:** Add a trusted renderer/evidence producer and make its evidence mandatory.
- **Blocks release:** Yes

### F-003 — Unsupported renderer components silently return null

- **Classification:** RELEASE BLOCKER
- **Subsystem:** Renderer sabotage resistance
- **Files:** `apps/web/src/features/studio/canvas/PhoneScreen.tsx`, `apps/web/src/features/studio/canvas/componentRegistry.ts`
- **Production path:** `DesignNodeRenderer` first checks `isComponentType`; unsupported types return `null`.
- **Invariant / Rule:** Unsupported renderer components must not create silent empty output.
- **Reproduction:** Pass a node whose `type` is not in `COMPONENT_TYPES` to `PhoneScreen`.
- **Expected:** Hard issue, visible error state, or final eligibility failure.
- **Actual:** `if (!isComponentType(node.type)) return null;`.
- **Evidence:** `apps/web/src/features/studio/canvas/PhoneScreen.tsx` renderer entry; no certification fixture for unsupported output.
- **Why it matters:** Missing UI can be mistaken for valid empty content and survive to preview/final paths.
- **Recommended fix:** Emit a deterministic renderer issue and block final eligibility.
- **Blocks release:** Yes

### F-004 — Duplicate node ID hard gate is not verified

- **Classification:** RELEASE BLOCKER
- **Subsystem:** DesignSpec identity / repair safety
- **Files:** `packages/design-spec/src/types.ts`, `packages/design-spec/src/patch-validator.ts`
- **Production path:** Patch validator checks targets and add-node collisions but no document-wide duplicate-ID validator was found.
- **Invariant / Rule:** Duplicate node IDs must not survive normalization or FINAL.
- **Reproduction:** Create two nodes with the same ID in separate branches and run the generation/quality path.
- **Expected:** Deterministic hard failure.
- **Actual:** No production duplicate-ID check was found; existing patch tests cover collision only.
- **Evidence:** `packages/design-spec/src/patch-validator.ts:5-16`; `rg -n "DUPLICATE_NODE_ID"` returned no production implementation.
- **Why it matters:** Selection, targeted repair, and semantic identity become ambiguous.
- **Recommended fix:** Add duplicate-ID validation to normalization and final gates.
- **Blocks release:** Yes

## 5. Hard Invariant Results

| Invariant | Result | Evidence |
|---|---|---|
| Style cannot mutate semantics | PARTIAL | semantic hash unit tests and prompt separation exist; production parity run not verified |
| Preset parity 100% | NOT VERIFIED | no six-mode production semantic parity matrix |
| Auto parity 100% | NOT VERIFIED | deterministic resolver unit tests only |
| Nested Card FINAL impossible | PARTIAL | surface tests and static metric exist; final pipeline integration not proven |
| Empty interactive surface FINAL impossible | NOT VERIFIED | no production validator/evidence found |
| Invalid FAB FINAL impossible | PARTIAL | static quality rules and action tests exist; runtime final gate disconnected |
| Focused flow bottom nav FINAL impossible | PARTIAL | static quality/action tests exist; final gate disconnected |
| Duplicate page heading FINAL impossible | PARTIAL | typography validator exists; production path integration not proven |
| Unsupported component silent failure = 0 | FAIL | F-003 |
| Duplicate node ID = 0 | FAIL | F-004 |
| Critical geometry cannot FINAL | FAIL | F-001/F-002 |
| Critical static issue cannot FINAL | FAIL | disabled gate at `index.ts:194` |
| Client cannot forge finalEligible | NOT VERIFIED | no adversarial endpoint test run |
| Trusted evidence required | FAIL | F-001/F-002 |
| Repair preserves unrelated semantics | PARTIAL | local repair tests exist; full pipeline/hash regression not verified |

## 6. Semantic / Presentation Isolation

The shared `semantic-hash.ts`, `PresentationSpec`, `VisualConcept`, and `StyleGrammar` contracts have passing unit tests. This proves local contract behavior, not production generation parity. No certification matrix covering the same semantic input across Auto and all five preset modes was executed; result: **NOT VERIFIED**.

## 7. Preset Single Source of Truth

The backend now imports `findDesignTemplate` from the shared strategy source, and dashboard/template metadata imports `DESIGN_TEMPLATES`. Manual `TEMPLATE_STRATEGIES` and `STYLE_COMPOSITIONS` were removed from `generate/index.ts`. Canonical catalog ownership is therefore **PASS for the audited static path**, but generated Edge deployment parity was not verified.

## 8. Surface / Card Certification

Unit tests cover nested cards, sparse cards, card-as-section, excessive cardization, redundant surfaces, and excessive surface depth. The generation path does not show a call to `validateSurfaceSemantics`; it relies on separate quality logic. Result: **PARTIAL**, not production-certified.

## 9. Structural Tree Certification

`tree-simplifier.ts` and `lintTreeStructure()` have unit coverage for single-child wrappers and depth. No call from `normalizeScreens()` to the shared simplifier/linter was found. Result: **PARTIAL**.

## 10. Archetype Certification

### Dashboard

Static archetype and pattern contracts exist. Production hardening integration: **NOT VERIFIED**.

### Dense List

Pattern allowlist and action rules exist. Production generation enforcement: **PARTIAL**.

### Detail

Focused navigation policy exists. Runtime final enforcement: **PARTIAL**.

### Form

`archetype-hardening.ts` tests require `FormSection`, `FormField`, and `Button`, and reject FAB/bottom navigation. Production path does not call this validator: **NOT VERIFIED**.

### Settings

`SettingsRow` requirement and Card grouping rejection are unit-tested. Empty selector and runtime renderer safety are not proven: **PARTIAL**.

### Analytics

`ChartSpec` and archetype tests require insight metadata. Actual question → metric → visualization → insight production chain is not proven: **PARTIAL**.

## 11. Typography and Viewport Certification

The shared validator covers display restrictions, heading lines, duplicate headings, raw spacing, oversized blocks, density, and above-fold task checks. Extreme Turkish/long-content torture suite was not executed against trusted rendered output: **NOT VERIFIED**.

## 12. Action and Navigation Certification

Unit tests cover create/add/compose FAB intents, invalid FABs, duplicate primary actions, sort emphasis, focused navigation, invalid active states, and duplicate targets. Runtime final integration remains blocked by F-001: **PARTIAL**.

## 13. Renderer Certification

PhoneScreen consumes PresentationSpec CSS variables and has 11 unit tests. Unsupported-node behavior is silent null return, so renderer certification is **RELEASE BLOCKER** under F-003.

## 14. Geometry Certification

`createGeometryReport()` supports node-level issues and overlap pairs, with unit tests. Trusted rendered bounds producer and final integration are absent from evidence: **RELEASE BLOCKER** under F-001/F-002.

## 15. Typed Content / Locale

Typed content validators and unit tests exist. Production renderer-through-locale evidence for Turkish currency, date, percentage, extreme values, and raw-string fallback was not verified: **NOT VERIFIED**.

## 16. Preset Parity

StyleGrammar coverage exists for all five presets. Six-mode semantic hash parity execution was not performed: **NOT VERIFIED**.

## 17. Auto Mode Certification

Deterministic `VisualConcept` and `auto-safe-neutral` unit tests pass. The required 12 unrelated-domain diversity matrix and production Auto pipeline evidence were not executed: **NOT VERIFIED**.

## 18. Runtime Quality / finalEligible Security

The evaluator correctly returns false when geometry/critic evidence is missing in unit tests. However, the generation completion path does not invoke it, and the separate recorder endpoint is the only observed runtime writer. Result: **RELEASE BLOCKER**.

## 19. Visual Critic Certification

Threshold logic exists, but the certification spec requires actual rendered output and a stricter threshold set than the currently observed gate. No screenshot-based critic evidence was found: **RELEASE BLOCKER**.

## 20. Repair Loop Certification

Targeted repair contracts and tests exist; they validate node targeting and bounded cycles. Full red-team injection of nested Card + oversized heading + invalid FAB through production render/re-render was not executed: **PARTIAL / NOT VERIFIED**.

## 21. Cross-Screen Certification

Structural diversity metrics exist in `quality.ts`, but no trusted cross-screen critic evidence or consistency/differentiation matrix was found: **NOT VERIFIED**.

## 22. Known Benchmark Results

Existing `docs/benchmarks/results/2026-08-09T11-14-03-848Z.json` is marked `sourceRevision: local-uncommitted`, contains provider quota failures, and covers 7 domains rather than the certification spec’s 12-domain matrix. It is not a valid final certification benchmark. Result: **NOT VERIFIED**.

## 23. Holdout Results

No repository holdout set was found. Per certification protocol: **AWAITING EXTERNAL HOLDOUT SET**. No holdout result was invented.

## 24. Performance Regression

No certification baseline with p50/p95 latency, token cost, repair cycles, or render/critic latency was produced. Result: **NOT VERIFIED**.

## 25. Security / Bypass Attempts

Client `finalEligible=true`, missing trusted evidence, and critical-issue/high-average bypass tests were not executed against a live endpoint. Because finalization is not wired into `generate/index.ts`, the bypass audit cannot pass: **RELEASE BLOCKER**.

## 26. Major Issues

- F-001: runtime quality is not mandatory in generation finalization.
- F-002: trusted rendered-output visual critic is not verified.
- F-003: unsupported renderer components silently return null.
- F-004: duplicate node ID hard gate is not verified.

## 27. Minor Issues

- Certification spec is not present at the required in-repo source-of-truth path.
- Certification benchmark catalog is smaller than the required 12-domain matrix.
- Full lint, E2E, Supabase integration, holdout, and performance certification evidence is absent.

## 28. Metrics Dashboard

| Metric | Certification result |
|---|---:|
| semanticParityPassRate | NOT VERIFIED |
| nestedCardCount | NOT VERIFIED on certification generation set |
| emptyInteractiveSurfaceCount | NOT VERIFIED |
| invalidFabCount | NOT VERIFIED on certification generation set |
| focusedFlowBottomNavViolationCount | NOT VERIFIED on certification generation set |
| duplicateHeadingCount | NOT VERIFIED on certification generation set |
| unsupportedRendererCount | At least silent-failure path exists |
| duplicateNodeIdCount | NOT VERIFIED; no hard gate found |
| overflowCount / overlapCount | NOT VERIFIED from trusted rendered output |
| repairSuccessRate | Unit-level only |
| generationLatencyP50/P95 | NOT VERIFIED |
| averageTokenCost | NOT VERIFIED |

## 29. Final Release Decision

**NOT CERTIFIED**

The repository contains substantial V2 contracts and passing unit tests, but certification requires production-path enforcement and trusted rendered evidence. The identified release blockers prevent a FINAL release certification.

