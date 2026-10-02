begin;
-- Qualify command-local status assignments with their explicit PL/pgSQL block.
create or replace function private.portal_command(operation text, payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
<<portal_state>>
declare actor uuid := auth.uid(); admin boolean := private.is_platform_admin();
 target uuid; company uuid; invitation uuid; item jsonb; result jsonb := '{}'::jsonb;
 app public.company_applications%rowtype; inv public.company_invitations%rowtype;
 lim public.company_limit_requests%rowtype; member public.company_memberships%rowtype;
 email text; used integer; cap integer; status text; day integer;
begin
 if actor is null then raise exception 'Iniciá sesión para continuar.' using errcode='42501'; end if;
 if length(payload::text)>50000 then raise exception 'Datos demasiado extensos.' using errcode='22023'; end if;
 target := nullif(payload->>'id','')::uuid;
 company := nullif(payload->>'companyId','')::uuid;
 case operation
 when 'submit_application','resubmit_application' then
  if private.current_verified_email() is null then raise exception 'Confirmá tu email antes de solicitar el alta.' using errcode='42501'; end if;
  foreach email in array array['businessName','legalName','corporateEmail','phone','responsible','address','activity','documentPath'] loop
   if coalesce(length(trim(payload->>email)),0) not between 1 and 1000 then raise exception 'Completá los campos obligatorios.' using errcode='22023'; end if;
  end loop;
  if coalesce(payload->>'taxId','') !~ '^[0-9]{11}$' or coalesce(payload->>'corporateEmail','') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
   raise exception 'Revisá el CUIT y el email corporativo.' using errcode='22023'; end if;
  if not exists(select 1 from storage.objects where bucket_id='company-documents' and name=payload->>'documentPath'
   and (storage.foldername(name))[1]=actor::text) then raise exception 'Adjuntá la documentación de tu organización.' using errcode='22023'; end if;
  if operation='resubmit_application' then
   select * into app from public.company_applications where id=target for update;
   if app.applicant_id is distinct from actor or app.status <> 'NEEDS_INFO' then raise exception 'No podés modificar esta solicitud.' using errcode='42501'; end if;
   update public.company_applications set business_name=trim(payload->>'businessName'),legal_name=trim(payload->>'legalName'),
    tax_id=payload->>'taxId',corporate_email=lower(trim(payload->>'corporateEmail')),phone=trim(payload->>'phone'),responsible=trim(payload->>'responsible'),
    address=trim(payload->>'address'),activity=trim(payload->>'activity'),website=payload->>'website',description=payload->>'description',
    document_path=payload->>'documentPath',status='SUBMITTED',updated_at=now() where id=target;
  else
   insert into public.company_applications(applicant_id,business_name,legal_name,tax_id,corporate_email,phone,responsible,address,activity,website,description,document_path)
   values(actor,trim(payload->>'businessName'),trim(payload->>'legalName'),payload->>'taxId',lower(trim(payload->>'corporateEmail')),
    trim(payload->>'phone'),trim(payload->>'responsible'),trim(payload->>'address'),trim(payload->>'activity'),payload->>'website',payload->>'description',payload->>'documentPath') returning id into target;
  end if;
 when 'review_application' then
  if not admin then raise exception 'Sólo el administrador puede revisar solicitudes.' using errcode='42501'; end if;
  select * into app from public.company_applications where id=target for update;
  if app.id is null then raise exception 'Solicitud no encontrada.' using errcode='22023'; end if;
  status:=payload->>'status';
  if app.status='APPROVED' and status='APPROVED' then return jsonb_build_object('id',target,'companyId',app.company_id); end if;
  if app.status not in ('SUBMITTED','UNDER_REVIEW') or status not in ('UNDER_REVIEW','NEEDS_INFO','APPROVED','REJECTED') then raise exception 'La solicitud ya cambió de estado. Actualizá la pantalla.' using errcode='22023'; end if;
  if status in ('NEEDS_INFO','REJECTED') and coalesce(length(trim(payload->>'note')),0)<5 then raise exception 'Indicá el motivo de la revisión.' using errcode='22023'; end if;
  if status='APPROVED' then
   insert into public.companies(name) values(app.business_name) returning id into company;
   insert into public.company_details values(company,app.legal_name,app.tax_id,app.corporate_email,app.phone,app.responsible,app.address,app.activity,app.website,app.description);
   select lower(u.email) into email from auth.users u where u.id=app.applicant_id and u.email_confirmed_at is not null;
   if email is null then raise exception 'El responsable debe confirmar su email.' using errcode='22023'; end if;
   insert into public.company_invitations(company_id,email,role,invited_by) values(company,email,'company_owner',actor) returning id into invitation;
   result:=jsonb_build_object('invitationId',invitation,'companyId',company);
  end if;
  update public.company_applications set status=portal_state.status,review_note=payload->>'note',reviewed_by=actor,
   company_id=company,updated_at=now() where id=target;
 when 'accept_invitation' then
  select company_id into company from public.company_invitations where id=target;
  perform 1 from public.companies where id=company and public.companies.status='ACTIVE' for update;
  if not found then raise exception 'La empresa no está activa.' using errcode='42501'; end if;
  select * into inv from public.company_invitations where id=target for update;
  if inv.email is distinct from private.current_verified_email() then raise exception 'Esta invitación corresponde a otra cuenta.' using errcode='42501'; end if;
  if inv.status='ACCEPTED' and inv.accepted_by=actor then return jsonb_build_object('companyId',company); end if;
  if inv.status<>'INVITED' then raise exception 'La invitación ya no está disponible.' using errcode='22023'; end if;
  insert into public.company_memberships(user_id,company_id,role,status) values(actor,company,inv.role,'ACTIVE')
   on conflict(user_id,company_id) do update set status='ACTIVE',role=excluded.role;
  update public.company_invitations set status='ACCEPTED',accepted_by=actor where id=target;
 when 'save_company' then
  if not private.has_company_role(company,true) then raise exception 'Sólo el responsable puede editar la empresa.' using errcode='42501'; end if;
  if coalesce(length(trim(payload->>'name')),0) not between 1 and 150 or coalesce(length(trim(payload->>'phone')),0)=0
   or coalesce(length(trim(payload->>'address')),0)=0 then raise exception 'Completá nombre, teléfono y dirección.' using errcode='22023'; end if;
  update public.companies set name=trim(payload->>'name') where id=company;
  update public.company_details set phone=trim(payload->>'phone'),address=trim(payload->>'address'),website=payload->>'website',description=payload->>'description' where company_id=company;
 when 'save_point' then
  if not private.has_company_role(company,true) then raise exception 'Sólo el responsable puede editar puntos verdes.' using errcode='42501'; end if;
  perform 1 from public.companies where id=company for update;
  if target is not null and not exists(select 1 from public.green_points where id=target and company_id=company) then raise exception 'Punto no encontrado en tu empresa.' using errcode='42501'; end if;
  if coalesce(length(trim(payload->>'name')),0) not between 1 and 150 or coalesce(length(trim(payload->>'address')),0)=0
   or jsonb_array_length(coalesce(payload->'categories','[]'))=0 then raise exception 'Completá nombre, dirección y categorías.' using errcode='22023'; end if;
  if coalesce((payload->>'active')::boolean,false) and jsonb_array_length(coalesce(payload->'schedules','[]'))=0 then raise exception 'Agregá horarios antes de publicar.' using errcode='22023'; end if;
  if target is null then
   insert into public.green_points(company_id,name,address,latitude,longitude,phone,description,time_zone,active,pickup_enabled)
   values(company,trim(payload->>'name'),trim(payload->>'address'),(payload->>'latitude')::float8,(payload->>'longitude')::float8,
    payload->>'phone',payload->>'description',payload->>'timeZone',(payload->>'active')::boolean,(payload->>'pickupEnabled')::boolean) returning id into target;
  else
   update public.green_points set name=trim(payload->>'name'),address=trim(payload->>'address'),latitude=(payload->>'latitude')::float8,
    longitude=(payload->>'longitude')::float8,phone=payload->>'phone',description=payload->>'description',time_zone=payload->>'timeZone',
    active=(payload->>'active')::boolean,pickup_enabled=(payload->>'pickupEnabled')::boolean where id=target;
  end if;
  delete from public.green_point_schedules where green_point_id=target;
  for item in select value from jsonb_array_elements(payload->'schedules') loop
   insert into public.green_point_schedules(green_point_id,weekday,opens_minute,closes_minute)
    values(target,(item->>'weekday')::int,(item->>'opensMinute')::int,(item->>'closesMinute')::int);
  end loop;
  delete from public.green_point_device_categories where green_point_id=target;
  for item in select value from jsonb_array_elements(payload->'categories') loop
   if not exists(select 1 from public.device_categories where id=(item#>>'{}')::uuid and active) then raise exception 'Categoría no disponible.' using errcode='22023'; end if;
   insert into public.green_point_device_categories values(target,(item#>>'{}')::uuid);
  end loop;
 when 'save_points' then
  if not private.has_company_role(company,true) then raise exception 'Sólo el responsable puede configurar puntos.' using errcode='42501'; end if;
  for item in select value from jsonb_array_elements(payload->'categories') loop
   if not exists(select 1 from public.device_categories where id=(item->>'id')::uuid and active) then raise exception 'Categoría no disponible.' using errcode='22023'; end if;
   insert into public.company_device_points values(company,(item->>'id')::uuid,(item->>'points')::int)
    on conflict(company_id,device_category_id) do update set points=excluded.points;
  end loop;
 when 'invite_worker' then
  if not private.has_company_role(company,true) then raise exception 'Sólo el responsable puede invitar trabajadores.' using errcode='42501'; end if;
  select worker_limit into cap from public.companies where id=company for update;
  email:=lower(trim(payload->>'email'));
  if email is null or email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Ingresá un email válido.' using errcode='22023'; end if;
  if exists(select 1 from public.company_memberships m join auth.users u on u.id=m.user_id where m.company_id=company and lower(u.email)=email and m.status<>'DISABLED') then raise exception 'La persona ya pertenece al equipo.' using errcode='22023'; end if;
  if exists(select 1 from public.company_memberships m join auth.users u on u.id=m.user_id where m.company_id=company and lower(u.email)=email and m.role='company_owner') then raise exception 'No podés cambiar el rol de un responsable.' using errcode='42501'; end if;
  select (select count(*) from public.company_memberships where company_id=company and role='company_worker' and public.company_memberships.status in ('ACTIVE','INVITED'))+
   (select count(*) from public.company_invitations where company_id=company and role='company_worker' and public.company_invitations.status='INVITED') into used;
  if used>=cap then raise exception 'Alcanzaste el límite de trabajadores. Solicitá una ampliación.' using errcode='22023'; end if;
  insert into public.company_invitations(company_id,email,role,invited_by) values(company,email,'company_worker',actor) returning id into invitation;
  result:=jsonb_build_object('invitationId',invitation);
 when 'cancel_invitation' then
  select * into inv from public.company_invitations where id=target;
  company:=inv.company_id;
  if not private.has_company_role(company,true) or inv.role<>'company_worker' then raise exception 'No podés cancelar esta invitación.' using errcode='42501'; end if;
  perform 1 from public.companies where id=company for update;
  update public.company_invitations set status='CANCELLED' where id=target and public.company_invitations.status='INVITED';
 when 'set_member_status' then
  select * into member from public.company_memberships where id=target;
  company:=member.company_id;
  if not private.has_company_role(company,true) or member.role<>'company_worker' then raise exception 'No podés cambiar este acceso.' using errcode='42501'; end if;
  select worker_limit into cap from public.companies where id=company for update;
  status:=payload->>'status';
  if status not in ('ACTIVE','DISABLED') then raise exception 'Estado inválido.' using errcode='22023'; end if;
  if status='ACTIVE' and member.status='DISABLED' then
   select (select count(*) from public.company_memberships where company_id=company and role='company_worker' and public.company_memberships.status in ('ACTIVE','INVITED'))+
    (select count(*) from public.company_invitations where company_id=company and role='company_worker' and public.company_invitations.status='INVITED') into used;
   if used>=cap then raise exception 'Alcanzaste el límite de trabajadores.' using errcode='22023'; end if;
  end if;
  update public.company_memberships set status=portal_state.status where id=target;
 when 'request_limit' then
  if not private.has_company_role(company,true) then raise exception 'Sólo el responsable puede solicitar una ampliación.' using errcode='42501'; end if;
  select worker_limit into cap from public.companies where id=company for update;
  if (payload->>'limit')::int<=cap or coalesce(length(trim(payload->>'reason')),0)<10 then raise exception 'Indicá un límite mayor y el motivo de la ampliación.' using errcode='22023'; end if;
  insert into public.company_limit_requests(company_id,requested_by,requested_limit,reason) values(company,actor,(payload->>'limit')::int,trim(payload->>'reason')) returning id into target;
 when 'review_limit' then
  if not admin then raise exception 'Sólo el administrador puede revisar límites.' using errcode='42501'; end if;
  select * into lim from public.company_limit_requests where id=target for update;
  if lim.id is null or lim.status<>'SUBMITTED' or payload->>'status' not in ('APPROVED','REJECTED') then raise exception 'La solicitud ya cambió de estado.' using errcode='22023'; end if;
  company:=lim.company_id;
  if payload->>'status'='APPROVED' then update public.companies set worker_limit=greatest(worker_limit,lim.requested_limit) where id=company; end if;
  update public.company_limit_requests set status=payload->>'status',review_note=payload->>'note' where id=target;
 when 'set_company_status' then
  if not admin then raise exception 'Sólo el administrador puede suspender o reactivar empresas.' using errcode='42501'; end if;
  if payload->>'status' not in ('ACTIVE','SUSPENDED') or coalesce(length(trim(payload->>'note')),0)<5 then raise exception 'Indicá el estado y el motivo del cambio.' using errcode='22023'; end if;
  company:=target;
  update public.companies set status=payload->>'status' where id=target;
  if not found then raise exception 'Empresa no encontrada.' using errcode='22023'; end if;
 when 'save_global_xp' then
  if not admin then raise exception 'Sólo el administrador puede configurar XP.' using errcode='42501'; end if;
  for item in select value from jsonb_array_elements(payload->'categories') loop
   update public.device_categories set impact_xp=(item->>'xp')::int where id=(item->>'id')::uuid;
  end loop;
 when 'save_level' then
  if not admin then raise exception 'Sólo el administrador puede configurar niveles.' using errcode='42501'; end if;
  if target is null then insert into public.impact_levels(name,minimum_xp) values(trim(payload->>'name'),(payload->>'minimumXp')::int) returning id into target;
  else update public.impact_levels set name=trim(payload->>'name'),minimum_xp=(payload->>'minimumXp')::int where id=target; end if;
 else raise exception 'Operación no disponible.' using errcode='22023';
 end case;
 insert into public.audit_log(actor_id,action,target_id,company_id,details)
 values(actor,operation,target,company,jsonb_build_object('status',payload->>'status','note',payload->>'note'));
 return result || jsonb_build_object('id',target,'companyId',company);
end;
$$;
commit;
