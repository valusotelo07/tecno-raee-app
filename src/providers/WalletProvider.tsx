import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { usePortalData } from '@/hooks/usePortalData';
import { getDeliveryBalance } from '@/services/delivery.service';
import type { DeliveryBalance } from '@/models/Delivery';
type Wallet = {
  data: DeliveryBalance | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};
const WalletContext = createContext<Wallet | null>(null);
export function WalletProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { user } = useAuth();
  const userId = user?.id;
  const loader = useCallback(
    () => (userId ? getDeliveryBalance() : Promise.resolve(null)),
    [userId]
  );
  const result = usePortalData(loader);
  return <WalletContext.Provider value={result}>{children}</WalletContext.Provider>;
}
export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('WalletProvider no está disponible.');
  return context;
}
