import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { AccountRequired } from '@/components/auth/AccountRequired';
import { ActionButton } from '@/components/ui/ActionButton';
import { SuccessArtwork } from '@/components/ui/EcoArtwork';
import { PortalLoading } from '@/components/portal/PortalUI';
import {
  CitizenPage,
  InfoNote,
  RewardPhoto,
  rewardStyles as s,
} from '@/components/rewards/RewardsUI';
import { RewardLocation } from '@/components/rewards/RewardLocation';
import { RewardBarcode } from '@/components/rewards/RewardBarcode';
import { usePortalData } from '@/hooks/usePortalData';
import { rewardQr } from '@/models/Reward';
import { useAuth } from '@/providers/AuthProvider';
import { rewardCommand } from '@/services/reward.service';
import { colors, fonts } from '@/theme';
export default function RedemptionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  return session ? (
    <RedemptionCode key={`${id}:${session.user.id}`} id={id} />
  ) : (
    <AccountRequired title="Tu código de canje" />
  );
}
function RedemptionCode({ id }: Readonly<{ id: string }>) {
  const loader = useCallback(() => rewardCommand('get', { id }), [id]);
  const { data, loading, error, refresh } = usePortalData(loader);
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );
  return (
    <CitizenPage title="Tu código de canje" back="/rewards">
      <PortalLoading loading={loading} error={error} retry={() => void refresh()} />
      {data && (
        <>
          <View style={{ alignItems: 'center', gap: 12, paddingVertical: 10 }}>
            <SuccessArtwork />
            <Text style={[s.title, { fontSize: 23, textAlign: 'center' }]}>
              {data.status === 'RESERVED' ? '¡Listo para disfrutar!' : '¡Premio entregado!'}
            </Text>
            <Text style={[s.body, { textAlign: 'center' }]}>
              {data.status === 'RESERVED'
                ? 'Mostralo en el local para canjear tu premio.'
                : 'Este código ya fue utilizado.'}
            </Text>
          </View>
          <View style={s.card}>
            <View style={s.row}>
              <View style={{ width: 90, borderRadius: 12, overflow: 'hidden' }}>
                <RewardPhoto reward={data.reward} height={76} />
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={s.subtitle}>{data.reward.title}</Text>
                <Text style={s.body}>{data.reward.businessName}</Text>
              </View>
            </View>
            {data.status === 'RESERVED' && (
              <>
                <RewardBarcode code={data.code} />
                <Text
                  selectable
                  style={{
                    fontFamily: fonts.semiBold,
                    color: colors.text,
                    fontSize: 16,
                    textAlign: 'center',
                  }}
                >
                  {data.code}
                </Text>
                <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                  <QRCode value={rewardQr(data.code)} size={150} quietZone={14} ecl="M" />
                </View>
                <InfoNote>
                  Mostralo en el local para canjear. Este código es válido por única vez y queda
                  guardado en Mis canjes.
                </InfoNote>
              </>
            )}
            <Text style={s.body}>
              {data.pointsCost} puntos · {new Date(data.createdAt).toLocaleDateString('es-AR')}
              {data.redeemedAt
                ? `\nEntregado el ${new Date(data.redeemedAt).toLocaleString('es-AR')}`
                : ''}
            </Text>
          </View>
          <RewardLocation reward={data.reward} />
          <ActionButton
            title="← Volver a premios"
            secondary
            onPress={() => router.replace('/rewards')}
          />
        </>
      )}
    </CitizenPage>
  );
}
