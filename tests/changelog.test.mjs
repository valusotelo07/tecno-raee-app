import assert from 'node:assert/strict';
import { test } from 'node:test';
import { changelogChanges } from '../src/models/Changelog.ts';

test('el historial muestra el estado anterior y nuevo de una empresa', () => {
  assert.deepEqual(
    changelogChanges(
      [{ id: 'company', name: 'Recicladora', status: 'ACTIVE' }],
      [{ id: 'company', name: 'Recicladora', status: 'SUSPENDED' }]
    ),
    [{ entity: 'Recicladora', field: 'Estado', before: 'Activa', after: 'Suspendida' }]
  );
});
test('XP agrupa cambios por identidad aunque cambie el orden; omite valores sin cambios', () => {
  assert.deepEqual(
    changelogChanges(
      [
        { id: '1', name: 'Celulares', impact_xp: 10 },
        { id: '2', name: 'Cables', impact_xp: 2 },
      ],
      [
        { id: '2', name: 'Cables', impact_xp: 2 },
        { id: '1', name: 'Celulares', impact_xp: 15 },
      ]
    ),
    [{ entity: 'Celulares', field: 'XP por unidad', before: '10', after: '15' }]
  );
});
test('un nuevo nivel conserva nombre y umbral en el historial', () => {
  assert.deepEqual(changelogChanges([], [{ id: 'level', name: 'Bosque', minimum_xp: 1500 }]), [
    { entity: 'Bosque', field: 'Nombre', before: 'Sin valor', after: 'Bosque' },
    { entity: 'Bosque', field: 'XP mínimo', before: 'Sin valor', after: '1500' },
  ]);
});
test('registros antiguos sin snapshots no inventan modificaciones', () => {
  assert.deepEqual(changelogChanges(null, undefined), []);
});
