alter table public.generation_jobs
  add column if not exists quality_report jsonb;

comment on column public.generation_jobs.quality_report is
  'Deterministic post-generation quality evaluation; contains scores and issue codes, never raw prompts.';
