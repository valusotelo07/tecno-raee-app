# Correcciones de recuperación de contraseña

Fecha: 2026-09-30.

- Confirmación de envío y reenvío dentro de la pantalla, con anuncio accesible. Los errores también son visibles en web; no dependen de Alert.
- Más espacio entre la descripción del código y las seis casillas. Se mantiene el diseño existente.
- Indicadores de envío/verificación/guardado y bloqueo de acciones mientras hay una solicitud en curso.
- Cambiar el email reinicia el código y su confirmación. La verificación conserva OTP de tipo recovery.
- Guardar la nueva contraseña mantiene la sesión verificada. AuthProvider termina el estado de recuperación sólo después de una actualización exitosa; la navegación vuelve a Index, que espera los permisos y abre Home, Empresa o Admin según la cuenta. No depende de aceptar una alerta ni vuelve a la pantalla de código.
- Un error al actualizar conserva la pantalla y el estado de recuperación para reintentar.

Verificación: TypeScript y lint correctos; suite local y tests de Auth correctos, incluyendo conservación de sesión tras guardar y respuestas/error de envío. En navegador se verificó el aviso contra Auth con un email de prueba no registrado, sin cambiar la contraseña ni la sesión real del usuario. Revisión visual del espacio sobre las casillas. No se modificó la base de datos ni se cambió una contraseña real durante la verificación.
