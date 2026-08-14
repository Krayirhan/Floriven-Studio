-- Makes generation_v3_jobs resumable across multiple Edge Function invocations instead of
-- depending on one background run finishing within Supabase's own execution ceiling (free tier:
-- 150s). Persists the original request (so a run resumed from a GET poll, which only carries
-- jobId + jobToken, can reconstruct its planning input) and a per-work-item checkpoint.
alter table public.generation_v3_jobs
  add column if not exists brief text not null default '',
  add column if not exists platform text not null default 'ios',
  add column if not exists locale text,
  add column if not exists device_profile text,
  add column if not exists requested_screen_count integer,
  add column if not exists planning_state jsonb;

alter table public.generation_v3_jobs
  drop constraint if exists generation_v3_jobs_platform_check;

alter table public.generation_v3_jobs
  add constraint generation_v3_jobs_platform_check
  check (platform in ('ios', 'android', 'web'));

comment on column public.generation_v3_jobs.planning_state is
  'Incremental checkpoint of V3PlanningState after every single work item (see planning-pipeline.ts) — what makes a run resumable across as many separate invocations as it takes.';
