import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import { createClient } from '@supabase/supabase-js';
import ts from 'typescript';

// Explicit local-only integration run. Never sends registrations to the hosted project.
const url = process.env.TECNORAAE_TEST_URL;
const key = process.env.TECNORAAE_TEST_PUBLISHABLE_KEY;
if (url !== 'http://127.0.0.1:55321' || !key) {
  throw new Error('Use the local test URL on port 55321 and its publishable key.');
}
function loadService(name, supabase) {
  const exports = {};
  const code = ts.transpileModule(
    readFileSync(new URL('../src/services/' + name + '.service.ts', import.meta.url), 'utf8'),
    {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }
  ).outputText;
  vm.runInNewContext(code, {
    exports,
    Error,
    require(dependency) {
      if (dependency === '@/config/supabase') return { supabase };
      if (dependency === '@/lib/logger') return { log: { info() {}, error() {}, warn() {} } };
      throw new Error('Unexpected dependency: ' + dependency);
    },
  });
  return exports;
}
function sql(query) {
  return execFileSync(
    'docker',
    [
      'exec',
      'supabase_db_tecno-raee-app',
      'psql',
      '-U',
      'postgres',
      '-d',
      'postgres',
      '-v',
      'ON_ERROR_STOP=1',
      '-At',
      '-c',
      query,
    ],
    { encoding: 'utf8' }
  );
}

test('Auth real local: trigger, permisos DB, membresías, persistencia y logout', async () => {
  const storage = new Map();
  const options = {
    auth: {
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: false,
      storage: {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      },
    },
  };
  const client = createClient(url, key, options);
  const auth = loadService('auth', client);
  const access = loadService('access', client);
  const email = 'sprint1-' + randomUUID() + '@example.test';
  const password = randomUUID() + 'Ab1!';
  let userId;
  const companyId = randomUUID();
  try {
    const registration = await auth.register({ name: 'Prueba Sprint 1', email, password });
    userId = registration.user.id;
    assert.match(userId, /^[0-9a-f-]{36}$/);
    assert.ok(registration.session, 'local email confirmations must be disabled');
    const profile = await client.from('profiles').select('full_name').eq('id', userId).single();
    assert.equal(profile.error, null);
    assert.equal(profile.data.full_name, 'Prueba Sprint 1');
    const citizen = await access.getAccess(userId);
    assert.equal(citizen.isPlatformAdmin, false);
    assert.equal(citizen.memberships.length, 0);
    sql(
      "insert into public.companies(id,name) values ('" +
        companyId +
        "','Integración local'); insert into public.company_memberships(user_id,company_id,role,status) values ('" +
        userId +
        "','" +
        companyId +
        "','company_worker','ACTIVE');"
    );
    const worker = await access.getAccess(userId);
    assert.equal(worker.memberships[0].role, 'company_worker');
    assert.equal(worker.memberships[0].companyId, companyId);
    const escalation = await client
      .from('company_memberships')
      .update({ role: 'company_owner' })
      .eq('user_id', userId);
    assert.equal(escalation.error.code, '42501');
    const restored = createClient(url, key, options);
    assert.equal((await restored.auth.getSession()).data.session.user.id, userId);
    await auth.logout();
    assert.equal((await client.auth.getSession()).data.session, null);
    assert.equal((await auth.login(email.toUpperCase(), password)).user.id, userId);
    await auth.logout();
  } finally {
    if (userId) sql("delete from auth.users where id='" + userId + "';");
    sql("delete from public.companies where id='" + companyId + "';");
  }
});
