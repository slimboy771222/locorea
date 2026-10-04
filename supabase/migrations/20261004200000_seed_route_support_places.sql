-- Route-support Places for upcoming Bukchon and Han River routes.
-- Coordinates and cover media are intentionally omitted until verified source data is available.

insert into public.tags (slug, tag_group)
values ('seoul', 'location')
on conflict (slug) do nothing;

insert into public.tag_translations (tag_id, language_code, name)
select id, 'en', 'Seoul'
from public.tags
where slug = 'seoul'
on conflict (tag_id, language_code) do update
set name = excluded.name;

insert into public.areas (city_id, slug, sort_order, is_active)
select cities.id, seed.slug, seed.sort_order, true
from public.cities cities
cross join (values
  ('jongno', 2),
  ('yeouido', 3),
  ('yongsan', 4),
  ('seocho', 5)
) as seed(slug, sort_order)
where cities.slug = 'seoul'
on conflict (slug) do nothing;

insert into public.area_translations (area_id, language_code, name, description)
select areas.id, 'en', seed.name, seed.description
from public.areas areas
join (values
  ('jongno', 'Jongno', 'A historic central Seoul district with royal palaces, hanok neighborhoods, and galleries.'),
  ('yeouido', 'Yeouido', 'A riverside Seoul district known for Han River parks and city views.'),
  ('yongsan', 'Yongsan', 'A central Seoul district connecting riverfront parks, museums, and neighborhoods.'),
  ('seocho', 'Seocho', 'A southern Seoul district with Han River parks and access to Banpo Bridge.')
) as seed(slug, name, description) on seed.slug = areas.slug
on conflict (area_id, language_code) do update
set name = excluded.name,
    description = excluded.description;

insert into public.places (
  area_id,
  source_id,
  slug,
  place_type,
  status,
  last_verified_at,
  published_at
)
select
  areas.id,
  sources.id,
  seed.slug,
  seed.place_type,
  'published',
  now(),
  now()
from (values
  ('gyeongbokgung-palace', 'jongno', 'culture'),
  ('bukchon-hanok-village', 'jongno', 'culture'),
  ('samcheong-dong', 'jongno', 'culture'),
  ('yeouido-hangang-park', 'yeouido', 'nature'),
  ('ichon-hangang-park', 'yongsan', 'nature'),
  ('banpo-hangang-park', 'seocho', 'nature')
) as seed(slug, area_slug, place_type)
join public.areas areas on areas.slug = seed.area_slug
join public.sources sources on sources.name = 'Locorea Editorial'
on conflict (slug) do nothing;

insert into public.place_translations (
  place_id,
  language_code,
  name,
  summary,
  description,
  address_text,
  local_tip
)
select
  places.id,
  'en',
  seed.name,
  seed.summary,
  seed.description,
  seed.address_text,
  seed.local_tip
from public.places places
join (values
  (
    'gyeongbokgung-palace',
    'Gyeongbokgung Palace',
    'Seoul''s landmark royal palace and a strong starting point for exploring the historic center.',
    'A major royal palace in central Seoul and a natural first stop for a walking route toward Bukchon and Samcheong-dong.',
    '161 Sajik-ro, Jongno-gu, Seoul',
    null
  ),
  (
    'bukchon-hanok-village',
    'Bukchon Hanok Village',
    'A residential hanok neighborhood where traditional streets and everyday Seoul meet.',
    'A walkable residential neighborhood of traditional Korean homes between the palace district and Samcheong-dong.',
    null,
    'Please keep noise low and respect residents while walking through Bukchon.'
  ),
  (
    'samcheong-dong',
    'Samcheong-dong',
    'A walkable neighborhood mixing galleries, cafés, shops, and traditional streets.',
    'A neighborhood just beyond Bukchon where galleries, cafés, independent shops, and traditional streets make an easy walking stop.',
    null,
    null
  ),
  (
    'yeouido-hangang-park',
    'Yeouido Hangang Park',
    'A large Han River park and an easy starting point for a riverside cycling route.',
    'A broad riverside park in Yeouido with open paths that make a practical starting point for a Han River ride.',
    '330 Yeouidong-ro, Yeongdeungpo-gu, Seoul',
    null
  ),
  (
    'ichon-hangang-park',
    'Ichon Hangang Park',
    'A long riverside park that makes a natural middle section of a Han River ride.',
    'A riverside park in Ichon that works as a natural middle stop on a Han River cycling route.',
    '62 Ichon-ro 72-gil, Yongsan-gu, Seoul',
    null
  ),
  (
    'banpo-hangang-park',
    'Banpo Hangang Park',
    'A riverside park around Banpo Bridge and a strong sunset finish for a Han River ride.',
    'A riverside park around Banpo Bridge that makes a memorable sunset finish for a Han River ride.',
    '40 Sinbanpo-ro 11-gil, Seocho-gu, Seoul',
    null
  )
) as seed(slug, name, summary, description, address_text, local_tip) on seed.slug = places.slug
on conflict (place_id, language_code) do update
set name = excluded.name,
    summary = excluded.summary,
    description = excluded.description,
    address_text = excluded.address_text,
    local_tip = excluded.local_tip;

insert into public.place_tags (place_id, tag_id)
select places.id, tags.id
from public.places places
join (values
  ('gyeongbokgung-palace', 'seoul'),
  ('gyeongbokgung-palace', 'culture'),
  ('bukchon-hanok-village', 'seoul'),
  ('bukchon-hanok-village', 'culture'),
  ('bukchon-hanok-village', 'local'),
  ('samcheong-dong', 'seoul'),
  ('samcheong-dong', 'culture'),
  ('samcheong-dong', 'local'),
  ('yeouido-hangang-park', 'seoul'),
  ('yeouido-hangang-park', 'nature'),
  ('ichon-hangang-park', 'seoul'),
  ('ichon-hangang-park', 'nature'),
  ('banpo-hangang-park', 'seoul'),
  ('banpo-hangang-park', 'nature')
) as seed(place_slug, tag_slug) on seed.place_slug = places.slug
join public.tags tags on tags.slug = seed.tag_slug
on conflict do nothing;
