-- =========================================================
-- Locorea Content Review Workflow
-- =========================================================

alter table public.places
  add column if not exists review_status text not null default 'unreviewed',
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists review_note text;

alter table public.routes
  add column if not exists review_status text not null default 'unreviewed',
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists review_note text;

alter table public.guides
  add column if not exists review_status text not null default 'unreviewed',
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists review_note text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'places_review_status_check') then
    alter table public.places
      add constraint places_review_status_check
      check (review_status in ('unreviewed', 'in_review', 'needs_fix', 'approved'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'routes_review_status_check') then
    alter table public.routes
      add constraint routes_review_status_check
      check (review_status in ('unreviewed', 'in_review', 'needs_fix', 'approved'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'guides_review_status_check') then
    alter table public.guides
      add constraint guides_review_status_check
      check (review_status in ('unreviewed', 'in_review', 'needs_fix', 'approved'));
  end if;
end;
$$;

update public.places
set review_status = case when status = 'published' then 'approved' else 'unreviewed' end;

update public.routes
set review_status = case when status = 'published' then 'approved' else 'unreviewed' end;

update public.guides
set review_status = case when status = 'published' then 'approved' else 'unreviewed' end;

create index if not exists places_review_status_idx on public.places(review_status);
create index if not exists routes_review_status_idx on public.routes(review_status);
create index if not exists guides_review_status_idx on public.guides(review_status);
