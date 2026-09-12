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
  TextInput,
  View,
} from 'react-native';

export default function NewPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  async function handleSavePassword() {
    if (!password) {
      Alert.alert(
        'Contraseña requerida',
        'Ingresá tu nueva contraseña.'
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Contraseña demasiado corta',
        'La contraseña debe tener al menos 6 caracteres.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Las contraseñas no coinciden',
        'Revisá las contraseñas e intentá nuevamente.'
      );
      return;
    }

    /*
     * BE-0004:
     *
     * await updatePassword(password);
     */

    Alert.alert(
      'Contraseña actualizada',
      'Tu contraseña fue modificada correctamente.',
      [
        {
          text: 'Aceptar',
          onPress: () => router.replace('/login'),
        },
      ]
    );
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
          <Text style={styles.logo}>
            TECNO RAEE
          </Text>

          <Text style={styles.description}>
            Creá una nueva contraseña para recuperar el
            acceso a tu cuenta.
          </Text>

          {/* Nueva contraseña */}
          <View style={styles.passwordField}>
            <Text style={styles.label}>
              Nueva Contraseña
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={25}
                color="#000000"
                style={styles.lockIcon}
              />

              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Ingresá tu nueva contraseña"
                placeholderTextColor="#000000"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
              />

              <Pressable
                style={styles.eyeButton}
                onPress={() =>
                  setShowPassword(value => !value)
                }
              >
                <Ionicons
                  name={
                    showPassword
                      ? 'eye-outline'
                      : 'eye-off-outline'
                  }
                  size={25}
                  color="#000000"
                />
              </Pressable>
            </View>
          </View>

          {/* Confirmación */}
          <View style={styles.confirmPasswordField}>
            <Text style={styles.label}>
              Confirmar Contraseña
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={25}
                color="#000000"
                style={styles.lockIcon}
              />

              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repetí tu nueva contraseña"
                placeholderTextColor="#000000"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                onSubmitEditing={handleSavePassword}
              />

              <Pressable
                style={styles.eyeButton}
                onPress={() =>
                  setShowConfirmPassword(
                    value => !value
                  )
                }
              >
                <Ionicons
                  name={
                    showConfirmPassword
                      ? 'eye-outline'
                      : 'eye-off-outline'
                  }
                  size={25}
                  color="#000000"
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.pressed,
            ]}
            onPress={handleSavePassword}
          >
            <Text style={styles.saveButtonText}>
              Guardar Contraseña
            </Text>
          </Pressable>
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

    color: '#17823B',
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

    backgroundColor: '#F7FAF8',

    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 10,
  },

  lockIcon: {
    marginLeft: 10,
    marginRight: 10,
  },

  passwordInput: {
    flex: 1,
    height: '100%',

    paddingVertical: 0,

    fontFamily: 'Inter',
    fontSize: 14,

    color: '#000000',
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

    backgroundColor: '#17823B',
    borderRadius: 12,
  },

  saveButtonText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 17,

    color: '#FFFFFF',
  },

  pressed: {
    opacity: 0.75,
  },
});