import { createContext, ReactNode, useContext, useMemo } from 'react';
import { ExtendedStoreStatus, useYjsStore } from '../hooks/useYjsStore';
import { StorageItemT } from 'common.types';
import { DEMO_STORAGE_TOKEN, DEMO_YDOC_ID } from '../utils/yjsConstants';

type YjsContextType = ExtendedStoreStatus | null;

const YjsContext = createContext<YjsContextType>(null);

type YjsProviderProps = {
  children: ReactNode;
  storageItem?: StorageItemT;
  /** Если true — используются тестовые значения ydocId и storageToken */
  isDemo?: boolean;
};

export const useYjsContext = () => {
  const context = useContext(YjsContext);
  if (!context) {
    throw new Error('useYjsContext must be used within YjsProvider');
  }
  return context;
};

export const YjsProvider = ({ children, storageItem, isDemo = false }: YjsProviderProps) => {
  // Извлекаем примитивные значения для мемоизации
  const storageToken = isDemo ? DEMO_STORAGE_TOKEN : storageItem?.storage_token || '';
  const ydocId = isDemo ? DEMO_YDOC_ID : storageItem?.ydoc_id || '';

  // Мемоизируем параметры, чтобы избежать пересоздания провайдера
  // Используем примитивные значения напрямую в зависимостях
  // useMemo автоматически сравнивает зависимости по значению для примитивов
  const storeParams = useMemo(
    () => {
      if (import.meta.env?.DEV) {
        // Безопасное логирование чувствительных данных
        const maskToken = (token: string | undefined): string => {
          if (!token) return 'empty';
          if (token.length <= 6) return '***';
          return `${token.substring(0, 4)}...(${token.length})`;
        };
        const maskId = (id: string | undefined): string => {
          if (!id) return 'empty';
          if (id.length <= 10) return id.substring(0, 4) + '***';
          return `${id.substring(0, 8)}...(${id.length})`;
        };

        console.log('🔄 YjsProvider: пересоздание storeParams', {
          storageToken: maskToken(storageToken),
          ydocId: maskId(ydocId),
          isDemo,
        });
      }

      return {
        storageToken,
        ydocId,
        token: storageToken, // Передаем токен для asset store
      };
    },
    [storageToken, ydocId, isDemo], // Зависимости от примитивных значений
  );

  const yjsStore = useYjsStore(storeParams);

  // console.log('yjsStore', yjsStore);

  return <YjsContext.Provider value={yjsStore}>{children}</YjsContext.Provider>;
};
