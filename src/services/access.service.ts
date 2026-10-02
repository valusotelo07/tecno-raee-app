import { supabase } from '@/config/supabase';
import type { Access, CompanyMembership } from '@/models/Access';

type MembershipRow = {
  id: string;
  company_id: string;
  role: CompanyMembership['role'];
  status: CompanyMembership['status'];
  companies: { name: string; status: CompanyMembership['companyStatus'] } | null;
};

export async function getAccess(userId: string, email?: string): Promise<Access> {
  const [admins, memberships, invitations] = await Promise.all([
    supabase.from('platform_admins').select('user_id').eq('user_id', userId).maybeSingle(),
    supabase
      .from('company_memberships')
      .select('id, company_id, role, status, companies(name, status)')
      .eq('user_id', userId)
      .order('created_at'),
    email
      ? supabase
          .from('company_invitations')
          .select('id, companies!inner(status)')
          .eq('email', email.toLowerCase())
          .eq('status', 'INVITED')
          .eq('companies.status', 'ACTIVE')
          .limit(1)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (admins.error) throw admins.error;
  if (memberships.error) throw memberships.error;
  if (invitations.error) throw invitations.error;
  return {
    isPlatformAdmin: Boolean(admins.data),
    hasPendingInvitations: Boolean(invitations.data?.length),
    memberships: (memberships.data as unknown as MembershipRow[])
      .filter((row) => row.companies !== null)
      .map((row) => ({
        id: row.id,
        companyId: row.company_id,
        companyName: row.companies!.name,
        companyStatus: row.companies!.status,
        role: row.role,
        status: row.status,
      })),
  };
}
