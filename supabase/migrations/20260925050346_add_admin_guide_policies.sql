-- =========================================================
-- Locorea Admin Guide Policies
-- =========================================================

-- ---------------------------------------------------------
-- Guides
-- ---------------------------------------------------------

create policy "Admins can read all guides"
on public.guides
for select
to authenticated
using (public.is_admin());


create policy "Admins can insert guides"
on public.guides
for insert
to authenticated
with check (public.is_admin());


create policy "Admins can update guides"
on public.guides
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- Hard delete intentionally omitted.


-- ---------------------------------------------------------
-- Guide translations
-- ---------------------------------------------------------

create policy "Admins can read all guide translations"
on public.guide_translations
for select
to authenticated
using (public.is_admin());


create policy "Admins can insert guide translations"
on public.guide_translations
for insert
to authenticated
with check (public.is_admin());


create policy "Admins can update guide translations"
on public.guide_translations
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());