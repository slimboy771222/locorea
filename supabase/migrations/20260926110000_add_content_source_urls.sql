alter table public.places add column if not exists source_url text;
alter table public.routes add column if not exists source_url text;
alter table public.guides add column if not exists source_url text;
