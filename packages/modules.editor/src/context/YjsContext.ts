import { createContext } from 'react';
import { UseCollaborativeTiptapReturn } from '../hooks/useYjsStore';

type YjsContextType = UseCollaborativeTiptapReturn | null;

export const YjsContext = createContext<YjsContextType>(null);
