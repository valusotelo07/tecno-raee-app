import type { User } from '@supabase/supabase-js';

import { supabase } from '@/config/supabase';
import { log } from '@/lib/logger';

function getErrorDetails(error: unknown) {
  if (error instanceof Error) {
    const errorWithMetadata = error as Error & {
      cause?: unknown;
      code?: unknown;
      status?: unknown;
    };

    return {
      message: error.message,
      name: error.name,
      code: errorWithMetadata.code,
      status: errorWithMetadata.status,
      cause:
        errorWithMetadata.cause instanceof Error
          ? errorWithMetadata.cause.message
          : errorWithMetadata.cause,
      stack: error.stack,
    };
  }

  return { message: String(error) };
}

async function ensureProfile(user: User) {
  if (!user.email) {
    throw new Error('El usuario no tiene un email asociado.');
  }

  const { error } = await supabase.from('profiles').upsert(
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

export async function register(name: string, email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  log.info('Auth: starting registration', { email: normalizedEmail });

  try {
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: name.trim(),
        },
      },
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error('No se pudo crear el usuario.');
    }

    await ensureProfile(data.user);
    log.info('Auth: registration completed', { userId: data.user.id });

    return data;
  } catch (error) {
    log.error('Auth: registration failed', getErrorDetails(error));
    throw error;
  }
}

export async function login(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  log.info('Auth: starting login', { email: normalizedEmail });

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      throw error;
    }

    await ensureProfile(data.user);
    log.info('Auth: login completed', { userId: data.user.id });

    return data;
  } catch (error) {
    log.error('Auth: login failed', getErrorDetails(error));
    throw error;
  }
}

export async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session;
}

export async function logout() {
  const { error } = await supabase.auth.signOut({
    scope: 'local',
  });

  if (error) {
    throw error;
  }
}

/**
 * Envía un código de recuperación por email.
 */
export async function sendRecoveryCode(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    log.warn('Auth: recovery requested without an email');
    throw new Error('Ingresá un correo electrónico.');
  }

  log.info('Auth: starting recovery email request', { email: normalizedEmail });

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(normalizedEmail);

    if (error) {
      throw error;
    }

    log.info('Auth: recovery email request completed', { email: normalizedEmail });
    return data;
  } catch (error) {
    const errorDetails = getErrorDetails(error);
    const status =
      typeof errorDetails.status === 'number' || typeof errorDetails.status === 'string'
        ? errorDetails.status
        : 'unknown';
    const category = typeof status === 'number' && status >= 500 ? 'server/email' : 'network/auth';

    log.error(
      `Auth: recovery email failed [${category}] ${errorDetails.message} (${errorDetails.name}, status ${status})`
    );
    throw error;
  }
}

/**
 * Verifica el código OTP de 6 dígitos enviado por Supabase.
 *
 * Si el código es correcto, Supabase crea una sesión
 * autenticada temporal para permitir modificar la contraseña.
 */
export async function verifyRecoveryCode(email: string, code: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedCode = code.trim();

  log.info('Auth: starting recovery code verification', { email: normalizedEmail });

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: normalizedCode,
      type: 'recovery',
    });

    if (error) {
      throw error;
    }

    if (!data.session) {
      throw new Error('No se pudo iniciar la sesión de recuperación.');
    }

    if (!data.user) {
      throw new Error('No se pudo identificar al usuario recuperado.');
    }

    log.info('Auth: recovery code verification completed', { userId: data.user.id });
    return data;
  } catch (error) {
    log.error('Auth: recovery code verification failed', getErrorDetails(error));
    throw error;
  }
}

/**
 * Cambia la contraseña del usuario después de haber
 * verificado correctamente el código de recuperación.
 */
export async function updateRecoveredPassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    throw error;
  }

  /*
   * verifyOtp() creó una sesión para poder modificar
   * la contraseña.
   *
   * Como nuestro flujo termina volviendo al Login,
   * eliminamos únicamente esa sesión local.
   */
  const { error: signOutError } = await supabase.auth.signOut({
    scope: 'local',
  });

  if (signOutError) {
    throw signOutError;
  }

  return data;
}
