-- =========================================================
-- Problem guide type
-- =========================================================

alter table public.problem_guides
add column guide_type text not null default 'problem'
    constraint problem_guides_guide_type_check
    check (guide_type in ('problem', 'practical'));

create index problem_guides_guide_type_idx
on public.problem_guides(guide_type);
