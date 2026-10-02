import { useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';

export function useAuthFlowArrival() {
  const { session, loading, clearAuthIntent } = useAuth();
  useEffect(() => {
    if (session && !loading) clearAuthIntent();
  }, [session, loading, clearAuthIntent]);
}
