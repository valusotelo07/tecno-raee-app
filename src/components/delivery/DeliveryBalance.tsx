import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';
import { PointsCard } from '@/components/rewards/RewardsUI';
import { PortalLink } from '@/components/portal/PortalUI';
import { useWallet } from '@/providers/WalletProvider';
export function DeliveryBalance() {
  const { data, loading, error, refresh } = useWallet();
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );
  return (
    <View style={{ gap: 8 }}>
      <PointsCard
        points={data?.points ?? null}
        loading={loading}
        error={error}
        onPress={() => (error ? void refresh() : router.push('/my-points'))}
      />
      {data && (
        <PortalLink
          title={`${data.xp.toLocaleString('es-AR')} XP · ${data.level?.name ?? 'Ver mi impacto'} ›`}
          onPress={() => router.push('/impact')}
        />
      )}
    </View>
  );
}
