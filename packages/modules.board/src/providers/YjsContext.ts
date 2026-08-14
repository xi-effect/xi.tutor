import { createContext, useContext } from 'react';
import type { ExtendedStoreStatus } from '../hooks/useYjsStore';

export type YjsContextType = ExtendedStoreStatus | null;

export const YjsContext = createContext<YjsContextType>(null);

export const useYjsContext = () => {
  const context = useContext(YjsContext);
  if (!context) {
    throw new Error('useYjsContext must be used within YjsProvider');
  }
  return context;
};
