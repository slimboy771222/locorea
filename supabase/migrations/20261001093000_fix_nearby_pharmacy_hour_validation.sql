create or replace function public.nearby_pharmacies(
  user_latitude double precision,
  user_longitude double precision,
  radius_meters double precision default 2000,
  result_limit integer default 20
)
returns table (
  id uuid,
  source_id text,
  name_ko text,
  address_ko text,
  phone text,
  latitude double precision,
  longitude double precision,
  opening_time text,
  closing_time text,
  note_ko text,
  source_name text,
  source_url text,
  is_open_now boolean,
  distance_meters double precision
)
language sql
stable
set search_path = public, extensions
as $$
  with current_korea_time as (
    select extract(isodow from timezone('Asia/Seoul', now()))::integer as weekday, to_char(timezone('Asia/Seoul', now()), 'HH24MI') as current_time
  ), nearby as (
    select pharmacy.*,
      case current_korea_time.weekday when 1 then pharmacy.mon_open when 2 then pharmacy.tue_open when 3 then pharmacy.wed_open when 4 then pharmacy.thu_open when 5 then pharmacy.fri_open when 6 then pharmacy.sat_open when 7 then pharmacy.sun_open end as opening_time,
      case current_korea_time.weekday when 1 then pharmacy.mon_close when 2 then pharmacy.tue_close when 3 then pharmacy.wed_close when 4 then pharmacy.thu_close when 5 then pharmacy.fri_close when 6 then pharmacy.sat_close when 7 then pharmacy.sun_close end as closing_time,
      current_korea_time.current_time,
      extensions.st_distance(extensions.st_setsrid(extensions.st_makepoint(pharmacy.longitude, pharmacy.latitude), 4326)::extensions.geography, extensions.st_setsrid(extensions.st_makepoint(user_longitude, user_latitude), 4326)::extensions.geography) as distance_meters
    from public.pharmacies as pharmacy cross join current_korea_time
    where radius_meters between 1 and 5000 and result_limit between 1 and 20
      and extensions.st_dwithin(extensions.st_setsrid(extensions.st_makepoint(pharmacy.longitude, pharmacy.latitude), 4326)::extensions.geography, extensions.st_setsrid(extensions.st_makepoint(user_longitude, user_latitude), 4326)::extensions.geography, radius_meters)
  )
  select nearby.id, nearby.source_id, nearby.name_ko, nearby.address_ko, nearby.phone, nearby.latitude, nearby.longitude, nearby.opening_time, nearby.closing_time, nearby.note_ko, nearby.source_name, nearby.source_url,
    case
      when nearby.opening_time !~ '^[0-9]{3,4}$' or nearby.closing_time !~ '^[0-9]{3,4}$' then null
      when lpad(nearby.opening_time, 4, '0') <= lpad(nearby.closing_time, 4, '0') then nearby.current_time >= lpad(nearby.opening_time, 4, '0') and nearby.current_time < lpad(nearby.closing_time, 4, '0')
      else nearby.current_time >= lpad(nearby.opening_time, 4, '0') or nearby.current_time < lpad(nearby.closing_time, 4, '0')
    end as is_open_now,
    nearby.distance_meters
  from nearby
  order by is_open_now desc nulls last, distance_meters asc
  limit result_limit;
$$;
