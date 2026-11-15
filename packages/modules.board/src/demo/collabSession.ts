import {
  HocuspocusProvider,
  HocuspocusProviderWebsocket,
  type onSyncedParameters,
  type onUnsyncedChangesParameters,
} from '@hocuspocus/provider';
import * as Y from 'yjs';

const SYNC_TIMEOUT_MS = 20_000;

const waitForSynced = (provider: HocuspocusProvider): Promise<void> => {
  if (provider.synced) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      provider.off('synced', onSynced);
      reject(new Error('collab-sync-timeout'));
    }, SYNC_TIMEOUT_MS);

    const onSynced = ({ state }: onSyncedParameters) => {
      if (!state) return;
      window.clearTimeout(timer);
      provider.off('synced', onSynced);
      resolve();
    };

    provider.on('synced', onSynced);
  });
};

const waitForSave = async (provider: HocuspocusProvider): Promise<void> => {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 50);
  });
  if (!provider.hasUnsyncedChanges) return;

  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      provider.off('unsyncedChanges', onChange);
      reject(new Error('collab-save-timeout'));
    }, SYNC_TIMEOUT_MS);

    const onChange = ({ number }: onUnsyncedChangesParameters) => {
      if (number !== 0) return;
      window.clearTimeout(timer);
      provider.off('unsyncedChanges', onChange);
      resolve();
    };

    provider.on('unsyncedChanges', onChange);
  });
};

export async function withCollabDocument<T>(
  args: { ydocId: string; contentToken: string },
  write: (yDoc: Y.Doc) => Promise<T> | T,
): Promise<T> {
  const yDoc = new Y.Doc();
  const hostUrl = import.meta.env.VITE_SERVER_URL_HOCUS ?? 'wss://hocus.sovlium.ru';
  const websocketProvider = new HocuspocusProviderWebsocket({
    url: hostUrl,
    autoConnect: false,
  });
  const provider = new HocuspocusProvider({
    name: args.ydocId,
    document: yDoc,
    token: args.contentToken,
    forceSyncInterval: 20_000,
    sessionAwareness: true,
    websocketProvider,
  });

  let rejectAuth: ((error: Error) => void) | null = null;
  const authFailed = new Promise<never>((_, reject) => {
    rejectAuth = reject;
  });
  const onAuthFailed = () => {
    rejectAuth?.(new Error('collab-auth-failed'));
  };
  provider.on('authenticationFailed', onAuthFailed);
  void authFailed.catch(() => undefined);

  try {
    provider.attach();
    void websocketProvider.connect();
    await Promise.race([waitForSynced(provider), authFailed]);
    const result = await write(yDoc);
    await Promise.race([waitForSave(provider), authFailed]);
    return result;
  } finally {
    rejectAuth = null;
    provider.off('authenticationFailed', onAuthFailed);
    try {
      provider.detach();
    } catch {
      // Соединение могло не успеть открыться.
    }
    try {
      provider.destroy();
    } catch {
      // Повторное уничтожение провайдера не мешает завершению.
    }
    try {
      websocketProvider.destroy();
    } catch {
      // Сокет уже закрыт.
    }
    yDoc.destroy();
  }
}
