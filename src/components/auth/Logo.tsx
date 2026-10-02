import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';

type Props = {
  variant?: 'dark' | 'light';
  compact?: boolean;
};

export function Logo({ variant = 'dark', compact = false }: Readonly<Props>) {
  const light = variant === 'light';

  return (
    <View style={styles.container}>
      {!compact && <MaterialCommunityIcons name="recycle" size={34} color={colors.accent} />}

      <Text style={[styles.text, light && styles.textLight, compact && styles.compact]}>
        Tecno<Text style={[styles.green, compact && { color: colors.primary }]}>RAEE</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  text: {
    fontSize: 25,
    fontWeight: '800',
    color: colors.brandDark,
  },

  textLight: {
    color: colors.textOnPrimary,
  },

  green: {
    color: colors.accent,
  },
  compact: {
    fontFamily: fonts.bold,
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
});
