import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { ActionButton } from '@/components/ui/ActionButton';
import { brand } from '@/config/brand';
import {
  PortalPage,
  PortalField,
  PortalFeedback,
  PortalLoading,
  PortalLink,
  portalStyles as s,
} from '@/components/portal/PortalUI';
import { usePortalAction, usePortalData } from '@/hooks/usePortalData';
import { useAuth } from '@/providers/AuthProvider';
import { useAuthFlowArrival } from '@/hooks/useAuthFlowArrival';
import { authRoute } from '@/models/AuthFlow';
import {
  applicationStatuses,
  type ApplicationInput,
  type CompanyApplication,
} from '@/models/Portal';
import { getApplications, pickCompanyDocument, portalCommand } from '@/services/portal.service';

const empty: ApplicationInput = {
  businessName: '',
  legalName: '',
  taxId: '',
  corporateEmail: '',
  phone: '',
  responsible: '',
  address: '',
  activity: '',
  website: '',
  description: '',
  documentPath: '',
};
export default function CompanyApplicationScreen() {
  useAuthFlowArrival();
  const { user, session, loading } = useAuth();
  return (
    <PortalPage
      title="Sumá tu organización"
      subtitle={`Solicitá el alta para recibir tecnología en desuso a través de ${brand.name}.`}
      back="/"
    >
      {!loading && !session ? (
        <View style={s.stack}>
          <Text style={s.body}>
            Creá una cuenta o iniciá sesión para enviar la documentación, seguir la revisión y
            recibir tu acceso como responsable. La empresa se habilita después de la aprobación.
          </Text>
          <ActionButton
            title="Crear cuenta"
            onPress={() => router.push(authRoute('/register', 'application'))}
          />
          <ActionButton
            title="Iniciar sesión"
            secondary
            onPress={() => router.push(authRoute('/login', 'application'))}
          />
        </View>
      ) : user ? (
        <ApplicationForm key={user.id} userId={user.id} />
      ) : (
        <PortalLoading loading error={null} retry={() => {}} />
      )}
    </PortalPage>
  );
}
function ApplicationForm({ userId }: Readonly<{ userId: string }>) {
  const { data, loading, error, refresh } = usePortalData(getApplications);
  const action = usePortalAction();
  const [form, setForm] = useState<ApplicationInput>(empty);
  const [editing, setEditing] = useState<CompanyApplication | null>(null);
  const [documentName, setDocumentName] = useState('');
  const open = data?.find((a) => ['SUBMITTED', 'UNDER_REVIEW', 'NEEDS_INFO'].includes(a.status));
  const fields: readonly [keyof ApplicationInput, string][] = [
    ['businessName', 'Nombre comercial'],
    ['legalName', 'Razón social'],
    ['taxId', 'CUIT (11 dígitos)'],
    ['corporateEmail', 'Email corporativo'],
    ['phone', 'Teléfono'],
    ['responsible', 'Responsable'],
    ['address', 'Dirección'],
    ['activity', 'Actividad / rubro'],
    ['website', 'Sitio web (opcional)'],
    ['description', 'Descripción (opcional)'],
  ];
  return (
    <>
      <PortalLoading loading={loading} error={error} retry={() => void refresh()} />
      {data?.map((app) => (
        <View key={app.id} style={s.row}>
          <Text style={s.subtitle}>{app.businessName}</Text>
          <Text style={s.body}>
            {applicationStatuses[app.status]} ·{' '}
            {new Date(app.createdAt).toLocaleDateString('es-AR')}
          </Text>
          {app.reviewNote && <Text style={s.body}>{app.reviewNote}</Text>}
          {app.status === 'NEEDS_INFO' && (
            <PortalLink
              title="Completar información"
              disabled={action.busy}
              onPress={() => {
                setEditing(app);
                setForm(app);
                setDocumentName('Documentación adjunta');
              }}
            />
          )}
          {app.status === 'APPROVED' && (
            <PortalLink
              title="Ver mi acceso empresarial"
              onPress={() => router.push('/company-invitations')}
            />
          )}
        </View>
      ))}
      {data && !error && (!open || editing) && (
        <View style={s.section}>
          <Text style={s.subtitle}>
            {editing ? 'Completar solicitud' : 'Datos de la organización'}
          </Text>
          {fields.map(([key, label]) => (
            <PortalField
              key={key}
              label={label}
              value={form[key]}
              editable={!action.busy}
              onChangeText={(value) =>
                setForm({ ...form, [key]: key === 'taxId' ? value.replace(/\D/g, '') : value })
              }
              keyboardType={
                key === 'corporateEmail'
                  ? 'email-address'
                  : key === 'taxId'
                    ? 'number-pad'
                    : 'default'
              }
              multiline={key === 'description'}
            />
          ))}
          <Text style={s.body}>
            Documentación que acredite la organización. PDF, JPG o PNG, hasta 8 MB. Sólo vos y el
            administrador pueden verla.
          </Text>
          <ActionButton
            title={documentName || 'Adjuntar documentación'}
            secondary
            loading={action.busy}
            onPress={() =>
              void action.run(async () => {
                const file = await pickCompanyDocument(userId);
                if (file) {
                  setForm({ ...form, documentPath: file.path });
                  setDocumentName(file.name);
                }
              }, 'Documentación lista.')
            }
          />
          <Text style={s.hint}>
            El acceso como responsable se enviará al email verificado de tu cuenta.
          </Text>
          <ActionButton
            title={editing ? 'Volver a enviar' : 'Enviar solicitud'}
            loading={action.busy}
            onPress={() =>
              void action.run(async () => {
                if (!form.documentPath)
                  throw new Error('Adjuntá la documentación antes de enviar.');
                await portalCommand(editing ? 'resubmit_application' : 'submit_application', {
                  ...form,
                  id: editing?.id,
                });
                setEditing(null);
                setForm(empty);
                setDocumentName('');
                await refresh();
              }, 'Solicitud enviada. Podés consultar su estado aquí.')
            }
          />
        </View>
      )}
      <PortalFeedback error={action.error} notice={action.notice} />
      <PortalLink title="Actualizar estado" onPress={() => void refresh()} />
    </>
  );
}
