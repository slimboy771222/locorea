create table public.medical_facilities (
  id uuid primary key default gen_random_uuid(),
  source_id text not null unique,
  name_ko text not null,
  address_ko text,
  phone text,
  facility_code text,
  facility_name_ko text,
  emergency_code text,
  emergency_name_ko text,
  er_operation_code text,
  er_phone text,
  description_ko text,
  note_ko text,
  directions_ko text,
  latitude double precision not null,
  longitude double precision not null,
  mon_open text,
  mon_close text,
  tue_open text,
  tue_close text,
  wed_open text,
  wed_close text,
  thu_open text,
  thu_close text,
  fri_open text,
  fri_close text,
  sat_open text,
  sat_close text,
  sun_open text,
  sun_close text,
  holiday_open text,
  holiday_close text,
  source_name text not null default 'National Medical Center',
  source_url text,
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint medical_facilities_valid_latitude check (latitude between -90 and 90),
  constraint medical_facilities_valid_longitude check (longitude between -180 and 180)
);

create index medical_facilities_coordinates_idx on public.medical_facilities (latitude, longitude);

alter table public.medical_facilities enable row level security;

create policy "Public can read medical facilities"
on public.medical_facilities
for select
to anon, authenticated
using (true);
