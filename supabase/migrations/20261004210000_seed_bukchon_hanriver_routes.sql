-- Published route content for Bukchon and the Han River. The supporting Places
-- are created by 20261004200000_seed_route_support_places.sql.

insert into public.routes (
  area_id,
  source_id,
  slug,
  route_type,
  duration_minutes,
  distance_km,
  difficulty,
  status,
  last_verified_at,
  published_at
)
select
  areas.id,
  sources.id,
  seed.slug,
  seed.route_type,
  seed.duration_minutes,
  null,
  'easy',
  'published',
  now(),
  now()
from (values
  ('half-day-in-bukchon', 'jongno', 'half_day', 240),
  ('han-river-sunset-ride', 'yeouido', 'half_day', 180)
) as seed(slug, area_slug, route_type, duration_minutes)
join public.areas areas on areas.slug = seed.area_slug
join public.sources sources on sources.name = 'Locorea Editorial'
on conflict (slug) do update
set area_id = excluded.area_id,
    source_id = excluded.source_id,
    route_type = excluded.route_type,
    duration_minutes = excluded.duration_minutes,
    distance_km = excluded.distance_km,
    difficulty = excluded.difficulty,
    status = excluded.status,
    last_verified_at = excluded.last_verified_at,
    published_at = excluded.published_at;

insert into public.route_translations (
  route_id,
  language_code,
  name,
  summary,
  description
)
select
  routes.id,
  'en',
  seed.name,
  seed.summary,
  seed.description
from public.routes routes
join (values
  (
    'half-day-in-bukchon',
    'Half Day in Bukchon',
    'Walk through royal Seoul, traditional hanok streets, and one of the city''s most atmospheric neighborhoods.',
    'Start at Gyeongbokgung Palace, continue through Bukchon Hanok Village, then slow down in Samcheong-dong. Bukchon is a residential neighborhood, so keep voices low and respect local residents as you walk.'
  ),
  (
    'han-river-sunset-ride',
    'Han River Sunset Ride',
    'Follow the Han River by bike and finish the ride around sunset at Banpo.',
    'Ride from Yeouido Hangang Park through Ichon Hangang Park to Banpo Hangang Park at a relaxed pace. This outdoor route is best enjoyed as the light softens toward sunset.'
  )
) as seed(slug, name, summary, description) on seed.slug = routes.slug
on conflict (route_id, language_code) do update
set name = excluded.name,
    summary = excluded.summary,
    description = excluded.description;

delete from public.route_places route_places
using public.routes routes
where route_places.route_id = routes.id
  and routes.slug in ('half-day-in-bukchon', 'han-river-sunset-ride');

insert into public.route_places (
  route_id,
  place_id,
  stop_order,
  stay_minutes,
  travel_minutes_to_next
)
select
  routes.id,
  places.id,
  seed.stop_order,
  seed.stay_minutes,
  seed.travel_minutes_to_next
from (values
  ('half-day-in-bukchon', 'gyeongbokgung-palace', 1, 90, 15),
  ('half-day-in-bukchon', 'bukchon-hanok-village', 2, 75, 10),
  ('half-day-in-bukchon', 'samcheong-dong', 3, 50, null),
  ('han-river-sunset-ride', 'yeouido-hangang-park', 1, 45, 35),
  ('han-river-sunset-ride', 'ichon-hangang-park', 2, 35, 35),
  ('han-river-sunset-ride', 'banpo-hangang-park', 3, 30, null)
) as seed(route_slug, place_slug, stop_order, stay_minutes, travel_minutes_to_next)
join public.routes routes on routes.slug = seed.route_slug
join public.places places on places.slug = seed.place_slug;

insert into public.route_tags (route_id, tag_id)
select routes.id, tags.id
from public.routes routes
join (values
  ('half-day-in-bukchon', 'seoul'),
  ('half-day-in-bukchon', 'culture'),
  ('half-day-in-bukchon', 'local'),
  ('han-river-sunset-ride', 'seoul'),
  ('han-river-sunset-ride', 'nature')
) as seed(route_slug, tag_slug) on seed.route_slug = routes.slug
join public.tags tags on tags.slug = seed.tag_slug
on conflict do nothing;
