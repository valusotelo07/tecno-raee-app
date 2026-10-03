import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton } from '@/components/ui/ActionButton';
import { CitizenPage, rewardStyles as s } from '@/components/rewards/RewardsUI';
import { PortalFeedback } from '@/components/portal/PortalUI';
import { DeliveryBalance } from '@/components/delivery/DeliveryBalance';
import { usePortalAction } from '@/hooks/usePortalData';
import { useAuth } from '@/providers/AuthProvider';
import { colors, fonts } from '@/theme';
export default function ProfileScreen() {
  const { session } = useAuth();
  return session ? (
    <Profile />
  ) : (
    <CitizenPage title="Tu perfil">
      <View style={s.card}>
        <Text style={s.subtitle}>Comenzá a sumar impacto</Text>
        <Text style={s.body}>
          Creá tu cuenta para registrar tus entregas, sumar puntos y disfrutar premios.
        </Text>
        <ActionButton title="Crear cuenta" onPress={() => router.push('/register')} />
        <ActionButton title="Iniciar sesión" secondary onPress={() => router.push('/login')} />
      </View>
      <View style={s.card}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/my-raee')}
          style={styles.menuRow}
        >
          <Ionicons name="refresh-outline" size={23} color={colors.primaryDark} />
          <Text style={[s.label, { flex: 1 }]}>Mis entregas</Text>
          <Ionicons name="chevron-forward" size={19} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/device-categories')}
          style={styles.menuRow}
        >
          <Ionicons name="hardware-chip-outline" size={23} color={colors.primaryDark} />
          <Text style={[s.label, { flex: 1 }]}>Qué recibimos</Text>
          <Ionicons name="chevron-forward" size={19} color={colors.textSecondary} />
        </Pressable>
        <SettingsLink />
      </View>
    </CitizenPage>
  );
}
function SettingsLink() {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push('/settings')}
      style={styles.menuRow}
    >
      <Ionicons name="settings-outline" size={23} color={colors.primaryDark} />
      <Text style={[s.label, { flex: 1 }]}>Configuraciones</Text>
      <Ionicons name="chevron-forward" size={19} color={colors.textSecondary} />
    </Pressable>
  );
}
function Profile() {
  const { profile, logout } = useAuth();
  const action = usePortalAction();
  const signOut = () =>
    void action.run(async () => {
      await logout();
      router.replace('/');
    }, '');
  return (
    <CitizenPage title="Mi perfil">
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={36} color={colors.primaryDark} />
        </View>
        <Text style={s.title}>{profile?.fullName ?? 'Mi cuenta'}</Text>
        <Text style={s.body}>{profile?.email}</Text>
      </View>
      <DeliveryBalance />
      <View style={s.card}>
        {(
          [
            ['leaf-outline', 'Mi impacto', '/impact'],
            ['bar-chart-outline', 'Mis puntos', '/my-points'],
            ['gift-outline', 'Premios y mis canjes', '/rewards'],
            ['location-outline', 'Puntos verdes', '/green-points'],
            ['refresh-outline', 'Mis entregas', '/my-raee'],
            ['hardware-chip-outline', 'Qué recibimos', '/device-categories'],
          ] as const
        ).map(([icon, label, path]) => (
          <Pressable
            key={path}
            accessibilityRole="button"
            onPress={() => router.push(path)}
            style={styles.menuRow}
          >
            <Ionicons name={icon} size={23} color={colors.primaryDark} />
            <Text style={[s.label, { flex: 1 }]}>{label}</Text>
            <Ionicons name="chevron-forward" size={19} color={colors.textSecondary} />
          </Pressable>
        ))}
      </View>
      <View style={s.card}>
        <SettingsLink />
      </View>
      <PortalFeedback error={action.error} />
      <Pressable
        accessibilityRole="button"
        disabled={action.busy}
        style={styles.logout}
        onPress={() => {
          if (Platform.OS === 'web') signOut();
          else
            Alert.alert('Cerrar sesión', '¿Querés cerrar tu sesión?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Cerrar sesión', style: 'destructive', onPress: signOut },
            ]);
        }}
      >
        <Ionicons name="log-out-outline" size={23} color={colors.danger} />
        <Text style={styles.logoutText}>{action.busy ? 'Cerrando sesión…' : 'Cerrar sesión'}</Text>
      </Pressable>
    </CitizenPage>
  );
}
const styles = StyleSheet.create({
  identity: { alignItems: 'center', gap: 8, paddingVertical: 12 },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  menuRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12 },
  logout: {
    minHeight: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
  },
  logoutText: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.danger },
});
