begin;

-- Delivery credits retain their source organization. Spending uses one global balance.
-- Existing credits are preserved; no balance backfill or destructive ledger conversion.
create table public.rewards (
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null references public.companies(id),
 title text not null check(length(trim(title)) between 1 and 120),
 description text not null default '' check(length(description)<=2000),
 category text not null check(category in ('food','wellness','education','shopping','other')),
 points_cost integer not null check(points_cost between 1 and 1000000),
 image_url text check(image_url is null or (length(image_url)<=2000 and image_url ~ '^https://')),
 business_name text not null check(length(trim(business_name)) between 1 and 120),
 address text not null check(length(trim(address)) between 1 and 300),
 hours text not null default '' check(length(hours)<=500),
 latitude double precision check(latitude between -90 and 90),
 longitude double precision check(longitude between -180 and 180),
 stock integer check(stock between 0 and 1000000),
 active boolean not null default false,
 starts_at timestamptz, ends_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check((latitude is null)=(longitude is null)),
 check(starts_at is null or ends_at is null or starts_at<ends_at)
);
create index rewards_company_idx on public.rewards(company_id);
create index rewards_catalog_idx on public.rewards(created_at desc,id) where active;
create trigger reward_updated before update on public.rewards for each row execute function private.touch_updated_at();

-- A reservation is an immutable debit. Receiving the prize consumes its token once,
-- without deducting the points a second time. No client can write either ledger.
create table public.reward_redemptions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id),
 reward_id uuid not null references public.rewards(id),
 company_id uuid not null references public.companies(id),
 citizen_name text not null,
 points_cost integer not null check(points_cost>0),
 reward_snapshot jsonb not null,
 verification_token text not null unique,
 client_request_id uuid not null, request_payload jsonb not null,
 status text not null default 'RESERVED' check(status in ('RESERVED','REDEEMED')),
 created_at timestamptz not null default now(),
 redeemed_at timestamptz, redeemed_by uuid references public.profiles(id),
 unique(user_id,client_request_id),
 check((status='REDEEMED')=(redeemed_at is not null and redeemed_by is not null))
);
create index redemptions_user_date_idx on public.reward_redemptions(user_id,created_at desc,id);
create index redemptions_company_idx on public.reward_redemptions(company_id);
create index redemptions_reward_idx on public.reward_redemptions(reward_id);
create index redemptions_actor_idx on public.reward_redemptions(redeemed_by) where redeemed_by is not null;
alter table public.rewards enable row level security;
alter table public.reward_redemptions enable row level security;
revoke all on public.rewards,public.reward_redemptions from public,anon,authenticated;
grant select on public.rewards to anon,authenticated;
-- Do not expose idempotency request payloads through the Data API.
grant select (id,user_id,reward_id,company_id,citizen_name,points_cost,reward_snapshot,
 verification_token,status,created_at,redeemed_at,redeemed_by) on public.reward_redemptions to authenticated;
grant all on public.rewards,public.reward_redemptions to service_role;
create policy rewards_catalog_read on public.rewards for select to anon,authenticated using(
 active and (starts_at is null or starts_at<=now()) and (ends_at is null or ends_at>now())
 and exists(select 1 from public.companies c where c.id=company_id and c.status='ACTIVE'));
create policy rewards_team_read on public.rewards for select to authenticated using(
 private.has_company_role(company_id) or (select private.is_platform_admin()));
create policy redemptions_read on public.reward_redemptions for select to authenticated using(
 user_id=(select auth.uid()) or private.has_company_role(company_id) or (select private.is_platform_admin()));

create function private.global_points(target uuid) returns bigint
 language sql stable set search_path='' as $$
 select coalesce((select sum(amount) from public.points_transactions where user_id=target),0)
  - coalesce((select sum(points_cost) from public.reward_redemptions where user_id=target),0);
$$;
revoke all on function private.global_points(uuid) from public,anon,authenticated;

create or replace function private.my_delivery_balance() returns jsonb
 language plpgsql stable security definer set search_path='' as $$
declare actor uuid:=auth.uid(); xp bigint; balances jsonb;
begin
 if actor is null then raise exception 'Iniciá sesión.' using errcode='42501'; end if;
 select coalesce(sum(amount),0) into xp from public.impact_transactions where user_id=actor;
 -- Retained for old client compatibility: these are historical credits, not spendable wallets.
 select coalesce(jsonb_agg(to_jsonb(b)),'[]'::jsonb) into balances from (
  select t.company_id,c.name as company_name,sum(t.amount) as points from public.points_transactions t
   join public.companies c on c.id=t.company_id where t.user_id=actor group by t.company_id,c.name order by c.name
 ) b;
 return jsonb_build_object('points',private.global_points(actor),'xp',xp,'companies',balances,'level',
  (select to_jsonb(l) from public.impact_levels l where l.minimum_xp<=xp order by l.minimum_xp desc limit 1),'nextLevel',
  (select to_jsonb(l) from public.impact_levels l where l.minimum_xp>xp order by l.minimum_xp limit 1));
end;
$$;

create function private.my_points_history() returns jsonb
 language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Iniciá sesión.' using errcode='42501'; end if;
 return coalesce((select jsonb_agg(to_jsonb(m) order by m.created_at desc,m.id) from (
  select * from (
   select t.id,t.amount,'Entrega confirmada'::text as title,c.name as source,t.created_at
    from public.points_transactions t join public.companies c on c.id=t.company_id where t.user_id=auth.uid()
   union all
   select r.id,-r.points_cost::bigint,r.reward_snapshot->>'title',r.reward_snapshot->>'business_name',r.created_at
    from public.reward_redemptions r where r.user_id=auth.uid()
  ) movements order by created_at desc,id limit 50
 ) m),'[]'::jsonb);
end;
$$;
revoke all on function private.my_points_history() from public,anon,authenticated;
grant execute on function private.my_points_history() to authenticated;
create function public.my_points_history() returns jsonb language sql security invoker set search_path='' as $$
 select private.my_points_history();
$$;
revoke all on function public.my_points_history() from public,anon,authenticated;
grant execute on function public.my_points_history() to authenticated;

create function private.redemption_json(target uuid) returns jsonb
 language sql stable set search_path='' as $$
 select to_jsonb(r)-'client_request_id'-'request_payload' from public.reward_redemptions r where id=target;
$$;
revoke all on function private.redemption_json(uuid) from public,anon,authenticated;

-- The private definer is necessary for atomic, server-owned ledger writes. Public
-- entry is invoker-only; every branch checks auth, ownership and current company access.
create function private.reward_command(operation text,payload jsonb) returns jsonb
 language plpgsql security definer set search_path='' as $$
declare
 actor uuid:=auth.uid(); company uuid; target uuid; request_id uuid;
 r public.rewards%rowtype; redemption public.reward_redemptions%rowtype;
 random_token text; code text;
begin
 if actor is null then raise exception 'Iniciá sesión para continuar.' using errcode='42501'; end if;
 if payload is null or jsonb_typeof(payload)<>'object' or length(payload::text)>15000 then
  raise exception 'Datos inválidos.' using errcode='22023'; end if;

 if operation='save' then
  if not private.is_platform_admin() then
   raise exception 'Sólo los administradores pueden publicar premios.' using errcode='42501'; end if;
  company:=(payload->>'companyId')::uuid;
  perform 1 from public.companies where id=company and status='ACTIVE' for share;
  if not found then raise exception 'Seleccioná un comercio activo.' using errcode='22023'; end if;
  target:=nullif(payload->>'id','')::uuid;
  if target is not null then
   select * into r from public.rewards where id=target and company_id=company for update;
   if not found then raise exception 'Premio ajeno a esta empresa.' using errcode='42501'; end if;
  end if;
  if target is null then
   insert into public.rewards(company_id,title,description,category,points_cost,image_url,business_name,address,hours,latitude,longitude,stock,active,starts_at,ends_at)
   values(company,trim(payload->>'title'),coalesce(payload->>'description',''),payload->>'category',(payload->>'pointsCost')::integer,
    nullif(payload->>'imageUrl',''),trim(payload->>'businessName'),trim(payload->>'address'),coalesce(payload->>'hours',''),
    (payload->>'latitude')::double precision,(payload->>'longitude')::double precision,(payload->>'stock')::integer,
    coalesce((payload->>'active')::boolean,false),nullif(payload->>'startsAt','')::timestamptz,nullif(payload->>'endsAt','')::timestamptz)
   returning * into r;
  else
   update public.rewards set title=trim(payload->>'title'),description=coalesce(payload->>'description',''),category=payload->>'category',
    points_cost=(payload->>'pointsCost')::integer,image_url=nullif(payload->>'imageUrl',''),business_name=trim(payload->>'businessName'),
    address=trim(payload->>'address'),hours=coalesce(payload->>'hours',''),latitude=(payload->>'latitude')::double precision,
    longitude=(payload->>'longitude')::double precision,stock=(payload->>'stock')::integer,active=coalesce((payload->>'active')::boolean,false),
    starts_at=nullif(payload->>'startsAt','')::timestamptz,ends_at=nullif(payload->>'endsAt','')::timestamptz
    where id=target returning * into r;
  end if;
  insert into public.audit_log(actor_id,action,target_id,company_id) values(actor,'reward_saved',r.id,company);
  return to_jsonb(r);
 end if;

 if operation='reserve' then
  if private.current_verified_email() is null then raise exception 'Confirmá tu email antes de canjear.' using errcode='42501'; end if;
  request_id:=(payload->>'requestId')::uuid;
  if request_id is null then raise exception 'Identificador de solicitud requerido.' using errcode='22023'; end if;
  -- All debits for the user serialize, including requests for different rewards/companies.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('wallet:'||actor::text,0));
  select * into redemption from public.reward_redemptions where user_id=actor and client_request_id=request_id;
  if found then
   if redemption.request_payload is distinct from payload then raise exception 'No reutilices la solicitud con otros datos.' using errcode='22023'; end if;
   return private.redemption_json(redemption.id);
  end if;
  select company_id into company from public.rewards where id=(payload->>'rewardId')::uuid;
  perform 1 from public.companies where id=company and status='ACTIVE' for share;
  if not found then raise exception 'El comercio no está disponible.' using errcode='22023'; end if;
  select * into r from public.rewards where id=(payload->>'rewardId')::uuid for update;
  if not found or not r.active or (r.starts_at is not null and r.starts_at>now()) or (r.ends_at is not null and r.ends_at<=now()) then
   raise exception 'Este premio ya no está disponible.' using errcode='22023'; end if;
  if r.stock=0 then raise exception 'Este premio está agotado.' using errcode='22023'; end if;
  if private.global_points(actor)<r.points_cost then raise exception 'Todavía no tenés puntos suficientes.' using errcode='22023'; end if;
  random_token:=upper(replace(pg_catalog.gen_random_uuid()::text,'-',''));
  code:='TRR-'||substring(random_token,1,8)||'-'||substring(random_token,9,8)||'-'||substring(random_token,17,8)||'-'||substring(random_token,25,8);
  insert into public.reward_redemptions(user_id,reward_id,company_id,citizen_name,points_cost,reward_snapshot,verification_token,client_request_id,request_payload)
   select actor,r.id,r.company_id,p.full_name,r.points_cost,to_jsonb(r),code,request_id,payload from public.profiles p where p.id=actor
   returning id into target;
  if r.stock is not null then update public.rewards set stock=stock-1 where id=r.id; end if;
  insert into public.audit_log(actor_id,action,target_id,company_id,details)
   values(actor,'reward_reserved',target,r.company_id,jsonb_build_object('points',r.points_cost));
  return private.redemption_json(target);
 end if;

 if operation in ('lookup','confirm') then
  company:=(payload->>'companyId')::uuid;
  perform 1 from public.companies where id=company and status='ACTIVE' for share;
  if not found or not private.has_company_role(company) then raise exception 'No tenés acceso operativo a esta empresa.' using errcode='42501'; end if;
  perform 1 from public.company_memberships where user_id=actor and company_id=company and status='ACTIVE' for share;
  code:=upper(trim(payload->>'code'));
  select * into redemption from public.reward_redemptions where verification_token=code and company_id=company for update;
  if not found then raise exception 'Código no encontrado para esta empresa.' using errcode='22023'; end if;
 elsif operation='get' then
  select * into redemption from public.reward_redemptions where id=(payload->>'id')::uuid and user_id=actor;
  if not found then raise exception 'No podés acceder a este canje.' using errcode='42501'; end if;
 else raise exception 'Operación no disponible.' using errcode='22023';
 end if;
 if operation='confirm' and redemption.status='RESERVED' then
  if redemption.user_id=actor then raise exception 'Otra persona del equipo debe entregar tu premio.' using errcode='42501'; end if;
  update public.reward_redemptions set status='REDEEMED',redeemed_at=now(),redeemed_by=actor where id=redemption.id;
  insert into public.audit_log(actor_id,action,target_id,company_id) values(actor,'reward_redeemed',redemption.id,company);
 end if;
 return private.redemption_json(redemption.id);
end;
$$;
revoke all on function private.reward_command(text,jsonb) from public,anon,authenticated;
grant execute on function private.reward_command(text,jsonb) to authenticated;
create function public.reward_command(operation text,payload jsonb) returns jsonb language sql security invoker set search_path='' as $$
 select private.reward_command(operation,payload);
$$;
revoke all on function public.reward_command(text,jsonb) from public,anon,authenticated;
grant execute on function public.reward_command(text,jsonb) to authenticated;
notify pgrst,'reload schema';
commit;
