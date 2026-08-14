alter table public.generation_jobs
  add column if not exists input_hash text;

comment on column public.generation_jobs.input_hash is
  'SHA-256 fingerprint of the generation request used to reject idempotency-key reuse with a different payload.';
