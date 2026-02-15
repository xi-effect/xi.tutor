import { ReactNode } from 'react';
import { useYjsStore } from '../hooks/useYjsStore';
import { YjsContext } from '../context/YjsContext';
import { StorageItemT } from 'common.types';

type YjsProviderProps = {
  children: ReactNode;
  data: StorageItemT;
};

const DEMO_YDOC_ID = 'test/demo-room';
const DEMO_STORAGE_TOKEN = 'test/demo-room';

export const YjsProvider = ({ children, data }: YjsProviderProps) => {
  const isDemo = import.meta.env.DEV && !data.ydoc_id;
  const yjsStore = useYjsStore({
    hostUrl: import.meta.env.VITE_SERVER_URL_HOCUS ?? 'wss://hocus.sovlium.ru',
    ydocId: isDemo ? DEMO_YDOC_ID : data.ydoc_id || '',
    storageToken: isDemo ? DEMO_STORAGE_TOKEN : data.storage_token || '',
    storageItem: data,
  });

  return <YjsContext.Provider value={yjsStore}>{children}</YjsContext.Provider>;
};
