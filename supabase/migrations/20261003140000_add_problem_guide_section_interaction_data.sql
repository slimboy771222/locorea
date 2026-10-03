alter table public.problem_guide_sections
add column interaction_data jsonb;

comment on column public.problem_guide_sections.interaction_data is
  'Optional structured client interaction data for a guide section.';
