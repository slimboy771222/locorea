-- =========================================================
-- Locorea Admin Content Policies
-- =========================================================

-- ---------------------------------------------------------
-- Places
-- Admins may read all places including draft/archived.
-- ---------------------------------------------------------

create policy "Admins can read all places"
on public.places
for select
to authenticated
using (public.is_admin());


create policy "Admins can insert places"
on public.places
for insert
to authenticated
with check (public.is_admin());


create policy "Admins can update places"
on public.places
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- Hard delete intentionally omitted for now.


-- ---------------------------------------------------------
-- Place translations
-- ---------------------------------------------------------

create policy "Admins can read all place translations"
on public.place_translations
for select
to authenticated
using (public.is_admin());


create policy "Admins can insert place translations"
on public.place_translations
for insert
to authenticated
with check (public.is_admin());


create policy "Admins can update place translations"
on public.place_translations
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- ---------------------------------------------------------
-- Media metadata
-- ---------------------------------------------------------

create policy "Admins can insert media assets"
on public.media_assets
for insert
to authenticated
with check (public.is_admin());


create policy "Admins can update media assets"
on public.media_assets
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());


create policy "Admins can delete media assets"
on public.media_assets
for delete
to authenticated
using (public.is_admin());


create policy "Admins can insert entity media"
on public.entity_media
for insert
to authenticated
with check (public.is_admin());


create policy "Admins can update entity media"
on public.entity_media
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());


create policy "Admins can delete entity media"
on public.entity_media
for delete
to authenticated
using (public.is_admin());


-- ---------------------------------------------------------
-- Storage
-- Only authenticated Locorea admins may modify media bucket.
-- Public read remains available through the public bucket.
-- ---------------------------------------------------------

create policy "Admins can upload media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'media'
  and public.is_admin()
);


create policy "Admins can update media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'media'
  and public.is_admin()
)
with check (
  bucket_id = 'media'
  and public.is_admin()
);


create policy "Admins can delete media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'media'
  and public.is_admin()
);