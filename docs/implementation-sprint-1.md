# TecnoRAEE — Sprint 1 (BE-0014–0017, FE-0015–0017, QA-0002)

## Auditoría previa

- Entrada real: `expo-router/entry`; rutas en `src/app`. `App.tsx` e `index.ts` son restos del template, no la entrada activa.
- Expo 57.0.24, Router 57.0.21, React 19.2.3 y React Native 0.86.3. Se consultó la documentación versionada de SDK 57 antes de editar.
- Auth: registro, login, recuperación OTP, cambio de contraseña, logout local y persistencia. Un único cliente Supabase con publishable key pública.
- `AuthProvider` carga sesión/perfil, pero carece de permisos y consulta Supabase dentro del callback de Auth. No hay guards de navegación.
- Perfil: `id`, `email`, `full_name`, `created_at`, `updated_at`; mapper existente `toProfile`.
- Home y Perfil son maquetas parciales. Mapa, Mis RAEE y Recompensas son placeholders. Los accesos rápidos no tienen acciones.
- Theme verde/Inter y componentes reutilizables existentes. Sin `supabase/`, modelos de empresa, catálogo ni pruebas.
- `ensureProfile` hace upsert durante registro y login: duplica el trigger previsto en el plan.
- En la auditoría inicial el proyecto remoto `awzmweclcgellphiromh` estaba INACTIVE y las consultas SQL daban timeout. El usuario lo reactivó después; la inspección y aplicación remotas se detallan abajo.
- Baseline: `npx tsc --noEmit` y `npm run lint` pasan. No existen scripts `typecheck` ni `test`.

## Plan de cambios

1. Conservar servicios/rutas de Auth y cliente Supabase; agregar modelos y servicio de acceso basados en DB, sin autorización por user_metadata.
2. Extender AuthProvider con estado de acceso, recuperación, invitados y onboarding. Consultar DB fuera del callback Auth; fallar de forma cerrada si no puede cargar permisos.
3. Agregar guards de Router para ciudadano/invitado, empresa y administrador. Conservar recuperación OTP y enrutar login por rol.
4. Agregar onboarding de tres slides, acceso invitado y CTA contextual en secciones privadas. El admin omite onboarding.
5. Crear migración versionada de perfiles, empresas mínimas, membresías, administradores y catálogo, con grants restrictivos y RLS. Garantizar un trigger de perfiles sin duplicar uno existente; respaldar usuarios previos mediante backfill.
6. Agregar pruebas de permisos/guards y SQL de RLS, verificar con PostgreSQL local aislado y validar lint, TypeScript y Expo.

## Compatibilidad y alcance

Este cambio implementa las fundaciones del Sprint 1, siguiendo el orden incremental del documento. Los shells de empresa/admin sólo establecen acceso y contexto: los dashboards operativos pertenecen a sprints posteriores. El enlace Solicitar alta explica el proceso y su próxima disponibilidad; no simula una solicitud enviada. Catálogo público disponible; el mapa y las operaciones siguen pendientes del Sprint 2/5.

Las migraciones ya se aplicaron al remoto después de inspeccionar su esquema y trigger. La app muestra un error recuperable si no puede cargar el acceso; nunca inventa permisos ni crea perfiles desde el frontend. El trigger/backfill SQL reemplaza el upsert duplicado de Auth.

## Decisiones de seguridad

- Ciudadano es el contexto de una identidad sin membresía activa ni registro de administrador; roles de empresa provienen de `company_memberships` y admin de `platform_admins`.
- Las tablas de autorización son de sólo lectura para clientes. No existe alta/autoasignación de roles desde la UI.
- Empresas públicas únicamente ACTIVE; membresías activas sólo operan empresas ACTIVE. El owner sólo puede actualizar el nombre público en estas fundaciones, sin tocar status o límite.
- Funciones internas de autorización en schema `private`, search_path vacío, grants explícitos, sin RPC privilegiados públicos.
- Datos de perfil visibles sólo para el titular. Actualización de cliente limitada a `full_name`; ID/email y altas pertenecen al servidor.
- No se crean puntos, ledger, XP ni canjes antes de implementar sus dependencias.

## Verificación y próximos pasos

| Verificación                                                      | Resultado                                                                               |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `npx tsc --noEmit`                                                | PASS                                                                                    |
| `npm run lint`                                                    | PASS                                                                                    |
| `node --experimental-strip-types --test tests/*.test.mjs`         | 11/11 pruebas PASS                                                                      |
| `npx supabase test db`                                            | 44/44 pruebas RLS PASS                                                                  |
| `node --test tests/local-auth.integration.mjs` (URL/key locales)  | PASS: registro, trigger, membresía, bloqueo de escalación, persistencia, login y logout |
| Base simulada con perfil/trigger/policy preexistentes             | PASS: un solo trigger, backfill y revocación de permisos de email/public read           |
| `npx supabase db advisors --local --type security --fail-on warn` | Sin issues                                                                              |
| `npx supabase db lint --local`                                    | Sin errores                                                                             |
| `npx expo install --check`                                        | Dependencias compatibles                                                                |
| `npx expo-doctor`                                                 | 21/21 checks PASS                                                                       |
| `npx expo export --platform web`                                  | PASS, 30 rutas incluyendo aliases de grupos                                             |
| Prettier sobre los archivos cambiados y `git diff --check`        | PASS                                                                                    |

Se actualizaron patches compatibles dentro de Expo SDK 57 (`expo` 57.0.26, Router 57.0.24 y paquetes señalados por `expo install --check`). Se incluye `package-lock.json` para reproducibilidad; se quitó su exclusión del gitignore. No se cambió la versión mayor de SDK, React ni React Native. Se eliminó el impacto ficticio de Perfil y se corrigió el cierre de sesión web para que no dependa de Alert nativo.

La UI no pudo comprobarse visualmente: el navegador de prueba devolvió timeouts de CDP. La compilación web sí se verificó. No se verificó Auth E2E remoto, Android/iOS ni envío de OTP real. La recuperación se verificó a nivel del servicio con su SDK simulado; la integración local cubrió Auth/DB real sin emails externos. La verificación remota posterior cubrió DB/RLS y acceso público mediante REST.

## Archivos

- Nuevos: `src/models/Access.ts`, `DeviceCategory.ts`; servicios `access`, `device-category`, `onboarding`; componentes `ActionButton`, `AccountRequired`, `RolePortal`; rutas `onboarding`, `company-application`, `device-categories`, shells `company/` y `admin/`.
- Modificados: `AuthProvider`, layouts raíz/Auth/tabs, index, welcome, login, register, Home, Mis RAEE, Perfil; `auth.service.ts`, `config/supabase.ts`, `package.json`, `.gitignore` y README.
- Infraestructura nueva: `supabase/config.toml`, `.gitignore`, migraciones `20260909162544_create_profiles_and_rls.sql` (historial existente recuperado), `20260930131644_foundations.sql`, `20260930131934_secure_profile_trigger.sql`, `tests/foundations.test.sql`, `.env.example`, lockfile y pruebas JS en `tests/`.
- Cliente Supabase único: admite overrides opcionales de URL/publishable key para desarrollo local y conserva los valores actuales por defecto. Nunca colocar secret/service_role en variables EXPO_PUBLIC.

## Pendientes y próximo sprint

1. Resolver la advertencia de Auth sobre protección contra contraseñas filtradas, si la configuración/plan del proyecto permite habilitarla.
2. Completar la verificación visual y Auth E2E remoto/Android/iOS.
3. Sprint 2: puntos verdes, horarios, categorías aceptadas, mapa/listado/detalle y geolocalización.
4. Sprint 3: formulario empresarial, revisión admin e invitación owner. Después configuración y loop de entrega/QR. El enlace de alta y los portales actuales no se presentan como estos flujos completos.

## Aplicación remota — 30/09/2026

- Proyecto `ACTIVE_HEALTHY`; sólo existía `profiles`. Se verificó `on_auth_user_created` → `public.handle_new_user()` con `full_name` desde los datos del registro. Se conservó ese trigger.
- Se recuperó el archivo de la migración original desde el historial. Como la columna `email` se agregó fuera de esa migración, las fundaciones incluyen `ADD COLUMN IF NOT EXISTS email` para reproducir el historial completo en una base vacía sin alterar la columna remota existente.
- Migraciones nuevas aplicadas mediante el conector Supabase: `20260930131644_foundations` y `20260930131934_secure_profile_trigger`. Los archivos locales usan los mismos identificadores del remoto.
- Cinco usuarios y cinco perfiles antes/después. La huella del contenido de todos los perfiles coincide exactamente; no se asignaron roles nuevos a usuarios existentes.
- RLS habilitada en las cinco tablas; 13 categorías públicas. La API REST con la publishable key de la app devuelve las 13 categorías y bloquea perfiles para invitados con HTTP 401.
- Las 44 pruebas RLS se ejecutaron en transacción y se repitieron después de cerrar la invocación pública de `handle_new_user()`: 44 PASS, 0 FAIL. Los fixtures y la extensión de pruebas se revirtieron al terminar; no se enviaron emails ni se conservaron usuarios de prueba.
- Los avisos sobre ejecución pública/autenticada del trigger quedaron resueltos. Queda únicamente la advertencia de configuración Auth: [protección contra contraseñas filtradas deshabilitada](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
- La repetición local del historial actualizado no pudo ejecutarse en esta continuación porque Docker Desktop no logró iniciar. Las fundaciones iniciales sí tenían validación local previa; el SQL final y la restricción del trigger se verificaron en el remoto. TypeScript/lint siguen pasando.
