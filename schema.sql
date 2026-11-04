-- Run this SQL in Supabase Dashboard > SQL Editor.
-- The first administrator is added manually after they sign in with Google.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists public.portfolio_content (
  id integer primary key check (id = 1),
  content jsonb not null default '{}'::jsonb
);

alter table public.admin_users enable row level security;
alter table public.portfolio_content enable row level security;

-- Visitors can read the portfolio. Only allowlisted admins can change it.
create policy "Public can read portfolio"
on public.portfolio_content for select
to anon, authenticated
using (true);

create policy "Admins can insert portfolio"
on public.portfolio_content for insert
to authenticated
with check (
  exists (select 1 from public.admin_users where user_id = auth.uid())
);

create policy "Admins can update portfolio"
on public.portfolio_content for update
to authenticated
using (
  exists (select 1 from public.admin_users where user_id = auth.uid())
)
with check (
  exists (select 1 from public.admin_users where user_id = auth.uid())
);

-- No public policies are created for admin_users.
-- Create the storage bucket named portfolio-media and make it public
-- only for reading profile images. Restrict uploads to authenticated admins.

insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do nothing;

create policy "Public can view portfolio media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'portfolio-media');

create policy "Admins can upload portfolio media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'portfolio-media'
  and exists (select 1 from public.admin_users where user_id = auth.uid())
);

create policy "Admins can update portfolio media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'portfolio-media'
  and exists (select 1 from public.admin_users where user_id = auth.uid())
)
with check (
  bucket_id = 'portfolio-media'
  and exists (select 1 from public.admin_users where user_id = auth.uid())
);

-- After the owner has signed in once with Google, find their auth.users.id
-- in Authentication > Users, then run:
-- insert into public.admin_users (user_id)
-- values ('PASTE-THE-USER-UUID-HERE');
