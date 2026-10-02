import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '@/components/ui/ActionButton';
import { AccountRequired } from '@/components/auth/AccountRequired';
import { DiscoveryState } from '@/components/discovery/DiscoveryState';
import { PointsMap } from '@/components/discovery/PointsMap';
import {
  distanceKm,
  formatDistance,
  formatScheduleMinute,
  openingStatus,
  weekdayNames,
} from '@/models/GreenPoint';
import { useAuth } from '@/providers/AuthProvider';
import { useDiscovery } from '@/providers/DiscoveryProvider';
import { colors, fonts } from '@/theme';

export default function PointDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { guest } = useAuth();
  const { points, loading, error, refresh, location, now } = useDiscovery();
  const [needsAccount, setNeedsAccount] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const point = points.find((p) => p.id === id);
  const mapPoints = useMemo(() => (point ? [point] : []), [point]);
  const noSelect = useCallback(() => {}, []);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/green-points'));
  const openLink = async (url: string) => {
    setLinkError(null);
    try {
      await Linking.openURL(url);
    } catch {
      setLinkError(
        'No pudimos abrir el enlace. Podés copiar la dirección o el teléfono de esta pantalla.'
      );
    }
  };
  if (needsAccount)
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AccountRequired title="Registrá tu entrega" />
        <View style={{ padding: 24 }}>
          <ActionButton title="Volver al punto" secondary onPress={() => setNeedsAccount(false)} />
        </View>
      </SafeAreaView>
    );
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ActionButton title="Volver" secondary onPress={back} />
        {loading || error ? (
          <DiscoveryState loading={loading} error={error} retry={refresh} />
        ) : !point ? (
          <>
            <Text style={styles.title}>Punto no disponible</Text>
            <Text style={styles.text}>El punto no existe o ya no está publicado.</Text>
            <ActionButton
              title="Explorar otros puntos"
              onPress={() => router.replace('/green-points')}
            />
          </>
        ) : (
          <>
            <View style={styles.heading}>
              <Text style={styles.title}>{point.name}</Text>
              <Text style={styles.company}>{point.companyName}</Text>
            </View>
            <Text selectable style={styles.text}>
              {point.address}
            </Text>
            {location && (
              <Text style={styles.text}>
                A {formatDistance(distanceKm(location, point))} en línea recta
              </Text>
            )}
            <Text style={styles.status}>
              {openingStatus(point, now) === 'open'
                ? 'Abierto ahora'
                : openingStatus(point, now) === 'closed'
                  ? 'Cerrado ahora'
                  : 'Horario sin informar'}
            </Text>
            <PointsMap points={mapPoints} preview onSelect={noSelect} />
            <ActionButton
              title="Cómo llegar"
              onPress={() =>
                void openLink(
                  `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`
                )
              }
            />
            {point.description && <Text style={styles.text}>{point.description}</Text>}
            <Text style={styles.sectionTitle}>Qué recibe este punto</Text>
            {point.categories.length ? (
              point.categories.map((c) => (
                <Text style={styles.text} key={c.id}>
                  {c.name}
                </Text>
              ))
            ) : (
              <Text style={styles.text}>
                El punto todavía no informó sus categorías. Consultá antes de acercarte.
              </Text>
            )}
            <Text style={styles.sectionTitle}>Horarios</Text>
            <Text style={styles.caption}>Hora local del punto · {point.timeZone}</Text>
            {point.schedules.length ? (
              weekdayNames.map((day, index) => {
                const intervals = point.schedules.filter((s) => s.weekday === index + 1);
                return (
                  <View key={day} style={styles.schedule}>
                    <Text style={styles.day}>{day}</Text>
                    <Text style={styles.hours}>
                      {intervals.length
                        ? intervals
                            .map(
                              (s) =>
                                `${formatScheduleMinute(s.opensMinute)} – ${formatScheduleMinute(s.closesMinute)}`
                            )
                            .join('\n')
                        : 'Cerrado'}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.text}>Horarios sin informar. Consultá antes de acercarte.</Text>
            )}
            {point.phone && (
              <>
                <Text style={styles.sectionTitle}>Contacto</Text>
                <Text selectable style={styles.text}>
                  {point.phone}
                </Text>
                <ActionButton
                  title="Llamar al punto"
                  secondary
                  onPress={() => void openLink(`tel:${point.phone!.replace(/[^+\d]/g, '')}`)}
                />
              </>
            )}
            {linkError && (
              <Text accessibilityRole="alert" style={styles.text}>
                {linkError}
              </Text>
            )}
            <Text style={styles.text}>
              {point.pickupEnabled
                ? 'Esta organización ofrece retiros desde este punto.'
                : 'Este punto recibe entregas presenciales.'}
            </Text>
            {guest ? (
              <ActionButton title="Registrar una entrega" onPress={() => setNeedsAccount(true)} />
            ) : (
              <ActionButton
                title="Registrar una entrega"
                onPress={() =>
                  router.push({ pathname: '/new-delivery', params: { pointId: point.id } })
                }
              />
            )}
          </>
        )}
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
    paddingBottom: 40,
  },
  heading: { gap: 8 },
  title: { fontFamily: fonts.bold, fontSize: 28, color: colors.primary },
  company: { fontFamily: fonts.semiBold, fontSize: 18, color: colors.text },
  text: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: colors.text },
  status: { fontFamily: fonts.semiBold, color: colors.primary, fontSize: 16 },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: 20, color: colors.text, marginTop: 8 },
  caption: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.brandDark },
  schedule: {
    flexDirection: 'row',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
  },
  day: { width: 100, fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  hours: { flex: 1, fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.text },
});
