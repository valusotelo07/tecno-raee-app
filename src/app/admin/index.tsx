import { router } from 'expo-router';
import { Linking, Text, View } from 'react-native';
import { useState } from 'react';
import { ActionButton } from '@/components/ui/ActionButton';
import {
  PortalNav,
  PortalField,
  PortalLoading,
  PortalFeedback,
  PortalLink,
  portalStyles as s,
} from '@/components/portal/PortalUI';
import { AdminPage, AdminEmpty } from '@/components/portal/AdminPage';
import { AdminChangelog } from '@/components/portal/AdminChangelog';
import { usePortalAction, usePortalData } from '@/hooks/usePortalData';
import { useAuth } from '@/providers/AuthProvider';
import {
  applicationStatuses,
  type AdminPortalData,
  type CompanyApplication,
  type ImpactLevel,
} from '@/models/Portal';
import {
  companyDocumentUrl,
  getAdminPortal,
  portalCommand,
  sendCompanyInvitation,
} from '@/services/portal.service';

const sections = [
  'Inicio',
  'Solicitudes',
  'Empresas',
  'Límites',
  'Configuración global',
  'Historial de cambios',
] as const;
export default function AdminScreen() {
  const { profile, logout } = useAuth();
  const [tab, setTab] = useState<string>('Inicio');
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
          {tab === 'Inicio' && (
            <>
              <Text style={s.subtitle}>Pendientes de revisión</Text>
              <PortalLink
                title={`${data.applications.filter((a) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW').length} solicitudes de empresa`}
                onPress={() => setTab('Solicitudes')}
              />
              <PortalLink
                title={`${data.limitRequests.filter((r) => r.status === 'SUBMITTED').length} solicitudes de ampliación`}
                onPress={() => setTab('Límites')}
              />
              <Text style={s.body}>
                {data.companies.filter((c) => c.status === 'ACTIVE').length} empresas activas ·{' '}
                {data.companies.filter((c) => c.status === 'SUSPENDED').length} suspendidas
              </Text>
              <Text style={s.hint}>
                La aprobación crea la empresa y reserva el acceso de su responsable. El primer punto
                verde se publica después de la configuración empresarial.
              </Text>
            </>
          )}
          {tab === 'Solicitudes' && <Applications data={data} refresh={refresh} />}
          {tab === 'Empresas' && <Companies data={data} refresh={refresh} />}
          {tab === 'Límites' && <Limits data={data} refresh={refresh} />}
          {tab === 'Configuración global' && <GlobalSettings data={data} refresh={refresh} />}
          {tab === 'Historial de cambios' && <AdminChangelog key={historyRevision} />}
        </View>
      )}
    </AdminPage>
  );
}
function Applications({
  data,
  refresh,
}: Readonly<{ data: AdminPortalData; refresh: () => Promise<void> }>) {
  const [filter, setFilter] = useState('Pendientes'),
    [selected, setSelected] = useState<string | null>(null);
  const application = data.applications.find((a) => a.id === selected);
  const rows = data.applications.filter(
    (a) => filter === 'Todas' || ['SUBMITTED', 'UNDER_REVIEW', 'NEEDS_INFO'].includes(a.status)
  );
  return (
    <>
      <PortalNav items={['Pendientes', 'Todas']} selected={filter} onSelect={setFilter} />
      {application ? (
        <ApplicationReview
          key={application.id}
          application={application}
          refresh={refresh}
          back={() => setSelected(null)}
        />
      ) : rows.length === 0 ? (
        <AdminEmpty
          title="No hay solicitudes para revisar"
          description="Las organizaciones que soliciten el alta aparecerán aquí con sus datos y documentación."
        />
      ) : (
        rows.map((a) => (
          <View key={a.id} style={s.row}>
            <Text style={s.subtitle}>{a.businessName}</Text>
            <Text style={s.body}>
              {applicationStatuses[a.status]} · CUIT {a.taxId}
            </Text>
            <Text style={s.hint}>
              {a.responsible} · {new Date(a.createdAt).toLocaleDateString('es-AR')}
            </Text>
            <PortalLink title="Revisar solicitud" onPress={() => setSelected(a.id)} />
          </View>
        ))
      )}
    </>
  );
}
function ApplicationReview({
  application: a,
  refresh,
  back,
}: Readonly<{ application: CompanyApplication; refresh: () => Promise<void>; back: () => void }>) {
  const [note, setNote] = useState(a.reviewNote ?? '');
  const action = usePortalAction();
  async function review(status: string) {
    const result = await portalCommand('review_application', { id: a.id, status, note });
    await refresh();
    if (result.invitationId) await sendCompanyInvitation(result.invitationId);
  }
  return (
    <View style={s.stack}>
      <PortalLink title="Volver a solicitudes" onPress={back} disabled={action.busy} />
      <Text style={s.subtitle}>{a.businessName}</Text>
      <Text style={s.body}>{applicationStatuses[a.status]}</Text>
      {[
        ['Razón social', a.legalName],
        ['CUIT', a.taxId],
        ['Email corporativo', a.corporateEmail],
        ['Teléfono', a.phone],
        ['Responsable', a.responsible],
        ['Dirección', a.address],
        ['Actividad', a.activity],
        ['Sitio web', a.website],
        ['Descripción', a.description],
      ]
        .filter(([, value]) => value)
        .map(([label, value]) => (
          <View key={label} style={{ gap: 4 }}>
            <Text style={s.hint}>{label}</Text>
            <Text selectable style={s.body}>
              {value}
            </Text>
          </View>
        ))}
      <ActionButton
        title="Ver documentación privada"
        secondary
        loading={action.busy}
        onPress={() =>
          void action.run(async () => {
            await Linking.openURL(await companyDocumentUrl(a.documentPath, true));
          }, 'Documentación abierta.')
        }
      />
      {['SUBMITTED', 'UNDER_REVIEW'].includes(a.status) && (
        <View style={s.section}>
          <PortalField
            label="Observación para el responsable"
            value={note}
            onChangeText={setNote}
            multiline
            editable={!action.busy}
          />
          {a.status === 'SUBMITTED' && (
            <ActionButton
              title="Marcar en revisión"
              secondary
              loading={action.busy}
              onPress={() =>
                void action.run(() => review('UNDER_REVIEW'), 'Solicitud en revisión.')
              }
            />
          )}
          <ActionButton
            title="Aprobar empresa y enviar acceso"
            loading={action.busy}
            onPress={() =>
              void action.run(() => review('APPROVED'), 'Empresa aprobada e invitación enviada.')
            }
          />
          <ActionButton
            title="Pedir información adicional"
            secondary
            loading={action.busy}
            onPress={() =>
              void action.run(
                () => review('NEEDS_INFO'),
                'Solicitud devuelta para completar información.'
              )
            }
          />
          <ActionButton
            title="Rechazar solicitud"
            secondary
            loading={action.busy}
            onPress={() => void action.run(() => review('REJECTED'), 'Solicitud rechazada.')}
          />
        </View>
      )}
      <PortalFeedback error={action.error} notice={action.notice} />
    </View>
  );
}
function Companies({
  data,
  refresh,
}: Readonly<{ data: AdminPortalData; refresh: () => Promise<void> }>) {
  const [selected, setSelected] = useState<string | null>(null),
    [note, setNote] = useState('');
  const action = usePortalAction();
  const company = data.companies.find((c) => c.id === selected);
  const application = data.applications.find((a) => a.companyId === selected);
  return company ? (
    <View style={s.stack}>
      <PortalLink
        title="Volver a empresas"
        disabled={action.busy}
        onPress={() => {
          setSelected(null);
          setNote('');
        }}
      />
      <Text style={s.subtitle}>{company.name}</Text>
      <Text style={s.body}>
        {company.status === 'ACTIVE' ? 'Activa' : 'Suspendida'} · Límite: {company.workerLimit}{' '}
        trabajadores
      </Text>
      {application && (
        <>
          <Text style={s.body}>
            {application.legalName} · CUIT {application.taxId}
          </Text>
          <Text style={s.body}>
            {application.corporateEmail} · {application.phone}
          </Text>
        </>
      )}
      <PortalField
        label="Motivo de suspensión / reactivación"
        value={note}
        onChangeText={setNote}
        multiline
        editable={!action.busy}
      />
      <ActionButton
        title={company.status === 'ACTIVE' ? 'Suspender empresa' : 'Reactivar empresa'}
        secondary
        loading={action.busy}
        onPress={() =>
          void action.run(async () => {
            await portalCommand('set_company_status', {
              id: company.id,
              status: company.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
              note,
            });
            await refresh();
          }, 'Estado de la empresa actualizado.')
        }
      />
      {data.invitations
        .filter((i) => i.companyId === company.id && i.role === 'company_owner')
        .map((i) => (
          <View key={i.id} style={s.section}>
            <Text style={s.body}>Responsable pendiente: {i.email}</Text>
            <ActionButton
              title="Enviar / Reenviar invitación al responsable"
              secondary
              loading={action.busy}
              onPress={() =>
                void action.run(async () => {
                  await sendCompanyInvitation(i.id);
                  await refresh();
                }, 'Email enviado.')
              }
            />
          </View>
        ))}
      <PortalFeedback error={action.error} notice={action.notice} />
    </View>
  ) : data.companies.length === 0 ? (
    <AdminEmpty
      title="Todavía no hay empresas aprobadas"
      description="Cuando apruebes una solicitud, podrás consultar la empresa y gestionar su estado desde aquí."
    />
  ) : (
    <>
      {data.companies.map((c) => (
        <View key={c.id} style={s.row}>
          <Text style={s.subtitle}>{c.name}</Text>
          <Text style={s.body}>
            {c.status === 'ACTIVE' ? 'Activa' : 'Suspendida'} · {c.workerLimit} cupos
          </Text>
          <PortalLink title="Ver empresa" onPress={() => setSelected(c.id)} />
        </View>
      ))}
    </>
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
        El XP define la progresión global. Los puntos de recompensas se configuran en cada empresa.
        Los cambios se aplicarán a nuevas operaciones.
      </Text>
      {data.categories.map((c) => (
        <PortalField
          key={c.id}
          label={`${c.name} · XP`}
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
