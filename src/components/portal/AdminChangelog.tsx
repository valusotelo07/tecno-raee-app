import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { ActionButton } from '@/components/ui/ActionButton';
import { usePortalData } from '@/hooks/usePortalData';
import { auditNames, changelogChanges } from '@/models/Changelog';
import { getChangelog } from '@/services/portal.service';
import { colors } from '@/theme';
import { AdminEmpty } from './AdminPage';
import { PortalField, PortalLink, PortalLoading, portalStyles as s } from './PortalUI';

export function AdminChangelog() {
  const [page, setPage] = useState(0);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const loader = useCallback(() => getChangelog(page * 25, search, true), [page, search]);
  const { data, loading, error, refresh } = usePortalData(loader);
  return (
    <View style={s.stack}>
      <Text style={s.body}>
        Acciones de administradores, con fecha, autor y detalle de los cambios.
      </Text>
      <View style={{ gap: 12, maxWidth: 640 }}>
        <PortalField
          label="Buscar por persona, empresa o referencia"
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => {
            setSearch(draft.trim());
            setPage(0);
          }}
          returnKeyType="search"
        />
        <View style={s.actions}>
          <ActionButton
            title="Buscar en el historial"
            secondary
            onPress={() => {
              setSearch(draft.trim());
              setPage(0);
            }}
          />
          <PortalLink
            title="Actualizar historial"
            disabled={loading}
            onPress={() => void refresh()}
          />
        </View>
      </View>
      <PortalLoading loading={loading} error={error} retry={() => void refresh()} />
      {data && !loading && !error && (
        <>
          {data.entries.length === 0 && (
            <AdminEmpty
              title="Sin operaciones registradas"
              description={
                search
                  ? 'No hay resultados para esta búsqueda.'
                  : 'Las próximas operaciones aparecerán aquí automáticamente.'
              }
            />
          )}
          {data.entries.map((entry) => {
            const changes = changelogChanges(entry.details.before, entry.details.after);
            return (
              <View key={entry.id} style={s.row}>
                <Text style={s.subtitle}>{auditNames[entry.action] ?? entry.action}</Text>
                <Text style={s.body}>
                  {entry.actorName || 'Cuenta'}
                  {entry.actorEmail ? ` · ${entry.actorEmail}` : ''}
                </Text>
                <Text style={s.hint}>
                  {new Date(entry.createdAt).toLocaleString('es-AR', {
                    timeZone: 'America/Argentina/Buenos_Aires',
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                  {entry.companyName ? ` · ${entry.companyName}` : ''}
                </Text>
                {typeof entry.details.name === 'string' && (
                  <Text style={s.body}>{entry.details.name}</Text>
                )}
                {typeof entry.details.email === 'string' && (
                  <Text style={s.body}>Destinatario: {entry.details.email}</Text>
                )}
                {entry.note && <Text style={s.body}>Motivo: {entry.note}</Text>}
                {changes.map((change, i) => (
                  <View
                    key={i}
                    style={{
                      gap: 4,
                      paddingLeft: 12,
                      borderLeftWidth: 2,
                      borderLeftColor: colors.primary,
                    }}
                  >
                    <Text style={s.body}>
                      {change.entity} · {change.field}
                    </Text>
                    <Text selectable style={s.hint}>
                      {change.before} → {change.after}
                    </Text>
                  </View>
                ))}
                {entry.targetId && (
                  <Text selectable style={s.hint}>
                    Referencia: {entry.targetId}
                  </Text>
                )}
              </View>
            );
          })}
          <View style={s.actions}>
            <PortalLink
              title="Anterior"
              disabled={page === 0 || loading}
              onPress={() => setPage(page - 1)}
            />
            <Text style={s.body}>Página {page + 1}</Text>
            <PortalLink
              title="Siguiente"
              disabled={!data.hasMore || loading}
              onPress={() => setPage(page + 1)}
            />
          </View>
        </>
      )}
    </View>
  );
}
