-- =========================================================
-- Explicit Problem Guide action placement
-- =========================================================

alter table public.problem_guide_actions
add column section_id uuid
    references public.problem_guide_sections(id)
    on delete set null;

create index problem_guide_actions_section_id_idx
on public.problem_guide_actions(section_id);


-- Backfill the existing published guides. The guide and section sort order
-- make the intended placement explicit without depending on section titles.
update public.problem_guide_actions action
set section_id = section.id
from public.problem_guides guide
join public.problem_guide_sections section
    on section.guide_id = guide.id
join (
    values
        ('lost-passport', 'search_lost112', 30),
        ('lost-passport', 'find_police', 40),
        ('lost-passport', 'find_embassy', 50),
        ('lost-passport', 'call_1345', 70),
        ('lost-passport', 'call_1330', 100),
        ('lost-something-on-the-subway', 'search_lost112', 40),
        ('lost-something-on-the-subway', 'related_guide', 60),
        ('lost-something-on-the-subway', 'call_1330', 80),
        ('lost-something-on-the-subway', 'seoul_lost_and_found', 80)
) as placement(slug, action_key, section_sort_order)
    on placement.slug = guide.slug
    and placement.section_sort_order = section.sort_order
where action.guide_id = guide.id
and action.action_key = placement.action_key;
