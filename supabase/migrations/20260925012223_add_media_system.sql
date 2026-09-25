-- =========================================================
-- Locorea Media System
-- =========================================================

-- ---------------------------------------------------------
-- Media assets
-- ---------------------------------------------------------

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),

  bucket text not null default 'media',

  storage_path text not null unique,

  media_type text not null default 'image'
    check (media_type in ('image')),

  mime_type text,

  width integer,
  height integer,

  alt_text text,

  credit_text text,
  source_url text,
  license_text text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- ---------------------------------------------------------
-- Entity ↔ Media relation
-- ---------------------------------------------------------

create table if not exists public.entity_media (
  id uuid primary key default gen_random_uuid(),

  media_id uuid not null
    references public.media_assets(id)
    on delete cascade,

  entity_type text not null
    check (
      entity_type in (
        'place',
        'route',
        'guide'
      )
    ),

  entity_id uuid not null,

  role text not null default 'gallery'
    check (
      role in (
        'cover',
        'thumbnail',
        'gallery'
      )
    ),

  sort_order integer not null default 0,

  created_at timestamptz not null default now(),

  unique (
    entity_type,
    entity_id,
    media_id,
    role
  )
);


-- ---------------------------------------------------------
-- One cover per entity
-- ---------------------------------------------------------

create unique index if not exists
entity_media_unique_cover_idx
on public.entity_media (
  entity_type,
  entity_id
)
where role = 'cover';


-- ---------------------------------------------------------
-- Query indexes
-- ---------------------------------------------------------

create index if not exists
entity_media_entity_idx
on public.entity_media (
  entity_type,
  entity_id
);

create index if not exists
entity_media_media_idx
on public.entity_media (
  media_id
);


-- ---------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------

alter table public.media_assets
enable row level security;

alter table public.entity_media
enable row level security;


-- Public read access

create policy "Public can read media assets"
on public.media_assets
for select
to anon, authenticated
using (true);


create policy "Public can read entity media"
on public.entity_media
for select
to anon, authenticated
using (true);


-- ---------------------------------------------------------
-- Supabase Storage bucket
-- ---------------------------------------------------------

insert into storage.buckets (
  id,
  name,
  public
)
values (
  'media',
  'media',
  true
)
on conflict (id)
do update set public = excluded.public;