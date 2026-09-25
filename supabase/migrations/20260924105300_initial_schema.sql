-- =========================================================
-- Locorea Initial Schema v1
-- Search-first Korea Travel Data & Knowledge Portal
-- =========================================================


-- =========================================================
-- Extensions
-- =========================================================

create extension if not exists postgis schema extensions;
create extension if not exists pg_trgm schema extensions;


-- =========================================================
-- Common ENUM-like constraints are implemented with text
-- for easier migration and future extension.
-- =========================================================


-- =========================================================
-- REGIONS
-- e.g. Seoul, Gyeonggi-do, Busan
-- =========================================================

create table public.regions (
    id uuid primary key default gen_random_uuid(),

    code varchar(30) unique,
    slug varchar(120) not null unique,

    sort_order integer not null default 0,
    is_active boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


create table public.region_translations (
    id uuid primary key default gen_random_uuid(),

    region_id uuid not null
        references public.regions(id)
        on delete cascade,

    language_code varchar(10) not null,

    name varchar(200) not null,
    description text,

    unique(region_id, language_code)
);


-- =========================================================
-- CITIES
-- e.g. Seoul, Busan, Jeju City
-- =========================================================

create table public.cities (
    id uuid primary key default gen_random_uuid(),

    region_id uuid
        references public.regions(id)
        on delete set null,

    code varchar(30),
    slug varchar(120) not null unique,

    sort_order integer not null default 0,
    is_active boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


create table public.city_translations (
    id uuid primary key default gen_random_uuid(),

    city_id uuid not null
        references public.cities(id)
        on delete cascade,

    language_code varchar(10) not null,

    name varchar(200) not null,
    description text,

    unique(city_id, language_code)
);


-- =========================================================
-- AREAS
-- e.g. Seongsu, Hongdae, Myeongdong
-- =========================================================

create table public.areas (
    id uuid primary key default gen_random_uuid(),

    city_id uuid not null
        references public.cities(id)
        on delete cascade,

    slug varchar(120) not null unique,

    sort_order integer not null default 0,
    is_active boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


create table public.area_translations (
    id uuid primary key default gen_random_uuid(),

    area_id uuid not null
        references public.areas(id)
        on delete cascade,

    language_code varchar(10) not null,

    name varchar(200) not null,
    description text,

    unique(area_id, language_code)
);


-- =========================================================
-- SOURCES
-- Official source / Public data / Editorial source
-- =========================================================

create table public.sources (
    id uuid primary key default gen_random_uuid(),

    name varchar(200) not null,

    source_type varchar(30) not null default 'official'
        check (
            source_type in (
                'official',
                'public_data',
                'editorial',
                'partner',
                'community',
                'other'
            )
        ),

    url text,

    license_name varchar(150),
    attribution text,

    last_checked_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- =========================================================
-- PLACES
--
-- Restaurant / Cafe / Attraction / Shopping etc.
-- are all Place entities.
-- =========================================================

create table public.places (
    id uuid primary key default gen_random_uuid(),

    area_id uuid
        references public.areas(id)
        on delete set null,

    source_id uuid
        references public.sources(id)
        on delete set null,

    slug varchar(160) not null unique,

    place_type varchar(40) not null
        check (
            place_type in (
                'attraction',
                'restaurant',
                'cafe',
                'shopping',
                'accommodation',
                'transport',
                'culture',
                'nature',
                'experience',
                'other'
            )
        ),

    location extensions.geography(point, 4326),

    phone varchar(100),
    website_url text,

    naver_map_url text,
    kakao_map_url text,

    opening_hours jsonb,

    price_level smallint
        check (price_level between 1 and 5),

    foreigner_friendly boolean,

    status varchar(20) not null default 'draft'
        check (
            status in (
                'draft',
                'published',
                'archived'
            )
        ),

    last_verified_at timestamptz,

    published_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


create table public.place_translations (
    id uuid primary key default gen_random_uuid(),

    place_id uuid not null
        references public.places(id)
        on delete cascade,

    language_code varchar(10) not null,

    name varchar(250) not null,

    summary text,

    description text,

    address_text text,

    local_tip text,

    unique(place_id, language_code)
);


create index places_location_idx
    on public.places
    using gist(location);

create index places_area_idx
    on public.places(area_id);

create index places_type_idx
    on public.places(place_type);

create index places_status_idx
    on public.places(status);

create index place_translation_name_trgm_idx
    on public.place_translations
    using gin(name extensions.gin_trgm_ops);


-- =========================================================
-- ROUTES
-- =========================================================

create table public.routes (
    id uuid primary key default gen_random_uuid(),

    area_id uuid
        references public.areas(id)
        on delete set null,

    source_id uuid
        references public.sources(id)
        on delete set null,

    slug varchar(160) not null unique,

    route_type varchar(40) not null default 'half_day'
        check (
            route_type in (
                'walking',
                'half_day',
                'one_day',
                'multi_day',
                'food',
                'shopping',
                'culture',
                'custom'
            )
        ),

    duration_minutes integer,

    distance_km numeric(8,2),

    difficulty varchar(20)
        check (
            difficulty is null
            or difficulty in (
                'easy',
                'normal',
                'hard'
            )
        ),

    status varchar(20) not null default 'draft'
        check (
            status in (
                'draft',
                'published',
                'archived'
            )
        ),

    last_verified_at timestamptz,

    published_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


create table public.route_translations (
    id uuid primary key default gen_random_uuid(),

    route_id uuid not null
        references public.routes(id)
        on delete cascade,

    language_code varchar(10) not null,

    name varchar(250) not null,

    summary text,

    description text,

    unique(route_id, language_code)
);


create table public.route_places (
    id uuid primary key default gen_random_uuid(),

    route_id uuid not null
        references public.routes(id)
        on delete cascade,

    place_id uuid not null
        references public.places(id)
        on delete cascade,

    stop_order integer not null,

    stay_minutes integer,

    travel_minutes_to_next integer,

    note text,

    unique(route_id, stop_order),
    unique(route_id, place_id)
);


create index routes_area_idx
    on public.routes(area_id);

create index routes_status_idx
    on public.routes(status);

create index route_translation_name_trgm_idx
    on public.route_translations
    using gin(name extensions.gin_trgm_ops);


-- =========================================================
-- GUIDES
--
-- Real travel problems:
-- subway, SIM, Climate Card, payment, emergency...
-- =========================================================

create table public.guides (
    id uuid primary key default gen_random_uuid(),

    source_id uuid
        references public.sources(id)
        on delete set null,

    slug varchar(160) not null unique,

    guide_type varchar(40) not null
        check (
            guide_type in (
                'arrival',
                'transport',
                'payment',
                'sim',
                'maps',
                'language',
                'etiquette',
                'emergency',
                'troubleshooting',
                'general'
            )
        ),

    status varchar(20) not null default 'draft'
        check (
            status in (
                'draft',
                'published',
                'archived'
            )
        ),

    featured boolean not null default false,

    last_verified_at timestamptz,

    published_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


create table public.guide_translations (
    id uuid primary key default gen_random_uuid(),

    guide_id uuid not null
        references public.guides(id)
        on delete cascade,

    language_code varchar(10) not null,

    title varchar(250) not null,

    summary text,

    body_markdown text,

    unique(guide_id, language_code)
);


create index guides_type_idx
    on public.guides(guide_type);

create index guides_status_idx
    on public.guides(status);

create index guide_translation_title_trgm_idx
    on public.guide_translations
    using gin(title extensions.gin_trgm_ops);


-- =========================================================
-- TAGS
--
-- K-pop / Cafe / Family / History / Local etc.
-- =========================================================

create table public.tags (
    id uuid primary key default gen_random_uuid(),

    slug varchar(100) not null unique,

    tag_group varchar(40) not null default 'general',

    created_at timestamptz not null default now()
);


create table public.tag_translations (
    id uuid primary key default gen_random_uuid(),

    tag_id uuid not null
        references public.tags(id)
        on delete cascade,

    language_code varchar(10) not null,

    name varchar(150) not null,

    unique(tag_id, language_code)
);


-- =========================================================
-- Entity ↔ Tag relations
-- =========================================================

create table public.place_tags (
    place_id uuid not null
        references public.places(id)
        on delete cascade,

    tag_id uuid not null
        references public.tags(id)
        on delete cascade,

    primary key(place_id, tag_id)
);


create table public.route_tags (
    route_id uuid not null
        references public.routes(id)
        on delete cascade,

    tag_id uuid not null
        references public.tags(id)
        on delete cascade,

    primary key(route_id, tag_id)
);


create table public.guide_tags (
    guide_id uuid not null
        references public.guides(id)
        on delete cascade,

    tag_id uuid not null
        references public.tags(id)
        on delete cascade,

    primary key(guide_id, tag_id)
);


-- =========================================================
-- UPDATED_AT helper
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;


create trigger regions_set_updated_at
before update on public.regions
for each row
execute function public.set_updated_at();


create trigger cities_set_updated_at
before update on public.cities
for each row
execute function public.set_updated_at();


create trigger areas_set_updated_at
before update on public.areas
for each row
execute function public.set_updated_at();


create trigger sources_set_updated_at
before update on public.sources
for each row
execute function public.set_updated_at();


create trigger places_set_updated_at
before update on public.places
for each row
execute function public.set_updated_at();


create trigger routes_set_updated_at
before update on public.routes
for each row
execute function public.set_updated_at();


create trigger guides_set_updated_at
before update on public.guides
for each row
execute function public.set_updated_at();


-- =========================================================
-- RLS
-- =========================================================

alter table public.regions enable row level security;
alter table public.region_translations enable row level security;

alter table public.cities enable row level security;
alter table public.city_translations enable row level security;

alter table public.areas enable row level security;
alter table public.area_translations enable row level security;

alter table public.sources enable row level security;

alter table public.places enable row level security;
alter table public.place_translations enable row level security;

alter table public.routes enable row level security;
alter table public.route_translations enable row level security;
alter table public.route_places enable row level security;

alter table public.guides enable row level security;
alter table public.guide_translations enable row level security;

alter table public.tags enable row level security;
alter table public.tag_translations enable row level security;

alter table public.place_tags enable row level security;
alter table public.route_tags enable row level security;
alter table public.guide_tags enable row level security;


-- =========================================================
-- Public reference data
-- =========================================================

create policy "Public can read regions"
on public.regions
for select
using (is_active = true);


create policy "Public can read region translations"
on public.region_translations
for select
using (true);


create policy "Public can read cities"
on public.cities
for select
using (is_active = true);


create policy "Public can read city translations"
on public.city_translations
for select
using (true);


create policy "Public can read areas"
on public.areas
for select
using (is_active = true);


create policy "Public can read area translations"
on public.area_translations
for select
using (true);


create policy "Public can read sources"
on public.sources
for select
using (true);


-- =========================================================
-- Only published travel content can be read anonymously.
-- =========================================================

create policy "Public can read published places"
on public.places
for select
using (status = 'published');


create policy "Public can read place translations"
on public.place_translations
for select
using (
    exists (
        select 1
        from public.places p
        where p.id = place_id
        and p.status = 'published'
    )
);


create policy "Public can read published routes"
on public.routes
for select
using (status = 'published');


create policy "Public can read route translations"
on public.route_translations
for select
using (
    exists (
        select 1
        from public.routes r
        where r.id = route_id
        and r.status = 'published'
    )
);


create policy "Public can read published route places"
on public.route_places
for select
using (
    exists (
        select 1
        from public.routes r
        where r.id = route_id
        and r.status = 'published'
    )
);


create policy "Public can read published guides"
on public.guides
for select
using (status = 'published');


create policy "Public can read guide translations"
on public.guide_translations
for select
using (
    exists (
        select 1
        from public.guides g
        where g.id = guide_id
        and g.status = 'published'
    )
);


create policy "Public can read tags"
on public.tags
for select
using (true);


create policy "Public can read tag translations"
on public.tag_translations
for select
using (true);


create policy "Public can read place tags"
on public.place_tags
for select
using (true);


create policy "Public can read route tags"
on public.route_tags
for select
using (true);


create policy "Public can read guide tags"
on public.guide_tags
for select
using (true);
