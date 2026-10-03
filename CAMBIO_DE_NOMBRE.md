# Cambiar el nombre de la app

El nombre comercial se define una sola vez en [`src/config/brand.json`](src/config/brand.json).
Las pantallas, el logo de texto, los formularios de acceso y los permisos de cámara, fotos y ubicación usan esa configuración. `app.config.ts` también la usa para el nombre visible de Expo y de la app instalada.

## Cambio habitual

1. Editar `name` en `src/config/brand.json` con el nuevo nombre, respetando mayúsculas y espacios.
2. Ajustar `accentSuffix` si el logo debe destacar la última parte con otro color. Usar `""` para mostrar todo el nombre del mismo color. Si el nombre no termina con ese sufijo, se muestra completo automáticamente.
3. Reiniciar Expo. Para web, volver a exportar y publicar. Para Android/iOS, generar un nuevo build: el nombre instalado y los textos de permisos se incorporan durante la compilación.
4. Actualizar los títulos y las menciones comerciales en `README.md` y `PROYECTO_Y_FEATURES.md`, las fichas de las tiendas y las plantillas de emails/invitaciones configuradas fuera del cliente.

Por ejemplo, para un nombre de una sola palabra:

```json
{
  "name": "NuevoNombre",
  "accentSuffix": ""
}
```

`src/config/brand.ts` deriva el logo y la versión en mayúsculas para los formularios. No agregar nombres comerciales escritos directamente en nuevas pantallas: importar `brand` desde `@/config/brand` y usar `brand.name`.

## Recursos visuales

Si también cambia la identidad gráfica, revisar estos recursos referenciados por `app.json`:

| Uso                | Recurso                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| Ícono general      | `assets/images/icon.png`                                                                                  |
| Ícono iOS          | `assets/expo.icon/`                                                                                       |
| Ícono Android      | `assets/images/android-icon-foreground.png`, `android-icon-background.png`, `android-icon-monochrome.png` |
| Pantalla de inicio | `assets/images/splash-icon.png`                                                                           |
| Favicon web        | `assets/images/favicon.png`                                                                               |

Los colores y las fuentes están en `src/theme/`. El símbolo de reciclaje y la presentación del logo están en `src/components/auth/Logo.tsx`.

## Identificadores que se conservan

Estos valores identifican proyectos, enlaces o datos existentes. Un cambio de marca no requiere renombrarlos:

| Identificador                            | Ubicación                            | Motivo                                                                                     |
| ---------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------ |
| Slug `tecno-raee-app`                    | `app.json`                           | Identidad del proyecto Expo.                                                               |
| Scheme `tecnoraeeapp`                    | `app.json`                           | Compatibilidad de enlaces a la app y URLs de retorno.                                      |
| Package `com.ikarus16x.tecnoraeeapp`     | `app.json`                           | Identidad Android existente, fijada explícitamente para que no se derive del nuevo nombre. |
| Nombre npm `tecno-raee-app`              | `package.json`                       | Nombre técnico del paquete privado.                                                        |
| Clave `tecnoraee:onboarding:v1`          | `src/services/onboarding.service.ts` | Conserva la preferencia guardada de onboarding.                                            |
| Prefijo QR `TECNO-RAEE` y códigos `TR-…` | `src/models/Delivery.ts` y backend   | Los códigos emitidos deben seguir siendo válidos.                                          |
| Proyecto del backend                     | Configuración del backend            | Conserva usuarios, sesiones y datos.                                                       |

Antes de la primera distribución iOS, definir un `ios.bundleIdentifier` permanente en `app.json`; si ya hay una app publicada, conservar exactamente el identificador registrado. Si se decide cambiar un identificador técnico, planificar su migración por separado, manteniendo compatibilidad con enlaces y códigos anteriores.

`RAEE` también describe el tipo de residuo. Etiquetas como “Mis RAEE” y “RAEE reciclados” son términos del producto y se revisan sólo si cambia su vocabulario.

## Verificación

```powershell
npx expo config --type public
npx tsc --noEmit
npm run lint
npx expo export --platform web
```

Confirmar que `name` y los textos de los plugins muestran la nueva marca, y revisar Home, bienvenida, registro, login y recuperación de contraseña. Probar un QR anterior y el reingreso de un usuario que ya completó el onboarding.

Las carpetas `android/` e `ios/` son generadas y están ignoradas por Git. Si se compila desde una carpeta nativa ya existente, sincronizarla con `npx expo prebuild --platform android` o `npx expo prebuild --platform ios` antes del build. Conservar el identificador nativo existente y revisar el resultado generado.

Referencia: [configuración de Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/config/app/).
