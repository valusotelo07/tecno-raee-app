import type { User } from '@supabase/supabase-js';

import { supabase } from '@/config/supabase';

async function ensureProfile(user: User) {
  if (!user.email) {
    throw new Error('El usuario no tiene un email asociado.');
  }

  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email: user.email.toLowerCase(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'id',
      }
    );

  if (error) {
    throw error;
  }
}

export async function register(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('No se pudo crear el usuario.');
  }

  if (!data.session) {
    throw new Error(
      'La confirmación por email sigue activada en Supabase.'
    );
  }

  await ensureProfile(data.user);

  return data;
}

export async function login(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    throw error;
  }

  await ensureProfile(data.user);

  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}