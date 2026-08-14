alter table public.generation_jobs
  add column if not exists provider_operation text;

comment on column public.generation_jobs.provider_operation is
  'Exact Floriven generation phase that initiated the provider request.';
