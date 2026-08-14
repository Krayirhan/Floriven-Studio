-- Prepared for review. Do not apply to production without Backend/Security approval.
-- Keeps the product plan and the independent visual-style decision auditable.

alter table public.generation_jobs
  add column if not exists product_blueprint jsonb,
  add column if not exists domain_pack_id text,
  add column if not exists style_preset_id text;

alter table public.generation_jobs
  drop constraint if exists generation_jobs_domain_pack_id_check;

alter table public.generation_jobs
  add constraint generation_jobs_domain_pack_id_check
  check (
    domain_pack_id is null
    or domain_pack_id in ('health-care', 'commerce', 'learning', 'publishing', 'operations')
  );

comment on column public.generation_jobs.product_blueprint is
  'Validated product semantics produced from the user brief before visual generation.';
comment on column public.generation_jobs.domain_pack_id is
  'Optional capability pack derived from product_blueprint and brief; never from style_preset_id.';
comment on column public.generation_jobs.style_preset_id is
  'Optional visual-only preset. Must not determine domain, vocabulary, entities, or screen jobs.';
