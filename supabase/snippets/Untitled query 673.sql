select
  slug,
  status,
  review_status
from public.places
where slug in (
  'seongsu-yeonmujang-gil',
  'amore-seongsu',
  'seongsu-self-photo-booth',
  'seoul-forest',
  'seongsu-dong-galbi-alley'
)
order by slug;