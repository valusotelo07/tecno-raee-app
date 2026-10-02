import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QuickAccess } from '@/components/home/QuickAccess';
import { ActionButton } from '@/components/ui/ActionButton';
import { PortalLink } from '@/components/portal/PortalUI';
import { PointsMap } from '@/components/discovery/PointsMap';
import { PointRow } from '@/components/discovery/PointRow';
import { SearchBar } from '@/components/discovery/SearchBar';
import { DiscoveryState } from '@/components/discovery/DiscoveryState';
import { filterGreenPoints, type GreenPoint } from '@/models/GreenPoint';
import { useAuth } from '@/providers/AuthProvider';
import { useDiscovery } from '@/providers/DiscoveryProvider';
import { colors, fonts } from '@/theme';

export default function HomeScreen() {
  const { profile } = useAuth();
  const {
    points,
    loading,
    error,
    refresh,
    location,
    locating,
    locationError,
    requestLocation,
    now,
  } = useDiscovery();
  const [search, setSearch] = useState('');
  const sorted = useMemo(() => filterGreenPoints(points, {}, location), [points, location]);
  const openPoint = useCallback(
    (point: GreenPoint) => router.push({ pathname: '/point/[id]', params: { id: point.id } }),
    []
  );
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.brand}>TecnoRAEE</Text>
        <View style={styles.intro}>
          <Text style={styles.greeting}>
            Hola, {profile?.fullName.split(' ')[0] || 'visitante'}
          </Text>
          <Text style={styles.description}>Encontrá dónde llevar tu tecnología en desuso.</Text>
        </View>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          onSubmit={() => router.push({ pathname: '/green-points', params: { q: search } })}
        />
        <Text style={styles.sectionTitle}>Puntos verdes</Text>
        {loading || error ? (
          <DiscoveryState loading={loading} error={error} retry={refresh} />
        ) : (
          <>
            <PointsMap points={sorted} location={location} preview onSelect={openPoint} />
            {sorted.length === 0 ? (
              <DiscoveryState
                loading={false}
                error={null}
                retry={refresh}
                empty="Todavía no hay puntos verdes publicados. Podés consultar qué dispositivos recibimos."
              />
            ) : (
              <>
                <Text style={styles.nearest}>
                  {location ? 'El más cercano a vos' : 'Explorá un punto verde'}
                </Text>
                <PointRow
                  point={sorted[0]}
                  location={location}
                  now={now}
                  onPress={() => openPoint(sorted[0])}
                />
              </>
            )}
            {!location && (
              <ActionButton
                title="Usar mi ubicación"
                secondary
                loading={locating}
                onPress={() => void requestLocation()}
              />
            )}
            {locationError && (
              <Text accessibilityRole="alert" style={styles.description}>
                {locationError}
              </Text>
            )}
            <ActionButton
              title="Ver todos los puntos"
              secondary
              onPress={() => router.push('/green-points')}
            />
          </>
        )}
        <Text style={styles.sectionTitle}>Accesos rápidos</Text>
        <View style={styles.quickGrid}>
          <QuickAccess
            title={'Qué\nrecibimos'}
            icon={<Ionicons name="hardware-chip-outline" size={26} color={colors.text} />}
            onPress={() => router.push('/device-categories')}
          />
          <QuickAccess
            title={'Registrar\nentrega'}
            icon={<Ionicons name="clipboard-outline" size={26} color={colors.text} />}
            onPress={() => router.push('/new-delivery')}
          />
          <QuickAccess
            title={'Solicitar\nretiro'}
            icon={<MaterialCommunityIcons name="truck-outline" size={26} color={colors.text} />}
            onPress={() => router.push('/my-raee')}
          />
          <QuickAccess
            title="Recompensas"
            icon={<Ionicons name="star-outline" size={26} color={colors.text} />}
            onPress={() => router.push('/rewards')}
          />
        </View>
        <PortalLink
          title="Registrar una organización"
          onPress={() => router.push('/company-application')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: 24,
    gap: 16,
    paddingBottom: 32,
  },
  brand: { fontFamily: fonts.bold, color: colors.primary, fontSize: 22 },
  intro: { gap: 8, paddingVertical: 8 },
  greeting: { fontFamily: fonts.bold, fontSize: 28, color: colors.text },
  description: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.brandDark },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: 19, color: colors.text },
  nearest: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.primary, marginTop: 4 },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 20,
  },
});
