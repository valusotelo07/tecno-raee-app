import { router } from 'expo-router';
import { useRef, useState } from 'react';
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

import { AuthTextField } from '@/components/auth/AuthTextField';
import { sendRecoveryCode, verifyRecoveryCode } from '@/services/auth.service';
import { colors, fonts } from '@/theme';

const OTP_LENGTH = 6;
const OTP_SLOTS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'] as const;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const codeInputRef = useRef<TextInput>(null);

  async function handleSendCode() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      Alert.alert('Correo requerido', 'Ingresá el correo asociado a tu cuenta.');
      return;
    }

    try {
      await sendRecoveryCode(normalizedEmail);

      setCodeSent(true);

      Alert.alert('Código enviado', 'Revisá tu correo electrónico.');

      codeInputRef.current?.focus();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos enviar el código.';

      Alert.alert('Error al enviar el código', message);
    }
  }

  async function handleResendCode() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      Alert.alert('Correo requerido', 'Ingresá primero tu correo electrónico.');
      return;
    }

    try {
      await sendRecoveryCode(normalizedEmail);

      setCode('');

      Alert.alert('Código reenviado', 'Te enviamos un nuevo código.');

      codeInputRef.current?.focus();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos reenviar el código.';

      Alert.alert('Error', message);
    }
  }

  async function handleVerifyCode() {
    if (!codeSent) {
      Alert.alert('Código no enviado', 'Primero solicitá un código de recuperación.');
      return;
    }

    if (code.length !== 6) {
      Alert.alert('Código incompleto', 'Ingresá los 6 dígitos del código.');
      return;
    }

    try {
      await verifyRecoveryCode(email, code);
      router.push('/new-password');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'El código ingresado no es válido.';

      Alert.alert('Código incorrecto', message);
    }
  }

  function handleCodeChange(value: string) {
    const onlyNumbers = value.replace(/\D/g, '').slice(0, OTP_LENGTH);

    setCode(onlyNumbers);
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

          <Text style={styles.subtitle}>Recuperá tu Contraseña</Text>

          <Text style={styles.description}>
            Ingresá el correo asociado a tu cuenta.{'\n'}
            Te enviaremos un código para recuperarla.
          </Text>

          {/* Correo */}
          <View style={styles.emailContainer}>
            <AuthTextField
              iconName="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="Ingresá tu correo"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              trailing={
                <Pressable
                  style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]}
                  onPress={handleSendCode}
                >
                  <Text style={styles.sendButtonText}>Enviar</Text>
                </Pressable>
              }
            />
          </View>

          <Text style={styles.codeDescription}>Ingresá el código que enviamos a tu correo.</Text>

          {/* OTP */}
          <Pressable style={styles.otpContainer} onPress={() => codeInputRef.current?.focus()}>
            {OTP_SLOTS.map((slot, index) => {
              const digit = code[index] ?? '';
              const focused = index === code.length && code.length < OTP_LENGTH;

              return (
                <View key={slot} style={[styles.otpBox, focused && styles.otpBoxFocused]}>
                  <Text style={styles.otpDigit}>{digit}</Text>
                </View>
              );
            })}

            <TextInput
              ref={codeInputRef}
              style={styles.hiddenOtpInput}
              value={code}
              onChangeText={handleCodeChange}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              caretHidden
            />
          </Pressable>

          <Text style={styles.didNotReceive}>¿No recibiste el código?</Text>

          <Pressable style={styles.resendButton} onPress={handleResendCode}>
            <Text style={styles.resendText}>Reenviar código</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.verifyButton, pressed && styles.pressed]}
            onPress={handleVerifyCode}
          >
            <Text style={styles.verifyButtonText}>Verificar Código</Text>
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

    fontFamily: fonts.bold,
    fontSize: 32,
    lineHeight: 39,
    fontWeight: '700',

    color: colors.primary,
  },

  subtitle: {
    position: 'absolute',
    width: 197,
    left: 102,
    top: 158,

    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '400',
    textAlign: 'center',

    color: colors.primary,
  },

  description: {
    position: 'absolute',
    width: 315,
    left: 29,
    top: 271,

    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '400',
    textAlign: 'center',

    color: colors.text,
  },

  emailContainer: {
    position: 'absolute',

    left: 32,
    top: 326,

    width: 326,
  },

  sendButton: {
    width: 70,
    height: 36,

    marginRight: 13,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 8,
    backgroundColor: colors.primary,
  },

  sendButtonText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    fontWeight: '400',

    color: colors.textOnPrimary,
  },

  codeDescription: {
    position: 'absolute',

    left: 32,
    top: 413,

    width: 289,

    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',

    color: colors.text,
  },

  otpContainer: {
    position: 'absolute',

    left: 29,
    top: 439,

    width: 332,
    height: 52,

    flexDirection: 'row',
    gap: 4,
  },

  otpBox: {
    width: 52,
    height: 52,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: colors.background,

    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },

  otpBoxFocused: {
    borderColor: colors.primary,
  },

  otpDigit: {
    fontFamily: fonts.regular,
    fontSize: 18,
    fontWeight: '500',

    color: colors.text,
  },

  hiddenOtpInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
  },

  didNotReceive: {
    position: 'absolute',

    left: 28,
    top: 505,

    width: 159,

    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 17,

    color: colors.text,
  },

  resendButton: {
    position: 'absolute',

    left: 204,
    top: 490,

    width: 98,
    height: 48,

    justifyContent: 'center',
  },

  resendText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '700',
    textAlign: 'center',

    color: colors.text,
  },

  verifyButton: {
    position: 'absolute',

    left: 32,
    top: 552,

    width: 326,
    height: 50,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: colors.primary,
    borderRadius: 12,
  },

  verifyButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '600',

    color: colors.textOnPrimary,
  },

  pressed: {
    opacity: 0.75,
  },
});
