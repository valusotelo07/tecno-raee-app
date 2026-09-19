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

      await register(email, password);

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
            <Text style={styles.label}>Nombre</Text>

            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={25} color="#000000" style={styles.inputIcon} />

              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ingresá tu nombre"
                placeholderTextColor="#000000"
                autoCapitalize="words"
                autoCorrect={false}
                editable={!loading}
              />
            </View>
          </View>

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
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Ingresá tu contraseña"
                placeholderTextColor="#000000"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                editable={!loading}
              />

              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowPassword((value) => !value)}
                disabled={loading}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={25}
                  color="#000000"
                />
              </Pressable>
            </View>
          </View>

          {/* Confirmar contraseña */}
          <View style={styles.confirmPasswordField}>
            <Text style={styles.label}>Confirmar Contraseña</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={25}
                color="#000000"
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repetí tu contraseña"
                placeholderTextColor="#000000"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                editable={!loading}
                onSubmitEditing={handleRegister}
              />

              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword((value) => !value)}
                disabled={loading}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={25}
                  color="#000000"
                />
              </Pressable>
            </View>
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
              <ActivityIndicator color="#FFFFFF" />
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
    top: 158,

    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 19,
    textAlign: 'center',

    color: '#17823B',
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

  label: {
    height: 24,

    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 17,

    color: '#000000',
  },

  inputContainer: {
    width: 326,
    height: 52,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 10,
  },

  inputIcon: {
    marginLeft: 14,
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

  passwordInput: {
    flex: 1,
    height: '100%',

    paddingVertical: 0,

    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,

    color: '#000000',
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

    backgroundColor: '#17823B',
    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',
  },

  createButtonText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 17,

    color: '#FFFFFF',
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

    color: '#000000',
  },

  loginButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,

    width: 326,
    height: 50,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#17823B',
    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',
  },

  loginButtonText: {
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
