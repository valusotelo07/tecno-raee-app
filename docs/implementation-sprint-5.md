# Sprint 5 — Entregas con QR

Fecha: 30/09/2026. Implementación incremental sobre Expo SDK 57 y Supabase `awzmweclcgellphiromh`, manteniendo Home, onboarding, permisos y portales existentes. Se continuó con el circuito de entregas del plan, sin avanzar todavía a retiros/canjes.

## Circuito disponible

1. Home → Registrar entrega, o detalle del punto → Registrar una entrega. Invitados deben crear cuenta/iniciar sesión; el backend exige email verificado.
2. Seleccionar un punto publicado de empresa activa, categorías que recibe, cantidades enteras de 1 a 999, notas y foto opcional JPG/PNG hasta 5 MB.
3. Confirmar crea entrega pendiente e items con tarifas de puntos y XP congeladas. El QR y su código legible contienen un token aleatorio independiente del ID de la entrega; vencen en 7 días. No hay acreditación por creación.
4. Owner o worker abre **Escanear / Recibir entrega**. Puede usar cámara o ingresar el código/contenido del QR manualmente. El lector distingue DELIVERY/PICKUP/REWARD; los dos últimos informan que su flujo aún no está habilitado.
5. Se muestra el nombre del ciudadano, punto, dispositivos declarados, notas y foto privada cuando existe. El receptor verifica físicamente y ajusta cantidades (0 a 999, al menos una unidad recibida).
6. Confirmar guarda cantidades reales, consume el código, acredita puntos de esa empresa y XP global, registra auditoría y actualiza el historial, en una sola transacción. Repetir el mismo código devuelve el resultado original sin sumar otro crédito.
7. Mis RAEE muestra historial paginado, detalle/QR, saldo por empresa y XP/nivel global. Perfil comparte los mismos saldos reales. La empresa tiene su historial de recepciones.

Pendientes pueden cancelarse por su titular. Confirmadas no se cancelan ni editan desde cliente. Códigos cancelados o vencidos no acreditan. Un trabajador no puede recibir su propia entrega: debe hacerlo otra persona del equipo.

## Backend y aislamiento

- `deliveries`, `delivery_items`, `points_transactions`, `impact_transactions`, con RLS y grants explícitos. Clients sólo leen; las mutaciones usan comandos verificados en servidor.
- Identidad tomada de `auth.uid()`, roles activos desde DB y email verificado desde Auth. No se usan metadatos editables para autorizar.
- Lectura del ciudadano limitada a sus operaciones. Miembros activos leen su propia empresa; administradores pueden inspeccionar. Tokens/items/fotos son privados. Nombre comercial y tarifas de puntos son términos públicos para ciudadanos autenticados; datos legales siguen privados.
- Snapshots por item: nombre de categoría, puntos por unidad y XP por unidad, tomados al registrar. Cambiar tarifas después no recalcula el histórico ni esa entrega.
- Ledgers sin escritura directa de cliente; una referencia única por entrega en cada ledger. El saldo se calcula en servidor para el usuario actual y se mantiene separado por empresa. No existe un saldo editable en `profiles`.
- Bloqueos de empresa, membresía y entrega serializan cambios de permisos y confirmaciones. La creación usa un bloqueo por ciudadano e idempotencia por request UUID: el reintento de red no duplica registros, y una clave no admite cambiar el payload.
- Límite de 20 entregas pendientes no vencidas por usuario, comprobado en servidor. Cantidades, categorías, archivos y tamaño de payload también se validan en DB.
- Bucket privado `delivery-photos`, rutas por usuario, MIME/tamaño restringidos y URLs firmadas de 120 segundos. Un archivo presentado no se puede eliminar desde cliente. La foto no es obligatoria.
- La suspensión impide nuevas entregas y recepciones de la empresa. Conserva el histórico y los puntos ya ganados del ciudadano.

No se agregó DRAFT persistido: el formulario es local hasta Confirmar. EXPIRED se registra al consultar/recibir el código; listas también muestran el vencimiento efectivo. No hace falta un job para impedir acreditaciones vencidas.

## Migraciones y dependencias

Aplicadas y sincronizadas con el historial remoto:

- `20260930164550_deliveries_qr_ledger.sql`
- `20260930170631_serialize_delivery_registration.sql`

Paquetes compatibles con Expo 57: `expo-camera`, `expo-image-picker`, `expo-crypto`, `react-native-svg`; `react-native-qrcode-svg` fijado en 6.3.26. Se conservó el lockfile.

La cámara se solicita al tocar el botón de escaneo. El modo manual funciona sin permisos. Configuración nativa comprobada: mensaje de cámara/fotos en español, sin uso de micrófono; Android incluye CAMERA y bloquea RECORD_AUDIO con `tools:node="remove"`. Un build nativo existente necesita reconstruirse para incorporar cambios de permisos/paquetes.

## Verificación realizada

| Comprobación                | Resultado                                                                                                                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TypeScript y lint           | Sin errores ni warnings                                                                                                                                                                                            |
| Pruebas locales             | 22 aprobadas, incluyendo códigos tipados, cantidades, vencimiento y estimaciones                                                                                                                                   |
| Entregas en Supabase remoto | 75 assertions aprobadas, transacción con rollback                                                                                                                                                                  |
| Regresión DB                | 44 fundaciones + 33 descubrimiento + 42 portales, sin fallos, rollback                                                                                                                                             |
| Exportación                 | Bundles Android/iOS y web correctos; 35 rutas                                                                                                                                                                      |
| Compatibilidad y doctor     | Dependencias compatibles y 21/21 controles aprobados                                                                                                                                                               |
| Permisos nativos            | Config introspection: cámara/fotos correctas y micrófono bloqueado                                                                                                                                                 |
| Advisors                    | Sin nuevas observaciones de seguridad; persiste el aviso previo de [protección de contraseñas filtradas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) |

Los tests DB cubren fraude desde cliente, invitado/email no verificado, aislamiento entre ciudadanos y empresas, código conocido de otra empresa, ajustes físicos, snapshots tras cambios de tarifas, confirmación repetida, rollback, cancelación, vencimiento, trabajador deshabilitado, suspensión, trabajador que intenta recibir su propia entrega, documentos/fotos privados, cuota y saldos multiempresa.

### Prueba web contra Auth/DB reales

Se crearon dos identidades verificadas y un punto de QA temporales, sin enviar emails ni modificar cuentas reales. Desde el navegador:

- Invitado intentó registrar: apareció el acceso que exige cuenta.
- Ciudadano inició sesión, seleccionó el punto y declaró 3 celulares + 2 cables. Se generó y mostró QR/código; estimación de 340 puntos + 34 XP. Mis RAEE permaneció en 0 puntos/XP antes de recibir.
- Trabajador inició sesión y llegó al portal de su empresa. Ingresó el contenido del QR, ajustó a 2 celulares + 1 cable y confirmó. Resultado: 220 puntos + 22 XP.
- DB mostró exactamente un movimiento de puntos y uno de XP para esa operación.
- Ciudadano volvió a iniciar sesión: Mis RAEE mostró 220 puntos, 22 XP e historial con las cantidades recibidas; Perfil compartió ese saldo.
- Se cerraron sesiones, revocaron/eliminaron sesiones de QA y se eliminaron identidades, empresa, punto, operación, items, movimientos y auditoría temporales. Se comprobaron cero usuarios/empresas QA remanentes. Los tests SQL también revirtieron todos sus fixtures. Home quedó nuevamente como invitado.

En el primer login de QA apareció el estado de error de perfil/permisos; Reintentar recuperó la carga. Las consultas independientes del SDK y los logins siguientes funcionaron. No se identificó una causa persistente ni se ocultó el estado de error.

## Límites y próxima etapa

El circuito web se comprobó con ingreso manual del contenido del QR. La lectura óptica con cámara física, el selector de fotos y la ejecución en teléfonos Android/iOS todavía requieren prueba en dispositivo. Exportar bundles verifica el empaquetado, no sustituye esa prueba. No se enviaron emails de invitación durante esta verificación.

Quedan retiros, recompensas/canjes, métricas de impacto y operación avanzada. El lector ya reconoce sus tipos, pero no crea ni confirma esas operaciones. No se conservan saldos ni empresas ficticios para mostrar una demo.

## Archivos principales

- `src/models/Delivery.ts`, `src/services/delivery.service.ts`.
- `src/components/delivery/{DeliverySummary,DeliveryHistory,DeliveryBalance}.tsx`.
- `src/app/new-delivery.tsx`, `src/app/delivery/[id].tsx`, `src/app/company/scanner.tsx`.
- Mis RAEE, Perfil, Home, detalle de punto, portal empresa, auditoría admin y RootLayout.
- `app.config.ts`, `package.json`, `package-lock.json`, `ActionButton.tsx`.
- Migraciones indicadas, `supabase/tests/deliveries.test.sql` y `tests/delivery.test.mjs`.

Se preservaron los cambios anteriores del repositorio; no se creó un nuevo proyecto Supabase ni se incluyeron claves privilegiadas en el cliente.
