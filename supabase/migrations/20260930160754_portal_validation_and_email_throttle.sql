begin;
alter table public.company_invitations add column last_email_attempt_at timestamptz;
create or replace function private.invitation_recipient(invitation_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare inv public.company_invitations%rowtype;
begin
 select * into inv from public.company_invitations where id=invitation_id for update;
 if auth.uid() is null or inv.status is distinct from 'INVITED'
  or not (private.is_platform_admin() or (inv.role='company_worker' and private.has_company_role(inv.company_id,true)))
  or not exists(select 1 from public.companies where id=inv.company_id and status='ACTIVE') then
  raise exception 'No podés enviar esta invitación.' using errcode='42501'; end if;
 if inv.last_email_attempt_at > now()-interval '60 seconds' then
  raise exception 'Esperá un minuto antes de reenviar la invitación.' using errcode='22023'; end if;
 update public.company_invitations set last_email_attempt_at=now() where id=inv.id;
 insert into public.audit_log(actor_id,action,target_id,company_id) values(auth.uid(),'invitation_email_attempt',inv.id,inv.company_id);
 return jsonb_build_object('email',inv.email,'exists',exists(select 1 from auth.users where lower(email)=inv.email));
end; $$;

create function private.validate_initial_level() returns trigger language plpgsql set search_path='' as $$
begin
 if old.minimum_xp=0 and new.minimum_xp<>0 then raise exception 'El nivel inicial debe comenzar en 0 XP.' using errcode='22023'; end if;
 return new;
end; $$;
revoke all on function private.validate_initial_level() from public,anon,authenticated;
create trigger keep_initial_impact_level before update on public.impact_levels
 for each row execute function private.validate_initial_level();
commit;
