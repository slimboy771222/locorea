select
  g.id as guide_id,
  g.slug,
  g.status,
  g.featured,
  em.role,
  ma.bucket,
  ma.storage_path,
  ma.mime_type,
  ma.alt_text,
  so.name as actual_storage_object,
  case
    when so.name is not null then 'OK'
    else 'FILE NOT FOUND'
  end as storage_check
from public.guides g
left join public.entity_media em
  on em.entity_id = g.id
 and em.entity_type = 'guide'
 and em.role = 'cover'
left join public.media_assets ma
  on ma.id = em.media_id
left join storage.objects so
  on so.bucket_id = ma.bucket
 and so.name = ma.storage_path
where g.slug = 'how-to-use-seoul-subway-guide';