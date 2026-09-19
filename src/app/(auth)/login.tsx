import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AuthTextField } from '@/components/auth/AuthTextField';
import { login } from '@/services/auth.service';
import { colors } from '@/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Datos incompletos', 'Ingresá tu correo y contraseña.');
      return;
    }

    try {
      setLoading(true);

      await login(email, password);

      router.replace('/home');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos iniciar sesión.';

      Alert.alert('Error al iniciar sesión', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.screen}>
          <Text style={styles.logo}>TECNO RAEE</Text>

          <Text style={styles.subtitle}>Accedé a tu cuenta</Text>

          {/* Correo */}
          <View style={styles.emailField}>
            <AuthTextField
              label="Correo Electrónico"
              iconName="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="Ingresá tu correo"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!loading}
            />
          </View>

          {/* Contraseña */}
          <View style={styles.passwordField}>
            <AuthTextField
              label="Contraseña"
              iconName="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              placeholder="Ingresá tu contraseña"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              editable={!loading}
              onSubmitEditing={handleLogin}
            />
          </View>

          {/* Olvidaste contraseña */}
          <Pressable
            style={styles.forgotPassword}
            onPress={() => router.push('/forgot-password')}
            disabled={loading}
          >
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </Pressable>

          {/* Iniciar sesión */}
          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.pressed,
              loading && styles.disabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.textOnPrimary} />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </Pressable>

          {/* Crear cuenta */}
          <View style={styles.createAccountSection}>
            <Text style={styles.createAccountLabel}>¿Todavía no tenés una cuenta?</Text>

            <Pressable
              style={({ pressed }) => [styles.createAccountButton, pressed && styles.pressed]}
              onPress={() => router.push('/register')}
              disabled={loading}
            >
              <Text style={styles.createAccountButtonText}>Crear Cuenta</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.surface,
  },

  screen: {
    position: 'relative',
    width: '100%',
    maxWidth: 390,
    minHeight: 844,
    alignSelf: 'center',
    backgroundColor: colors.surface,
  },

  logo: {
    position: 'absolute',
    left: 84,
    top: 107,

    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 39,

    color: colors.primary,
  },

  subtitle: {
    position: 'absolute',
    width: 197,
    left: 102,
    top: 162,

    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 19,
    textAlign: 'center',

    color: colors.primary,
  },

  emailField: {
    position: 'absolute',
    width: 330,
    height: 76,
    left: 30,
    top: 227,
  },

  passwordField: {
    position: 'absolute',
    width: 330,
    height: 76,
    left: 30,
    top: 326,
  },

  forgotPassword: {
    position: 'absolute',
    left: 38,
    top: 410,

    width: 182,
    height: 24,

    justifyContent: 'center',
  },

  forgotPasswordText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 17,

    color: colors.text,
  },

  loginButton: {
    position: 'absolute',
    width: 326,
    height: 50,
    left: 32,
    top: 457,

    backgroundColor: colors.primary,
    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',
  },

  loginButtonText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 17,

    color: colors.textOnPrimary,
  },

  createAccountSection: {
    position: 'absolute',
    width: 326,
    height: 80,
    left: 32,
    top: 709,
  },

  createAccountLabel: {
    width: '100%',
    height: 30,

    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',

    color: colors.text,
  },

  createAccountButton: {
    position: 'absolute',
    left: 0,
    bottom: 0,

    width: 326,
    height: 50,

    backgroundColor: colors.surface,

    borderWidth: 1,
    borderColor: colors.borderPrimary,
    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',
  },

  createAccountButtonText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 17,

    color: colors.primary,
  },

  pressed: {
    opacity: 0.75,
  },

  disabled: {
    opacity: 0.6,
  },
});
