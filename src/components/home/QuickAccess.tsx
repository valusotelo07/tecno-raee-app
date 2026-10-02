import { colors } from '@/theme';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type QuickAccessProps = {
  title: string;
  icon: ReactNode;
  onPress: () => void;
};

export function QuickAccess({ title, icon, onPress }: Readonly<QuickAccessProps>) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.quickAccess, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.quickIcon}>{icon}</View>

      <Text style={styles.quickText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  quickAccess: {
    width: '48%',
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
  },

  quickIcon: {
    width: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickText: {
    flex: 1,
    marginLeft: 14,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    color: colors.text,
  },

  pressed: {
    opacity: 0.65,
  },
});
