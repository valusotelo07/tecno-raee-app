import { supabase } from '@/config/supabase';

export const adminKinds = {
  users: 'Usuarios',
  companies: 'Empresas',
  points: 'Puntos verdes',
  rewards: 'Premios',
} as const;
export type AdminKind = keyof typeof adminKinds;
export interface AdminRecord {
  kind: AdminKind;
  id: string;
  name: string;
  description: string;
  company_id: string | null;
}
export async function searchAdminRecords(text: string, kind: AdminKind, offset = 0) {
  const { data, error } = await supabase.rpc('admin_search_records', {
    search_text: text,
    entity_kind: kind,
    page_offset: offset,
  });
  if (error) throw error;
  const rows = (data ?? []) as AdminRecord[];
  return { rows: rows.slice(0, 25), hasMore: rows.length > 25 };
}
export async function editAdminRecord(kind: 'users' | 'companies', id: string, payload: object) {
  const { error } = await supabase.rpc('admin_edit_record', {
    entity_kind: kind,
    record_id: id,
    payload,
  });
  if (error) throw error;
}
