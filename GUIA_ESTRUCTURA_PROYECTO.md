# Guía rápida de estructura del proyecto

El proyecto usa **Expo Router + React Native + TypeScript**.
La idea principal es separar responsabilidades para evitar lógica, estilos y componentes duplicados.

```text
src/
├── app/          → pantallas y rutas
├── components/   → componentes reutilizables
├── hooks/        → hooks personalizados
├── services/          → servicios, Firebase, helpers y APIs
├── models/       → tipos e interfaces
└── theme/        → colores, tipografías y otros tokens visuales
```

## 1. Crear una nueva pantalla

Todas las pantallas/rutas se crean dentro de:

```text
src/app/
```

Por ejemplo, para agregar una pantalla de perfil:

```text
src/app/profile.tsx
```

```tsx
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi perfil</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.text,
  },
});
```

La ruta automáticamente será:

```text
/profile
```

Para navegar:

```tsx
import { router } from 'expo-router';

router.push('/profile');
```

Para volver:

```tsx
router.back();
```

Si la pantalla debe reemplazar a la actual:

```tsx
router.replace('/home');
```

---

## 2. Agrupar rutas

Expo Router permite crear grupos usando carpetas con paréntesis.

```text
src/app/
├── (auth)/
│   ├── login.tsx
│   └── register.tsx
│
└── (app)/
    ├── home.tsx
    └── profile.tsx
```

Los paréntesis **no forman parte de la URL**.

Por ejemplo:

```text
src/app/(auth)/login.tsx
```

sigue siendo:

```text
/login
```

Los grupos sirven para organizar mejor las rutas relacionadas.

---

## 3. Crear un componente reutilizable

Si algo se usa en más de una pantalla, debe ir en:

```text
src/components/
```

Por ejemplo:

```text
src/components/auth/AuthButton.tsx
```

```tsx
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts } from '@/theme';

type Props = {
  title: string;
  onPress: () => void;
};

export function AuthButton({ title, onPress }: Props) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  text: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textOnPrimary,
  },
});
```

Regla práctica: si el mismo bloque de UI aparece en dos o más pantallas, probablemente debería convertirse en un componente.

Ejemplos:

- Botones
- Inputs
- Cards
- Headers
- Logo
- Modales
- Items de listas

---

## 4. No hardcodear colores

Evitar:

```tsx
backgroundColor: '#17823B',
color: '#808080',
```

Usar siempre el theme:

```tsx
backgroundColor: colors.primary,
color: colors.textSecondary,
```

Los colores globales están en:

```text
src/theme/colors.ts
```

Ejemplo:

```ts
export const colors = {
  primary: '#17823B',

  background: '#F7FAF8',
  surface: '#FFFFFF',

  text: '#000000',
  textSecondary: '#808080',
  textOnPrimary: '#FFFFFF',

  borderPrimary: '#17823B',
} as const;
```

Si aparece un color nuevo que se reutiliza en distintas partes de la app, debe agregarse al theme.

---

## 5. No hardcodear tipografías

La app usa **Inter**.

Las fuentes están definidas en:

```text
src/theme/typography.ts
```

```ts
export const fonts = {
  regular: 'Inter_400Regular',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;
```

Usar:

```tsx
fontFamily: fonts.regular,
```

```tsx
fontFamily: fonts.semiBold,
```

```tsx
fontFamily: fonts.bold,
```

Evitar definir manualmente la familia y el peso en cada pantalla.

---

## 6. Modelos y tipos

Los objetos importantes de la aplicación se definen en:

```text
src/models/
```

Por ejemplo:

```text
src/models/device.ts
```

```ts
export type Device = {
  id: string;
  name: string;
  category: string;
  status: DeviceStatus;
};

export type DeviceStatus = 'received' | 'classified' | 'evaluated' | 'reconditioned' | 'final';
```

Después puede importarse desde cualquier parte del proyecto:

```tsx
import type { Device } from '@/models/device';
```

Esto evita definir estructuras diferentes para la misma entidad.

---

## 7. Firebase y servicios

La configuración y acceso a servicios externos va en:

```text
src/services/
```

Por ejemplo:

```text
src/services/firebase.ts
```

```ts
export const auth = ...
export const db = ...
```

Si existe lógica específica para dispositivos:

```text
src/services/devices.ts
```

```ts
export async function getDevices() {
  // Consulta a Firestore
}
```

La pantalla no debería contener toda la lógica de Firebase directamente.

Preferimos:

```text
Pantalla
   ↓
función de servicio
   ↓
services/
   ↓
Firebase
```

Esto hace que el código sea más fácil de mantener y probar.

---

## 8. Hooks

Cuando una lógica de estado se reutiliza o empieza a crecer demasiado, debe ir en:

```text
src/hooks/
```

Por ejemplo:

```text
src/hooks/useAuth.ts
```

```ts
export function useAuth() {
  // Usuario actual
  // Estado de carga
  // Escucha de autenticación

  return {
    user,
    loading,
  };
}
```

Después desde una pantalla:

```tsx
const { user, loading } = useAuth();
```

---

## 9. Ejemplo completo: agregar "Mis dispositivos"

Supongamos que queremos agregar una funcionalidad para listar dispositivos.

### Paso 1 — Modelo

```text
src/models/device.ts
```

```ts
export type Device = {
  id: string;
  name: string;
  status: string;
};
```

### Paso 2 — Servicio

```text
src/services/devices.ts
```

```ts
export async function getDevices(): Promise<Device[]> {
  // Consultar Firestore
}
```

### Paso 3 — Componente reutilizable

```text
src/components/devices/DeviceCard.tsx
```

```tsx
type Props = {
  device: Device;
};

export function DeviceCard({ device }: Props) {
  // UI de la tarjeta
}
```

### Paso 4 — Pantalla

```text
src/app/(app)/devices.tsx
```

La pantalla usa el servicio para obtener los datos y los componentes para mostrarlos.

```text
models/device.ts
        ↓
services/devices.ts
        ↓
app/(app)/devices.tsx
        ↓
components/devices/DeviceCard.tsx
```

Cada archivo mantiene una responsabilidad clara.

---

## 10. Regla general

Ante una nueva implementación, usar esta guía:

```text
¿Es una pantalla o ruta?
→ app/

¿Es UI reutilizable?
→ components/

¿Es lógica reutilizable de React?
→ hooks/

¿Habla con Firebase/API o es un helper?
→ services/

¿Define la estructura de un dato?
→ models/

¿Es un color, fuente u otro estilo global?
→ theme/
```

Mantener esta separación ayuda a que el proyecto siga siendo fácil de entender y modificar a medida que crezca.
