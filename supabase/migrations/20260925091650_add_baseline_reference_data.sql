-- =========================================================
-- Baseline reference data required by content importers
-- =========================================================

insert into public.sources (
    name,
    source_type,
    url,
    attribution,
    last_checked_at
)
select
    'Seoul Metropolitan Government',
    'official',
    'https://english.seoul.go.kr',
    'Source: Seoul Metropolitan Government',
    now()
where not exists (
    select 1 from public.sources where name = 'Seoul Metropolitan Government'
);

insert into public.sources (
    name,
    source_type,
    url,
    attribution,
    last_checked_at
)
select
    'Korea Tourism Organization',
    'official',
    'https://english.visitkorea.or.kr',
    'Source: Korea Tourism Organization',
    now()
where not exists (
    select 1 from public.sources where name = 'Korea Tourism Organization'
);

insert into public.sources (
    name,
    source_type,
    url,
    attribution,
    last_checked_at
)
select
    'Locorea Editorial',
    'editorial',
    null,
    'Curated by Locorea',
    now()
where not exists (
    select 1 from public.sources where name = 'Locorea Editorial'
);

insert into public.regions (code, slug, sort_order, is_active)
values ('SEOUL', 'seoul', 1, true)
on conflict (slug) do nothing;

insert into public.region_translations (region_id, language_code, name, description)
select
    r.id,
    'en',
    'Seoul',
    'The capital of South Korea and one of the country''s main travel hubs.'
from public.regions r
where r.slug = 'seoul'
on conflict (region_id, language_code) do nothing;

insert into public.cities (region_id, code, slug, sort_order, is_active)
select r.id, 'SEOUL', 'seoul', 1, true
from public.regions r
where r.slug = 'seoul'
on conflict (slug) do nothing;

insert into public.city_translations (city_id, language_code, name, description)
select
    c.id,
    'en',
    'Seoul',
    'A city of historic neighborhoods, modern culture, food, shopping and nightlife.'
from public.cities c
where c.slug = 'seoul'
on conflict (city_id, language_code) do nothing;

insert into public.areas (city_id, slug, sort_order, is_active)
select c.id, 'seongsu', 1, true
from public.cities c
where c.slug = 'seoul'
on conflict (slug) do nothing;

insert into public.area_translations (area_id, language_code, name, description)
select
    a.id,
    'en',
    'Seongsu',
    'A trendy Seoul neighborhood known for cafes, shopping, pop-ups and Seoul Forest.'
from public.areas a
where a.slug = 'seongsu'
on conflict (area_id, language_code) do nothing;
