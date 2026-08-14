alter table public.generation_jobs
  add column if not exists provider_duration_ms integer,
  add column if not exists failed_stage text,
  add column if not exists provider_metadata jsonb not null default '{}'::jsonb;

comment on column public.generation_jobs.provider_metadata is
  'Sanitized provider attempt metadata; never contains keys, tokens, prompts, or raw response bodies.';
