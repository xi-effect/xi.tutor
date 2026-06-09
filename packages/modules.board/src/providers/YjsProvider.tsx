import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { ExtendedStoreStatus, useYjsStore } from '../hooks/useYjsStore';
import { StorageItemT } from 'common.types';
import { LoadingScreen } from 'common.ui';
import { DEMO_STORAGE_TOKEN, DEMO_YDOC_ID } from '../utils/yjsConstants';
import { ydocIdFromBoardDumpFilename } from '../utils/parseYjsBoardDoc';

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

type LocalYjsPreviewState = {
  update: Uint8Array;
  ydocId: string;
};

type YjsProviderStoreProps = {
  children: ReactNode;
  storeParams: Parameters<typeof useYjsStore>[0];
};

/** Отдельный компонент: useYjsStore нельзя вызывать после условного return в родителе. */
function YjsProviderStore({ children, storeParams }: YjsProviderStoreProps) {
  const yjsStore = useYjsStore(storeParams);
  return <YjsContext.Provider value={yjsStore}>{children}</YjsContext.Provider>;
}

export const YjsProvider = ({ children, storageItem, isDemo = false }: YjsProviderProps) => {
  const localDumpUrl = import.meta.env.VITE_BOARD_LOCAL_YDOC_URL as string | undefined;
  const localDumpYdocIdEnv = import.meta.env.VITE_BOARD_LOCAL_YDOC_ID as string | undefined;
  const useLocalDump = import.meta.env.DEV && Boolean(localDumpUrl);

  const [localDump, setLocalDump] = useState<LocalYjsPreviewState | null>(null);
  const [localDumpError, setLocalDumpError] = useState<Error | null>(null);

  useEffect(() => {
    if (!useLocalDump || !localDumpUrl) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(localDumpUrl);
        if (!res.ok) {
          throw new Error(`Не удалось загрузить Y.Doc: ${res.status} ${res.statusText}`);
        }

        const buf = await res.arrayBuffer();
        const ydocId =
          localDumpYdocIdEnv ??
          ydocIdFromBoardDumpFilename(localDumpUrl) ??
          storageItem?.ydoc_id ??
          '';

        if (!ydocId) {
          throw new Error(
            'Задайте VITE_BOARD_LOCAL_YDOC_ID или имя файла board-{uuid} в URL дампа',
          );
        }

        if (!cancelled) {
          setLocalDump({ update: new Uint8Array(buf), ydocId });
        }
      } catch (err) {
        if (!cancelled) {
          setLocalDumpError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [useLocalDump, localDumpUrl, localDumpYdocIdEnv, storageItem?.ydoc_id]);

  // Извлекаем примитивные значения для мемоизации
  const storageToken = isDemo ? DEMO_STORAGE_TOKEN : storageItem?.storage_token || '';
  const ydocId = localDump?.ydocId ?? (isDemo ? DEMO_YDOC_ID : storageItem?.ydoc_id || '');

  // Мемоизируем параметры, чтобы избежать пересоздания провайдера
  const storeParams = useMemo(() => {
    if (import.meta.env?.DEV) {
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
        localYjsPreview: Boolean(localDump),
      });
    }

    return {
      hostUrl: import.meta.env.VITE_SERVER_URL_HOCUS ?? 'wss://hocus.sovlium.ru',
      storageToken,
      ydocId,
      token: storageToken,
      initialYjsUpdate: localDump?.update,
      localYjsPreview: Boolean(localDump),
    };
  }, [storageToken, ydocId, isDemo, localDump]);

  if (useLocalDump && !localDump && !localDumpError) {
    return <LoadingScreen />;
  }

  if (localDumpError) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm text-red-600">
        {localDumpError.message}
      </div>
    );
  }

  return <YjsProviderStore storeParams={storeParams}>{children}</YjsProviderStore>;
};
