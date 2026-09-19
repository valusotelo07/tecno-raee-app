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
  TextInput,
  View,
} from 'react-native';

import { login } from '@/services/auth.service';

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
            <Text style={styles.label}>Correo Electrónico</Text>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={25} color="#000000" style={styles.inputIcon} />

              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Ingresá tu correo"
                placeholderTextColor="#000000"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                editable={!loading}
              />
            </View>
          </View>

          {/* Contraseña */}
          <View style={styles.passwordField}>
            <Text style={styles.label}>Contraseña</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={25}
                color="#000000"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Ingresá tu contraseña"
                placeholderTextColor="#000000"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                editable={!loading}
                onSubmitEditing={handleLogin}
              />
            </View>
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
              <ActivityIndicator color="#FFFFFF" />
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
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },

  screen: {
    position: 'relative',
    width: '100%',
    maxWidth: 390,
    minHeight: 844,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
  },

  logo: {
    position: 'absolute',
    left: 84,
    top: 107,

    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 39,

    color: '#17823B',
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

    color: '#17823B',
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

  label: {
    height: 24,

    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 17,

    color: '#000000',
  },

  inputContainer: {
    height: 52,
    width: 326,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 10,
  },

  inputIcon: {
    marginLeft: 11,
    marginRight: 10,
  },

  input: {
    flex: 1,
    height: '100%',

    paddingVertical: 0,
    paddingRight: 14,

    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,

    color: '#000000',
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

    color: '#000000',
  },

  loginButton: {
    position: 'absolute',
    width: 326,
    height: 50,
    left: 32,
    top: 457,

    backgroundColor: '#17823B',
    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',
  },

  loginButtonText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 17,

    color: '#FFFFFF',
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

    color: '#000000',
  },

  createAccountButton: {
    position: 'absolute',
    left: 0,
    bottom: 0,

    width: 326,
    height: 50,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#17823B',
    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',
  },

  createAccountButtonText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 17,

    color: '#17823B',
  },

  pressed: {
    opacity: 0.75,
  },

  disabled: {
    opacity: 0.6,
  },
});
