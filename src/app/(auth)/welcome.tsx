import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts } from '@/theme';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>TECNO RAEE</Text>

        <Text style={styles.tagline}>Dale una segunda vida a tu tecnología.</Text>

        <Text style={styles.description}>
          Encontrá dónde llevar tus aparatos electrónicos o solicitá un retiro de forma sencilla.
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <View style={styles.section}>
          <Text style={styles.label}>¿Ya tenés cuenta?</Text>

          <Pressable
            style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginButtonText}>Iniciar sesión</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>¿Todavía no tenés una cuenta?</Text>

          <Pressable
            style={({ pressed }) => [styles.createAccountButton, pressed && styles.pressed]}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.createAccountButtonText}>Registrate</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 80,
  },

  content: {
    alignItems: 'center',
    width: '100%',
  },

  logo: {
    fontFamily: fonts.bold,
    fontSize: 32,
    lineHeight: 39,
    textAlign: 'center',
    color: colors.primary,
    marginBottom: 16,
  },

  tagline: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: colors.primary,
    maxWidth: 240,
    marginBottom: 24,
  },

  description: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: colors.textSecondary,
    maxWidth: 280,
  },

  actionsContainer: {
    width: '100%',
    gap: 20,
  },

  section: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },

  label: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',
    color: colors.text,
  },

  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loginButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',
    color: colors.textOnPrimary,
  },

  createAccountButton: {
    width: '100%',
    height: 50,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  createAccountButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',
    color: colors.primary,
  },

  pressed: {
    opacity: 0.8,
  },
});
