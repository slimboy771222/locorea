-- Reproducible public discovery taxonomy. Stable slugs are portable across environments.
insert into public.tags (slug, tag_group)
values
  ('cafe', 'theme'),
  ('shopping', 'theme'),
  ('nature', 'theme'),
  ('culture', 'theme'),
  ('local', 'theme'),
  ('first-trip', 'guide')
on conflict (slug) do nothing;

insert into public.tag_translations (tag_id, language_code, name)
select tags.id, 'en', names.name
from public.tags tags
join (values
  ('cafe', 'Cafe'),
  ('shopping', 'Shopping'),
  ('nature', 'Nature'),
  ('culture', 'Culture'),
  ('local', 'Local'),
  ('first-trip', 'First Trip')
) as names(slug, name) on names.slug = tags.slug
on conflict (tag_id, language_code) do update set name = excluded.name;

-- Only clear, initial Seongsu relationships. Every insert is idempotent.
insert into public.place_tags (place_id, tag_id)
select places.id, tags.id
from public.places places
join (values
  ('seoul-forest', 'nature'),
  ('seoul-forest', 'local'),
  ('cafe-onion-seongsu', 'cafe'),
  ('seongsu-handmade-shoe-street', 'shopping'),
  ('seongsu-handmade-shoe-street', 'local'),
  ('amore-seongsu', 'shopping'),
  ('daelim-warehouse-gallery', 'culture'),
  ('mokro-garden', 'local'),
  ('musinsa-kicks-seongsu', 'shopping'),
  ('scene-seongsu', 'cafe'),
  ('seongsu-dong-galbi-alley', 'local'),
  ('seongsu-yeonmujang-gil', 'shopping')
) as assignments(place_slug, tag_slug) on assignments.place_slug = places.slug
join public.tags tags on tags.slug = assignments.tag_slug
on conflict do nothing;

insert into public.route_tags (route_id, tag_id)
select routes.id, tags.id
from public.routes routes
join (values
  ('seongsu-cafe-shopping-walk', 'cafe'),
  ('seongsu-cafe-shopping-walk', 'shopping'),
  ('seongsu-beauty-fashion-route', 'shopping'),
  ('slow-seongsu-local-walk', 'local')
) as assignments(route_slug, tag_slug) on assignments.route_slug = routes.slug
join public.tags tags on tags.slug = assignments.tag_slug
on conflict do nothing;

insert into public.guide_tags (guide_id, tag_id)
select guides.id, tags.id
from public.guides guides
join (values
  ('getting-to-seongsu-and-seoul-forest', 'first-trip'),
  ('how-to-explore-seongsu', 'first-trip'),
  ('how-to-explore-seongsu', 'local'),
  ('seongsu-cafe-guide', 'cafe'),
  ('shopping-and-popups-in-seongsu', 'shopping'),
  ('shopping-and-popups-in-seongsu', 'local')
) as assignments(guide_slug, tag_slug) on assignments.guide_slug = guides.slug
join public.tags tags on tags.slug = assignments.tag_slug
on conflict do nothing;
