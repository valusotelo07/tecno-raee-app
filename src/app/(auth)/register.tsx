import { Ionicons } from '@expo/vector-icons';
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
import { colors } from '@/theme';
import { register } from '@/services/auth.service';

export default function CreateAccountScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Ingresá tu nombre.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Correo requerido', 'Ingresá tu correo electrónico.');
      return;
    }

    if (!password) {
      Alert.alert('Contraseña requerida', 'Ingresá una contraseña.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Contraseña demasiado corta', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Las contraseñas no coinciden', 'Revisá las contraseñas e intentá nuevamente.');
      return;
    }

    try {
      setLoading(true);

      await register(name, email, password);

      router.replace('/home');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos crear la cuenta.';

      Alert.alert('Error al crear la cuenta', message);
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

          <Text style={styles.subtitle}>Comenzá a reciclar</Text>

          {/* Nombre */}
          <View style={styles.nameField}>
            <AuthTextField
              label="Nombre"
              iconName="person-outline"
              value={name}
              onChangeText={setName}
              placeholder="Ingresá tu nombre"
              autoCapitalize="words"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

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
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              editable={!loading}
              trailing={
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword((value) => !value)}
                  disabled={loading}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={25}
                    color={colors.text}
                  />
                </Pressable>
              }
            />
          </View>

          {/* Confirmar contraseña */}
          <View style={styles.confirmPasswordField}>
            <AuthTextField
              label="Confirmar Contraseña"
              iconName="lock-closed-outline"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repetí tu contraseña"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              editable={!loading}
              onSubmitEditing={handleRegister}
              trailing={
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword((value) => !value)}
                  disabled={loading}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={25}
                    color={colors.text}
                  />
                </Pressable>
              }
            />
          </View>

          {/* Crear cuenta */}
          <Pressable
            style={({ pressed }) => [
              styles.createButton,
              pressed && styles.pressed,
              loading && styles.disabled,
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.textOnPrimary} />
            ) : (
              <Text style={styles.createButtonText}>Crear cuenta</Text>
            )}
          </Pressable>

          {/* Login */}
          <View style={styles.loginSection}>
            <Text style={styles.loginLabel}>¿Ya tenés cuenta?</Text>

            <Pressable
              style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}
              onPress={() => router.replace('/login')}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
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
    top: 158,

    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 19,
    textAlign: 'center',

    color: colors.primary,
  },

  nameField: {
    position: 'absolute',
    width: 330,
    height: 76,
    left: 30,
    top: 233,
  },

  emailField: {
    position: 'absolute',
    width: 330,
    height: 76,
    left: 30,
    top: 332,
  },

  passwordField: {
    position: 'absolute',
    width: 330,
    height: 76,
    left: 30,
    top: 431,
  },

  confirmPasswordField: {
    position: 'absolute',
    width: 330,
    height: 76,
    left: 30,
    top: 534,
  },

  eyeButton: {
    width: 45,
    height: '100%',

    alignItems: 'center',
    justifyContent: 'center',
  },

  createButton: {
    position: 'absolute',
    width: 326,
    height: 50,
    left: 32,
    top: 629,

    backgroundColor: colors.primary,
    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',
  },

  createButtonText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 17,

    color: colors.textOnPrimary,
  },

  loginSection: {
    position: 'absolute',
    width: 326,
    height: 74,
    left: 32,
    top: 741,
  },

  loginLabel: {
    width: '100%',
    height: 24,

    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',

    color: colors.text,
  },

  loginButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,

    width: 326,
    height: 50,

    backgroundColor: colors.surface,

    borderWidth: 1,
    borderColor: colors.borderPrimary,
    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',
  },

  loginButtonText: {
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
