import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { AccountRequired } from '@/components/auth/AccountRequired';
import { ActionButton } from '@/components/ui/ActionButton';
import { PortalLoading } from '@/components/portal/PortalUI';
import {
  CitizenPage,
  InfoNote,
  PointsCard,
  rewardStyles as s,
} from '@/components/rewards/RewardsUI';
import { usePortalData } from '@/hooks/usePortalData';
import { useAuth } from '@/providers/AuthProvider';
import { useWallet } from '@/providers/WalletProvider';
import { getPointsHistory } from '@/services/reward.service';
import { colors, fonts } from '@/theme';
export default function MyPointsScreen() {
  const { session } = useAuth();
  return session ? <MyPoints key={session.user.id} /> : <AccountRequired title="Mis puntos" />;
}
function MyPoints() {
  const wallet = useWallet();
  const history = usePortalData(getPointsHistory);
  const { refresh: refreshWallet } = wallet;
  const { refresh: refreshHistory } = history;
  useFocusEffect(
    useCallback(() => {
      void refreshWallet();
      void refreshHistory();
    }, [refreshWallet, refreshHistory])
  );
  return (
    <CitizenPage title="Mis puntos">
      <PointsCard
        points={wallet.data?.points ?? null}
        loading={wallet.loading}
        error={wallet.error}
        onPress={wallet.error ? () => void refreshWallet() : undefined}
      />
      <InfoNote>
        Un solo saldo para toda la red. Los puntos que sumás en cualquier organización sirven para
        todos los premios disponibles.
      </InfoNote>
      <ActionButton title="Explorar premios" onPress={() => router.push('/rewards')} />
      <Text style={s.subtitle}>Últimos movimientos</Text>
      <PortalLoading
        loading={history.loading}
        error={history.error}
        retry={() => void refreshHistory()}
      />
      {!history.loading && !history.error && history.data?.length === 0 && (
        <View style={s.card}>
          <Ionicons name="leaf-outline" size={30} color={colors.primaryDark} />
          <Text style={s.subtitle}>Todavía no sumaste puntos</Text>
          <Text style={s.body}>
            Registrá tu primera entrega. Los puntos se acreditan cuando el equipo confirma la
            recepción.
          </Text>
          <ActionButton title="Registrar entrega" onPress={() => router.push('/new-delivery')} />
        </View>
      )}
      {history.data?.map((m) => (
        <View
          key={m.id}
          style={[s.row, { paddingVertical: 14, borderBottomWidth: 1, borderColor: colors.border }]}
        >
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={s.label}>{m.title}</Text>
            <Text style={s.body}>{m.source}</Text>
            <Text style={s.body}>{new Date(m.createdAt).toLocaleDateString('es-AR')}</Text>
          </View>
          <Text
            style={{
              fontFamily: fonts.bold,
              fontSize: 20,
              color: m.amount > 0 ? colors.primaryDark : colors.text,
            }}
          >
            {m.amount > 0 ? '+' : ''}
            {m.amount.toLocaleString('es-AR')}
          </Text>
        </View>
      ))}
    </CitizenPage>
  );
}
