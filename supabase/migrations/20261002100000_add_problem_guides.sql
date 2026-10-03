-- =========================================================
-- Problem guides
-- =========================================================

create table public.problem_guides (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    category text not null,
    title text not null,
    summary text,
    status text not null default 'draft'
        check (status in ('draft', 'published', 'archived')),
    published_at timestamptz,
    last_reviewed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index problem_guides_category_idx
on public.problem_guides(category);

create index problem_guides_status_idx
on public.problem_guides(status);


-- =========================================================
-- Flexible Markdown sections
-- =========================================================

create table public.problem_guide_sections (
    id uuid primary key default gen_random_uuid(),
    guide_id uuid not null
        references public.problem_guides(id)
        on delete cascade,
    section_type text not null,
    title text,
    body_markdown text not null,
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index problem_guide_sections_guide_sort_idx
on public.problem_guide_sections(guide_id, sort_order);


-- =========================================================
-- Quick actions
-- =========================================================

create table public.problem_guide_actions (
    id uuid primary key default gen_random_uuid(),
    guide_id uuid not null
        references public.problem_guides(id)
        on delete cascade,
    action_key text,
    action_type text not null
        check (action_type in ('internal', 'external', 'phone')),
    label text not null,
    description text,
    href text,
    variant text not null default 'default'
        check (variant in ('default', 'primary', 'danger')),
    sort_order integer not null default 0,
    created_at timestamptz not null default now()
);

create index problem_guide_actions_guide_sort_idx
on public.problem_guide_actions(guide_id, sort_order);


-- =========================================================
-- Useful Korean phrases
-- =========================================================

create table public.problem_guide_phrases (
    id uuid primary key default gen_random_uuid(),
    guide_id uuid not null
        references public.problem_guides(id)
        on delete cascade,
    context text,
    text_en text not null,
    text_ko text not null,
    romanization text,
    sort_order integer not null default 0,
    created_at timestamptz not null default now()
);

create index problem_guide_phrases_guide_sort_idx
on public.problem_guide_phrases(guide_id, sort_order);


-- =========================================================
-- Official and external resources
-- =========================================================

create table public.problem_guide_resources (
    id uuid primary key default gen_random_uuid(),
    guide_id uuid not null
        references public.problem_guides(id)
        on delete cascade,
    resource_type text not null
        check (resource_type in ('official', 'external')),
    platform text,
    title text not null,
    description text,
    organization text,
    creator_name text,
    url text not null,
    language text,
    published_at timestamptz,
    last_checked_at timestamptz,
    is_active boolean not null default true,
    featured boolean not null default false,
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index problem_guide_resources_guide_type_sort_idx
on public.problem_guide_resources(guide_id, resource_type, sort_order);


-- =========================================================
-- Reuse the shared updated_at helper.
-- =========================================================

create trigger problem_guides_set_updated_at
before update on public.problem_guides
for each row
execute function public.set_updated_at();

create trigger problem_guide_sections_set_updated_at
before update on public.problem_guide_sections
for each row
execute function public.set_updated_at();

create trigger problem_guide_resources_set_updated_at
before update on public.problem_guide_resources
for each row
execute function public.set_updated_at();


-- =========================================================
-- Public read access is limited to published guides.
-- =========================================================

alter table public.problem_guides enable row level security;
alter table public.problem_guide_sections enable row level security;
alter table public.problem_guide_actions enable row level security;
alter table public.problem_guide_phrases enable row level security;
alter table public.problem_guide_resources enable row level security;

create policy "Public can read published problem guides"
on public.problem_guides
for select
using (status = 'published');

create policy "Public can read published problem guide sections"
on public.problem_guide_sections
for select
using (
    exists (
        select 1
        from public.problem_guides g
        where g.id = guide_id
        and g.status = 'published'
    )
);

create policy "Public can read published problem guide actions"
on public.problem_guide_actions
for select
using (
    exists (
        select 1
        from public.problem_guides g
        where g.id = guide_id
        and g.status = 'published'
    )
);

create policy "Public can read published problem guide phrases"
on public.problem_guide_phrases
for select
using (
    exists (
        select 1
        from public.problem_guides g
        where g.id = guide_id
        and g.status = 'published'
    )
);

create policy "Public can read published problem guide resources"
on public.problem_guide_resources
for select
using (
    exists (
        select 1
        from public.problem_guides g
        where g.id = guide_id
        and g.status = 'published'
    )
);
