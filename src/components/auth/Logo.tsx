import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';

type Props = {
  variant?: 'dark' | 'light';
};

export function Logo({ variant = 'dark' }: Readonly<Props>) {
  const light = variant === 'light';

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="recycle" size={34} color={colors.accent} />

      <Text style={[styles.text, light && styles.textLight]}>
        Tecno<Text style={styles.green}>RAEE</Text>
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
});
