import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { AccountRequired } from '@/components/auth/AccountRequired';
import { ActionButton } from '@/components/ui/ActionButton';
import { DeliveryBalance } from '@/components/delivery/DeliveryBalance';
import { DeliveryHistory } from '@/components/delivery/DeliveryHistory';
import { PortalPage, PortalNav, portalStyles as s } from '@/components/portal/PortalUI';
import { useAuth } from '@/providers/AuthProvider';

export default function MyRaeeScreen() {
  const { session } = useAuth();
  const [tab, setTab] = useState('Todos');
  if (!session) return <AccountRequired title="Mis RAEE" />;
  return (
    <PortalPage title="Mis RAEE" subtitle="Tus entregas, puntos por empresa e impacto global.">
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
    </PortalPage>
  );
}
