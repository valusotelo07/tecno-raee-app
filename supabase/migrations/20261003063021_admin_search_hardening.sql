-- Privileged searches and edits remain behind the database admin check.
create or replace function private.admin_search_records(search_text text, entity_kind text default 'users', page_offset integer default 0)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare query text := translate(lower(trim(search_text)),'áéíóúüñ','aeiouun'); result jsonb;
begin
 if not private.is_platform_admin() then raise exception 'Sólo los administradores pueden buscar cuentas.' using errcode='42501'; end if;
 if entity_kind not in ('users','companies','points','rewards') or page_offset < 0 or page_offset > 100000 or length(query)>150 then
  raise exception 'Búsqueda inválida.' using errcode='22023';
 end if;
 if query = '' then return '[]'::jsonb; end if;
 select coalesce(jsonb_agg(to_jsonb(search_rows)), '[]'::jsonb) into result from (
  select * from (
   select 'users'::text as kind, p.id, p.full_name as name, p.email as description, null::uuid as company_id
    from public.profiles p where entity_kind='users'
   union all
   select 'companies', c.id,c.name,c.status,c.id from public.companies c where entity_kind='companies'
   union all
   select 'points',p.id,p.name,p.address,p.company_id from public.green_points p where entity_kind='points'
   union all
   select 'rewards',r.id,r.title,r.business_name,r.company_id from public.rewards r where entity_kind='rewards'
  ) candidates where strpos(translate(lower(coalesce(name,'')),'áéíóúüñ','aeiouun'),query)>0 or strpos(id::text,query)>0
  order by lower(name),id limit 26 offset page_offset
 ) search_rows;
 return result;
end $$;
revoke all on function private.admin_search_records(text,text,integer) from public,anon;
grant execute on function private.admin_search_records(text,text,integer) to authenticated;

create or replace function private.admin_edit_record(entity_kind text, record_id uuid, payload jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare before_state jsonb; after_state jsonb; company uuid;
begin
 if not private.is_platform_admin() then raise exception 'Sólo los administradores pueden editar cuentas.' using errcode='42501'; end if;
 if length(payload::text)>10000 or coalesce(length(trim(payload->>'name')),0) not between 1 and 150 then
  raise exception 'Ingresá un nombre de hasta 150 caracteres.' using errcode='22023';
 end if;
 if entity_kind='users' then
  select jsonb_build_array(jsonb_build_object('id',id,'name',full_name)) into before_state from public.profiles where id=record_id for update;
  if before_state is null then raise exception 'Usuario no encontrado.' using errcode='22023'; end if;
  update public.profiles set full_name=trim(payload->>'name'),updated_at=now() where id=record_id;
  select jsonb_build_array(jsonb_build_object('id',id,'name',full_name)) into after_state from public.profiles where id=record_id;
 elsif entity_kind='companies' then
  company:=record_id;
  select jsonb_build_array(jsonb_build_object('id',id,'name',name)) into before_state from public.companies where id=record_id for update;
  if before_state is null then raise exception 'Empresa no encontrada.' using errcode='22023'; end if;
  if exists(select 1 from public.company_details where company_id=record_id) then
   before_state := before_state || (select jsonb_build_array(to_jsonb(d) || jsonb_build_object('id',company_id,'name',legal_name)) from public.company_details d where company_id=record_id);
   if coalesce(length(trim(payload->>'phone')),0) not between 1 and 100 or coalesce(length(trim(payload->>'address')),0) not between 1 and 500
     or length(coalesce(payload->>'website',''))>1000 or length(coalesce(payload->>'description',''))>2000 then
    raise exception 'Revisá los datos de contacto.' using errcode='22023';
   end if;
   update public.company_details set phone=trim(payload->>'phone'),address=trim(payload->>'address'),website=payload->>'website',description=payload->>'description' where company_id=record_id;
  end if;
  update public.companies set name=trim(payload->>'name'),updated_at=now() where id=record_id;
  select jsonb_build_array(jsonb_build_object('id',id,'name',name)) into after_state from public.companies where id=record_id;
  after_state := after_state || coalesce((select jsonb_build_array(to_jsonb(d) || jsonb_build_object('id',company_id,'name',legal_name)) from public.company_details d where company_id=record_id),'[]'::jsonb);
 else raise exception 'Tipo de edición inválido.' using errcode='22023';
 end if;
 insert into public.audit_log(actor_id,action,target_id,company_id,details)
  values(auth.uid(),'admin_edit_'||entity_kind,record_id,company,jsonb_build_object('before',before_state,'after',after_state));
end $$;
revoke all on function private.admin_edit_record(text,uuid,jsonb) from public,anon;
grant execute on function private.admin_edit_record(text,uuid,jsonb) to authenticated;


create or replace function public.admin_search_records(search_text text,entity_kind text default 'users',page_offset integer default 0)
returns jsonb language sql security invoker set search_path='' as $$
select private.admin_search_records(search_text,entity_kind,page_offset);
$$;
create or replace function public.admin_edit_record(entity_kind text,record_id uuid,payload jsonb)
returns void language sql security invoker set search_path='' as $$
select private.admin_edit_record(entity_kind,record_id,payload);
$$;
