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
    width: 165,
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 19,
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
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    color: colors.text,
  },

  pressed: {
    opacity: 0.65,
  },
});
