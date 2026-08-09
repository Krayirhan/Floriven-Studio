alter table public.generation_jobs
  add column if not exists stage text not null default 'queued',
  add column if not exists provider text,
  add column if not exists provider_attempt integer not null default 0,
  add column if not exists provider_http_status integer,
  add column if not exists error_code text,
  add column if not exists final_eligible boolean not null default false,
  add column if not exists final_decision_reason text,
  add column if not exists quality_version text;

comment on column public.generation_jobs.stage is
  'Observable generation pipeline stage; status remains the coarse terminal/processing state.';
