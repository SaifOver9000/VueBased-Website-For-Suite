-- Run once in the Supabase SQL editor (Dashboard -> SQL Editor).
-- Adds click tracking and restricts writes to signed-in (admin) users.

-- 1. Click counter
alter table "Suites" add column if not exists click_count integer not null default 0;

-- Public visitors can't update rows directly, so clicks go through this function.
-- If your "Suites".id is uuid rather than bigint, change the parameter type.
create or replace function increment_suite_clicks(suite_id bigint)
returns void
language sql
security definer
set search_path = public
as $$
  update "Suites" set click_count = click_count + 1 where id = suite_id;
$$;

grant execute on function increment_suite_clicks(bigint) to anon, authenticated;

-- 2. Row Level Security: anyone can read, only signed-in users can write.
-- Remove any older policy that let the anon role insert/update/delete.
alter table "Suites" enable row level security;

drop policy if exists "Public can read suites" on "Suites";
drop policy if exists "Admins can insert suites" on "Suites";
drop policy if exists "Admins can update suites" on "Suites";
drop policy if exists "Admins can delete suites" on "Suites";

create policy "Public can read suites" on "Suites"
  for select to anon, authenticated using (true);

create policy "Admins can insert suites" on "Suites"
  for insert to authenticated with check (true);

create policy "Admins can update suites" on "Suites"
  for update to authenticated using (true) with check (true);

create policy "Admins can delete suites" on "Suites"
  for delete to authenticated using (true);
