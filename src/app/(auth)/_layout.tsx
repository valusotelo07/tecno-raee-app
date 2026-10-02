import { Stack } from 'expo-router';

import { colors } from '@/theme';
import { useAuth } from '@/providers/AuthProvider';

export default function AuthLayout() {
  const { session, recoveringPassword } = useAuth();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        headerBackTitle: '',
        headerShadowVisible: false,
        headerTransparent: true,
        headerTintColor: colors.primary,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Protected guard={Boolean(session) && recoveringPassword}>
        <Stack.Screen name="new-password" />
      </Stack.Protected>
      <Stack.Screen
        name="welcome"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
