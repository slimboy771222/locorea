-- =========================================================
-- Allow Locorea admins to read media object metadata
-- Required for Storage upsert / replacement workflows
-- =========================================================

create policy "Admins can read media objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'media'
  and public.is_admin()
);