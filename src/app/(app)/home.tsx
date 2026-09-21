import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { QuickAccess } from '@/components/home/QuickAccess';
import { useAuth } from '@/providers/AuthProvider';
import { colors } from '@/theme';

export default function HomeScreen() {
  const { profile } = useAuth();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.logo}>TECNO RAEE</Text>

      <Text style={styles.greeting}>Hola {profile?.fullName ?? 'usuario'},</Text>

      <Text style={styles.question}>¿Qué querés hacer hoy?</Text>

      {/* Punto verde más cercano */}
      <Pressable
        style={({ pressed }) => [styles.nearestPoint, pressed && styles.pressed]}
        // onPress={() => router.push('/green-points')}
      >
        <Ionicons name="location-outline" size={30} color={colors.primary} />

        <View style={styles.nearestPointText}>
          <Text style={styles.nearestTitle}>Punto verde más cercano:</Text>

          <Text style={styles.nearestName}>Ejemplo de lugar cercano</Text>
        </View>

        <Ionicons name="arrow-forward" size={28} color={colors.text} />
      </Pressable>

      <Text style={styles.quickTitle}>Accesos rápidos</Text>

      <View style={styles.quickGrid}>
        <QuickAccess
          title={'Qué\nrecibimos'}
          icon={<Ionicons name="hardware-chip-outline" size={26} color={colors.text} />}
          onPress={() => {}}
        />

        <QuickAccess
          title={'Puntos\nVerdes'}
          icon={<Ionicons name="location-outline" size={27} color={colors.text} />}
          onPress={() => {}}
        />

        <QuickAccess
          title={'Registrar\nEntrega'}
          icon={<Ionicons name="clipboard-outline" size={27} color={colors.text} />}
          onPress={() => {}}
        />

        <QuickAccess
          title={'Solicitar\nRetiro'}
          icon={<MaterialCommunityIcons name="truck-outline" size={27} color={colors.text} />}
          onPress={() => {}}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 390,
    alignSelf: 'center',
    paddingBottom: 24,
  },

  logo: {
    marginTop: 54,

    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',

    color: colors.primary,
  },

  pressed: {
    opacity: 0.65,
  },

  greeting: {
    marginTop: 58,
    marginHorizontal: 32,

    fontFamily: 'Inter',
    fontSize: 30,
    fontWeight: '700',

    color: colors.primary,
  },

  question: {
    marginTop: 6,
    marginHorizontal: 32,

    fontFamily: 'Inter',
    fontSize: 16,

    color: colors.primary,
  },

  nearestPoint: {
    height: 65,

    marginTop: 32,
    marginHorizontal: 22,

    paddingHorizontal: 14,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: colors.background,

    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
  },

  nearestPointText: {
    flex: 1,
    marginLeft: 13,
  },

  nearestTitle: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '500',

    color: colors.text,
  },

  nearestName: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '500',

    color: colors.text,
  },

  quickTitle: {
    marginTop: 38,
    marginLeft: 18,

    fontFamily: 'Inter',
    fontSize: 18,

    color: colors.text,
  },

  quickGrid: {
    marginTop: 16,
    marginHorizontal: 17,

    flexDirection: 'row',
    flexWrap: 'wrap',

    justifyContent: 'space-between',

    rowGap: 42,
  },
});
