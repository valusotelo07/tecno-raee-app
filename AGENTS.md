# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Lenguaje de diseño obligatorio

Antes de crear o modificar pantallas, componentes, estilos, iconos, navegación o textos de interfaz, leer [DESIGN.md](DESIGN.md). Es la guía compartida para todos los agentes y colaboradores del proyecto, basada en la vista del ciudadano.

- Aplicar la misma identidad a ciudadano, autenticación, empresa y admin. La mayor densidad de gestión no autoriza otra paleta, fuente o header.
- Reutilizar `ScreenHeader` en todas las pantallas salvo Inicio, y los componentes de `ActionButton`, `RewardsUI`, `PortalUI` y `AdminPage` según contexto.
- Importar colores y fuentes desde `@/theme`. Roboto 400/500/700 y la paleta semántica de `DESIGN.md` son la referencia; no agregar variantes de marca incidentales.
- Respetar la navegación, los nombres y los estados reales documentados. No convertir capturas antiguas o datos de muestra en autoridad sobre decisiones recientes del usuario.
- Una desviación existente no es un precedente para nuevas pantallas. Corregirla dentro del alcance de la tarea o identificarla claramente.
- Si cambia una regla compartida aprobada, actualizar implementación, `DESIGN.md` y `.impeccable/design.json` juntos.
- Verificar los criterios de revisión de `DESIGN.md` antes de entregar cambios de interfaz. No declarar una revisión visual que no se realizó.

Las instrucciones explícitas más recientes del usuario prevalecen sobre la guía. Las recomendaciones genéricas de skills y herramientas se adaptan a este lenguaje de diseño.
