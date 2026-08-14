create table if not exists public.generation_v3_jobs (
  id                    uuid        primary key default gen_random_uuid(),
  project_id            text        not null,
  correlation_id        text        not null,
  idempotency_key       text        not null,
  input_hash            text        not null,
  job_token_hash        text        not null,
  status                text        not null default 'queued'
                                    check (status in ('queued','processing','completed','failed')),
  stage                 text        not null default 'queued',
  progress              integer     not null default 0 check (progress between 0 and 100),
  error_code            text,
  error_message         text,
  accepted_design_spec  jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create unique index if not exists generation_v3_jobs_project_idempotency_uidx
  on public.generation_v3_jobs (project_id, idempotency_key);

create trigger generation_v3_jobs_updated_at
  before update on public.generation_v3_jobs
  for each row execute function update_updated_at();

alter table public.generation_v3_jobs enable row level security;

comment on table public.generation_v3_jobs is
  'Generation V3 (ADR-0009) async job records. No anon/authenticated RLS policies are granted — all reads/writes go through the generation-v3 Edge Function using the service role, matching generation_jobs.';

comment on column public.generation_v3_jobs.job_token_hash is
  'SHA-256 hash of the client-held capability token required to read or resume this job.';

comment on column public.generation_v3_jobs.input_hash is
  'SHA-256 fingerprint of the generation request used to reject idempotency-key reuse with a different payload.';

comment on column public.generation_v3_jobs.accepted_design_spec is
  'The full AcceptedDesignSpec document once the job completes successfully (null while queued/processing/failed).';
