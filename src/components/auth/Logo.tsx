import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  variant?: 'dark' | 'light';
};

export function Logo({ variant = 'dark' }: Readonly<Props>) {
  const light = variant === 'light';

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="recycle" size={34} color="#50B43C" />

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
    color: '#10282C',
  },

  textLight: {
    color: '#FFFFFF',
  },

  green: {
    color: '#50B43C',
  },
});
