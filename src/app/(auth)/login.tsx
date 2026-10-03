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
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, padding: 24, paddingBottom: 32 },
  screen: { width: '100%', maxWidth: 420, alignSelf: 'center', gap: 18 },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.6 },
  error: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.danger },

  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  emailField: { width: '100%' },
  passwordField: { width: '100%' },
  forgotPassword: { minHeight: 44, alignSelf: 'flex-end', justifyContent: 'center' },
  forgotPasswordText: { fontFamily: fonts.regular, fontSize: 14, color: colors.primaryDark },
  loginButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  loginButtonText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textOnPrimary },
  feedback: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  createAccountSection: { gap: 12, marginTop: 24 },
  createAccountLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: 'center',
    color: colors.text,
  },
  createAccountButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    backgroundColor: colors.surface,
  },
  createAccountButtonText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.primaryDark },
});
