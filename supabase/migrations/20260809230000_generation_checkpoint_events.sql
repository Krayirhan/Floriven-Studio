alter table public.generation_jobs
  add column if not exists provider_events jsonb not null default '[]'::jsonb,
  add column if not exists generation_checkpoint text;

comment on column public.generation_jobs.provider_events is 'Append-only safe provider operation summaries.';
comment on column public.generation_jobs.generation_checkpoint is 'Last idempotent generation checkpoint.';
