# Panel admin e historial de cambios

Fecha: 2026-09-30.

La cabecera y la navegación quedan fuera del contenido desplazable. Todas las secciones mantienen una barra de 49 px; en móvil se desplaza horizontalmente y conserva visible la pestaña seleccionada. Se usan los colores y fuentes existentes. Los estados vacíos de solicitudes, empresas y ampliaciones explican qué aparecerá en cada sección. Configuración global limita el ancho de sus formularios a 640 px.

Historial de cambios consulta Supabase con autorización de administrador verificada en DB. Muestra autor, email, fecha en Argentina, operación, empresa/referencia, motivo y diferencias anteriores/nuevas. Incluye búsqueda por persona, empresa o referencia y páginas de 25 registros, sin el recorte anterior a los últimos 100. El filtro inicial muestra administradores; Todas las cuentas incluye también operaciones ciudadanas y empresariales.

Los comandos de revisión de solicitudes y cupos, suspensión/reactivación, XP y niveles guardan snapshots en la misma transacción que la operación, después de bloquear las filas correspondientes. La identidad y el rol del autor se conservan al insertar el registro, aunque luego cambien el perfil o sus permisos. Los comandos existentes siguen registrando sus operaciones. Los registros antiguos se conservan; no se inventan snapshots que nunca se almacenaron.

También se registra la emisión de acceso a documentación privada desde admin. Las invitaciones conservan el intento previo al envío y agregan el resultado enviado/fallido desde la Edge Function, con identidad verificada. No se registran clics de navegación ni contraseñas. Un comando fallido no se presenta como cambio realizado. La tabla conserva RLS y no permite insertar, modificar o eliminar registros desde clientes autenticados; los registros los escribe el backend autorizado.

Migración remota/local: `20260930213235_admin_changelog.sql`. Edge Function `company-invitation` desplegada en versión 3, preservando su validación Auth.getUser y la autorización del RPC de invitación.

Validación:

- 33 pruebas locales, TypeScript y lint sin errores; exportación web correcta.
- 27 pruebas SQL nuevas y 42 pruebas existentes de portales ejecutadas en Supabase dentro de transacciones con rollback. Cubren snapshots, identidad conservada, consultas privadas, permisos, paginación y rollback de comandos fallidos.
- Navegación comprobada en web de 1280 px y móvil de 390 px. Creación y edición de un nivel temporal desde la interfaz, con ambos cambios visibles en el historial real. Se eliminaron exclusivamente la identidad y los datos de esta prueba al terminar.
- Advisors sin nuevos avisos de esquema. Persiste el aviso previo de [protección de contraseñas filtradas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

El historial cubre operaciones de la aplicación; cambios manuales hechos directamente con credenciales de administración de la base requieren su propia auditoría operativa. No se enviaron emails de prueba a personas reales en esta revisión.
