import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>TECNO RAEE</Text>

      <Text style={styles.tagline}>Dale una segunda vida a tu tecnología.</Text>

      <Text style={styles.description}>
        Encontrá dónde llevar tus aparatos electrónicos o solicitá un retiro de forma sencilla.
      </Text>

      <View style={styles.loginSection}>
        <Text style={styles.loginLabel}>¿Ya tenés cuenta?</Text>

        <Pressable
          style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}
          onPress={() => console.log('Iniciar Sesión pressed')}
        >
          <Text style={styles.loginButtonText}>Iniciar sesión</Text>
        </Pressable>
      </View>

      <View style={styles.createAccountSection}>
        <Text style={styles.actionLabel}>¿Todavía no tenés una cuenta?</Text>

        <Pressable
          style={({ pressed }) => [styles.createAccountButton, pressed && styles.pressed]}
          onPress={() => console.log('Crear Cuenta pressed')}
        >
          <Text style={styles.createAccountButtonText}>Registrate</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.background,
  },

  logo: {
    position: 'absolute',
    top: 123,
    left: '50%',
    transform: [{ translateX: -103 }],

    width: 206,
    height: 39,

    fontFamily: fonts.bold,
    fontSize: 32,
    lineHeight: 39,

    textAlign: 'center',
    color: colors.primary,
  },

  tagline: {
    position: 'absolute',
    top: 219,
    left: '50%',
    transform: [{ translateX: -98.5 }],

    width: 197,
    height: 41,

    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 19,

    textAlign: 'center',
    color: colors.primary,
  },

  description: {
    position: 'absolute',
    top: 350,
    left: '50%',
    transform: [{ translateX: -106 }],

    width: 212,
    height: 76,

    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 19,

    textAlign: 'center',
    color: colors.textSecondary,
  },

  createAccountSection: {
    position: 'absolute',
    top: 653,
    left: '50%',
    transform: [{ translateX: -163 }],

    width: 326,
    height: 76,
  },

  actionLabel: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: [{ translateX: -105 }],

    width: 210,
    height: 21,

    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 17,

    textAlign: 'center',
    color: colors.text,
  },

  createAccountButton: {
    position: 'absolute',
    top: 26,
    left: 0,

    width: 326,
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

  loginSection: {
    position: 'absolute',
    top: 738,
    left: '50%',
    transform: [{ translateX: -163 }],

    width: 326,
    height: 74,
  },

  loginLabel: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: [{ translateX: -62 }],

    width: 124,
    height: 19,

    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 17,

    textAlign: 'center',
    color: colors.text,
  },

  loginButton: {
    position: 'absolute',
    top: 24,
    left: 0,

    width: 326,
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

  pressed: {
    opacity: 0.8,
  },
});
