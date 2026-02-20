-- ============================================================
-- RUN IN SUPABASE SQL EDITOR to allow public read access to theme reference images.
-- This allows n8n to fetch theme images from Supabase Storage public URLs.
-- ============================================================

-- Allow public read access to images/themes/ folder
drop policy if exists "Allow public read themes" on storage.objects;
create policy "Allow public read themes"
  on storage.objects
  for select
  to public
  using (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = 'themes'
  );

-- Optional: Allow authenticated/admin uploads to themes/ (for managing theme images)
-- Uncomment if you want to upload theme images via Supabase dashboard or API:
-- drop policy if exists "Allow authenticated uploads to themes" on storage.objects;
-- create policy "Allow authenticated uploads to themes"
--   on storage.objects
--   for insert
--   to authenticated
--   with check (
--     bucket_id = 'images'
--     and (storage.foldername(name))[1] = 'themes'
--   );
