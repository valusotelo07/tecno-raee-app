-- Sprint 2: BE-0018 / BE-0019 / BE-0020. Public discovery only.
begin;

create table public.green_points (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  address text not null check (length(trim(address)) > 0),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  phone text,
  description text,
  time_zone text not null default 'America/Argentina/Buenos_Aires',
  active boolean not null default false,
  pickup_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index green_points_company_idx on public.green_points(company_id);
create index green_points_active_idx on public.green_points(name, id) where active;

-- ISO weekdays: Monday=1, Sunday=7. Multiple intervals allow split shifts.
-- A closing minute above 1440 represents closing on the following day.
create table public.green_point_schedules (
  id uuid primary key default gen_random_uuid(),
  green_point_id uuid not null references public.green_points(id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7),
  opens_minute smallint not null check (opens_minute between 0 and 1439),
  closes_minute smallint not null,
  check (closes_minute > opens_minute and closes_minute <= opens_minute + 1440),
  unique (green_point_id, weekday, opens_minute)
);
create table public.green_point_device_categories (
  green_point_id uuid not null references public.green_points(id) on delete cascade,
  device_category_id uuid not null references public.device_categories(id) on delete cascade,
  primary key (green_point_id, device_category_id)
);
create index green_point_categories_category_idx
  on public.green_point_device_categories(device_category_id);

create function private.validate_point_time_zone() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = new.time_zone) then
    raise exception 'Invalid point time zone' using errcode = '22023';
  end if;
  return new;
end;
$$;
revoke all on function private.validate_point_time_zone() from public, anon, authenticated;
create trigger green_point_time_zone before insert or update of time_zone on public.green_points
  for each row execute function private.validate_point_time_zone();
create trigger green_point_updated before update on public.green_points
  for each row execute function private.touch_updated_at();

alter table public.green_points enable row level security;
alter table public.green_point_schedules enable row level security;
alter table public.green_point_device_categories enable row level security;
revoke all on public.green_points, public.green_point_schedules,
  public.green_point_device_categories from public, anon, authenticated;
grant select on public.green_points, public.green_point_schedules,
  public.green_point_device_categories to anon, authenticated;
grant all on public.green_points, public.green_point_schedules,
  public.green_point_device_categories to service_role;

create policy points_public_active on public.green_points for select to anon, authenticated
  using (active and exists (select 1 from public.companies c
    where c.id = company_id and c.status = 'ACTIVE'));
create policy points_company_read on public.green_points for select to authenticated
  using (private.has_company_role(company_id) or (select private.is_platform_admin()));
-- Child visibility follows the parent point's RLS; unpublished data never leaks to guests.
create policy schedules_point_read on public.green_point_schedules for select to anon, authenticated
  using (exists (select 1 from public.green_points p where p.id = green_point_id));
create policy accepted_categories_point_read on public.green_point_device_categories
  for select to anon, authenticated
  using (exists (select 1 from public.green_points p where p.id = green_point_id)
    and exists (select 1 from public.device_categories c
      where c.id = device_category_id and c.active));

-- Owner CRUD is introduced in Sprint 4; no client may publish/configure points yet.
commit;
