import type { QueryClient, QueryKey } from '@tanstack/react-query';
import {
  ClassroomMaterialsQueryKey,
  classroomMaterialsApiConfig,
  ClassroomNotesQueryKey,
  classroomNotesApiConfig,
  MaterialsQueryKey,
  materialsApiConfig,
} from 'common.api';
import { getAxiosInstance } from 'common.config';
import type { ContentYDocItem } from 'common.types';

export type CollabRecoveryOutcome = 'refreshed' | 'denied' | 'cancelled';

export type CollabRecovery = {
  token: string;
  promise: Promise<CollabRecoveryOutcome>;
};

export type CollabSocket = {
  status: string;
  disconnect: () => void;
  connect: () => Promise<unknown> | unknown;
  on: (event: 'disconnect', handler: () => void) => void;
  off: (event: 'disconnect', handler: () => void) => void;
};

const DISCONNECTED = 'disconnected';
const CLOSE_WAIT_MS = 1000;

function isContentYDocItem(data: unknown): data is ContentYDocItem {
  if (!data || typeof data !== 'object') return false;
  const item = data as ContentYDocItem;
  return typeof item.content_token === 'string' && typeof item.ydoc_id === 'string';
}

function storageItemUrl(queryKey: QueryKey): string | null {
  const [kind, first, second] = queryKey;

  if (kind === MaterialsQueryKey.StorageItem && typeof first === 'string') {
    return materialsApiConfig[MaterialsQueryKey.StorageItem].getUrl(first);
  }

  if (
    kind === ClassroomMaterialsQueryKey.ClassroomStorageItem &&
    typeof first === 'string' &&
    typeof second === 'string'
  ) {
    return classroomMaterialsApiConfig[ClassroomMaterialsQueryKey.ClassroomStorageItem].getUrl(
      first,
      second,
    );
  }

  if (
    kind === ClassroomMaterialsQueryKey.ClassroomStorageItemStudent &&
    typeof first === 'string' &&
    typeof second === 'string'
  ) {
    return classroomMaterialsApiConfig[
      ClassroomMaterialsQueryKey.ClassroomStorageItemStudent
    ].getUrl(first, second);
  }

  if (kind === ClassroomNotesQueryKey.GetNoteStorageItem && typeof first === 'string') {
    return classroomNotesApiConfig[ClassroomNotesQueryKey.GetNoteStorageItem].getUrl(first);
  }

  return null;
}

function matchesRejectedToken(
  data: ContentYDocItem,
  rejectedToken: string,
  ydocId: string,
): boolean {
  if (rejectedToken && data.content_token === rejectedToken) return true;
  return Boolean(ydocId) && data.ydoc_id === ydocId;
}

/**
 * Повторно читает storage-item из кэша react-query и кладёт свежий content_token
 * обратно в кэш. Ошибка запроса кэш не трогает: открытая доска и редактор остаются на месте.
 * Возвращает токен только если он отличается от отклонённого.
 */
export async function fetchFreshContentToken(
  queryClient: QueryClient,
  { rejectedToken, ydocId }: { rejectedToken: string; ydocId: string },
): Promise<string | null> {
  if (!rejectedToken && !ydocId) return null;

  const matches = queryClient
    .getQueryCache()
    .findAll()
    .filter((query) => {
      if (!storageItemUrl(query.queryKey)) return false;
      const data = query.state.data;
      return isContentYDocItem(data) && matchesRejectedToken(data, rejectedToken, ydocId);
    });

  if (matches.length === 0) return null;

  let fresh: string | null = null;

  await Promise.all(
    matches.map(async (query) => {
      const url = storageItemUrl(query.queryKey);
      if (!url) return;

      try {
        const axiosInstance = await getAxiosInstance();
        const response = await axiosInstance({
          method: 'GET',
          url,
          headers: { 'Content-Type': 'application/json' },
        });
        const data: unknown = response.data;
        if (!isContentYDocItem(data)) return;
        if (!data.content_token || data.content_token === rejectedToken) return;

        queryClient.setQueryData(query.queryKey, data);
        fresh = data.content_token;
      } catch {
        // Кэш не обновляем: неуспешный refetch не должен размонтировать доску или редактор.
      }
    }),
  );

  return fresh;
}

function waitUntilDisconnected(socket: CollabSocket): Promise<void> {
  if (socket.status === DISCONNECTED) return Promise.resolve();

  return new Promise((resolve) => {
    const finish = () => {
      clearTimeout(timer);
      socket.off('disconnect', finish);
      resolve();
    };
    const timer = setTimeout(finish, CLOSE_WAIT_MS);
    socket.on('disconnect', finish);
  });
}

/**
 * Один отказ в доступе — одно восстановление. Повтор того же токена не открывает новый запрос.
 */
export function shareCollabRecovery(
  current: CollabRecovery | null,
  token: string,
  start: () => Promise<CollabRecoveryOutcome>,
): CollabRecovery {
  if (current?.token === token) return current;
  return { token, promise: start() };
}

/**
 * Hocuspocus 4.7 оставляет сокет открытым после PermissionDenied, а затем
 * переподключается с тем же токеном. Сначала гасим сокет, потом берём новый
 * content_token. Без нового токена соединение не поднимаем.
 */
export async function recoverCollabSocket({
  socket,
  rejectedToken,
  ydocId,
  applyToken,
  shouldReconnect,
  queryClient,
}: {
  socket: CollabSocket;
  rejectedToken: string;
  ydocId: string;
  applyToken: (token: string) => void;
  shouldReconnect: () => boolean;
  queryClient: QueryClient;
}): Promise<CollabRecoveryOutcome> {
  const closed = waitUntilDisconnected(socket);
  socket.disconnect();
  await closed;

  if (!shouldReconnect()) return 'cancelled';

  const fresh = await fetchFreshContentToken(queryClient, { rejectedToken, ydocId });

  if (!shouldReconnect()) return 'cancelled';
  if (!fresh) return 'denied';

  applyToken(fresh);
  if (!shouldReconnect()) return 'cancelled';

  await socket.connect();
  return 'refreshed';
}
