import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ActionButton } from '@/components/ui/ActionButton';
import { colors, fonts } from '@/theme';

export function AccountRequired({ title = 'Seguí tu impacto' }: Readonly<{ title?: string }>) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>
          Creá tu cuenta para registrar tus entregas, sumar puntos y seguir tu impacto.
        </Text>
        <ActionButton title="Crear cuenta" onPress={() => router.push('/register')} />
        <ActionButton title="Iniciar sesión" secondary onPress={() => router.push('/login')} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: colors.background, padding: 24 },
  content: { width: '100%', maxWidth: 420, alignSelf: 'center', gap: 16 },
  title: { fontFamily: fonts.bold, fontSize: 26, color: colors.primary },
  description: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: colors.text },
});
