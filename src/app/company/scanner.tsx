import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { ActionButton } from '@/components/ui/ActionButton';
import { DeliverySummary } from '@/components/delivery/DeliverySummary';
import {
  PortalPage,
  PortalField,
  PortalLink,
  PortalFeedback,
  portalStyles as s,
} from '@/components/portal/PortalUI';
import { usePortalAction } from '@/hooks/usePortalData';
import {
  deliveryQuantity,
  effectiveDeliveryStatus,
  parseOperationCode,
  type Delivery,
} from '@/models/Delivery';
import { useAuth } from '@/providers/AuthProvider';
import { deliveryCommand } from '@/services/delivery.service';

export default function ScannerScreen() {
  const { company } = useAuth();
  const { code: initialCode } = useLocalSearchParams<{ code?: string }>();
  if (!company)
    return (
      <PortalPage title="Recepción">
        <Text style={s.body}>Seleccioná una empresa activa.</Text>
      </PortalPage>
    );
  return (
    <Scanner key={company.companyId} companyId={company.companyId} initialCode={initialCode} />
  );
}
function Scanner({
  companyId,
  initialCode,
}: Readonly<{ companyId: string; initialCode?: string }>) {
  const [permission, requestPermission] = useCameraPermissions();
  const [camera, setCamera] = useState(false);
  const scanLock = useRef(false);
  const [code, setCode] = useState(initialCode ?? '');
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const action = usePortalAction();
  useFocusEffect(
    useCallback(
      () => () => {
        setCamera(false);
      },
      []
    )
  );
  async function lookup(raw: string) {
    const parsed = parseOperationCode(raw);
    if (parsed.type !== 'DELIVERY')
      throw new Error(
        parsed.type === 'PICKUP'
          ? 'Este código es de retiro. Ese flujo todavía no está habilitado.'
          : 'Este código es de recompensa. Ese flujo todavía no está habilitado.'
      );
    setDelivery(null);
    const found = await deliveryCommand('lookup', { companyId, code: parsed.code });
    setCode(parsed.code);
    setDelivery(found);
    setQuantities(
      Object.fromEntries(
        found.items.map((i) => [i.categoryId, String(i.confirmedQuantity ?? i.declaredQuantity)])
      )
    );
  }
  return (
    <PortalPage
      title="Recibir entrega"
      subtitle="Revisá los dispositivos físicamente antes de confirmar."
      back="/company"
    >
      {!delivery && (
        <>
          <ActionButton
            title={camera ? 'Cerrar cámara' : 'Escanear QR / código de barras'}
            secondary
            loading={action.busy}
            onPress={() =>
              void action.run(async () => {
                if (camera) {
                  setCamera(false);
                  return;
                }
                const granted = permission?.granted || (await requestPermission()).granted;
                if (!granted)
                  throw new Error(
                    'Podés habilitar la cámara desde los ajustes o ingresar el código manualmente.'
                  );
                scanLock.current = false;
                setCamera(true);
              }, '')
            }
          />
          {camera && permission?.granted && (
            <CameraView
              style={{ height: 300, width: '100%' }}
              facing="back"
              mode="picture"
              barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128'] }}
              onMountError={() => {
                setCamera(false);
                void action.run(async () => {
                  throw new Error('No pudimos abrir la cámara. Ingresá el código manualmente.');
                });
              }}
              onBarcodeScanned={({ data }) => {
                if (scanLock.current) return;
                scanLock.current = true;
                setCamera(false);
                void action.run(() => lookup(data), 'Código identificado.');
              }}
            />
          )}
          <PortalField
            label="Código de entrega"
            placeholder="TR-… o contenido del QR"
            value={code}
            onChangeText={setCode}
            editable={!action.busy}
            autoCapitalize="characters"
          />
          <ActionButton
            title="Buscar entrega"
            loading={action.busy}
            onPress={() => {
              setCamera(false);
              void action.run(() => lookup(code), 'Código identificado.');
            }}
          />
        </>
      )}
      {delivery && (
        <>
          <Text style={s.subtitle}>{delivery.citizenName}</Text>
          <DeliverySummary delivery={delivery} />
          {effectiveDeliveryStatus(delivery) === 'PENDING_RECEPTION' && (
            <View style={s.section}>
              <Text style={s.subtitle}>Cantidades recibidas</Text>
              <Text style={s.body}>
                Ajustá lo recibido. Usá 0 para las categorías que no llegaron.
              </Text>
              {delivery.items.map((i) => (
                <PortalField
                  key={i.categoryId}
                  label={`${i.categoryName} · ${i.declaredQuantity} declarados`}
                  value={quantities[i.categoryId] ?? ''}
                  onChangeText={(v) => setQuantities((q) => ({ ...q, [i.categoryId]: v }))}
                  keyboardType="number-pad"
                  maxLength={3}
                  editable={!action.busy}
                />
              ))}
              <ActionButton
                title="Confirmar recepción y acreditar"
                loading={action.busy}
                onPress={() =>
                  void action.run(async () => {
                    const received = await deliveryCommand('confirm', {
                      companyId,
                      code: delivery.code,
                      items: delivery.items.map((i) => ({
                        categoryId: i.categoryId,
                        quantity: deliveryQuantity(quantities[i.categoryId], true),
                      })),
                    });
                    setDelivery(received);
                    if (received.status !== 'CONFIRMED')
                      throw new Error(
                        'El código venció antes de la recepción. No se acreditaron puntos.'
                      );
                  }, 'Recepción confirmada. Puntos y XP acreditados.')
                }
              />
            </View>
          )}
          <PortalLink
            title="Consultar de nuevo"
            disabled={action.busy}
            onPress={() => void action.run(() => lookup(delivery.code), '')}
          />
          <ActionButton
            title="Recibir otra entrega"
            secondary
            disabled={action.busy}
            onPress={() => {
              setDelivery(null);
              setCode('');
            }}
          />
        </>
      )}
      <PortalFeedback error={action.error} notice={action.notice} />
      <PortalLink title="Volver al portal" onPress={() => router.replace('/company')} />
    </PortalPage>
  );
}
