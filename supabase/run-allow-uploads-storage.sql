-- ============================================================
-- RUN IN SUPABASE SQL EDITOR if user uploads fail with "Upload failed"
-- or "new row violates row-level security".
-- Allows the app (anon key) to upload files to images/uploads/
-- ============================================================

drop policy if exists "Allow anon uploads to uploads folder" on storage.objects;
create policy "Allow anon uploads to uploads folder"
  on storage.objects
  for insert
  to anon
  with check (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = 'uploads'
  );

-- Allow public read so n8n can fetch the image from the URL
drop policy if exists "Allow public read uploads" on storage.objects;
create policy "Allow public read uploads"
  on storage.objects
  for select
  to public
  using (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = 'uploads'
  );
