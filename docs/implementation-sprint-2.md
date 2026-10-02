# Sprint 2 — Descubrimiento

Fecha: 30/09/2026. Implementación incremental sobre Expo SDK 57 y el mismo proyecto Supabase TecnoRAEE (`awzmweclcgellphiromh`). Se preservaron las modificaciones previas del Sprint 1.

## Estado encontrado

- Expo Router activo en `src/app/`, con tabs ciudadanas, guards por rol, recuperación OTP y modo invitado.
- Home tenía accesos rápidos y un enlace al mapa; Puntos Verdes era un placeholder.
- Qué recibimos ya consultaba las 13 categorías globales.
- Supabase remoto activo, tres migraciones previas aplicadas, cinco usuarios/perfiles y cero empresas. No existían tablas de puntos verdes, horarios o categorías aceptadas.
- Servicios, AuthProvider y theme existentes se conservaron. No se creó otra configuración de Supabase ni otra navegación.

## Alcance implementado

| Tarea   | Resultado                                                                                                                                     |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| BE-0018 | `green_points` relacionado con `companies`, publicación explícita, dirección, coordenadas, contacto y servicio de retiro.                     |
| BE-0019 | Horarios semanales por punto, turnos partidos/nocturnos y relación N:M con categorías globales.                                               |
| BE-0020 | Query pública paginada con empresa activa, relaciones anidadas y mapeo centralizado a modelos propios.                                        |
| FE-0018 | Home liviana: saludo, buscador, mapa preview, punto cercano cuando hay ubicación y accesos rápidos.                                           |
| FE-0019 | Mapa/lista, búsqueda por nombre/dirección/organización/dispositivo y filtros combinables.                                                     |
| FE-0020 | Detalle de punto: organización, dirección, mapa, cómo llegar, categorías, horarios, teléfono y estado.                                        |
| FE-0021 | Categorías del catálogo enlazadas a la búsqueda de puntos que las reciben.                                                                    |
| FE-0022 | Ubicación opcional, orden por distancia, radio de 10 km, abierto ahora, organización y servicio de retiro.                                    |
| QA-0003 | Permisos públicos/privados, lógica de horarios/distancia/filtros y revisión del flujo invitado web. Límites de verificación detallados abajo. |

No se publicaron datos ficticios. El remoto continúa sin empresas/puntos: las pantallas informan este estado y permiten explorar el catálogo. La creación de empresas y la configuración/publicación de puntos pertenecen a los Sprints 3 y 4. Las entregas siguen pendientes del Sprint 5; el intento de entrega de un invitado pide crear cuenta/iniciar sesión.

## Archivos creados

- `src/models/GreenPoint.ts`: modelos, horarios, distancias, búsqueda y filtros.
- `src/services/green-point.service.ts`: query pública y mapeo snake_case → camelCase.
- `src/providers/DiscoveryProvider.tsx`: datos compartidos, recarga, cancelación, errores y ubicación en memoria.
- `src/components/discovery/{PointsMap.tsx,PointsMap.web.tsx,PointsMap.types.ts,PointRow.tsx,SearchBar.tsx,DiscoveryState.tsx}`.
- `src/components/discovery/leaflet.web.css`: estilos de Leaflet 1.9.4 con su licencia BSD; se quitaron imágenes no utilizadas incompatibles con el bundler CSS de Expo. Los marcadores usan SVG.
- `src/app/point/[id].tsx`: detalle protegido por el mismo guard ciudadano/invitado.
- `app.config.ts`: configuración opcional de la clave de Google Maps para builds Android.
- `supabase/migrations/20260930135013_public_discovery.sql`.
- `supabase/tests/discovery.test.sql` y `tests/discovery.test.mjs`.
- Este reporte.

## Archivos modificados

`src/app/_layout.tsx`, `src/app/(app)/_layout.tsx`, `src/app/(app)/home.tsx`, `src/app/(app)/green-points.tsx`, `src/app/device-categories.tsx`, `src/components/home/QuickAccess.tsx`, `app.json`, `package.json`, `package-lock.json`, `.env.example` y `README.md`.

Se agregaron dependencias compatibles con Expo 57 (`expo-location`, `react-native-maps`) y Leaflet 1.9.4 con sus tipos. Se conservó el lockfile. Los accesos rápidos ahora se adaptan al ancho de pantalla y usan la fuente ya cargada.

## Decisiones y seguridad

- Horarios ISO: lunes=1, domingo=7. Cada intervalo incluye minuto de apertura/cierre; un cierre mayor a 1440 corresponde al día siguiente. La duración máxima es 24 horas. La zona horaria se valida en DB.
- Sin horarios, el estado es “Horario sin informar”; no se afirma que un punto esté cerrado por falta de datos. El estado se recalcula cada 30 segundos en el cliente.
- Distancia Haversine en línea recta. Sin permiso no se inventa una ubicación ni se etiqueta un punto como el más cercano.
- Se comparte una carga entre Home, mapa y detalle. La query pagina de a 500 registros para superar el límite de respuesta de Supabase, con orden estable por nombre/id.
- El mapa web importa Leaflet después del montaje para no acceder a `window` en renderizado estático. Los textos de puntos se insertan como nodos de texto, sin interpretar HTML.
- Ubicación sólo en primer plano y después de una acción explícita. No se persiste ni se envía a Supabase. La obtención GPS tiene timeout y se invalidan solicitudes al cambiar de contexto.
- RLS activa en las tres tablas nuevas. Invitados y ciudadanos ven puntos activos de empresas activas; horarios y categorías heredan la visibilidad del padre. Categorías desactivadas permanecen ocultas.
- Miembros activos leen borradores de su propia empresa; un miembro de otra empresa no puede leerlos. Asignaciones protegidas de admin permiten inspección. Worker deshabilitado pierde acceso interno.
- Ningún cliente puede crear, publicar, modificar o borrar puntos/horarios/categorías en este sprint. La escritura futura del owner se habilitará con permisos específicos en Sprint 4. Sólo el backend privilegiado tiene grants de escritura.
- No se modificaron Auth, perfiles, claves frontend, membresías ni asignaciones reales.

## Migración y verificación

La migración `public_discovery` fue aplicada al remoto y registrada con timestamp `20260930135013`; el archivo local utiliza el mismo timestamp.

| Comprobación                                                                     | Resultado                                                                                                                    |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `npx tsc --noEmit`                                                               | Sin errores, luego de que Expo regeneró los tipos de rutas.                                                                  |
| `npm run lint`                                                                   | Sin errores ni warnings.                                                                                                     |
| `node --test tests/access.test.mjs tests/auth.test.mjs tests/discovery.test.mjs` | 16 pruebas aprobadas: 11 regresiones y 5 de descubrimiento.                                                                  |
| RLS Sprint 2, remoto                                                             | 33 aprobadas, 0 fallos, rollback completo.                                                                                   |
| Regresión RLS Sprint 1, remoto                                                   | 44 aprobadas, 0 fallos, rollback completo.                                                                                   |
| REST público real con publishable key                                            | HTTP 200 con la query anidada de puntos, empresa, horarios y categorías; lista vacía esperada.                               |
| `npx expo install --check`                                                       | Dependencias compatibles.                                                                                                    |
| `npx expo-doctor`                                                                | 21/21 controles aprobados.                                                                                                   |
| `npx expo export --platform web`                                                 | 31 rutas, incluyendo `/point/[id]`; carga diferida de Leaflet.                                                               |
| Advisors de seguridad                                                            | Sin nuevas observaciones de tablas/funciones. Persiste la advertencia previa de protección de contraseñas filtradas en Auth. |

Las pruebas SQL crean identidades/empresas/puntos sólo dentro de transacciones con rollback. No envían correos ni conservan fixtures. Las pruebas de dominio cubren zona horaria, apertura/cierre, turnos partidos y nocturnos, cruce domingo/lunes, distancias, ubicación ausente, acentos y filtros combinados.

La revisión web usa el Supabase remoto real: onboarding, acceso invitado, Home/mapa, búsqueda desde Home, las 13 categorías, navegación al filtro de Notebooks y lista vacía. Se verificó también mapa/filtros a 390 px de ancho. No se otorgaron permisos de ubicación real durante la revisión.

El navegador de verificación tuvo timeouts al intentar abrir el detalle de un punto inexistente; la revisión manual de ese estado y del CTA de cuenta desde detalle quedó pendiente. El código incluye ambos estados, las rutas exportan correctamente y los guards del Sprint 1 continúan pasando sus pruebas.

`npx expo export --platform all` generó correctamente los bundles Hermes Android/iOS y la web con 31 rutas. Esto verifica empaquetado y resolución de imports; no equivale a ejecutar en dispositivo.

Prettier sobre los archivos del sprint y `git diff --check` pasaron. `npm run format:check` global detectó formato pendiente en 11 archivos anteriores sin cambios en este sprint: AuthTextField, Logo, PlaceholderScreen, ProfileImpactCard, ProfileMenuItem, logger, Profile, RegisterInput, profile.service, colors y tsconfig.

No se verificó todavía en dispositivos Android/iOS ni con GPS real. El detalle de un punto publicado y el marcador de datos reales requieren que una empresa publique puntos; actualmente no existen. La DB y la lógica se verificaron con fixtures transaccionales. No se volvió a ejecutar el stack Docker local, que no estaba disponible en la aplicación remota previa.

Para builds Android configurar una clave de Maps restringida siguiendo la [documentación Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/map-view/). Expo Go y el mapa web no requieren esa clave. El mapa web usa [OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/) sin precarga masiva ni descarga offline; se debe sustituir el proveedor de tiles si el volumen operativo lo requiere.

Advertencia heredada: [protección contra contraseñas filtradas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) desactivada.

## Próxima etapa

Sprint 3: `company_applications`, formulario de alta, revisión admin, aprobación transaccional, invitación segura al owner y emails. No crear empresas operativas directamente desde el formulario ciudadano.
