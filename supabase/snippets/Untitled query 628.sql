select
  p.id,
  p.slug,
  pt.language_code,
  pt.name
from public.places p
left join public.place_translations pt
  on pt.place_id = p.id
where p.slug = 'pyeong-nae';