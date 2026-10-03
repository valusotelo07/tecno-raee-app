import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton } from '@/components/ui/ActionButton';
import { PointsCoin } from '@/components/ui/EcoArtwork';
import { PortalFeedback, PortalLoading } from '@/components/portal/PortalUI';
import {
  CitizenPage,
  InfoNote,
  RewardPhoto,
  rewardStyles as s,
} from '@/components/rewards/RewardsUI';
import { RewardLocation } from '@/components/rewards/RewardLocation';
import { rewardExamples } from '@/data/rewardExamples';
import { usePortalAction, usePortalData } from '@/hooks/usePortalData';
import { rewardAvailable } from '@/models/Reward';
import { useAuth } from '@/providers/AuthProvider';
import { useWallet } from '@/providers/WalletProvider';
import { useDiscovery } from '@/providers/DiscoveryProvider';
import { getReward, rewardCommand } from '@/services/reward.service';
import { colors, fonts } from '@/theme';

export default function RewardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  return <RewardDetail key={`${id}:${user?.id ?? 'guest'}`} id={id} />;
}
function RewardDetail({ id }: Readonly<{ id: string }>) {
  const { session } = useAuth();
  const wallet = useWallet();
  const { now } = useDiscovery();
  const loader = useCallback(
    () =>
      id.startsWith('example-')
        ? Promise.resolve(rewardExamples.find((r) => r.id === id) ?? null)
        : getReward(id),
    [id]
  );
  const { data: reward, loading, error, refresh } = usePortalData(loader);
  const { refresh: refreshWallet } = wallet;
  useFocusEffect(
    useCallback(() => {
      void refresh();
      void refreshWallet();
    }, [refresh, refreshWallet])
  );
  const [confirming, setConfirming] = useState(false);
  const requestId = useRef<string | null>(null);
  const action = usePortalAction();
  const enough = wallet.data != null && wallet.data.points >= (reward?.pointsCost ?? Infinity);
  const available = reward != null && rewardAvailable(reward, now.getTime());
  return (
    <CitizenPage title="Detalle del premio" back="/rewards">
      <PortalLoading loading={loading} error={error} retry={() => void refresh()} />
      {!loading && !error && !reward && <InfoNote>Este premio ya no está disponible.</InfoNote>}
      {reward && (
        <>
          <View style={styles.hero}>
            <RewardPhoto key={reward.imageUrl} reward={reward} height={250} />
          </View>
          <View style={styles.details}>
            <Text style={s.title}>{reward.title}</Text>
            <View style={s.row}>
              <MaterialCommunityIcons name="storefront-outline" size={21} color={colors.text} />
              <Text style={[s.body, { color: colors.text, fontSize: 16 }]}>
                {reward.businessName}
              </Text>
            </View>
            <Text style={s.body}>{reward.description}</Text>
            <View style={styles.costCard}>
              <PointsCoin size={58} coins />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={s.label}>Costo del premio</Text>
                <Text style={styles.cost}>{reward.pointsCost.toLocaleString('es-AR')} puntos</Text>
              </View>
            </View>
            <RewardLocation reward={reward} showMap />
            <InfoNote>
              {reward.demo
                ? 'Premio de ejemplo. Podrás canjear cuando un administrador publique beneficios reales.'
                : 'Acercate al comercio y mostrá tu código de canje para recibir el premio. Es válido por única vez.'}
            </InfoNote>
            {!reward.demo && session && (
              <Text style={s.body}>
                {wallet.loading
                  ? 'Actualizando tu saldo…'
                  : wallet.data
                    ? `Tu saldo: ${wallet.data.points.toLocaleString('es-AR')} puntos`
                    : 'No pudimos cargar tu saldo.'}
              </Text>
            )}
            {wallet.error && !reward.demo && (
              <ActionButton
                title="Reintentar saldo"
                secondary
                onPress={() => void refreshWallet()}
              />
            )}
            <ActionButton
              title={
                reward.demo
                  ? 'Premio de ejemplo'
                  : !available
                    ? reward.stock === 0
                      ? 'Premio agotado'
                      : 'Premio no disponible'
                    : !session
                      ? 'Ingresá para canjear'
                      : !enough && !wallet.loading
                        ? 'Te faltan puntos'
                        : 'Canjear premio'
              }
              disabled={!!reward.demo || !available || (!!session && (wallet.loading || !enough))}
              onPress={() => {
                if (!session) {
                  router.push('/login');
                  return;
                }
                setConfirming(true);
                void refreshWallet();
              }}
            />
          </View>
          <Modal
            transparent
            visible={confirming}
            animationType="fade"
            onRequestClose={() => {
              if (!action.busy) setConfirming(false);
            }}
          >
            <View style={styles.backdrop}>
              <View accessibilityViewIsModal style={styles.modal}>
                <Ionicons name="gift-outline" size={32} color={colors.primaryDark} />
                <Text style={s.subtitle}>¿Querés canjear este premio?</Text>
                <Text style={s.label}>{reward.title}</Text>
                <Text style={s.body}>{reward.businessName}</Text>
                <Text style={s.body}>Costo: {reward.pointsCost} puntos</Text>
                <Text style={s.body}>
                  Tu saldo:{' '}
                  {wallet.loading ? 'Actualizando…' : (wallet.data?.points ?? 'No disponible')}{' '}
                  puntos
                </Text>
                {wallet.data && (
                  <Text style={s.label}>
                    Después del canje: {Math.max(0, wallet.data.points - reward.pointsCost)} puntos
                  </Text>
                )}
                <PortalFeedback error={action.error} />
                <ActionButton
                  title="Confirmar canje"
                  loading={action.busy}
                  disabled={wallet.loading || !enough}
                  onPress={() =>
                    void action.run(async () => {
                      requestId.current ??= Crypto.randomUUID();
                      const redemption = await rewardCommand('reserve', {
                        rewardId: reward.id,
                        requestId: requestId.current,
                      });
                      setConfirming(false);
                      void refreshWallet();
                      router.replace({
                        pathname: '/redemption/[id]',
                        params: { id: redemption.id },
                      });
                    }, '')
                  }
                />
                <Pressable
                  accessibilityRole="button"
                  disabled={action.busy}
                  onPress={() => setConfirming(false)}
                  style={styles.cancel}
                >
                  <Text style={s.link}>Cancelar</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </>
      )}
    </CitizenPage>
  );
}
const styles = StyleSheet.create({
  hero: { borderRadius: 20, overflow: 'hidden' },
  details: {
    marginTop: -42,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
    gap: 14,
  },
  costCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
  },
  cost: { fontFamily: fonts.bold, fontSize: 24, color: colors.text },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,30,20,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    gap: 14,
  },
  cancel: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
