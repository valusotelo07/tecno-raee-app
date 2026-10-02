-- QA-0002: transactional fixtures, rolled back after pgTAP assertions.
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select no_plan();

insert into auth.users(id, email, raw_user_meta_data) values
 ('10000000-0000-0000-0000-000000000001', 'citizen@example.test', '{"full_name":"Ciudadano","role":"platform_admin"}'),
 ('10000000-0000-0000-0000-000000000002', 'owner@example.test', '{"full_name":"Responsable"}'),
 ('10000000-0000-0000-0000-000000000003', 'worker@example.test', '{"full_name":"Trabajador de prueba"}'),
 ('10000000-0000-0000-0000-000000000004', 'other@example.test', '{"full_name":"Otro responsable de prueba"}'),
 ('10000000-0000-0000-0000-000000000005', 'admin@example.test', '{"full_name":"Administrador de prueba"}');
select is((select count(*) from profiles where id::text like '10000000-%'), 5::bigint, 'trigger creates every profile');
select is((select full_name from profiles where id='10000000-0000-0000-0000-000000000001'), 'Ciudadano', 'trigger preserves full_name');
insert into companies(id, name, status) values
 ('20000000-0000-0000-0000-000000000001', 'EcoCentro', 'ACTIVE'),
 ('20000000-0000-0000-0000-000000000002', 'Otra empresa', 'ACTIVE'),
 ('20000000-0000-0000-0000-000000000003', 'Suspendida', 'SUSPENDED');
insert into company_memberships(user_id, company_id, role, status) values
 ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'company_owner', 'ACTIVE'),
 ('10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'company_worker', 'ACTIVE'),
 ('10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 'company_owner', 'ACTIVE'),
 ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'company_owner', 'ACTIVE');
insert into platform_admins(user_id) values ('10000000-0000-0000-0000-000000000005');
select is((select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname in ('profiles','companies','company_memberships','platform_admins','device_categories') and c.relrowsecurity),
  5::bigint, 'all exposed foundation tables have RLS');

set local role anon;
select is((select count(*) from companies), 2::bigint, 'guest sees only ACTIVE companies');
select is((select count(*) from device_categories), 13::bigint, 'guest sees global catalog');
select throws_ok('select * from profiles', '42501', null, 'guest cannot read profiles');
select throws_ok('select * from company_memberships', '42501', null, 'guest cannot read memberships');
select throws_ok('select * from platform_admins', '42501', null, 'guest cannot read admin assignments');
select throws_ok($$insert into companies(name) values ('Attack')$$, '42501', null, 'guest cannot create companies');
select throws_ok($$update device_categories set name='Attack'$$, '42501', null, 'guest cannot edit catalog');
select throws_ok($$delete from companies$$, '42501', null, 'guest cannot delete companies');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000001', true);
select is((select count(*) from profiles), 1::bigint, 'citizen sees only own profile');
select is((select count(*) from company_memberships), 0::bigint, 'citizen cannot read other memberships');
select is((select count(*) from platform_admins), 0::bigint, 'citizen cannot read other admin assignments');
select ok(not private.is_platform_admin(), 'user_metadata.role cannot elevate citizen');
select throws_ok($$insert into platform_admins(user_id) values ('10000000-0000-0000-0000-000000000001')$$, '42501', null, 'citizen cannot become admin');
select throws_ok($$insert into company_memberships(user_id,company_id,role) values ('10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','company_owner')$$, '42501', null, 'citizen cannot self-assign owner');
select throws_ok($$update profiles set email='attack@example.test'$$, '42501', null, 'client cannot change trusted email');
select throws_ok($$insert into profiles(id,email) values ('10000000-0000-0000-0000-000000000009','attack@example.test')$$, '42501', null, 'client cannot create profiles');
select throws_ok('delete from profiles', '42501', null, 'client cannot delete profiles');
update profiles set full_name='Nombre nuevo' where id='10000000-0000-0000-0000-000000000001';
select is((select full_name from profiles), 'Nombre nuevo', 'citizen can update own name');
with changed as (update profiles set full_name='Attack' where id='10000000-0000-0000-0000-000000000002' returning id)
 select is((select count(*) from changed), 0::bigint, 'citizen cannot update another profile');
with changed as (update companies set name='Attack' returning id)
 select is((select count(*) from changed), 0::bigint, 'citizen cannot edit companies');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000002', true);
select ok(private.has_company_role('20000000-0000-0000-0000-000000000001', true), 'active owner authorized');
select is((select count(*) from company_memberships), 3::bigint, 'owner sees own memberships and own company team');
select ok(not private.has_company_role('20000000-0000-0000-0000-000000000002', true), 'owner cannot operate another company');
select ok(not private.has_company_role('20000000-0000-0000-0000-000000000003', true), 'suspended company cannot operate');
update companies set name='EcoCentro actualizado' where id='20000000-0000-0000-0000-000000000001';
select is((select name from companies where id='20000000-0000-0000-0000-000000000001'), 'EcoCentro actualizado', 'owner can update own public name');
with changed as (update companies set name='Attack' where id='20000000-0000-0000-0000-000000000002' returning id)
 select is((select count(*) from changed), 0::bigint, 'owner cannot update another company');
select throws_ok($$update companies set worker_limit=999$$, '42501', null, 'owner cannot change worker limit');
select throws_ok($$update companies set status='ACTIVE'$$, '42501', null, 'owner cannot reactivate company');
select throws_ok($$update company_memberships set role='company_owner'$$, '42501', null, 'owner cannot write authorization directly');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000003', true);
select ok(private.has_company_role('20000000-0000-0000-0000-000000000001', false), 'worker can operate own company');
select ok(not private.has_company_role('20000000-0000-0000-0000-000000000001', true), 'worker cannot act as owner');
select is((select count(*) from company_memberships), 1::bigint, 'worker cannot read team or other companies');
with changed as (update companies set name='Attack' returning id)
 select is((select count(*) from changed), 0::bigint, 'worker cannot update company configuration');
select throws_ok($$update company_memberships set role='company_owner'$$, '42501', null, 'worker cannot escalate membership');
select throws_ok('delete from company_memberships', '42501', null, 'worker cannot delete memberships');
reset role;
update company_memberships set status='DISABLED' where user_id='10000000-0000-0000-0000-000000000003';
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000003', true);
select ok(not private.has_company_role('20000000-0000-0000-0000-000000000001'), 'disabled worker loses operational access');
reset role;
update company_memberships set status='INVITED' where user_id='10000000-0000-0000-0000-000000000003';
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000003', true);
select ok(not private.has_company_role('20000000-0000-0000-0000-000000000001'), 'invited worker has no operational access');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000005', true);
select ok(private.is_platform_admin(), 'admin assignment comes from protected DB');
select is((select count(*) from companies), 3::bigint, 'admin can inspect suspended companies');
select is((select count(*) from company_memberships), 4::bigint, 'admin can inspect memberships');
select is((select count(*) from profiles), 1::bigint, 'admin still cannot list private citizen profiles');
reset role;

select * from finish();
rollback;
