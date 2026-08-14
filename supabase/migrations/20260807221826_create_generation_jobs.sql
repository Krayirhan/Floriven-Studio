
create table generation_jobs (
  id             uuid        primary key default gen_random_uuid(),
  project_id     text        not null,
  status         text        not null default 'queued'
                             check (status in ('queued','processing','completed','failed')),
  progress       integer     not null default 0 check (progress between 0 and 100),
  prompt         text        not null,
  platform       text        not null default 'ios'
                             check (platform in ('ios','android','cross-platform')),
  screen_scope   text,
  result_screens jsonb,
  error_message  text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger generation_jobs_updated_at
  before update on generation_jobs
  for each row execute function update_updated_at();

alter table generation_jobs enable row level security;

create policy "read_by_id"
  on generation_jobs for select
  using (true);
;
