-- Existing hosted migration, recovered from its migration history.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
grant select, insert, update on public.profiles to authenticated;

create policy "users_can_read_own_profile" on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "users_can_create_own_profile" on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
create policy "users_can_update_own_profile" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
