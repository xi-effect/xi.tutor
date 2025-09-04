import { useParams } from '@tanstack/react-router';
import { useGetMaterial } from 'common.services';
import { createContext, ReactNode, useContext } from 'react';
import { ExtendedStoreStatus, useYjsStore } from '../hooks/useYjsStore';

type YjsContextType = ExtendedStoreStatus | null;

const YjsContext = createContext<YjsContextType>(null);

type YjsProviderProps = {
  children: ReactNode;
};

export const useYjsContext = () => {
  const context = useContext(YjsContext);
  if (!context) {
    throw new Error('useYjsContext must be used within YjsProvider');
  }
  return context;
};

export const YjsProvider = ({ children }: YjsProviderProps) => {
  const { boardId = 'empty' } = useParams({ strict: false });
  const { data } = useGetMaterial(boardId);

  const yjsStore = useYjsStore({
    roomId: data?.ydoc_id,
  });

  return <YjsContext.Provider value={yjsStore}>{children}</YjsContext.Provider>;
};
