import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';

type PlaceholderScreenProps = {
  title: string;
};

export function PlaceholderScreen({ title }: Readonly<PlaceholderScreenProps>) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  title: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '600',
    color: colors.primary,
  },
});
