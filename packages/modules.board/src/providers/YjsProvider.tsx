import { createContext, ReactNode, useContext } from 'react';
import { ExtendedStoreStatus, useYjsStore } from '../hooks/useYjsStore';
import { StorageItemT } from 'common.types';

type YjsContextType = ExtendedStoreStatus | null;

const YjsContext = createContext<YjsContextType>(null);

type YjsProviderProps = {
  children: ReactNode;
  storageItem: StorageItemT;
};

export const useYjsContext = () => {
  const context = useContext(YjsContext);
  if (!context) {
    throw new Error('useYjsContext must be used within YjsProvider');
  }
  return context;
};

export const YjsProvider = ({ children, storageItem }: YjsProviderProps) => {
  const yjsStore = useYjsStore({
    storageToken: storageItem?.storage_token || '',
    ydocId: storageItem?.ydoc_id || '',
    token: storageItem?.storage_token || '', // Передаем токен для asset store
  });

  return <YjsContext.Provider value={yjsStore}>{children}</YjsContext.Provider>;
};
