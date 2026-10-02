import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseSchedules, scheduleText } from '../src/models/PointSchedule.ts';

test('horario cortado, día cerrado y cierre al día siguiente', () => {
  const parsed = parseSchedules(['09:00-13:00, 15:00-19:00', '', '22:00-02:00']);
  assert.deepEqual(parsed, [
    { weekday: 1, opensMinute: 540, closesMinute: 780 },
    { weekday: 1, opensMinute: 900, closesMinute: 1140 },
    { weekday: 3, opensMinute: 1320, closesMinute: 1560 },
  ]);
  assert.equal(scheduleText(parsed)[2], '22:00-02:00');
});
test('rechaza horas y separadores inválidos', () => {
  for (const value of ['24:00-25:00', '09:60-10:00', '9:00-18:00', '09:00', '09:00-12:00-13:00'])
    assert.throws(() => parseSchedules([value]));
});
