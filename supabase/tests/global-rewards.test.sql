begin;
create extension if not exists pgtap with schema extensions;
set search_path=public,extensions;
create temporary table reward_test_results (message text);
grant select,insert on reward_test_results to anon,authenticated;
insert into reward_test_results select no_plan();
insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values
 ('23000000-0000-0000-0000-000000000001','global-citizen@example.test',now(),'{"full_name":"Ciudadano"}'),
 ('23000000-0000-0000-0000-000000000002','global-other@example.test',now(),'{"full_name":"Otro"}'),
 ('23000000-0000-0000-0000-000000000003','global-owner@example.test',now(),'{"full_name":"Responsable"}'),
 ('23000000-0000-0000-0000-000000000004','global-worker@example.test',now(),'{"full_name":"Comercio B"}'),
 ('23000000-0000-0000-0000-000000000005','global-admin@example.test',now(),'{"full_name":"Admin"}'),
 ('23000000-0000-0000-0000-000000000006','global-unverified@example.test',null,'{"full_name":"Sin verificar"}');
insert into platform_admins values('23000000-0000-0000-0000-000000000005',now());
insert into companies(id,name) values
 ('23000000-0000-0000-0000-000000000011','Origen A'),('23000000-0000-0000-0000-000000000012','Comercio B');
insert into company_memberships(user_id,company_id,role,status) values
 ('23000000-0000-0000-0000-000000000003','23000000-0000-0000-0000-000000000011','company_owner','ACTIVE'),
 ('23000000-0000-0000-0000-000000000004','23000000-0000-0000-0000-000000000012','company_worker','ACTIVE');
insert into green_points(id,company_id,name,address,latitude,longitude,active)
 values('23000000-0000-0000-0000-000000000021','23000000-0000-0000-0000-000000000011','Origen A','Calle 1',-34,-58,true);
insert into green_point_device_categories(green_point_id,device_category_id)
 select '23000000-0000-0000-0000-000000000021',id from device_categories where slug='celulares';
insert into company_device_points(company_id,device_category_id,points)
 select '23000000-0000-0000-0000-000000000011',id,100 from device_categories where slug='celulares';
create function pg_temp.save_test_reward(target_company text default '23000000-0000-0000-0000-000000000012',cost integer default 60,stock_count integer default null)
 returns jsonb language sql as $$
 select public.reward_command('save',jsonb_build_object('companyId',target_company,'title','Premio de prueba','description','Condiciones',
  'category','food','pointsCost',cost,'businessName','Comercio de prueba','address','Calle 2','hours','9 a 18','active',true,'stock',stock_count));
$$;
create function pg_temp.reserve_test_reward(request_id text default '23000000-0000-0000-0000-000000000031',reward_title text default 'Premio de prueba')
 returns jsonb language sql as $$
 select public.reward_command('reserve',jsonb_build_object('requestId',request_id,'rewardId',
  (select id from public.rewards where title=reward_title and company_id='23000000-0000-0000-0000-000000000012')));
$$;
set local role anon;
insert into reward_test_results select throws_ok($$select reward_command('save','{}')$$,'42501',null,'guests cannot publish rewards');
insert into reward_test_results select throws_ok($$select reward_command('reserve','{}')$$,'42501',null,'guests cannot reserve');
reset role;
select set_config('request.jwt.claim.sub','23000000-0000-0000-0000-000000000003',true);
set local role authenticated;
insert into reward_test_results select throws_ok($$select pg_temp.save_test_reward('23000000-0000-0000-0000-000000000011')$$,'42501',null,'company owners cannot publish even for their own company');
reset role;
select set_config('request.jwt.claim.sub','23000000-0000-0000-0000-000000000004',true);
set local role authenticated;
insert into reward_test_results select throws_ok($$select pg_temp.save_test_reward()$$,'42501',null,'company workers cannot publish');
reset role;
select set_config('request.jwt.claim.sub','23000000-0000-0000-0000-000000000001',true);
set local role authenticated;
insert into reward_test_results select throws_ok($$select pg_temp.save_test_reward()$$,'42501',null,'citizens cannot publish');
insert into reward_test_results select lives_ok($$select delivery_command('create',jsonb_build_object('requestId','23000000-0000-0000-0000-000000000041','pointId','23000000-0000-0000-0000-000000000021','items',
 jsonb_build_array(jsonb_build_object('categoryId',(select id from device_categories where slug='celulares'),'quantity',1))))$$,'citizen registers real delivery');
reset role;
select set_config('request.jwt.claim.sub','23000000-0000-0000-0000-000000000003',true);
set local role authenticated;
insert into reward_test_results select lives_ok($$select delivery_command('confirm',jsonb_build_object('companyId','23000000-0000-0000-0000-000000000011','code',
 (select verification_token from deliveries where client_request_id='23000000-0000-0000-0000-000000000041'),'items',
 jsonb_build_array(jsonb_build_object('categoryId',(select id from device_categories where slug='celulares'),'quantity',1))))$$,'delivery confirms and credits the ledger');
reset role;
select set_config('request.jwt.claim.sub','23000000-0000-0000-0000-000000000005',true);
set local role authenticated;
insert into reward_test_results select lives_ok($$select pg_temp.save_test_reward()$$,'admin can publish for another company');
insert into reward_test_results select throws_ok($$select pg_temp.save_test_reward('23000000-0000-0000-0000-000000000012',0)$$,'23514',null,'zero cost is rejected by the server');
reset role;
insert into rewards(company_id,title,category,points_cost,business_name,address,stock,active) values
 ('23000000-0000-0000-0000-000000000012','Una unidad','food',10,'Comercio B','Calle 2',1,true),
 ('23000000-0000-0000-0000-000000000012','Agotado','food',10,'Comercio B','Calle 2',0,true),
 ('23000000-0000-0000-0000-000000000012','Borrador','food',10,'Comercio B','Calle 2',null,false);
set local role anon;
insert into reward_test_results select is((select count(*) from rewards where company_id='23000000-0000-0000-0000-000000000012' and title='Borrador'),0::bigint,'drafts are hidden from guests');
insert into reward_test_results select is((select count(*) from rewards where company_id='23000000-0000-0000-0000-000000000012' and title='Premio de prueba'),1::bigint,'published catalog is visible to guests');
insert into reward_test_results select throws_ok($$select verification_token from reward_redemptions$$,'42501',null,'guests cannot read redemption tokens');
reset role;
select set_config('request.jwt.claim.sub','23000000-0000-0000-0000-000000000006',true);
set local role authenticated;
insert into reward_test_results select throws_ok($$select pg_temp.reserve_test_reward()$$,'42501',null,'unverified email cannot reserve');
reset role;
select set_config('request.jwt.claim.sub','23000000-0000-0000-0000-000000000001',true);
set local role authenticated;
insert into reward_test_results select is((my_delivery_balance()->>'points')::bigint,100::bigint,'all existing delivery credits are global');
insert into reward_test_results select throws_ok($$select pg_temp.reserve_test_reward('23000000-0000-0000-0000-000000000032','Agotado')$$,'22023',null,'out of stock cannot be redeemed');
insert into reward_test_results select throws_ok($$select pg_temp.reserve_test_reward('23000000-0000-0000-0000-000000000032','Borrador')$$,'22023',null,'inactive rewards cannot be redeemed');
insert into reward_test_results select lives_ok($$select pg_temp.reserve_test_reward()$$,'credits earned at A can pay for rewards at B');
insert into reward_test_results select is((my_delivery_balance()->>'points')::bigint,40::bigint,'reservation deducts the exact cost from the global wallet');
insert into reward_test_results select lives_ok($$select pg_temp.reserve_test_reward()$$,'retry with same request is idempotent');
insert into reward_test_results select is((my_delivery_balance()->>'points')::bigint,40::bigint,'retry does not charge twice');
insert into reward_test_results select throws_ok($$select pg_temp.reserve_test_reward('23000000-0000-0000-0000-000000000031','Una unidad')$$,'22023',null,'idempotency key cannot be reused for a different prize');
insert into reward_test_results select throws_ok($$select pg_temp.reserve_test_reward('23000000-0000-0000-0000-000000000033')$$,'22023',null,'next request cannot overspend');
insert into reward_test_results select lives_ok($$select pg_temp.reserve_test_reward('23000000-0000-0000-0000-000000000034','Una unidad')$$,'last stock unit can be reserved');
insert into reward_test_results select is((select stock from rewards where title='Una unidad' and company_id='23000000-0000-0000-0000-000000000012'),0,'stock decrements atomically');
insert into reward_test_results select throws_ok($$select pg_temp.reserve_test_reward('23000000-0000-0000-0000-000000000035','Una unidad')$$,'22023',null,'last stock unit cannot be reserved again');
insert into reward_test_results select is(jsonb_array_length(my_points_history()),3,'history includes delivery credits and reward debits');
insert into reward_test_results select is((my_delivery_balance()->>'points')::bigint,30::bigint,'global wallet reflects all debits');
insert into reward_test_results select throws_ok($$update rewards set points_cost=1$$,'42501',null,'clients cannot change reward costs directly');
insert into reward_test_results select throws_ok($$update reward_redemptions set status='REDEEMED'$$,'42501',null,'clients cannot consume codes directly');
insert into reward_test_results select throws_ok($$select request_payload from reward_redemptions$$,'42501',null,'idempotency payloads stay private');
reset role;
create temporary table reward_fixture as select id,verification_token from reward_redemptions where user_id='23000000-0000-0000-0000-000000000001' and client_request_id='23000000-0000-0000-0000-000000000031';
grant select on reward_fixture to authenticated;
select set_config('request.jwt.claim.sub','23000000-0000-0000-0000-000000000002',true);
set local role authenticated;
insert into reward_test_results select is((select count(*) from reward_redemptions where user_id='23000000-0000-0000-0000-000000000001'),0::bigint,'another citizen cannot read codes');
insert into reward_test_results select throws_ok($$select reward_command('get',jsonb_build_object('id',(select id from reward_fixture)))$$,'42501',null,'another citizen cannot retrieve a code by ID');
reset role;
select set_config('request.jwt.claim.sub','23000000-0000-0000-0000-000000000003',true);
set local role authenticated;
insert into reward_test_results select throws_ok($$select reward_command('lookup',jsonb_build_object('companyId','23000000-0000-0000-0000-000000000011','code',(select verification_token from reward_fixture)))$$,'22023',null,'company A cannot validate B prize');
reset role;
select set_config('request.jwt.claim.sub','23000000-0000-0000-0000-000000000004',true);
set local role authenticated;
insert into reward_test_results select lives_ok($$select reward_command('lookup',jsonb_build_object('companyId','23000000-0000-0000-0000-000000000012','code',(select verification_token from reward_fixture)))$$,'assigned company can look up the code');
insert into reward_test_results select lives_ok($$select reward_command('confirm',jsonb_build_object('companyId','23000000-0000-0000-0000-000000000012','code',(select verification_token from reward_fixture)))$$,'assigned company can deliver the prize');
insert into reward_test_results select lives_ok($$select reward_command('confirm',jsonb_build_object('companyId','23000000-0000-0000-0000-000000000012','code',(select verification_token from reward_fixture)))$$,'repeat confirmation returns the original result');
insert into reward_test_results select is((select status from reward_redemptions where id=(select id from reward_fixture)),'REDEEMED','code is consumed after delivery');
reset role;
select set_config('request.jwt.claim.sub','23000000-0000-0000-0000-000000000001',true);
set local role authenticated;
insert into reward_test_results select is((my_delivery_balance()->>'points')::bigint,30::bigint,'delivery of prize does not charge points again');
insert into reward_test_results select lives_ok($$select reward_command('get',jsonb_build_object('id',(select id from reward_fixture)))$$,'citizen can reopen original redeemed receipt');
reset role;
insert into reward_test_results select * from finish();
select * from reward_test_results;
rollback;
