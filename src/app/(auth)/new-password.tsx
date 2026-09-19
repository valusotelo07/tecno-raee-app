import { updateRecoveredPassword } from '@/services/auth.service';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
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

export default function NewPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSavePassword() {
    if (!password) {
      Alert.alert('Contraseña requerida', 'Ingresá tu nueva contraseña.');
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
      await updateRecoveredPassword(password);

      Alert.alert('Contraseña actualizada', 'Tu contraseña fue modificada correctamente.', [
        {
          text: 'Aceptar',
          onPress: () => router.replace('/login'),
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No pudimos actualizar la contraseña.';

      Alert.alert('Error al actualizar la contraseña', message);
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

          <Text style={styles.description}>
            Creá una nueva contraseña para recuperar el acceso a tu cuenta.
          </Text>

          {/* Nueva contraseña */}
          <View style={styles.passwordField}>
            <AuthTextField
              label="Nueva Contraseña"
              iconName="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              placeholder="Ingresá tu nueva contraseña"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              trailing={
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword((value) => !value)}
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

          {/* Confirmación */}
          <View style={styles.confirmPasswordField}>
            <AuthTextField
              label="Confirmar Contraseña"
              iconName="lock-closed-outline"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repetí tu nueva contraseña"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              onSubmitEditing={handleSavePassword}
              trailing={
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword((value) => !value)}
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

          <Pressable
            style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
            onPress={handleSavePassword}
          >
            <Text style={styles.saveButtonText}>Guardar Contraseña</Text>
          </Pressable>
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

  description: {
    position: 'absolute',

    left: 19,
    top: 171,

    width: 337,

    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 19,
    textAlign: 'center',

    color: colors.primary,
  },

  passwordField: {
    position: 'absolute',

    left: 31,
    top: 298,

    width: 330,
    height: 76,
  },

  confirmPasswordField: {
    position: 'absolute',

    left: 31,
    top: 413,

    width: 330,
    height: 76,
  },

  eyeButton: {
    width: 45,
    height: '100%',

    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButton: {
    position: 'absolute',

    left: 31,
    top: 552,

    width: 326,
    height: 50,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: colors.primary,
    borderRadius: 12,
  },

  saveButtonText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 17,

    color: colors.textOnPrimary,
  },

  pressed: {
    opacity: 0.75,
  },
});
