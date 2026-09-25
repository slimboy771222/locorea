select
  p.slug,
  em.role,
  ma.bucket,
  ma.storage_path,
  ma.alt_text
from public.places p
join public.entity_media em
  on em.entity_id = p.id
 and em.entity_type = 'place'
join public.media_assets ma
  on ma.id = em.media_id
where p.slug = 'seoul-forest';