import assert from 'node:assert/strict';
import { test } from 'node:test';
import { authDestination, authRoute, parseAuthIntent } from '../src/models/AuthFlow.ts';
import { resolveRole } from '../src/models/Access.ts';

test('un retorno externo, una ruta arbitraria o parámetros duplicados no se aceptan', () => {
  for (const input of [
    undefined,
    '',
    'https://example.com',
    '/admin',
    '//example.com',
    ['admin', 'company'],
  ]) {
    assert.equal(parseAuthIntent(input), null);
  }
});

test('participación e invitación conservan su intención; participación abre Contacto', () => {
  for (const intent of ['application', 'invitations']) {
    assert.equal(authRoute('/register', intent).params.intent, intent);
    assert.equal(authRoute('/login', intent).params.intent, intent);
  }
  assert.equal(authDestination('application'), '/contact');
  assert.equal(authDestination('invitations'), '/company-invitations');
});

test('parámetros de admin o empresa se ignoran; los permisos se leen desde la cuenta', () => {
  for (const intent of ['admin', 'company']) {
    assert.equal(parseAuthIntent(intent), null);
    assert.equal(resolveRole({ isPlatformAdmin: false, memberships: [] }), 'citizen');
  }
});
