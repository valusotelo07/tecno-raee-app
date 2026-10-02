import { useState } from 'react';
import { Text, View } from 'react-native';
import { ActionButton } from '@/components/ui/ActionButton';
import {
  PortalChoice,
  PortalField,
  PortalToggle,
  PortalFeedback,
  PortalLink,
  portalStyles as s,
} from './PortalUI';
import { usePortalAction } from '@/hooks/usePortalData';
import type { CompanyPortalData, ManagedPoint } from '@/models/Portal';
import { weekdays, parseSchedules, scheduleText } from '@/models/PointSchedule';
import { portalCommand } from '@/services/portal.service';

export function CompanyPointEditor({
  data,
  point,
  onSaved,
  onCancel,
}: Readonly<{
  data: CompanyPortalData;
  point: ManagedPoint | null;
  onSaved: () => Promise<void>;
  onCancel: () => void;
}>) {
  const [name, setName] = useState(point?.name ?? ''),
    [address, setAddress] = useState(point?.address ?? '');
  const [latitude, setLatitude] = useState(point ? String(point.latitude) : ''),
    [longitude, setLongitude] = useState(point ? String(point.longitude) : '');
  const [phone, setPhone] = useState(point?.phone ?? data.details?.phone ?? ''),
    [description, setDescription] = useState(point?.description ?? '');
  const [timeZone, setTimeZone] = useState(point?.timeZone ?? 'America/Argentina/Buenos_Aires');
  const [active, setActive] = useState(point?.active ?? false),
    [pickupEnabled, setPickupEnabled] = useState(point?.pickupEnabled ?? false);
  const [categories, setCategories] = useState<string[]>(point?.categories ?? []);
  const [days, setDays] = useState(scheduleText(point?.schedules ?? []));
  const action = usePortalAction();
  return (
    <View style={s.section}>
      <Text style={s.subtitle}>{point ? 'Editar punto verde' : 'Nuevo punto verde'}</Text>
      <PortalField
        label="Nombre del punto"
        value={name}
        onChangeText={setName}
        editable={!action.busy}
      />
      <PortalField
        label="Dirección"
        value={address}
        onChangeText={setAddress}
        editable={!action.busy}
      />
      <PortalField
        label="Latitud"
        value={latitude}
        onChangeText={setLatitude}
        keyboardType="numbers-and-punctuation"
        editable={!action.busy}
      />
      <PortalField
        label="Longitud"
        value={longitude}
        onChangeText={setLongitude}
        keyboardType="numbers-and-punctuation"
        editable={!action.busy}
      />
      <PortalField
        label="Teléfono de contacto"
        value={phone}
        onChangeText={setPhone}
        editable={!action.busy}
      />
      <PortalField
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        multiline
        editable={!action.busy}
      />
      <PortalField
        label="Zona horaria"
        value={timeZone}
        onChangeText={setTimeZone}
        editable={!action.busy}
      />
      <Text style={s.subtitle}>Categorías recibidas</Text>
      {data.categories.map((c) => (
        <PortalChoice
          key={c.id}
          label={c.name}
          selected={categories.includes(c.id)}
          disabled={action.busy}
          onPress={() =>
            setCategories(
              categories.includes(c.id)
                ? categories.filter((id) => id !== c.id)
                : [...categories, c.id]
            )
          }
        />
      ))}
      <Text style={s.subtitle}>Horarios</Text>
      <Text style={s.hint}>
        Usá 09:00-18:00. Para horario cortado: 09:00-13:00, 15:00-19:00. Dejá vacío si está cerrado.
        Un cierre anterior a la apertura corresponde al día siguiente.
      </Text>
      {weekdays.map((day, i) => (
        <PortalField
          key={day}
          label={day}
          value={days[i]}
          placeholder="Cerrado"
          editable={!action.busy}
          onChangeText={(value) => setDays(days.map((d, j) => (i === j ? value : d)))}
        />
      ))}
      <PortalToggle
        label="Ofrece retiros"
        value={pickupEnabled}
        onChange={setPickupEnabled}
        disabled={action.busy}
      />
      <PortalToggle
        label="Publicado para ciudadanos"
        value={active}
        onChange={setActive}
        disabled={action.busy}
      />
      <PortalFeedback error={action.error} />
      <ActionButton
        title="Guardar punto"
        loading={action.busy}
        onPress={() =>
          void action.run(async () => {
            const lat = Number(latitude.replace(',', '.')),
              lon = Number(longitude.replace(',', '.'));
            if (
              !latitude.trim() ||
              !longitude.trim() ||
              !Number.isFinite(lat) ||
              !Number.isFinite(lon) ||
              lat < -90 ||
              lat > 90 ||
              lon < -180 ||
              lon > 180
            )
              throw new Error('Ingresá coordenadas válidas para ubicar el punto en el mapa.');
            await portalCommand('save_point', {
              id: point?.id,
              companyId: data.company.id,
              name,
              address,
              latitude: lat,
              longitude: lon,
              phone,
              description,
              timeZone,
              active,
              pickupEnabled,
              categories,
              schedules: parseSchedules(days),
            });
            await onSaved();
          })
        }
      />
      <PortalLink title="Cancelar edición" disabled={action.busy} onPress={onCancel} />
    </View>
  );
}
