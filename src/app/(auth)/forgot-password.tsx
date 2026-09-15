import { Ionicons } from '@expo/vector-icons';
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

const OTP_LENGTH = 6;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const codeInputRef = useRef<TextInput>(null);

  async function handleSendCode() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      Alert.alert(
        'Correo requerido',
        'Ingresá el correo asociado a tu cuenta.'
      );
      return;
    }

    if (!normalizedEmail.includes('@')) {
      Alert.alert(
        'Correo inválido',
        'Ingresá un correo electrónico válido.'
      );
      return;
    }

    /*
     * BE-0004:
     *
     * await sendRecoveryCode(normalizedEmail);
     */

    setCodeSent(true);

    codeInputRef.current?.focus();
  }

  async function handleResendCode() {
    if (!email.trim()) {
      Alert.alert(
        'Correo requerido',
        'Ingresá primero tu correo electrónico.'
      );
      return;
    }

    /*
     * BE-0004:
     *
     * await sendRecoveryCode(email);
     */

    setCode('');
    setCodeSent(true);

    codeInputRef.current?.focus();
  }

  async function handleVerifyCode() {
    if (!codeSent) {
      Alert.alert(
        'Código no enviado',
        'Primero solicitá un código de recuperación.'
      );
      return;
    }

    if (code.length !== OTP_LENGTH) {
      Alert.alert(
        'Código incompleto',
        'Ingresá los 6 dígitos del código.'
      );
      return;
    }

    /*
     * BE-0004:
     *
     * await verifyRecoveryCode(email, code);
     */

    router.push('/new-password');
  }

  function handleCodeChange(value: string) {
    const onlyNumbers = value
      .replace(/\D/g, '')
      .slice(0, OTP_LENGTH);

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
          <Text style={styles.logo}>
            TECNO RAEE
          </Text>

          <Text style={styles.subtitle}>
            Recuperá tu Contraseña
          </Text>

          <Text style={styles.description}>
            Ingresá el correo asociado a tu cuenta.{'\n'}
            Te enviaremos un código para recuperarla.
          </Text>

          {/* Correo */}
          <View style={styles.emailContainer}>
            <Ionicons
              name="mail-outline"
              size={25}
              color="#000000"
              style={styles.mailIcon}
            />

            <TextInput
              style={styles.emailInput}
              value={email}
              onChangeText={setEmail}
              placeholder="Ingresá tu correo"
              placeholderTextColor="#000000"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />

            <Pressable
              style={({ pressed }) => [
                styles.sendButton,
                pressed && styles.pressed,
              ]}
              onPress={handleSendCode}
            >
              <Text style={styles.sendButtonText}>
                Enviar
              </Text>
            </Pressable>
          </View>

          <Text style={styles.codeDescription}>
            Ingresá el código que enviamos a tu correo.
          </Text>

          {/* OTP */}
          <Pressable
            style={styles.otpContainer}
            onPress={() => codeInputRef.current?.focus()}
          >
            {Array.from({ length: OTP_LENGTH }).map(
              (_, index) => {
                const digit = code[index] ?? '';

                const focused =
                  index === code.length &&
                  code.length < OTP_LENGTH;

                return (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      focused && styles.otpBoxFocused,
                    ]}
                  >
                    <Text style={styles.otpDigit}>
                      {digit}
                    </Text>
                  </View>
                );
              }
            )}

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

          <Text style={styles.didNotReceive}>
            ¿No recibiste el código?
          </Text>

          <Pressable
            style={styles.resendButton}
            onPress={handleResendCode}
          >
            <Text style={styles.resendText}>
              Reenviar código
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.verifyButton,
              pressed && styles.pressed,
            ]}
            onPress={handleVerifyCode}
          >
            <Text style={styles.verifyButtonText}>
              Verificar Código
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
    fontSize: 32,
    lineHeight: 39,
    fontWeight: '700',

    color: '#17823B',
  },

  subtitle: {
    position: 'absolute',
    width: 197,
    left: 102,
    top: 158,

    fontFamily: 'Inter',
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '400',
    textAlign: 'center',

    color: '#17823B',
  },

  description: {
    position: 'absolute',
    width: 315,
    left: 29,
    top: 271,

    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '400',
    textAlign: 'center',

    color: '#000000',
  },

  emailContainer: {
    position: 'absolute',

    left: 32,
    top: 326,

    width: 326,
    height: 52,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#F7FAF8',

    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 10,
  },

  mailIcon: {
    marginLeft: 14,
  },

  emailInput: {
    flex: 1,
    height: '100%',

    paddingHorizontal: 10,
    paddingVertical: 0,

    fontFamily: 'Inter',
    fontSize: 14,

    color: '#000000',
  },

  sendButton: {
    width: 70,
    height: 36,

    marginRight: 13,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 8,
    backgroundColor: '#17823B',
  },

  sendButtonText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400',

    color: '#FFFFFF',
  },

  codeDescription: {
    position: 'absolute',

    left: 32,
    top: 413,

    width: 289,

    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',

    color: '#000000',
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

    backgroundColor: '#F7FAF8',

    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 10,
  },

  otpBoxFocused: {
    borderColor: '#17823B',
  },

  otpDigit: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '500',

    color: '#000000',
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

    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 17,

    color: '#000000',
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
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '700',
    textAlign: 'center',

    color: '#000000',
  },

  verifyButton: {
    position: 'absolute',

    left: 32,
    top: 552,

    width: 326,
    height: 50,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#17823B',
    borderRadius: 12,
  },

  verifyButtonText: {
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '600',

    color: '#FFFFFF',
  },

  pressed: {
    opacity: 0.75,
  },
});