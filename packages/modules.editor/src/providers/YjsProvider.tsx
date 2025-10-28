import { ReactNode } from 'react';
import { useYjsStore } from '../hooks/useYjsStore';
import { YjsContext } from '../context/YjsContext';
import { MaterialT } from 'common.types';

type YjsProviderProps = {
  children: ReactNode;
  data: MaterialT;
};

export const YjsProvider = ({ children }: YjsProviderProps) => {
  //data
  const documentName = '';

  const yjsStore = useYjsStore({
    documentName: documentName, // Используем editorId как fallback
  });

  return <YjsContext.Provider value={yjsStore}>{children}</YjsContext.Provider>;
};
