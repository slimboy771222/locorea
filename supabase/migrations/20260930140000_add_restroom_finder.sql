create table public.restrooms (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  name text not null,
  address text,
  latitude double precision not null,
  longitude double precision not null,
  opening_hours text,
  facility_type text,
  source_name text,
  source_url text,
  source_updated_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (latitude between -90 and 90),
  check (longitude between -180 and 180)
);

create index restrooms_coordinates_idx on public.restrooms (latitude, longitude);

alter table public.restrooms enable row level security;

create policy "Public can read restrooms"
on public.restrooms
for select
using (true);

create function public.nearby_restrooms(
  user_latitude double precision,
  user_longitude double precision,
  radius_meters double precision default 800,
  result_limit integer default 15
)
returns table (
  id uuid,
  name text,
  address text,
  latitude double precision,
  longitude double precision,
  opening_hours text,
  facility_type text,
  source_name text,
  source_url text,
  source_updated_at date,
  distance_meters double precision
)
language sql
stable
set search_path = public, extensions
as $$
  with user_location as (
    select extensions.st_setsrid(extensions.st_makepoint(user_longitude, user_latitude), 4326)::extensions.geography as point
  )
  select
    restroom.id,
    restroom.name,
    restroom.address,
    restroom.latitude,
    restroom.longitude,
    restroom.opening_hours,
    restroom.facility_type,
    restroom.source_name,
    restroom.source_url,
    restroom.source_updated_at,
    extensions.st_distance(
      extensions.st_setsrid(extensions.st_makepoint(restroom.longitude, restroom.latitude), 4326)::extensions.geography,
      user_location.point
    ) as distance_meters
  from public.restrooms as restroom
  cross join user_location
  where extensions.st_dwithin(
    extensions.st_setsrid(extensions.st_makepoint(restroom.longitude, restroom.latitude), 4326)::extensions.geography,
    user_location.point,
    least(greatest(radius_meters, 1), 1500)
  )
  order by distance_meters
  limit least(greatest(result_limit, 1), 15);
$$;

grant execute on function public.nearby_restrooms(double precision, double precision, double precision, integer) to anon, authenticated;
