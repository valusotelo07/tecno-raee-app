import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { DiscoveryProvider } from '@/providers/DiscoveryProvider';
import { WalletProvider } from '@/providers/WalletProvider';
import { canAccessCitizen } from '@/models/Access';
import { useFonts } from 'expo-font';
import { Roboto_400Regular, Roboto_500Medium, Roboto_700Bold } from '@expo-google-fonts/roboto';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <StatusBar style="dark" />

      <DiscoveryProvider>
        <WalletProvider>
          <Navigation />
        </WalletProvider>
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
      <Stack.Screen name="settings" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="contact" />
      <Stack.Protected guard={!session || recoveringPassword}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!loading && !recoveringPassword && canAccessCitizen(role, guest)}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="my-raee" />
        <Stack.Screen name="device-categories" />
        <Stack.Screen name="point/[id]" />
        <Stack.Screen name="new-delivery" />
        <Stack.Screen name="delivery/[id]" />
        <Stack.Screen name="my-points" />
        <Stack.Screen name="impact" />
        <Stack.Screen name="reward/[id]" />
        <Stack.Screen name="redemption/[id]" />
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
