-- QA-0003. All fixtures and any test extension are rolled back.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();
insert into auth.users(id, email, raw_user_meta_data) values
 ('90000000-0000-0000-0000-000000000001', 'discovery-owner-a@example.test', '{"full_name":"Test owner A"}'),
 ('90000000-0000-0000-0000-000000000002', 'discovery-worker-a@example.test', '{"full_name":"Test worker A"}'),
 ('90000000-0000-0000-0000-000000000003', 'discovery-owner-b@example.test', '{"full_name":"Test owner B"}'),
 ('90000000-0000-0000-0000-000000000004', 'discovery-citizen@example.test', '{"full_name":"Test citizen"}'),
 ('90000000-0000-0000-0000-000000000005', 'discovery-admin@example.test', '{"full_name":"Test admin"}');
insert into companies(id, name, status) values
 ('91000000-0000-0000-0000-000000000001', 'Test discovery A', 'ACTIVE'),
 ('91000000-0000-0000-0000-000000000002', 'Test discovery B', 'ACTIVE'),
 ('91000000-0000-0000-0000-000000000003', 'Test discovery suspended', 'SUSPENDED');
insert into company_memberships(user_id, company_id, role, status) values
 ('90000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000001', 'company_owner', 'ACTIVE'),
 ('90000000-0000-0000-0000-000000000002', '91000000-0000-0000-0000-000000000001', 'company_worker', 'ACTIVE'),
 ('90000000-0000-0000-0000-000000000003', '91000000-0000-0000-0000-000000000002', 'company_owner', 'ACTIVE');
insert into platform_admins(user_id) values ('90000000-0000-0000-0000-000000000005');
insert into green_points(id, company_id, name, address, latitude, longitude, active) values
 ('92000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000001', 'A public', 'Test address', -34.6, -58.4, true),
 ('92000000-0000-0000-0000-000000000002', '91000000-0000-0000-0000-000000000001', 'A private', 'Test address', -34.6, -58.4, false),
 ('92000000-0000-0000-0000-000000000003', '91000000-0000-0000-0000-000000000002', 'B public', 'Test address', -34.6, -58.4, true),
 ('92000000-0000-0000-0000-000000000004', '91000000-0000-0000-0000-000000000002', 'B private', 'Test address', -34.6, -58.4, false),
 ('92000000-0000-0000-0000-000000000005', '91000000-0000-0000-0000-000000000003', 'Suspended public', 'Test address', -34.6, -58.4, true);
insert into green_point_schedules(green_point_id, weekday, opens_minute, closes_minute)
 select id, 1, 540, 1080 from green_points;
insert into green_point_device_categories(green_point_id, device_category_id)
 select p.id, c.id from green_points p cross join device_categories c where c.slug = 'celulares';
insert into device_categories(id, slug, name, active) values
 ('93000000-0000-0000-0000-000000000001', 'discovery-inactive-test', 'Inactive test category', false);
insert into green_point_device_categories values
 ('92000000-0000-0000-0000-000000000001', '93000000-0000-0000-0000-000000000001');

select ok((select bool_and(relrowsecurity) from pg_class where oid in ('green_points'::regclass, 'green_point_schedules'::regclass, 'green_point_device_categories'::regclass)), 'all discovery tables have RLS');
select throws_ok($$insert into green_points(company_id,name,address,latitude,longitude,time_zone) values('91000000-0000-0000-0000-000000000001','Invalid','Address',0,0,'Invalid/Zone')$$, '22023', 'Invalid point time zone', 'invalid time zone rejected');
select throws_ok($$insert into green_points(company_id,name,address,latitude,longitude) values('91000000-0000-0000-0000-000000000001','Invalid','Address',91,0)$$, '23514', null, 'invalid latitude rejected');
select throws_ok($$insert into green_point_schedules(green_point_id,weekday,opens_minute,closes_minute) values('92000000-0000-0000-0000-000000000001',8,540,1080)$$, '23514', null, 'invalid weekday rejected');
select throws_ok($$insert into green_point_schedules(green_point_id,weekday,opens_minute,closes_minute) values('92000000-0000-0000-0000-000000000001',2,540,540)$$, '23514', null, 'empty interval rejected');
select throws_ok($$insert into green_point_schedules(green_point_id,weekday,opens_minute,closes_minute) values('92000000-0000-0000-0000-000000000001',2,540,1981)$$, '23514', null, 'more than 24 hour interval rejected');
select lives_ok($$insert into green_point_schedules(green_point_id,weekday,opens_minute,closes_minute) values('92000000-0000-0000-0000-000000000002',7,1320,1560)$$, 'overnight schedule supported');
select throws_ok($$insert into green_point_device_categories select green_point_id,device_category_id from green_point_device_categories limit 1$$, '23505', null, 'duplicate accepted category rejected');

set local role anon;
select is((select count(*) from green_points), 2::bigint, 'guest sees active points of active companies');
select is((select count(*) from green_points where id='92000000-0000-0000-0000-000000000002'), 0::bigint, 'direct unpublished point lookup hidden');
select is((select count(*) from green_points where id='92000000-0000-0000-0000-000000000005'), 0::bigint, 'suspended company point hidden');
select is((select count(*) from green_point_schedules), 2::bigint, 'guest schedules follow public parent');
select is((select count(*) from green_point_device_categories), 2::bigint, 'guest categories hide unpublished parents and inactive categories');
select is((select count(*) from green_points p join companies c on c.id=p.company_id where c.status='ACTIVE'), 2::bigint, 'public company join query works');
select throws_ok($$insert into green_points(company_id,name,address,latitude,longitude) values('91000000-0000-0000-0000-000000000001','Injected','Address',0,0)$$, '42501', null, 'guest cannot create point');
select throws_ok($$update green_point_schedules set closes_minute=1200$$, '42501', null, 'guest cannot modify schedules');
select throws_ok($$delete from green_point_device_categories$$, '42501', null, 'guest cannot remove categories');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-0000-0000-000000000004',true);
select is((select count(*) from green_points), 2::bigint, 'citizen sees public points only');
select throws_ok($$update green_points set active=true$$, '42501', null, 'citizen cannot publish points');
select set_config('request.jwt.claim.sub','90000000-0000-0000-0000-000000000002',true);
select is((select count(*) from green_points), 3::bigint, 'worker can read own unpublished point');
select is((select count(*) from green_points where id='92000000-0000-0000-0000-000000000004'), 0::bigint, 'worker cannot read another company draft');
select throws_ok($$update green_points set active=true$$, '42501', null, 'worker cannot publish points');
select throws_ok($$insert into green_point_schedules(green_point_id,weekday,opens_minute,closes_minute) values('92000000-0000-0000-0000-000000000001',2,540,1080)$$, '42501', null, 'worker cannot configure schedules');
select set_config('request.jwt.claim.sub','90000000-0000-0000-0000-000000000001',true);
select is((select count(*) from green_points), 3::bigint, 'owner can read own unpublished point');
select is((select count(*) from green_points where id='92000000-0000-0000-0000-000000000004'), 0::bigint, 'owner cannot read another company draft');
select throws_ok($$update green_points set company_id='91000000-0000-0000-0000-000000000002'$$, '42501', null, 'owner cannot reassign tenant');
select set_config('request.jwt.claim.sub','90000000-0000-0000-0000-000000000003',true);
select is((select count(*) from green_point_schedules where green_point_id='92000000-0000-0000-0000-000000000002'), 0::bigint, 'another company cannot read private schedules');
select is((select count(*) from green_point_device_categories where green_point_id='92000000-0000-0000-0000-000000000002'), 0::bigint, 'another company cannot read private category relation');
select set_config('request.jwt.claim.sub','90000000-0000-0000-0000-000000000005',true);
select is((select count(*) from green_points), 5::bigint, 'protected admin can inspect all points');
reset role;
update company_memberships set status='DISABLED' where user_id='90000000-0000-0000-0000-000000000002';
set local role authenticated;
select set_config('request.jwt.claim.sub','90000000-0000-0000-0000-000000000002',true);
select is((select count(*) from green_points), 2::bigint, 'disabled worker loses private point access');
reset role;
update companies set status='SUSPENDED' where id='91000000-0000-0000-0000-000000000001';
set local role anon;
select is((select count(*) from green_points), 1::bigint, 'suspension immediately removes public point');
select is((select count(*) from green_point_schedules), 1::bigint, 'suspension also hides schedules');
select is((select count(*) from green_point_device_categories), 1::bigint, 'suspension also hides accepted categories');
reset role;
select * from finish();
rollback;
