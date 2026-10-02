# TecnoRAEE

Aplicación de gestión de RAEE con React Native, Expo SDK 57, Expo Router, TypeScript y Supabase. El código activo está en `src/app/`; servicios en `src/services/`, modelos en `src/models/` y estilos compartidos en `src/theme/`.

Se implementaron las fundaciones del Sprint 1, el descubrimiento del Sprint 2, los portales reales de empresa/admin y las entregas del Sprint 5: registro, QR, recepción física con cantidades ajustables, movimientos de puntos por empresa, XP global e historial. Conservan el estilo de Home/onboarding. Reportes: [Sprint 1](docs/implementation-sprint-1.md), [Sprint 2](docs/implementation-sprint-2.md), [Empresa y admin](docs/implementation-company-admin.md), [Panel admin e historial](docs/implementation-admin-changelog.md) y [Entregas con QR](docs/implementation-sprint-5.md).

## Ejecutar

Requiere Node 22.13 o posterior y npm.

```powershell
npm ci
npm run web
```

Para dispositivos: `npm run android` / `npm run ios`. La configuración conserva por defecto el proyecto Supabase existente. Los overrides locales son opcionales: `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

**Supabase remoto activo y migraciones hasta entregas aplicadas el 30/09/2026.** Se preservaron los usuarios/perfiles y el trigger existente. Pasaron 221 pruebas SQL (75 entregas + 69 portales e historial + 44 fundaciones + 33 descubrimiento), con rollback de fixtures, y 33 pruebas locales. Se comprobó el circuito web ciudadano → empresa → saldo/historial con cuentas temporales y se eliminaron al terminar. Todavía no hay empresas/puntos publicados: la app muestra el estado vacío real. La primera apertura muestra onboarding; Saltar o Comenzar abre Home como invitado y las siguientes visitas abren la app directamente. El login es opcional y redirige según los permisos reales de la cuenta; la autorización admin solicitada para `waltercaste16@outlook.com` ya está registrada en DB.

El mapa web usa Leaflet/OpenStreetMap, con atribución y carga diferida compatible con renderizado estático. Android/iOS usan `react-native-maps`. Expo Go no requiere una clave propia; para un build Android configurar `GOOGLE_MAPS_ANDROID_API_KEY` restringida a la app y su SHA-1. iOS usa Apple Maps. La ubicación se solicita sólo al tocar el botón y permanece en memoria; la búsqueda funciona sin habilitarla. Las distancias son en línea recta.

## Supabase local y migración

Con Docker disponible, iniciar el stack mínimo usado en las pruebas:

```powershell
npx supabase start --exclude realtime,storage-api,imgproxy,mailpit,postgres-meta,studio,edge-runtime,logflare,vector,supavisor
npx supabase status
```

Puertos de TecnoRAEE: API 55321 y PostgreSQL 55322. Los archivos de migración coinciden con el historial remoto:

- `20260909162544_create_profiles_and_rls.sql`
- `20260930131644_foundations.sql`
- `20260930131934_secure_profile_trigger.sql`
- `20260930135013_public_discovery.sql`
- `20260930154245_company_admin_portals.sql`
- `20260930160754_portal_validation_and_email_throttle.sql`
- `20260930161036_fix_portal_status_commands.sql`
- `20260930164550_deliveries_qr_ledger.sql`
- `20260930170631_serialize_delivery_registration.sql`
- `20260930213235_admin_changelog.sql`

Se preserva `profiles` y su trigger. Las tablas nuevas tienen RLS y grants explícitos. La función del trigger no se puede invocar directamente desde la API pública. Los comandos de empresa/admin verifican los permisos en DB y ejecutan cambios relacionados en una transacción. Las invitaciones usan la Edge Function `company-invitation`, desplegada en el remoto y autenticada dentro de la función.

Para pruebas locales de documentación/invitaciones/fotos se necesita Storage, Mailpit y Edge Runtime; el stack mínimo del comando anterior sólo cubre Auth/DB. Ver los reportes de portales y entregas para despliegue, URLs de retorno y límites de verificación.

Registrar una entrega requiere una cuenta con email confirmado y un punto publicado por una empresa activa. Crear el QR no acredita puntos: owner o worker debe confirmar la recepción desde `/company/scanner`. Se permite ingresar el código manualmente, sin cámara. Fotos opcionales privadas, JPG/PNG hasta 5 MB; el QR vence en 7 días. Mis RAEE y Perfil muestran saldos reales por empresa y XP global.

Si ya existía la base local de pruebas de la implementación inicial, regenerarla con `npx supabase db reset --local` después de iniciar Docker. El cambio de numeración refleja los timestamps registrados al aplicar las migraciones en Supabase remoto.

Copiar `.env.example` a `.env.local` y reemplazar la key por la **publishable key local** para conectar la app a ese stack. Reiniciar Expo después de cambiar esas variables. Nunca colocar secret keys o service_role en EXPO_PUBLIC ni en el cliente.

Los roles de empresa/admin se asignan únicamente desde un backend seguro o DB administrada. Ciudadano corresponde a una identidad sin asignaciones activas. Los nuevos registros siempre reciben su perfil por trigger; el cliente no hace upsert.

## Verificar

```powershell
npx tsc --noEmit
npm run lint
node --experimental-strip-types --test tests/*.test.mjs
npx supabase test db
npx supabase db advisors --local --type security --fail-on warn
npx supabase db lint --local
npx expo install --check
npx expo-doctor
npx expo export --platform web
```

La integración Auth/DB real usa exclusivamente el stack local:

```powershell
$localStatus = npx supabase status -o json | ConvertFrom-Json
$env:TECNORAAE_TEST_URL = 'http://127.0.0.1:55321'
$env:TECNORAAE_TEST_PUBLISHABLE_KEY = $localStatus.PUBLISHABLE_KEY
node --test tests/local-auth.integration.mjs
```

La prueba crea y limpia sus propias identidades/empresa locales. Las pruebas RLS usan transacciones con rollback. No existen scripts npm `test` o `typecheck`: los comandos anteriores invocan las herramientas directamente.

## Próximas etapas

Siguiente etapa: retiros, catálogo/canjes de recompensas, métricas de impacto global y operación avanzada. El XP y los puntos por empresa ya se acreditan con las entregas confirmadas. El lector distingue códigos de entrega, retiro y recompensa; los dos últimos todavía informan que su flujo no está habilitado.
