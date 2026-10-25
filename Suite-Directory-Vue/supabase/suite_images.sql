-- Run once in the Supabase SQL editor, after admin_setup.sql.
-- Adds image uploads: a public Storage bucket plus an image_url column on "Suites".

-- 1. Column holding each suite's public image URL
alter table "Suites" add column if not exists image_url text;

-- 2. Public bucket: anyone can view images via their public URL
insert into storage.buckets (id, name, public)
values ('suite-images', 'suite-images', true)
on conflict (id) do nothing;

-- 3. Only signed-in (admin) users can upload, replace or delete images
drop policy if exists "Admins can upload suite images" on storage.objects;
drop policy if exists "Admins can update suite images" on storage.objects;
drop policy if exists "Admins can delete suite images" on storage.objects;

create policy "Admins can upload suite images" on storage.objects
  for insert to authenticated with check (bucket_id = 'suite-images');

create policy "Admins can update suite images" on storage.objects
  for update to authenticated using (bucket_id = 'suite-images');

create policy "Admins can delete suite images" on storage.objects
  for delete to authenticated using (bucket_id = 'suite-images');
