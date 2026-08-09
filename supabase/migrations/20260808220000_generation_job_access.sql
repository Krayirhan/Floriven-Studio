alter table public.generation_jobs
  add column if not exists job_token_hash text;

drop policy if exists "read_by_id" on public.generation_jobs;

comment on column public.generation_jobs.job_token_hash is
  'SHA-256 hash of the client-held capability token required to read or resume this job.';
