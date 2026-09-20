import { supabase } from '@/config/supabase';
import { toProfile } from '@/models/Profile';

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? toProfile(data) : null;
}
