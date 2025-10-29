import { ReactNode } from 'react';
import { useYjsStore } from '../hooks/useYjsStore';
import { YjsContext } from '../context/YjsContext';
import { StorageItemT } from 'common.types';

type YjsProviderProps = {
  children: ReactNode;
  data: StorageItemT;
};

export const YjsProvider = ({ children, data }: YjsProviderProps) => {
  const yjsStore = useYjsStore({
    ydocId: data.ydoc_id || '',
    storageToken: data.storage_token || '',
  });

  return <YjsContext.Provider value={yjsStore}>{children}</YjsContext.Provider>;
};
