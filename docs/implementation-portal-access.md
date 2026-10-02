# Login único y redirección por permisos

Fecha: 2026-09-30. Sustituye el selector de acceso por empresa o admin de la revisión anterior, según la preferencia del usuario.

La primera apertura sin sesión muestra `/onboarding`. Saltar o Comenzar guarda la introducción como completada y abre `/home` como invitado. Las visitas siguientes abren Home directamente; cerrar sesión conserva esa preferencia. Entrar con una cuenta también completa la introducción para este dispositivo.

El login es opcional, elegido desde la introducción o las funciones que requieren cuenta. Todos se autentican por `/login`, con el diseño anterior: logo, correo, contraseña, recuperación y creación de cuenta. No hay etiquetas ni selección de Personal/Empresa/Admin. Home conserva el trámite de registrar una organización.

Después de autenticar, Index espera perfil/permisos y decide el destino desde Supabase:

- Administrador autorizado → `/admin`.
- Responsable o trabajador con membresía activa en empresa activa → `/company`.
- Ciudadano → `/home`.

Las invitaciones pendientes y los retornos a solicitud/invitaciones conservan el flujo ciudadano correspondiente. Nunca desplazan el portal de una cuenta que ya es empresa o admin. La recuperación de contraseña mantiene prioridad sobre la redirección normal.

Las URLs antiguas de `/portal-access` y `/welcome` llevan a la entrada normal: onboarding o Home sin sesión, o al portal correspondiente con sesión. Los parámetros `intent=admin` y `intent=company` se ignoran. El rol no se selecciona ni se asigna desde el cliente.

TypeScript y lint sin errores; 29 pruebas locales aprobadas. Se comprobó en navegador la primera apertura → Saltar → Home y el reingreso desde `/` → Home sin login. Las pruebas de persistencia cubren también preferencias antiguas de invitado. Los ingresos reales de admin y responsable fueron comprobados en la revisión anterior con fixtures temporales ya eliminados. Esta revisión conserva Auth, RLS y las cuentas existentes; no modifica la base de datos.
