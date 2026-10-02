import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { PortalLoading, portalStyles as s } from '@/components/portal/PortalUI';
import { usePortalData } from '@/hooks/usePortalData';
import { getDeliveryBalance } from '@/services/delivery.service';

export function DeliveryBalance() {
  const { data, loading, error, refresh } = usePortalData(getDeliveryBalance);
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );
  return (
    <View style={s.stack}>
      <PortalLoading loading={loading} error={error} retry={() => void refresh()} />
      {data && (
        <>
          <Text style={s.subtitle}>
            {data.xp} XP · {data.level?.name ?? 'Sin nivel configurado'}
          </Text>
          {data.nextLevel && (
            <Text style={s.body}>
              Faltan {data.nextLevel.minimumXp - data.xp} XP para {data.nextLevel.name}.
            </Text>
          )}
          <Text style={s.body}>Tus puntos por empresa</Text>
          {data.companies.length ? (
            data.companies.map((c) => (
              <Text key={c.id} style={s.body}>
                {c.name}: {c.points} puntos
              </Text>
            ))
          ) : (
            <Text style={s.hint}>
              Se acreditan al confirmar tus entregas. Cada empresa tiene su propio saldo.
            </Text>
          )}
        </>
      )}
    </View>
  );
}
