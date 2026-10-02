import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { DiscoveryProvider } from '@/providers/DiscoveryProvider';
import { canAccessCitizen } from '@/models/Access';
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <StatusBar style="dark" />

      <DiscoveryProvider>
        <Navigation />
      </DiscoveryProvider>
    </AuthProvider>
  );
}

function Navigation() {
  const { session, role, guest, loading, recoveringPassword } = useAuth();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="portal-access" />
      <Stack.Screen name="company-application" />
      <Stack.Screen name="company-invitations" />
      <Stack.Protected guard={!session || recoveringPassword}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!loading && !recoveringPassword && canAccessCitizen(role, guest)}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="device-categories" />
        <Stack.Screen name="point/[id]" />
        <Stack.Screen name="new-delivery" />
        <Stack.Screen name="delivery/[id]" />
      </Stack.Protected>
      <Stack.Protected
        guard={
          !loading && !recoveringPassword && (role === 'company_owner' || role === 'company_worker')
        }
      >
        <Stack.Screen name="company" />
      </Stack.Protected>
      <Stack.Protected guard={!loading && !recoveringPassword && role === 'platform_admin'}>
        <Stack.Screen name="admin" />
      </Stack.Protected>
    </Stack>
  );
}
