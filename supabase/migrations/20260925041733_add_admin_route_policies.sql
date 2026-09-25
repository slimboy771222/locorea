-- =========================================================
-- Locorea Admin Route Policies
-- =========================================================

-- Routes

create policy "Admins can read all routes"
on public.routes
for select
to authenticated
using (public.is_admin());

create policy "Admins can insert routes"
on public.routes
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update routes"
on public.routes
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- Route translations

create policy "Admins can read all route translations"
on public.route_translations
for select
to authenticated
using (public.is_admin());

create policy "Admins can insert route translations"
on public.route_translations
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update route translations"
on public.route_translations
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- Route places / stops

create policy "Admins can read all route places"
on public.route_places
for select
to authenticated
using (public.is_admin());

create policy "Admins can insert route places"
on public.route_places
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update route places"
on public.route_places
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete route places"
on public.route_places
for delete
to authenticated
using (public.is_admin());