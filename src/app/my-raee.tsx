import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { AccountRequired } from '@/components/auth/AccountRequired';
import { ActionButton } from '@/components/ui/ActionButton';
import { DeliveryBalance } from '@/components/delivery/DeliveryBalance';
import { DeliveryHistory } from '@/components/delivery/DeliveryHistory';
import { PortalNav, portalStyles as s } from '@/components/portal/PortalUI';
import { CitizenPage } from '@/components/rewards/RewardsUI';
import { useAuth } from '@/providers/AuthProvider';

export default function MyRaeeScreen() {
  const { session } = useAuth();
  const [tab, setTab] = useState('Todos');
  if (!session) return <AccountRequired title="Entregas" back="/profile" />;
  return (
    <CitizenPage title="Entregas" back="/profile">
      <DeliveryBalance />
      <ActionButton title="Registrar entrega" onPress={() => router.push('/new-delivery')} />
      <PortalNav items={['Todos', 'Entregas', 'Retiros']} selected={tab} onSelect={setTab} />
      {tab === 'Retiros' ? (
        <Text style={s.body}>
          La solicitud y seguimiento de retiros se habilitará en la próxima etapa.
        </Text>
      ) : (
        <DeliveryHistory />
      )}
    </CitizenPage>
  );
}
