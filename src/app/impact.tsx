import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { AccountRequired } from '@/components/auth/AccountRequired';
import { CitizenPage, InfoNote, rewardStyles as s } from '@/components/rewards/RewardsUI';
import { PortalLoading } from '@/components/portal/PortalUI';
import { useAuth } from '@/providers/AuthProvider';
import { useWallet } from '@/providers/WalletProvider';
import { colors, fonts } from '@/theme';
export default function ImpactScreen() {
  const { session } = useAuth();
  const { data, loading, error, refresh } = useWallet();
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );
  if (!session) return <AccountRequired title="Mi impacto" />;
  const progress = data?.nextLevel
    ? Math.max(
        0,
        Math.min(
          1,
          (data.xp - (data.level?.minimumXp ?? 0)) /
            (data.nextLevel.minimumXp - (data.level?.minimumXp ?? 0))
        )
      )
    : 1;
  return (
    <CitizenPage title="Mi impacto">
      <PortalLoading loading={loading} error={error} retry={() => void refresh()} />
      {data && (
        <View style={[s.card, { alignItems: 'center', padding: 28 }]}>
          <MaterialCommunityIcons name="sprout" size={86} color={colors.primaryDark} />
          <Text style={s.title}>
            {data.level ? `Nivel ${data.level.name}` : 'Tu impacto comienza acá'}
          </Text>
          <Text style={{ fontFamily: fonts.bold, fontSize: 36, color: colors.primaryDark }}>
            {data.xp.toLocaleString('es-AR')} XP
          </Text>
          <View
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
            style={{
              height: 10,
              width: '100%',
              backgroundColor: colors.primarySoft,
              borderRadius: 5,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: 10,
                width: `${progress * 100}%`,
                backgroundColor: colors.primary,
                borderRadius: 5,
              }}
            />
          </View>
          <Text style={[s.body, { textAlign: 'center' }]}>
            {data.nextLevel
              ? `${(data.nextLevel.minimumXp - data.xp).toLocaleString('es-AR')} XP para ${data.nextLevel.name}`
              : data.level
                ? 'Alcanzaste el nivel más alto. ¡Seguí sumando impacto!'
                : 'Los niveles aparecerán cuando estén configurados.'}
          </Text>
        </View>
      )}
      <InfoNote>
        Tu XP reconoce el impacto de tus entregas. No se gasta al canjear premios: tu progreso sigue
        creciendo.
      </InfoNote>
    </CitizenPage>
  );
}
