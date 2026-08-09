alter table public.generation_jobs
  add column if not exists runtime_quality_report jsonb;

comment on column public.generation_jobs.runtime_quality_report is
  'Trusted renderer and critic evidence. Final eligibility is computed server-side and no raw screenshots are stored.';
