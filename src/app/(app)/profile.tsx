import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ProfileImpactCard } from '@/components/profile/ProfileImpactCard';
import { ProfileMenuItem } from '@/components/profile/ProfileMenuItem';
import { logout } from '@/services/auth.service';
import { colors } from '@/theme';

async function performLogout() {
  try {
    await logout();

    router.replace('/welcome');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo cerrar la sesión.';

    Alert.alert('Error al cerrar sesión', message);
  }
}

function handleLogout() {
  Alert.alert('Cerrar sesión', '¿Querés cerrar tu sesión?', [
    {
      text: 'Cancelar',
      style: 'cancel',
    },
    {
      text: 'Cerrar sesión',
      style: 'destructive',
      onPress: performLogout,
    },
  ]);
}

export default function ProfileScreen() {
  /*
   * FE-0013:
   * por ahora estos datos pueden quedar mockeados.
   *
   * Después podemos tomarlos de Supabase.
   */
  const userName = 'El Gato';
  const email = 'elgato@gmail.com';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Encabezado */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={50} color={colors.primary} />
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {userName}
          </Text>

          <Text style={styles.email} numberOfLines={1}>
            {email}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={24} color={colors.text} />
      </View>

      <ProfileImpactCard recycledCount={5} recoveredWeight="12 kg" />

      <Text style={styles.sectionTitle}>Mi cuenta</Text>

      <View style={styles.menu}>
        <ProfileMenuItem
          title="Datos personales"
          subtitle="Nombre, correo y más"
          icon="person-outline"
          onPress={() => {}}
        />

        <ProfileMenuItem
          title="Mi ubicación"
          subtitle="Gestioná tu zona"
          icon="location-outline"
          onPress={() => {}}
        />

        <ProfileMenuItem
          title="Notificaciones"
          subtitle="Recibí novedades y recordatorios"
          icon="notifications-outline"
          onPress={() => {}}
        />

        <ProfileMenuItem
          title="Configuración"
          subtitle="Preferencias de la app"
          icon="settings-outline"
          onPress={() => {}}
        />
      </View>

      <View style={styles.logoutSeparator} />

      <Pressable
        style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={25} color={colors.danger} />

        <Text style={styles.logoutText}>Cerrar Sesión</Text>

        <Ionicons name="chevron-forward" size={22} color={colors.danger} />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  content: {
    width: '100%',
    maxWidth: 390,
    alignSelf: 'center',

    paddingHorizontal: 7,
    paddingTop: 48,
    paddingBottom: 20,
  },

  header: {
    minHeight: 90,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 35,
  },

  avatar: {
    width: 80,
    height: 80,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: colors.avatarBackground,

    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 40,
  },

  userInfo: {
    flex: 1,
    marginLeft: 15,
  },

  userName: {
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: '700',

    color: colors.primary,
  },

  email: {
    marginTop: 3,

    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',

    color: colors.text,
  },

  sectionTitle: {
    marginTop: 17,
    marginLeft: 1,

    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '500',

    color: colors.text,
  },

  menu: {
    marginTop: 14,
    gap: 7,
  },

  logoutSeparator: {
    height: 1,

    marginTop: 37,
    marginHorizontal: 6,

    backgroundColor: colors.border,
  },

  logoutButton: {
    height: 58,

    marginTop: 23,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 12,

    backgroundColor: colors.dangerBackground,

    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },

  logoutText: {
    flex: 1,

    marginLeft: 7,

    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '400',

    color: colors.danger,
  },

  pressed: {
    opacity: 0.65,
  },
});
