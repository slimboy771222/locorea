-- Explicit media provenance and display-attribution metadata.
alter table public.media_assets
  add column if not exists source_provider text,
  add column if not exists license_code text,
  add column if not exists license_url text,
  add column if not exists attribution_text text,
  add column if not exists attribution_required boolean not null default false,
  add column if not exists license_checked_at timestamptz;
