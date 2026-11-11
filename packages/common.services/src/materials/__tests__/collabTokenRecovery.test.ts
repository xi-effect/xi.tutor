import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClassroomMaterialsQueryKey, MaterialsQueryKey, materialsApiConfig } from 'common.api';

vi.mock('common.config', () => ({
  getAxiosInstance: vi.fn(),
}));

import { getAxiosInstance } from 'common.config';
import {
  fetchFreshContentToken,
  recoverCollabSocket,
  shareCollabRecovery,
  type CollabSocket,
} from '../collabTokenRecovery';

const axiosMock = vi.fn();

function createSocket(): CollabSocket & { connects: number; disconnects: number } {
  let onDisconnect: (() => void) | undefined;
  const socket = {
    status: 'connected',
    connects: 0,
    disconnects: 0,
    disconnect() {
      this.disconnects += 1;
      this.status = 'disconnected';
      onDisconnect?.();
    },
    connect() {
      this.connects += 1;
      this.status = 'connected';
    },
    on(_event: 'disconnect', handler: () => void) {
      onDisconnect = handler;
    },
    off() {
      onDisconnect = undefined;
    },
  };
  return socket;
}

describe('fetchFreshContentToken', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    vi.mocked(getAxiosInstance).mockResolvedValue(axiosMock as never);
  });

  it('запрашивает storage-item и кладёт в кэш только новый токен', async () => {
    const queryClient = new QueryClient();
    const queryKey = [MaterialsQueryKey.StorageItem, 'material-1'];
    queryClient.setQueryData(queryKey, {
      ydoc_id: 'doc-1',
      content_token: 'expired',
    });
    axiosMock.mockResolvedValue({
      data: { ydoc_id: 'doc-1', content_token: 'fresh' },
    });

    await expect(
      fetchFreshContentToken(queryClient, { rejectedToken: 'expired', ydocId: 'doc-1' }),
    ).resolves.toBe('fresh');

    expect(axiosMock).toHaveBeenCalledTimes(1);
    expect(axiosMock.mock.calls[0][0].url).toBe(
      materialsApiConfig[MaterialsQueryKey.StorageItem].getUrl('material-1'),
    );
    expect(queryClient.getQueryData(queryKey)).toEqual({
      ydoc_id: 'doc-1',
      content_token: 'fresh',
    });
  });

  it('не трогает кэш и не переподключается тем же токеном, если сервер не выдал новый', async () => {
    const queryClient = new QueryClient();
    const queryKey = [ClassroomMaterialsQueryKey.ClassroomStorageItem, 'room-1', 'board-1'];
    queryClient.setQueryData(queryKey, {
      ydoc_id: 'doc-1',
      content_token: 'expired',
    });
    axiosMock.mockResolvedValue({
      data: { ydoc_id: 'doc-1', content_token: 'expired' },
    });

    await expect(
      fetchFreshContentToken(queryClient, { rejectedToken: 'expired', ydocId: 'doc-1' }),
    ).resolves.toBeNull();
    expect(queryClient.getQueryData(queryKey)).toEqual({
      ydoc_id: 'doc-1',
      content_token: 'expired',
    });
  });

  it('при ошибке запроса оставляет прежний ответ в кэше', async () => {
    const queryClient = new QueryClient();
    const queryKey = [MaterialsQueryKey.StorageItem, 'material-1'];
    const cached = { ydoc_id: 'doc-1', content_token: 'expired' };
    queryClient.setQueryData(queryKey, cached);
    axiosMock.mockRejectedValue(new Error('403'));

    await expect(
      fetchFreshContentToken(queryClient, { rejectedToken: 'expired', ydocId: 'doc-1' }),
    ).resolves.toBeNull();
    expect(queryClient.getQueryData(queryKey)).toEqual(cached);
  });

  it('не запрашивает чужие query', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(['Materials', 'list'], {
      ydoc_id: 'doc-1',
      content_token: 'expired',
    });

    await expect(
      fetchFreshContentToken(queryClient, { rejectedToken: 'expired', ydocId: 'doc-1' }),
    ).resolves.toBeNull();
    expect(axiosMock).not.toHaveBeenCalled();
  });
});

describe('recoverCollabSocket', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    vi.mocked(getAxiosInstance).mockResolvedValue(axiosMock as never);
  });

  it('закрывает сокет и открывает его заново только с новым токеном', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData([MaterialsQueryKey.StorageItem, 'material-1'], {
      ydoc_id: 'doc-1',
      content_token: 'expired',
    });
    axiosMock.mockResolvedValue({
      data: { ydoc_id: 'doc-1', content_token: 'fresh' },
    });
    const socket = createSocket();
    const applied: string[] = [];

    await expect(
      recoverCollabSocket({
        socket,
        rejectedToken: 'expired',
        ydocId: 'doc-1',
        applyToken: (token) => applied.push(token),
        shouldReconnect: () => true,
        queryClient,
      }),
    ).resolves.toBe('refreshed');

    expect(socket.disconnects).toBe(1);
    expect(applied).toEqual(['fresh']);
    expect(socket.connects).toBe(1);
  });

  it('после отказа без нового токена сокет остаётся закрытым', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData([MaterialsQueryKey.StorageItem, 'material-1'], {
      ydoc_id: 'doc-1',
      content_token: 'expired',
    });
    axiosMock.mockRejectedValue(new Error('403'));
    const socket = createSocket();

    await expect(
      recoverCollabSocket({
        socket,
        rejectedToken: 'expired',
        ydocId: 'doc-1',
        applyToken: () => {
          throw new Error('token must stay unchanged');
        },
        shouldReconnect: () => true,
        queryClient,
      }),
    ).resolves.toBe('denied');

    expect(socket.disconnects).toBe(1);
    expect(socket.connects).toBe(0);
  });

  it('не поднимает сокет, если экран уже закрыт', async () => {
    const queryClient = new QueryClient();
    const socket = createSocket();

    await expect(
      recoverCollabSocket({
        socket,
        rejectedToken: 'expired',
        ydocId: 'doc-1',
        applyToken: () => undefined,
        shouldReconnect: () => false,
        queryClient,
      }),
    ).resolves.toBe('cancelled');

    expect(socket.connects).toBe(0);
    expect(axiosMock).not.toHaveBeenCalled();
  });
});

describe('shareCollabRecovery', () => {
  it('повтор того же токена не запускает второе восстановление', async () => {
    const start = vi.fn(() => Promise.resolve('denied' as const));
    const first = shareCollabRecovery(null, 'expired', start);
    const second = shareCollabRecovery(first, 'expired', start);

    expect(second).toBe(first);
    expect(start).toHaveBeenCalledTimes(1);
    await expect(second.promise).resolves.toBe('denied');
  });
});
