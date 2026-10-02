import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function onboardingService(storage) {
  const exports = {};
  const code = ts.transpileModule(
    readFileSync(new URL('../src/services/onboarding.service.ts', import.meta.url), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }
  ).outputText;
  vm.runInNewContext(code, {
    exports,
    require(name) {
      assert.equal(name, '@react-native-async-storage/async-storage');
      return {
        __esModule: true,
        default: {
          getItem: async (key) => storage.get(key) ?? null,
          setItem: async (key, value) => storage.set(key, value),
        },
      };
    },
  });
  return exports;
}

test('primera apertura sin marca persistida necesita la introducción', async () => {
  const service = onboardingService(new Map());
  assert.equal((await service.getAccessPreferences()).onboardingComplete, false);
});

test('omitir/completar persiste la introducción para la próxima apertura', async () => {
  const storage = new Map();
  await onboardingService(storage).saveOnboardingComplete();
  assert.equal((await onboardingService(storage).getAccessPreferences()).onboardingComplete, true);
});

test('la preferencia antigua de invitado no puede bloquear el reingreso ni omitir la primera introducción', async () => {
  for (const guest of ['true', 'false']) {
    const storage = new Map([
      ['tecnoraee:guest:v1', guest],
      ['tecnoraee:onboarding:v1', 'true'],
    ]);
    assert.equal(
      (await onboardingService(storage).getAccessPreferences()).onboardingComplete,
      true
    );
    storage.delete('tecnoraee:onboarding:v1');
    assert.equal(
      (await onboardingService(storage).getAccessPreferences()).onboardingComplete,
      false
    );
  }
});
