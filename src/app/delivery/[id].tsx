import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { AccountRequired } from '@/components/auth/AccountRequired';
import { ActionButton } from '@/components/ui/ActionButton';
import { DeliverySummary } from '@/components/delivery/DeliverySummary';
import {
  PortalPage,
  PortalLink,
  PortalLoading,
  PortalFeedback,
  portalStyles as s,
} from '@/components/portal/PortalUI';
import { usePortalAction, usePortalData } from '@/hooks/usePortalData';
import { effectiveDeliveryStatus } from '@/models/Delivery';
import { useAuth } from '@/providers/AuthProvider';
import { deliveryCommand } from '@/services/delivery.service';

export default function DeliveryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const loader = useCallback(() => deliveryCommand('get', { id }), [id]);
  const { data, loading, error, refresh } = usePortalData(loader);
  const action = usePortalAction();
  useFocusEffect(
    useCallback(() => {
      if (session) void refresh();
    }, [session, refresh])
  );
  if (!session) return <AccountRequired title="Tu entrega" />;
  return (
    <PortalPage title="Tu entrega" back="/my-raee">
      <PortalLoading loading={loading} error={error} retry={() => void refresh()} />
      {data && (
        <>
          <DeliverySummary delivery={data} showQr />
          {effectiveDeliveryStatus(data) === 'PENDING_RECEPTION' && (
            <View style={s.section}>
              <Text style={s.body}>
                Si no vas a llevar los dispositivos, podés cancelar esta entrega.
              </Text>
              <ActionButton
                title="Cancelar entrega"
                secondary
                loading={action.busy}
                onPress={() =>
                  void action.run(async () => {
                    await deliveryCommand('cancel', { id });
                    await refresh();
                  }, 'Entrega cancelada.')
                }
              />
            </View>
          )}
        </>
      )}
      <PortalFeedback error={action.error} notice={action.notice} />
      <PortalLink title="Actualizar estado" onPress={() => void refresh()} />
    </PortalPage>
  );
}
