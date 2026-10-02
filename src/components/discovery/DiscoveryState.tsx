import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ActionButton } from '@/components/ui/ActionButton';
import { colors, fonts } from '@/theme';
export function DiscoveryState({
  loading,
  error,
  empty,
  retry,
}: Readonly<{ loading: boolean; error: string | null; empty?: string; retry: () => void }>) {
  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator accessibilityLabel="Cargando puntos verdes" color={colors.primary} />
      ) : (
        <>
          <Text style={styles.text}>{error ?? empty}</Text>
          {error && <ActionButton title="Reintentar" secondary onPress={retry} />}
        </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { paddingVertical: 24, gap: 16 },
  text: { color: colors.brandDark, fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
});
