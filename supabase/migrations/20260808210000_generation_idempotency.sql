alter table public.generation_jobs
  add column if not exists idempotency_key text;

create unique index if not exists generation_jobs_project_id_idempotency_key_uidx
  on public.generation_jobs (project_id, idempotency_key)
  where idempotency_key is not null;

comment on column public.generation_jobs.idempotency_key is
  'Client-generated key used to safely resume or retry a generation POST without creating a second job.';
