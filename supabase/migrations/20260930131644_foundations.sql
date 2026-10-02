-- BE-0014 / BE-0015 / BE-0016 / BE-0017. Apply before deploying this client.
begin;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The original recorded profile migration predates the email column.
-- Preserve the hosted column while making fresh local replays compatible.
alter table public.profiles add column if not exists email text not null default '';

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'SUSPENDED')),
  worker_limit integer not null default 20 check (worker_limit > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.company_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  role text not null check (role in ('company_owner', 'company_worker')),
  status text not null default 'INVITED' check (status in ('INVITED', 'ACTIVE', 'DISABLED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, company_id)
);
create index company_memberships_company_idx on public.company_memberships(company_id);
create table public.platform_admins (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.device_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) > 0),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A server-owned trigger replaces ensureProfile(). Preserve an existing profile trigger.
create function private.create_profile_for_auth_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, email, full_name)
  values (new.id, coalesce(new.email, ''),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(coalesce(new.email, ''), '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function private.create_profile_for_auth_user() from public, anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_trigger t
    where t.tgrelid = 'auth.users'::regclass and not t.tgisinternal and t.tgenabled <> 'D'
      and (t.tgtype & 4) = 4 and (t.tgtype & 1) = 1
      and pg_get_functiondef(t.tgfoid) ~* '\mprofiles\M'
  ) then
    create trigger tecnoraee_create_profile after insert on auth.users
      for each row execute function private.create_profile_for_auth_user();
  end if;
end;
$$;

-- Backfill historical identities without changing existing profile data.
insert into public.profiles(id, email, full_name, created_at, updated_at)
select id, coalesce(email, ''),
  coalesce(nullif(trim(raw_user_meta_data ->> 'full_name'), ''), split_part(coalesce(email, ''), '@', 1)),
  coalesce(created_at, now()), now() from auth.users
on conflict (id) do nothing;

create function private.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function private.touch_updated_at() from public, anon, authenticated;
create trigger tecnoraee_profile_updated before update on public.profiles
  for each row execute function private.touch_updated_at();
create trigger tecnoraee_company_updated before update on public.companies
  for each row execute function private.touch_updated_at();
create trigger tecnoraee_membership_updated before update on public.company_memberships
  for each row execute function private.touch_updated_at();

-- Private helpers avoid recursive membership RLS; no caller-supplied user identity.
create function private.is_platform_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.platform_admins where user_id = auth.uid()
  );
$$;
create function private.has_company_role(target_company uuid, owner_only boolean default false)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.company_memberships m
    join public.companies c on c.id = m.company_id
    where m.user_id = auth.uid() and m.company_id = target_company
      and m.status = 'ACTIVE' and c.status = 'ACTIVE'
      and (not owner_only or m.role = 'company_owner')
  );
$$;
revoke all on function private.is_platform_admin() from public, anon, authenticated;
revoke all on function private.has_company_role(uuid, boolean) from public, anon, authenticated;
grant execute on function private.is_platform_admin() to authenticated;
grant execute on function private.has_company_role(uuid, boolean) to authenticated;

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_memberships enable row level security;
alter table public.platform_admins enable row level security;
alter table public.device_categories enable row level security;

-- Replace legacy profile policies, including any permissive public read policy.
do $$
declare existing_policy record;
begin
  for existing_policy in select policyname from pg_policies
    where schemaname = 'public' and tablename = 'profiles'
  loop
    execute format('drop policy %I on public.profiles', existing_policy.policyname);
  end loop;
end;
$$;
revoke all on public.profiles, public.companies, public.company_memberships,
  public.platform_admins, public.device_categories from public, anon, authenticated;
-- Remove possible legacy column grants too (a table revoke does not remove them).
revoke all (id, email, full_name, created_at, updated_at) on public.profiles from public, anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;
grant select on public.companies, public.device_categories to anon, authenticated;
grant update (name) on public.companies to authenticated;
grant select on public.company_memberships, public.platform_admins to authenticated;
grant all on public.profiles, public.companies, public.company_memberships,
  public.platform_admins, public.device_categories to service_role;

create policy profiles_read_self on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy companies_public_active on public.companies for select to anon, authenticated
  using (status = 'ACTIVE');
create policy companies_member_read on public.companies for select to authenticated
  using (exists (select 1 from public.company_memberships m
    where m.company_id = companies.id and m.user_id = (select auth.uid()))
    or (select private.is_platform_admin()));
create policy companies_owner_update on public.companies for update to authenticated
  using (private.has_company_role(id, true)) with check (private.has_company_role(id, true));
create policy memberships_read on public.company_memberships for select to authenticated
  using (user_id = (select auth.uid()) or private.has_company_role(company_id, true)
    or (select private.is_platform_admin()));
create policy platform_admins_read_self on public.platform_admins for select to authenticated
  using (user_id = (select auth.uid()));
create policy categories_public_active on public.device_categories for select to anon, authenticated
  using (active);
create policy categories_admin_read on public.device_categories for select to authenticated
  using ((select private.is_platform_admin()));

insert into public.device_categories(slug, name, sort_order) values
  ('celulares', 'Celulares', 1), ('tablets', 'Tablets', 2),
  ('notebooks', 'Notebooks', 3), ('computadoras', 'Computadoras', 4),
  ('monitores', 'Monitores', 5), ('televisores', 'Televisores', 6),
  ('impresoras', 'Impresoras', 7), ('consolas', 'Consolas', 8),
  ('auriculares', 'Auriculares', 9), ('cargadores', 'Cargadores', 10),
  ('cables', 'Cables', 11), ('electrodomesticos-pequenos', 'Electrodomésticos pequeños', 12),
  ('otros', 'Otros', 13);

commit;
