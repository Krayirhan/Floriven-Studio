-- Support the render-evidence verification flow: jobs now park at awaiting_render/render_verifying
-- while the client submits live DOM evidence, and store the intermediate planning output needed
-- to validate that evidence against the compiled screens.
alter table public.generation_v3_jobs
  add column if not exists planning_output jsonb;

alter table public.generation_v3_jobs
  drop constraint if exists generation_v3_jobs_status_check;

alter table public.generation_v3_jobs
  add constraint generation_v3_jobs_status_check
  check (status in ('queued', 'processing', 'awaiting_render', 'render_verifying', 'completed', 'failed'));
