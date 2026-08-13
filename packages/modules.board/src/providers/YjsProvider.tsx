import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useYjsStore } from '../hooks/useYjsStore';
import { YjsContext } from './YjsContext';
import { StorageItemT } from 'common.types';
import { LoadingScreen } from 'common.ui';
import { DEMO_STORAGE_TOKEN, DEMO_YDOC_ID } from '../utils/yjsConstants';
import { ydocIdFromBoardDumpFilename } from '../utils/parseYjsBoardDoc';
import i18n from 'i18next';

export { useYjsContext } from './YjsContext';

type YjsProviderProps = {
  children: ReactNode;
  storageItem?: StorageItemT;
  /** Если true — используются тестовые значения ydocId и storageToken */
  isDemo?: boolean;
  cachedYdocId?: string;
  initialYjsUpdate?: Uint8Array;
  cacheBoardId?: string;
  cacheUserId?: string;
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

export const YjsProvider = ({
  children,
  storageItem,
  isDemo = false,
  cachedYdocId,
  initialYjsUpdate,
  cacheBoardId,
  cacheUserId,
}: YjsProviderProps) => {
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
          throw new Error(
            i18n.t('provider.ydocLoadFailed', {
              ns: 'board',
              status: res.status,
              statusText: res.statusText,
            }),
          );
        }

        const buf = await res.arrayBuffer();
        const ydocId =
          localDumpYdocIdEnv ??
          ydocIdFromBoardDumpFilename(localDumpUrl) ??
          storageItem?.ydoc_id ??
          '';

        if (!ydocId) {
          throw new Error(i18n.t('provider.localYdocRequired', { ns: 'board' }));
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
  const ydocId =
    localDump?.ydocId ?? (isDemo ? DEMO_YDOC_ID : storageItem?.ydoc_id || cachedYdocId || '');
  const cacheUpdate =
    !localDump &&
    initialYjsUpdate?.length &&
    cachedYdocId &&
    (!storageItem?.ydoc_id || storageItem.ydoc_id === cachedYdocId)
      ? initialYjsUpdate
      : undefined;

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
      initialYjsUpdate: localDump?.update ?? cacheUpdate,
      localYjsPreview: Boolean(localDump) || isDemo,
      cacheBoardId,
      cacheUserId,
    };
  }, [storageToken, ydocId, isDemo, localDump, cacheUpdate, cacheBoardId, cacheUserId]);

  if (useLocalDump && !localDump && !localDumpError) {
    return <LoadingScreen />;
  }

  if (localDumpError) {
    return (
      <div className="text-text-danger flex h-full w-full items-center justify-center p-6 text-center text-sm">
        {localDumpError.message}
      </div>
    );
  }

  return (
    <YjsProviderStore key={ydocId} storeParams={storeParams}>
      {children}
    </YjsProviderStore>
  );
};
