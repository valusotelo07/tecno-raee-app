# TecnoRAEE

La descripción funcional del proyecto, los recorridos por rol y los pendientes están en [Proyecto y funcionalidades](PROYECTO_Y_FEATURES.md).

El [lenguaje de diseño](DESIGN.md) es obligatorio para quienes trabajen en la interfaz. Define la identidad basada en la vista del ciudadano, los componentes compartidos, el header común, los estilos y los criterios de revisión para ciudadano, empresa y admin. Leerlo antes de cambiar pantallas; [AGENTS.md](AGENTS.md) establece la misma obligación para los agentes.

El nombre comercial está centralizado en `src/config/brand.json`. La guía [Cambiar el nombre de la app](CAMBIO_DE_NOMBRE.md) explica cómo actualizarlo, revisar los recursos visuales y conservar los identificadores compatibles con los datos y enlaces existentes.

Aplicación de gestión de RAEE con React Native, Expo SDK 57, Expo Router, TypeScript y Supabase. El código activo está en `src/app/`; servicios en `src/services/`, modelos en `src/models/` y estilos compartidos en `src/theme/`.

Se implementaron las fundaciones del Sprint 1, el descubrimiento del Sprint 2, los portales reales de empresa/admin y las entregas del Sprint 5: registro, QR, recepción física con cantidades ajustables, movimientos de puntos por empresa, XP global e historial. Conservan el estilo de Home/onboarding.

## Ejecutar

Requiere Node 22.13 o posterior y npm.

```powershell
npm install
npm run web
```

Para dispositivos: `npm run android` / `npm run ios`. La configuración conserva por defecto el proyecto Supabase existente. Los overrides locales son opcionales: `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

**Supabase remoto activo y migraciones hasta entregas aplicadas el 30/09/2026.** Se preservaron los usuarios/perfiles y el trigger existente. Pasaron 221 pruebas SQL (75 entregas + 69 portales e historial + 44 fundaciones + 33 descubrimiento), con rollback de fixtures, y 33 pruebas locales. Se comprobó el circuito web ciudadano → empresa → saldo/historial con cuentas temporales y se eliminaron al terminar. Todavía no hay empresas/puntos publicados: la app muestra el estado vacío real. La primera apertura muestra onboarding; Saltar o Comenzar abre Home como invitado y las siguientes visitas abren la app directamente. El login es opcional y redirige según los permisos reales de la cuenta; la autorización admin solicitada para `waltercaste16@outlook.com` ya está registrada en DB.

El mapa web usa Leaflet/OpenStreetMap, con atribución y carga diferida compatible con renderizado estático. Android/iOS usan `react-native-maps`. Expo Go no requiere una clave propia; para un build Android configurar `GOOGLE_MAPS_ANDROID_API_KEY` restringida a la app y su SHA-1. iOS usa Apple Maps. La ubicación se solicita sólo al tocar el botón y permanece en memoria; la búsqueda funciona sin habilitarla. Las distancias son en línea recta.

## Supabase local

Con Docker disponible, iniciar el stack mínimo usado en las pruebas:

```powershell
npx supabase start --exclude realtime,storage-api,imgproxy,mailpit,postgres-meta,studio,edge-runtime,logflare,vector,supavisor
npx supabase status
```

Puertos de TecnoRAEE: API 55321 y PostgreSQL 55322. Las migraciones se conservan localmente y no se incluyen en esta branch. Para reproducir el esquema en otro entorno se necesitan esos archivos por separado.

Se preserva `profiles` y su trigger. Las tablas nuevas tienen RLS y grants explícitos. La función del trigger no se puede invocar directamente desde la API pública. Los comandos de empresa/admin verifican los permisos en DB y ejecutan cambios relacionados en una transacción. Las invitaciones usan la Edge Function `company-invitation`, desplegada en el remoto y autenticada dentro de la función.

Para usar documentación/invitaciones/fotos localmente se necesita Storage, Mailpit y Edge Runtime; el stack mínimo del comando anterior sólo cubre Auth/DB. Las URLs de retorno de Auth e invitaciones deben configurarse para el entorno de despliegue.

Registrar una entrega requiere una cuenta con email confirmado y un punto publicado por una empresa activa. Crear el QR no acredita puntos: owner o worker debe confirmar la recepción desde `/company/scanner`. Se permite ingresar el código manualmente, sin cámara. Fotos opcionales privadas, JPG/PNG hasta 5 MB; el QR vence en 7 días. Mis RAEE y Perfil muestran saldos reales por empresa y XP global.

Copiar `.env.example` a `.env.local` y reemplazar la key por la **publishable key local** para conectar la app a ese stack. Reiniciar Expo después de cambiar esas variables. Nunca colocar secret keys o service_role en EXPO_PUBLIC ni en el cliente.

Los roles de empresa/admin se asignan únicamente desde un backend seguro o DB administrada. Ciudadano corresponde a una identidad sin asignaciones activas. Los nuevos registros siempre reciben su perfil por trigger; el cliente no hace upsert.

## Verificar

```powershell
npx tsc --noEmit
npm run lint
npx supabase db advisors --local --type security --fail-on warn
npx supabase db lint --local
npx expo install --check
npx expo-doctor
npx expo export --platform web
```

Los reportes de implementación y las suites de pruebas se conservan localmente y no se incluyen en esta branch. No existen scripts npm `test` o `typecheck`: los comandos anteriores invocan las herramientas directamente.

## Próximas etapas

Siguiente etapa: retiros, catálogo/canjes de recompensas, métricas de impacto global y operación avanzada. El XP y los puntos por empresa ya se acreditan con las entregas confirmadas. El lector distingue códigos de entrega, retiro y recompensa; los dos últimos todavía informan que su flujo no está habilitado.
