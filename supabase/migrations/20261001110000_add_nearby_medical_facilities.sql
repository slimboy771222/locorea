create function public.nearby_medical_facilities(
  user_latitude double precision,
  user_longitude double precision,
  radius_meters double precision default 3000,
  result_limit integer default 20
)
returns table (
  id uuid,
  source_id text,
  name_ko text,
  address_ko text,
  phone text,
  facility_code text,
  facility_name_ko text,
  description_ko text,
  note_ko text,
  latitude double precision,
  longitude double precision,
  opening_time text,
  closing_time text,
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
    select
      extract(isodow from timezone('Asia/Seoul', now()))::integer as weekday,
      to_char(timezone('Asia/Seoul', now()), 'HH24MI') as current_time
  ), nearby as (
    select
      facility.*,
      case current_korea_time.weekday
        when 1 then facility.mon_open when 2 then facility.tue_open when 3 then facility.wed_open
        when 4 then facility.thu_open when 5 then facility.fri_open when 6 then facility.sat_open
        when 7 then facility.sun_open
      end as opening_time,
      case current_korea_time.weekday
        when 1 then facility.mon_close when 2 then facility.tue_close when 3 then facility.wed_close
        when 4 then facility.thu_close when 5 then facility.fri_close when 6 then facility.sat_close
        when 7 then facility.sun_close
      end as closing_time,
      current_korea_time.current_time,
      extensions.st_distance(
        extensions.st_setsrid(extensions.st_makepoint(facility.longitude, facility.latitude), 4326)::extensions.geography,
        extensions.st_setsrid(extensions.st_makepoint(user_longitude, user_latitude), 4326)::extensions.geography
      ) as distance_meters
    from public.medical_facilities as facility
    cross join current_korea_time
    where radius_meters between 1 and 7000
      and result_limit between 1 and 20
      and extensions.st_dwithin(
        extensions.st_setsrid(extensions.st_makepoint(facility.longitude, facility.latitude), 4326)::extensions.geography,
        extensions.st_setsrid(extensions.st_makepoint(user_longitude, user_latitude), 4326)::extensions.geography,
        radius_meters
      )
  )
  select
    nearby.id, nearby.source_id, nearby.name_ko, nearby.address_ko, nearby.phone,
    nearby.facility_code, nearby.facility_name_ko, nearby.description_ko, nearby.note_ko,
    nearby.latitude, nearby.longitude, nearby.opening_time, nearby.closing_time,
    nearby.source_name, nearby.source_url,
    case
      when nearby.opening_time !~ '^\\d{3,4}$' or nearby.closing_time !~ '^\\d{3,4}$' then null
      when lpad(nearby.opening_time, 4, '0') <= lpad(nearby.closing_time, 4, '0')
        then nearby.current_time >= lpad(nearby.opening_time, 4, '0') and nearby.current_time < lpad(nearby.closing_time, 4, '0')
      else nearby.current_time >= lpad(nearby.opening_time, 4, '0') or nearby.current_time < lpad(nearby.closing_time, 4, '0')
    end as is_open_now,
    nearby.distance_meters
  from nearby
  order by is_open_now desc nulls last, distance_meters asc
  limit result_limit;
$$;

grant execute on function public.nearby_medical_facilities(double precision, double precision, double precision, integer) to anon, authenticated;
