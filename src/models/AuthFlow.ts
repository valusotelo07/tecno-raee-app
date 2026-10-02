export type AuthIntent = 'application' | 'invitations';

export function parseAuthIntent(value: string | string[] | undefined): AuthIntent | null {
  return typeof value === 'string' && ['application', 'invitations'].includes(value)
    ? (value as AuthIntent)
    : null;
}

// Intent records where the user was going. Supabase permissions still decide access.
export function authDestination(intent: AuthIntent) {
  return intent === 'application' ? '/company-application' : '/company-invitations';
}

export function authRoute(pathname: '/login' | '/register', intent: AuthIntent | null) {
  return { pathname, params: intent ? { intent } : {} };
}
