# 17 — Observability & Product Metrics

## Generation metrics

- generation_success_rate
- provider_failure_rate
- enhanced_candidate_acceptance_rate
- deterministic_fallback_rate
- generation_latency_ms

## Renderer metrics

- render_latency_ms
- unsupported_component_count
- clipping_count
- overlap_count
- font_violation_count
- touch_target_violation_count

## Design metrics

- screen_job_distance
- preset_structural_distance
- visual_critic_score
- cross_screen_score
- hierarchy_score
- chart_quality_score

## User-product signals

- immediate_regeneration_rate
- first_5_minute_edit_count
- preset_switch_rate
- export_after_generation_rate
- abandoned_generation_rate

## Certification metrics

- certification_session_success
- studio_hydration_failure
- screenshot_capture_failure
- bounds_capture_failure
- runtime_quality_pass_rate
- final_eligible_rate

## Alerting

P0 alert:
- final eligible without runtime evidence
- cross-job certification access
- candidate hash mismatch accepted

P1:
- unsupported renderer node > 0
- clipping spike
- screenshot failure spike
