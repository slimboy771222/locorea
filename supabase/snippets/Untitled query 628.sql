with place_row as (
  select id
  from public.places
  where slug = 'seongsu-handmade-shoe-street'
),
media_row as (
  insert into public.media_assets (
    bucket,
    storage_path,
    media_type,
    mime_type,
    alt_text,
    credit_text
  )
  select
    'media',
    'places/' || id || '/cover.webp',
    'image',
    'image/webp',
    'Seongsu Handmade Shoe Street in Seoul',
    'Locorea Editorial'
  from place_row

  on conflict (storage_path)
  do update set
    alt_text = excluded.alt_text,
    credit_text = excluded.credit_text

  returning id
)

insert into public.entity_media (
  media_id,
  entity_type,
  entity_id,
  role,
  sort_order
)
select
  media_row.id,
  'place',
  place_row.id,
  'cover',
  0
from media_row
cross join place_row
on conflict do nothing;