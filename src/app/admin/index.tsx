import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { useState } from 'react';
import { ActionButton } from '@/components/ui/ActionButton';
import {
  PortalField,
  PortalLoading,
  PortalFeedback,
  PortalLink,
  portalStyles as s,
} from '@/components/portal/PortalUI';
import { AdminPage, AdminEmpty } from '@/components/portal/AdminPage';
import { AdminSearch } from '@/components/portal/AdminSearch';
import { AdminChangelog } from '@/components/portal/AdminChangelog';
import { AdminRewards } from '@/components/portal/AdminRewards';
import { AdminPoints } from '@/components/portal/AdminPoints';
import { usePortalAction, usePortalData } from '@/hooks/usePortalData';
import { useAuth } from '@/providers/AuthProvider';
import { type AdminPortalData, type ImpactLevel } from '@/models/Portal';
import { getAdminPortal, portalCommand } from '@/services/portal.service';

const sections = [
  'Puntos verdes',
  'Premios',
  'Buscador',
  'Límites',
  'Configuración global',
  'Historial de cambios',
] as const;
export default function AdminScreen() {
  const { profile, logout } = useAuth();
  const [tab, setTab] = useState<string>('Puntos verdes');
  const [historyRevision, setHistoryRevision] = useState(0);
  const { data, loading, error, refresh } = usePortalData(getAdminPortal);
  const action = usePortalAction();
  return (
    <AdminPage
      name={profile?.fullName ?? 'Administrador'}
      sections={sections}
      selected={tab}
      onSelect={setTab}
      refresh={() => {
        void refresh();
        setHistoryRevision((value) => value + 1);
      }}
      busy={action.busy || loading}
      logout={() =>
        void action.run(async () => {
          await logout();
          router.replace('/');
        })
      }
    >
      <PortalFeedback error={action.error} />
      <PortalLoading loading={loading} error={error} retry={() => void refresh()} />
      {data && !error && (
        <View key={tab} style={s.stack}>
          {tab === 'Buscador' && <AdminSearch companies={data.companies} refresh={refresh} />}
          {tab === 'Puntos verdes' && (
            <AdminPoints key={historyRevision} companies={data.companies} refresh={refresh} />
          )}
          {tab === 'Premios' && <AdminRewards key={historyRevision} companies={data.companies} />}
          {tab === 'Límites' && <Limits data={data} refresh={refresh} />}
          {tab === 'Configuración global' && <GlobalSettings data={data} refresh={refresh} />}
          {tab === 'Historial de cambios' && <AdminChangelog key={historyRevision} />}
        </View>
      )}
    </AdminPage>
  );
}
function Limits({
  data,
  refresh,
}: Readonly<{ data: AdminPortalData; refresh: () => Promise<void> }>) {
  const action = usePortalAction();
  const [notes, setNotes] = useState<Record<string, string>>({});
  return (
    <>
      {data.limitRequests.length === 0 && (
        <AdminEmpty
          title="No hay ampliaciones pendientes"
          description="Las empresas pueden solicitar más cupos para su equipo. Sus solicitudes aparecerán aquí."
        />
      )}
      {data.limitRequests.map((r) => (
        <View key={r.id} style={s.row}>
          <Text style={s.subtitle}>
            {r.companyName} · {r.requestedLimit} cupos
          </Text>
          <Text style={s.body}>{r.reason}</Text>
          <Text style={s.hint}>
            {r.status === 'SUBMITTED'
              ? 'En revisión'
              : r.status === 'APPROVED'
                ? 'Aprobada'
                : 'Rechazada'}
          </Text>
          {r.reviewNote && <Text style={s.body}>{r.reviewNote}</Text>}
          {r.status === 'SUBMITTED' && (
            <>
              <PortalField
                label="Observación"
                value={notes[r.id] ?? ''}
                onChangeText={(value) => setNotes({ ...notes, [r.id]: value })}
                editable={!action.busy}
              />
              {['APPROVED', 'REJECTED'].map((status) => (
                <ActionButton
                  key={status}
                  title={status === 'APPROVED' ? 'Aprobar ampliación' : 'Rechazar ampliación'}
                  secondary={status === 'REJECTED'}
                  loading={action.busy}
                  onPress={() =>
                    void action.run(async () => {
                      await portalCommand('review_limit', {
                        id: r.id,
                        status,
                        note: notes[r.id] ?? '',
                      });
                      await refresh();
                    }, 'Revisión guardada.')
                  }
                />
              ))}
            </>
          )}
        </View>
      ))}
      <PortalFeedback error={action.error} notice={action.notice} />
    </>
  );
}
function GlobalSettings({
  data,
  refresh,
}: Readonly<{ data: AdminPortalData; refresh: () => Promise<void> }>) {
  const action = usePortalAction();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(data.categories.map((c) => [c.id, String(c.impactXp)]))
  );
  const [editing, setEditing] = useState<ImpactLevel | null>(null),
    [name, setName] = useState(''),
    [xp, setXp] = useState('');
  return (
    <View style={[s.stack, { maxWidth: 640, width: '100%' }]}>
      <Text style={s.subtitle}>XP global por dispositivo</Text>
      <Text style={s.body}>
        El XP mide el impacto y define los niveles. Los puntos para canjear premios se configuran
        por empresa y se suman a un único saldo. Estos cambios se aplican a nuevas entregas.
      </Text>
      {data.categories.map((c) => (
        <PortalField
          key={c.id}
          label={`${c.name} · XP`}
          compact
          keyboardType="number-pad"
          value={values[c.id]}
          editable={!action.busy}
          onChangeText={(value) => setValues({ ...values, [c.id]: value })}
        />
      ))}
      <ActionButton
        title="Guardar XP"
        loading={action.busy}
        onPress={() =>
          void action.run(async () => {
            const categories = data.categories.map((c) => ({ id: c.id, xp: Number(values[c.id]) }));
            if (
              categories.some(
                (c) =>
                  !values[c.id].trim() || !Number.isSafeInteger(c.xp) || c.xp < 0 || c.xp > 1000000
              )
            )
              throw new Error('Usá valores enteros entre 0 y 1.000.000.');
            await portalCommand('save_global_xp', { categories });
            await refresh();
          })
        }
      />
      <View style={s.section}>
        <Text style={s.subtitle}>Niveles de impacto</Text>
        {data.levels.map((l) => (
          <View key={l.id} style={s.row}>
            <Text style={s.body}>
              {l.name} · desde {l.minimumXp} XP
            </Text>
            <PortalLink
              title="Editar nivel"
              disabled={action.busy}
              onPress={() => {
                setEditing(l);
                setName(l.name);
                setXp(String(l.minimumXp));
              }}
            />
          </View>
        ))}
        <PortalField
          label={editing ? 'Nombre del nivel' : 'Nombre del nuevo nivel'}
          value={name}
          onChangeText={setName}
          editable={!action.busy}
        />
        <PortalField
          label="XP mínimo"
          value={xp}
          onChangeText={setXp}
          keyboardType="number-pad"
          editable={!action.busy}
        />
        <ActionButton
          title={editing ? 'Guardar nivel' : 'Agregar nivel'}
          secondary
          loading={action.busy}
          onPress={() =>
            void action.run(async () => {
              if (!xp.trim() || !Number.isSafeInteger(Number(xp)) || Number(xp) < 0)
                throw new Error('Ingresá un umbral de XP entero y no negativo.');
              if (editing?.minimumXp === 0 && Number(xp) !== 0)
                throw new Error('El nivel inicial debe comenzar en 0 XP.');
              await portalCommand('save_level', { id: editing?.id, name, minimumXp: Number(xp) });
              setEditing(null);
              setName('');
              setXp('');
              await refresh();
            })
          }
        />
        {editing && (
          <PortalLink
            title="Cancelar edición"
            disabled={action.busy}
            onPress={() => {
              setEditing(null);
              setName('');
              setXp('');
            }}
          />
        )}
      </View>
      <PortalFeedback error={action.error} notice={action.notice} />
    </View>
  );
}
