# Empresa y administración

Actualización posterior: el flujo de entregas/QR, recepción y acreditación ya está implementado y verificado en [Sprint 5](implementation-sprint-5.md). Los pendientes de ese flujo indicados en este reporte corresponden al estado previo a esa implementación.

Fecha: 30/09/2026. Implementación sobre el repositorio existente, Expo SDK 57 y Supabase `awzmweclcgellphiromh`. Continúa los Sprints 3 y 4 del plan, con gestión de equipo/límites del Sprint 9 y configuración global admin. Las entregas físicas corresponden al Sprint 5 y siguen pendientes.

## Flujo disponible

1. Desde Home o Welcome, abrir **Empresas y administración** (`/portal-access`). El onboarding mantiene Comenzar/Saltar hacia Home como invitado.
2. Crear cuenta/verificar email o iniciar sesión y enviar solicitud con datos legales, contacto y documentación PDF/JPG/PNG de hasta 8 MB. La solicitud conserva su estado y permite corregir información cuando admin la solicita.
3. Admin revisa documentación mediante URL firmada de 120 segundos, pide información, rechaza o aprueba. La aprobación crea empresa e invitación owner en una transacción; repetirla no duplica la empresa.
4. El responsable entra con la cuenta que presentó la solicitud, acepta su invitación y configura empresa, puntos verdes, coordenadas, contacto, categorías, horarios semanales/turnos partidos y publicación. Define puntos por dispositivo para su propia empresa.
5. Owner invita trabajadores, reenvía/cancela invitaciones, deshabilita/reactiva integrantes y solicita aumento del límite. Invitaciones pendientes reservan cupo. Workers consultan información de su empresa y no pueden modificar configuración owner.
6. Admin gestiona solicitudes de límite, suspende/reactiva empresas con motivo, configura XP/niveles y consulta auditoría. Una empresa suspendida pierde publicación pública y operaciones protegidas.

La cuenta existente y verificada `waltercaste16@outlook.com` fue autorizada como administrador por pedido explícito del usuario. Al iniciar sesión llega directamente a `/admin`, sin onboarding. No se creó una contraseña nueva ni una identidad adicional.

## Persistencia y permisos

- Tablas: `company_applications`, `company_details`, `company_invitations`, `company_limit_requests`, `company_device_points`, `impact_levels`, `audit_log`; XP agregado al catálogo global.
- Bucket privado `company-documents`: archivos separados por usuario, lectura del solicitante/admin y restricciones de MIME/tamaño. Documentos presentados no se pueden borrar desde cliente.
- RLS en todas las tablas nuevas; el cliente no puede cambiar directamente roles, aprobaciones, límites ni configuración protegida.
- Wrapper público `portal_command` con operaciones verificadas en servidor. Mutaciones relacionadas y auditoría se confirman juntas. Bloqueos de filas serializan invitaciones y cupos.
- La identidad de una invitación se coteja con el email verificado de Auth. Los roles provienen de DB, nunca de metadatos editables por el usuario.
- La Edge Function verifica el Bearer con `Auth.getUser` y ejecuta un RPC con permisos del solicitante antes de enviar. Las claves privilegiadas quedan exclusivamente en el servidor. Reintentos de email limitados a 60 segundos.
- Nuevos invitados reciben acceso Auth y creación de contraseña; cuentas existentes reciben enlace de acceso. La documentación legal privada se mantiene separada del nombre público de empresa.

## Despliegue realizado

Migraciones aplicadas al remoto y sincronizadas con el historial:

- `20260930154245_company_admin_portals.sql`
- `20260930160754_portal_validation_and_email_throttle.sql`
- `20260930161036_fix_portal_status_commands.sql`

`company-invitation` desplegada, versión 2. Incluye `full_name` al invitar usuarios nuevos para conservar la compatibilidad con el trigger de perfiles existente.

Auth remoto comprobado y actualizado desde el dashboard:

- Site URL: `http://localhost:8081`.
- Retornos exactos: `http://localhost:8081/company-invitations` y `http://127.0.0.1:8081/company-invitations`.
- SMTP personalizado ya estaba habilitado. Las plantillas Invite y Magic Link contienen `ConfirmationURL`; se conservaron.

Para otro ambiente, configurar `COMPANY_INVITE_REDIRECT_URL` en la función, Site URL y la URL exacta permitida en Auth. El retorno configurado hoy corresponde al entorno web local; los enlaces deben abrirse en la computadora que ejecuta Expo. Para publicar o usar invitaciones nativas hay que configurar el dominio o deep link de ese ambiente.

## Verificación

| Control                                | Resultado                                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------------------------- |
| TypeScript                             | `npx tsc --noEmit`, sin errores                                                             |
| Lint                                   | `npm run lint`, sin errores ni warnings                                                     |
| Pruebas de dominio/servicios           | 18 aprobadas                                                                                |
| Portales en PostgreSQL remoto          | 42 assertions aprobadas; transacción con rollback                                           |
| Regresión fundaciones y descubrimiento | Suites de 44 y 33 assertions, sin fallos; rollback                                          |
| Edge Function                          | Deno check correcto; despliegue activo; POST sin sesión devuelve 401                        |
| Exportación web                        | 32 rutas, compilación correcta                                                              |
| Seguridad Supabase                     | Sin nuevas observaciones; persiste el aviso previo de protección de contraseñas filtradas   |
| Revisión web                           | Acceso invitado, hub de portales y solicitud que exige cuenta; URLs Auth guardadas visibles |

Los tests SQL cubren aislamiento entre empresas, aprobación repetida, invitación por email correcto, worker sin permisos owner, reservas y límite, suspensión, configuración protegida y documentos privados. Los fixtures de prueba se revirtieron; no se conservaron empresas falsas ni se enviaron correos de prueba.

No se verificó un envío real hasta la bandeja del destinatario. La validación de los comandos y permisos sí se ejecutó contra Supabase remoto. Los ingresos autenticados de admin y responsable se comprobaron posteriormente en el navegador; ver `implementation-portal-access.md`. No se probó DocumentPicker en Android/iOS físico. El registro y la recuperación anteriores permanecen conservados.

## Pendiente del plan

El escáner, las entregas con QR y la acreditación efectiva de puntos/XP quedaron implementados en `implementation-sprint-5.md`. Permanecen pendientes los retiros, catálogo/canje de recompensas y las vistas agregadas de impacto global. No se muestran saldos ni operaciones simuladas.

## Archivos principales

Pantallas en `src/app/company`, `src/app/admin`, `src/app/company-application.tsx`, `src/app/company-invitations.tsx` y `src/app/portal-access.tsx`; componentes compartidos en `src/components/portal`; modelos/horarios, servicio de portales y hooks de carga/acción; migraciones, función y tests bajo `supabase`; prueba de horarios en `tests/point-schedule.test.mjs`. AuthProvider y navegación incorporan invitaciones pendientes sin cambiar el ingreso de invitados a Home.
