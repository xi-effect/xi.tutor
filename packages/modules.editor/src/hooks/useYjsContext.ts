import { useContext } from 'react';
import { YjsContext } from '../context/YjsContext';
import { UseCollaborativeTiptapReturn } from './useYjsStore';

export const useYjsContext = (): UseCollaborativeTiptapReturn => {
  const context = useContext(YjsContext);
  if (!context) {
    throw new Error('useYjsContext must be used within YjsProvider');
  }
  return context;
};
