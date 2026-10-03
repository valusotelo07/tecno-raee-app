import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
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
import { colors, fonts } from '@/theme';
import { brand } from '@/config/brand';
import { authRoute, parseAuthIntent } from '@/models/AuthFlow';
import { useAuth } from '@/providers/AuthProvider';

export default function LoginScreen() {
  const params = useLocalSearchParams<{ intent?: string; confirm?: string }>();
  const intent = parseAuthIntent(params.intent);
  const { prepareAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (loading) return;
    setError(null);
    if (!email.trim() || !password) {
      setError('Ingresá tu correo y contraseña.');
      return;
    }

    try {
      setLoading(true);
      prepareAuth(intent);

      await login(email, password);

      router.replace('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos iniciar sesión.';

      prepareAuth(null);
      setError(message);
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
          <Text style={styles.logo}>{brand.authName}</Text>

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
            accessibilityRole="button"
            style={styles.forgotPassword}
            onPress={() => router.push('/forgot-password')}
            disabled={loading}
          >
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </Pressable>

          {/* Iniciar sesión */}
          <Pressable
            accessibilityRole="button"
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

          {(error || params.confirm === '1') && (
            <Text
              accessibilityRole={error ? 'alert' : undefined}
              accessibilityLiveRegion="polite"
              style={[styles.feedback, error && styles.error]}
            >
              {error ||
                'Revisá tu correo y confirmá la cuenta. Después iniciá sesión para continuar.'}
            </Text>
          )}

          {/* Crear cuenta */}
          <View style={styles.createAccountSection}>
            <Text style={styles.createAccountLabel}>¿Todavía no tenés una cuenta?</Text>

            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.createAccountButton, pressed && styles.pressed]}
              onPress={() => router.push(authRoute('/register', intent))}
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
  feedback: {
    position: 'absolute',
    top: 530,
    left: 30,
    width: 330,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  },
  error: { color: colors.danger },
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

    fontFamily: fonts.bold,
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

    fontFamily: fonts.regular,
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
    fontFamily: fonts.regular,
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
    fontFamily: fonts.semiBold,
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

    fontFamily: fonts.regular,
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
    fontFamily: fonts.semiBold,
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
