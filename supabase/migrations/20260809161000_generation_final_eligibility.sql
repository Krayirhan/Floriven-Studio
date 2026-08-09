alter table public.generation_jobs
  add column if not exists final_eligible boolean not null default false,
  add column if not exists final_decision_reason text,
  add column if not exists quality_version text not null default 'v2';

comment on column public.generation_jobs.final_eligible is
  'Server-derived release decision. Client input is never trusted.';
