/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  HocuspocusProvider,
  HocuspocusProviderWebsocket,
  WebSocketStatus,
  type onAuthenticatedParameters,
  type onAuthenticationFailedParameters,
  type onStatusParameters,
  type onSyncedParameters,
} from '@hocuspocus/provider';
import { useCurrentUser } from 'common.services';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  computed,
  createPresenceStateDerivation,
  createTLStore,
  defaultShapeUtils,
  defaultUserPreferences,
  getUserPreferences,
  InstancePresenceRecordType,
  loadSnapshot,
  react,
  SerializedSchema,
  setUserPreferences,
  TLAnyShapeUtilConstructor,
  TLInstancePresence,
  TLRecord,
  TLStore,
  TLStoreWithStatus,
} from 'tldraw';
import { YKeyValue } from 'y-utility/y-keyvalue';
import * as Y from 'yjs';
import { myAssetStore } from '../features/imageStore';
import { BOARD_SCHEMA_VERSION } from '../utils/yjsConstants';
import { maskId, maskToken, maskUrl } from '../utils/maskSensitiveData';
import {
  createProviderInstance,
  getOrCreateProfile,
  getProfile,
  logProviderEvent,
  updateProfile,
} from '../utils/yjsProfiling';
import { generateUserColor } from '../utils/userColor';

type UseYjsStoreArgs = Partial<{
  hostUrl: string;
  ydocId: string;
  storageToken: string;
  version: number;
  shapeUtils: TLAnyShapeUtilConstructor[];
  token: string; // Токен для asset store
}>;

type ConnectionStatus = 'online' | 'offline';
type StoreWithStatusExt = TLStoreWithStatus & { connectionStatus?: ConnectionStatus };

export type ExtendedStoreStatus = {
  store?: TLStore;
  status: TLStoreWithStatus['status'];
  error?: Error;
  connectionStatus?: ConnectionStatus;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isReadonly: boolean;
  toggleReadonly: () => void;
};

type PendingChanges = {
  added: Record<string, TLRecord>;
  updated: Record<string, TLRecord>;
  removed: Record<string, TLRecord>;
};

/**
 * ========= Shared WebSocket (v3) =========
 * В v3 connect/disconnect делаются на websocketProvider, а provider нужно attach/detach.
 * В DEV (StrictMode) эффекты вызываются дважды: mount -> cleanup -> mount.
 * Если на cleanup мы делаем detach/destroy — рукопожатие не успевает отправить hocuspocus frames,
 * сервер будет видеть только "Upgrading connection …".
 *
 * Поэтому:
 *  - шарим websocketProvider по hostUrl
 *  - refCount для потребителей
 *  - disconnect делаем с небольшой задержкой (debounce), чтобы StrictMode успел перемонтировать
 *  - detach/destroy provider тоже делаем с debounce и отменой
 */
type SharedSocketEntry = {
  socket: HocuspocusProviderWebsocket;
  refs: number;
  disconnectTimer: number | null;
  attachedProviders: Set<HocuspocusProvider>;
};

const sharedSockets = new Map<string, SharedSocketEntry>();

function getSharedSocket(hostUrl: string): SharedSocketEntry {
  const existing = sharedSockets.get(hostUrl);
  if (existing) return existing;

  const socket = new HocuspocusProviderWebsocket({
    url: hostUrl,
    autoConnect: false,
    messageReconnectTimeout: 20_000,
  });

  const entry: SharedSocketEntry = {
    socket,
    refs: 0,
    disconnectTimer: null,
    attachedProviders: new Set(),
  };
  sharedSockets.set(hostUrl, entry);
  return entry;
}

function retainSocket(entry: SharedSocketEntry) {
  entry.refs += 1;

  if (entry.disconnectTimer != null) {
    clearTimeout(entry.disconnectTimer);
    entry.disconnectTimer = null;
  }
}

function releaseSocket(entry: SharedSocketEntry, hostUrl: string) {
  entry.refs = Math.max(0, entry.refs - 1);

  if (entry.refs > 0) return;

  // debounce disconnect, чтобы StrictMode не рвал соединение между "двумя монтами"
  entry.disconnectTimer = window.setTimeout(() => {
    entry.disconnectTimer = null;

    if (entry.refs > 0) return;
    if (entry.attachedProviders.size > 0) return;

    try {
      entry.socket.disconnect();
    } catch {
      // ignore
    }

    try {
      entry.socket.destroy();
    } catch {
      // ignore
    }

    sharedSockets.delete(hostUrl);
  }, 200);
}

/**
 * Debounced provider cleanup (защита от StrictMode):
 * cleanup откладываем, а при повторном mount — отменяем.
 */
const providerCleanupTimers = new WeakMap<HocuspocusProvider, number>();

function cancelProviderCleanup(provider: HocuspocusProvider) {
  const t = providerCleanupTimers.get(provider);
  if (t != null) {
    clearTimeout(t);
    providerCleanupTimers.delete(provider);
  }
}

function scheduleProviderCleanup(
  provider: HocuspocusProvider,
  socketEntry: SharedSocketEntry,
  websocketProvider: HocuspocusProviderWebsocket,
  instanceId: number,
) {
  cancelProviderCleanup(provider);

  const timer = window.setTimeout(() => {
    providerCleanupTimers.delete(provider);

    // DETACH (симметрично attach)
    if (socketEntry.attachedProviders.has(provider)) {
      socketEntry.attachedProviders.delete(provider);
      try {
        websocketProvider.detach(provider);
      } catch {
        // ignore
      }
      logProviderEvent(instanceId, 'DETACH provider <- websocketProvider (debounced)', {
        attachedCount: socketEntry.attachedProviders.size,
      });
    }

    // destroy провайдера — только после debounce
    try {
      provider.destroy();
    } catch {
      // ignore
    }
  }, 250);

  providerCleanupTimers.set(provider, timer);
}

export function useYjsStore({
  ydocId = '',
  storageToken = '',
  hostUrl = import.meta.env.VITE_SERVER_URL_HOCUS,
  shapeUtils = [],
  token,
}: UseYjsStoreArgs): ExtendedStoreStatus {
  const { data: currentUser } = useCurrentUser();

  /* ---------- TLStore (локальный) ---------- */
  const [store] = useState(() => {
    const assetStore = token ? myAssetStore(token) : undefined;

    return createTLStore({
      shapeUtils: [...defaultShapeUtils, ...shapeUtils],
      ...(assetStore ? { assets: assetStore } : {}),
    });
  });

  /* ---------- Undo/Redo refs & flags ---------- */
  const undoManagerRef = useRef<Y.UndoManager | null>(null);
  const suppressSyncRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  /* ---------- Readonly state ---------- */
  const [isReadonly, setIsReadonly] = useState(false);
  const [serverReadonly, setServerReadonly] = useState(false);

  /* ---------- Статус ---------- */
  const [storeWithStatus, setStoreWithStatus] = useState<StoreWithStatusExt>({
    status: 'loading',
  });

  /* ---------- Отслеживание предыдущих значений зависимостей ---------- */
  const prevDepsRef = useRef<{ hostUrl?: string; ydocId?: string; storageToken?: string }>({});

  /* ---------- BATCHING: буфер изменений store -> Yjs ---------- */
  const pendingChangesRef = useRef<PendingChanges | null>(null);
  const flushTimeoutRef = useRef<number | null>(null);

  /* ---------- Yjs структуры + провайдер (v3.4.4) ---------- */
  const { yDoc, yStore, meta, readonlyMap, provider, socketEntry, instanceId } = useMemo(() => {
    const instanceId = createProviderInstance();

    const changedDeps: string[] = [];
    if (prevDepsRef.current.hostUrl !== hostUrl) changedDeps.push('hostUrl');
    if (prevDepsRef.current.ydocId !== ydocId) changedDeps.push('ydocId');
    if (prevDepsRef.current.storageToken !== storageToken) changedDeps.push('storageToken');
    prevDepsRef.current = { hostUrl, ydocId, storageToken };

    logProviderEvent(instanceId, 'СОЗДАНИЕ ПРОВАЙДЕРА (v3)', {
      hostUrl: maskUrl(hostUrl),
      ydocId: maskId(ydocId),
      storageToken: maskToken(storageToken),
      причина:
        changedDeps.length > 0
          ? `изменение зависимостей: ${changedDeps.join(', ')}`
          : 'useMemo пересоздание (зависимости не изменились)',
      всегоСоздано: instanceId,
    });

    const yDoc = new Y.Doc({ gc: true });
    const yArr = yDoc.getArray<{ key: string; val: TLRecord }>(`tl_${ydocId}`);
    const yStore = new YKeyValue(yArr);

    const meta = yDoc.getMap<SerializedSchema | string>('meta');
    meta.set('schemaVersion', BOARD_SCHEMA_VERSION);

    const readonlyMap = yDoc.getMap<boolean>('readonly');

    const socketEntry = getSharedSocket(hostUrl);

    const provider = new HocuspocusProvider({
      name: ydocId,
      document: yDoc,
      websocketProvider: socketEntry.socket,
      token: storageToken,
      forceSyncInterval: 20_000,

      onAuthenticationFailed: ({ reason }: onAuthenticationFailedParameters) => {
        logProviderEvent(instanceId, 'ОШИБКА АУТЕНТИФИКАЦИИ', { reason });

        setStoreWithStatus({
          status: 'error',
          error: new Error(`Authentication failed: ${reason}`),
          connectionStatus: 'offline',
        });

        if (reason === 'permission-denied') {
          toast('Ошибка доступа к серверу совместного редактирования');
        }
      },

      onAuthenticated: ({ scope }: onAuthenticatedParameters) => {
        setServerReadonly(scope === 'readonly');
        logProviderEvent(instanceId, 'АУТЕНТИФИКАЦИЯ УСПЕШНА', { scope });
      },
    });

    getOrCreateProfile(instanceId);

    return { yDoc, yStore, meta, readonlyMap, provider, socketEntry, instanceId };
  }, [hostUrl, ydocId, storageToken]);

  const isConnectingRef = useRef(false);
  const hasConnectedRef = useRef(false);

  const providerRef = useRef(provider);
  providerRef.current = provider;

  useEffect(() => {
    const profile = getProfile(instanceId);
    const currentProvider = providerRef.current;
    const websocketProvider = socketEntry.socket;

    // ВАЖНО: отменяем возможный debounced cleanup для этого provider (StrictMode ре-маунт)
    cancelProviderCleanup(currentProvider);

    // refcount socket (важно для StrictMode)
    retainSocket(socketEntry);

    const flushPendingChanges = () => {
      const pending = pendingChangesRef.current;
      if (!pending) return;

      pendingChangesRef.current = null;

      yDoc.transact(() => {
        Object.values(pending.added).forEach((r) => yStore.set(r.id, r));
        Object.values(pending.updated).forEach((r) => yStore.set(r.id, r));
        Object.values(pending.removed).forEach((r) => yStore.delete(r.id));
      }, 'user');
    };

    const scheduleFlush = () => {
      if (flushTimeoutRef.current != null) return;
      flushTimeoutRef.current = window.setTimeout(() => {
        flushTimeoutRef.current = null;
        flushPendingChanges();
      }, 25);
    };

    const effectKey = `effect-${instanceId}`;

    logProviderEvent(instanceId, 'ВЫЗОВ useEffect (v3)', {
      effectKey,
      websocketStatus: websocketProvider.status,
      hasCalledConnect: profile?.hasCalledConnect,
      alreadyConnected: hasConnectedRef.current,
    });

    /**
     * ✅ КРИТИЧНО: attach до/вместе с connect.
     * Если attach слетает в StrictMode cleanup — сервер будет видеть только "Upgrading connection …"
     */
    if (!socketEntry.attachedProviders.has(currentProvider)) {
      socketEntry.attachedProviders.add(currentProvider);
      websocketProvider.attach(currentProvider);
      logProviderEvent(instanceId, 'ATTACH provider -> websocketProvider', {
        attachedCount: socketEntry.attachedProviders.size,
      });
    }

    /**
     * Connect делаем только при реальном Disconnected.
     * Если уже connecting/connected — не дергаем.
     */
    const shouldConnect =
      !profile?.hasCalledConnect &&
      !isConnectingRef.current &&
      websocketProvider.status === WebSocketStatus.Disconnected;

    if (shouldConnect) {
      isConnectingRef.current = true;

      updateProfile(instanceId, {
        hasCalledConnect: true,
        connectCount: (getProfile(instanceId)?.connectCount || 0) + 1,
        lastConnectTime: Date.now(),
      });

      setStoreWithStatus({ status: 'loading' });

      logProviderEvent(instanceId, 'ВЫЗОВ websocketProvider.connect()', {
        websocketStatus: websocketProvider.status,
      });

      websocketProvider.connect();
    }

    const unsubs: Array<() => void> = [];

    const handleSynced = ({ state }: onSyncedParameters) => {
      logProviderEvent(instanceId, 'СОБЫТИЕ synced', { state });
      if (!state) return;

      /* ========== DOCUMENT: store -> yDoc (С БАТЧИНГОМ) ========== */
      unsubs.push(
        store.listen(
          ({ changes }) => {
            if (suppressSyncRef.current) return;

            if (!pendingChangesRef.current) {
              pendingChangesRef.current = { added: {}, updated: {}, removed: {} };
            }

            const pending = pendingChangesRef.current;

            Object.values(changes.added).forEach((r) => {
              pending.added[r.id] = r;
              delete pending.removed[r.id];
            });

            Object.values(changes.updated).forEach(([_, r]) => {
              pending.updated[r.id] = r;
            });

            Object.values(changes.removed).forEach((r) => {
              delete pending.added[r.id];
              delete pending.updated[r.id];
              pending.removed[r.id] = r;
            });

            scheduleFlush();
          },
          { source: 'user', scope: 'document' },
        ),
      );

      /* ========== DOCUMENT: yDoc -> store ========== */
      const handleChange = (
        changes: Map<
          string,
          | { action: 'delete'; oldValue: TLRecord }
          | { action: 'update'; oldValue: TLRecord; newValue: TLRecord }
          | { action: 'add'; newValue: TLRecord }
        >,
        transaction: Y.Transaction,
      ) => {
        if (transaction.local && transaction.origin !== undoManagerRef.current) return;

        const toRemove: TLRecord['id'][] = [];
        const toPut: TLRecord[] = [];

        changes.forEach((change, id) => {
          if (change.action === 'delete') {
            toRemove.push(id as TLRecord['id']);
          } else {
            const record = yStore.get(id);
            if (record) toPut.push(record);
          }
        });

        store.mergeRemoteChanges(() => {
          if (toRemove.length) store.remove(toRemove);
          if (toPut.length) store.put(toPut);
        });
      };

      yStore.on('change', handleChange);
      unsubs.push(() => yStore.off('change', handleChange));

      /* ========== READONLY (shared map) ========== */
      const getReadonlyValue = () => readonlyMap.get('isReadonly') ?? false;
      const handleReadonlyChange = () => setIsReadonly(getReadonlyValue());

      readonlyMap.observe(handleReadonlyChange);
      unsubs.push(() => readonlyMap.unobserve(handleReadonlyChange));
      setIsReadonly(getReadonlyValue());

      /* ========== AWARENESS ========== */
      const awareness = currentProvider.awareness;
      if (!awareness) return;

      const yClientId = awareness.clientID.toString();
      const userName =
        currentUser?.display_name || currentUser?.username || defaultUserPreferences.name;
      const userColor = generateUserColor(currentUser?.id?.toString() || yClientId);

      setUserPreferences({
        id: yClientId,
        name: userName,
        color: userColor,
      });

      const userPreferences = computed<{ id: string; color: string; name: string }>(
        'userPreferences',
        () => {
          const user = getUserPreferences();
          return {
            id: user.id,
            color: user.color ?? userColor,
            name: user.name ?? userName,
          };
        },
      );

      const presenceId = InstancePresenceRecordType.createId(yClientId);
      const presenceDerivation = createPresenceStateDerivation(userPreferences, presenceId)(store);

      awareness.setLocalStateField('presence', presenceDerivation.get());

      unsubs.push(
        react('when presence changes', () => {
          const presence = presenceDerivation.get();
          requestAnimationFrame(() => {
            awareness.setLocalStateField('presence', presence);
          });
        }),
      );

      type PresenceState = { presence?: TLInstancePresence };
      type AwarenessChange = { added: number[]; updated: number[]; removed: number[] };

      let rafId: number | null = null;

      const pendingRemote = {
        toPut: new Map<string, TLInstancePresence>(),
        toRemove: new Set<string>(),
      };

      const flushRemotePresence = () => {
        rafId = null;

        const toRemove = Array.from(pendingRemote.toRemove) as TLInstancePresence['id'][];
        const toPut = Array.from(pendingRemote.toPut.values());

        pendingRemote.toPut.clear();
        pendingRemote.toRemove.clear();

        if (!toRemove.length && !toPut.length) return;

        store.mergeRemoteChanges(() => {
          if (toRemove.length) store.remove(toRemove);
          if (toPut.length) store.put(toPut);
        });
      };

      const scheduleFlushRemote = () => {
        if (rafId != null) return;
        rafId = requestAnimationFrame(flushRemotePresence);
      };

      const onAwarenessChange = ({ added, updated, removed }: AwarenessChange) => {
        const states = awareness.getStates() as Map<number, PresenceState>;

        for (const clientId of [...added, ...updated]) {
          if (clientId.toString() === yClientId) continue;

          const st = states.get(clientId);
          const remotePresence = st?.presence;

          if (remotePresence && remotePresence.id !== presenceId) {
            pendingRemote.toPut.set(remotePresence.id, remotePresence);
            pendingRemote.toRemove.delete(remotePresence.id);
          }
        }

        for (const clientId of removed) {
          const id = InstancePresenceRecordType.createId(clientId.toString());
          pendingRemote.toRemove.add(id);
          pendingRemote.toPut.delete(id);
        }

        scheduleFlushRemote();
      };

      awareness.on('change', onAwarenessChange);
      unsubs.push(() => awareness.off('change', onAwarenessChange));

      unsubs.push(() => {
        if (rafId != null) cancelAnimationFrame(rafId);
        rafId = null;
        pendingRemote.toPut.clear();
        pendingRemote.toRemove.clear();
      });

      /* ========== INITIAL SEED ========== */
      if (yStore.yarray.length) {
        const ourSchema = store.schema.serialize();
        const theirSchema = meta.get('schema') as SerializedSchema | undefined;
        if (!theirSchema) throw new Error('No schema found in the yjs doc');

        const records = yStore.yarray.toJSON().map(({ val }) => val);

        const migrationResult = store.schema.migrateStoreSnapshot({
          schema: theirSchema,
          store: Object.fromEntries(records.map((r) => [r.id, r])),
        });

        if (migrationResult.type === 'error') {
          console.warn('Schema updated, refresh.');
          return;
        }

        yDoc.transact(() => {
          for (const r of records) {
            if (!migrationResult.value[r.id]) yStore.delete(r.id);
          }
          for (const r of Object.values(migrationResult.value) as TLRecord[]) {
            yStore.set(r.id, r);
          }
          meta.set('schema', ourSchema);
        }, 'init');

        loadSnapshot(store, { store: migrationResult.value, schema: ourSchema });
      } else {
        yDoc.transact(() => {
          for (const rec of store.allRecords()) yStore.set(rec.id, rec);
          meta.set('schema', store.schema.serialize());
        }, 'init');
      }

      /* ========== UNDO MANAGER ========== */
      if (!undoManagerRef.current) {
        undoManagerRef.current = new Y.UndoManager(yStore.yarray, {
          captureTimeout: 300,
          trackedOrigins: new Set(['user', null]),
        });

        const um = undoManagerRef.current;
        const updateFlags = () => {
          setCanUndo(um.canUndo());
          setCanRedo(um.canRedo());
        };

        um.on('stack-item-added', updateFlags);
        um.on('stack-item-popped', updateFlags);
        um.on('stack-cleared', updateFlags);
        updateFlags();

        unsubs.push(() => {
          um.off('stack-item-added', updateFlags);
          um.off('stack-item-popped', updateFlags);
          um.off('stack-cleared', updateFlags);
        });
      }

      setStoreWithStatus({
        store,
        status: 'synced-remote',
        connectionStatus: 'online',
      });
    };

    currentProvider.on('synced', handleSynced);
    unsubs.push(() => currentProvider.off('synced', handleSynced));

    const handleStatus = ({ status }: onStatusParameters) => {
      const prof = getProfile(instanceId);
      if (prof) {
        updateProfile(instanceId, {
          statusChanges: [...prof.statusChanges, { status, timestamp: Date.now() }],
        });
      }

      logProviderEvent(instanceId, `ИЗМЕНЕНИЕ СТАТУСА (v3): ${status}`, {
        websocketStatus: status,
      });

      if (status === WebSocketStatus.Disconnected) {
        hasConnectedRef.current = false;
        isConnectingRef.current = false;

        setStoreWithStatus((prev) => ({
          ...prev,
          connectionStatus: 'offline',
        }));
        return;
      }

      if (status === WebSocketStatus.Connected) {
        hasConnectedRef.current = true;
        isConnectingRef.current = false;

        setStoreWithStatus((prev) => ({
          ...prev,
          connectionStatus: 'online',
        }));
      }
    };

    currentProvider.on('status', handleStatus);
    unsubs.push(() => currentProvider.off('status', handleStatus));

    return () => {
      logProviderEvent(instanceId, 'ОЧИСТКА useEffect (v3)', {
        unsubs: unsubs.length,
        wasConnected: hasConnectedRef.current,
      });

      isConnectingRef.current = false;

      if (flushTimeoutRef.current != null) {
        clearTimeout(flushTimeoutRef.current);
        flushTimeoutRef.current = null;
      }
      pendingChangesRef.current = null;

      // Снимаем подписки сразу (чтобы при ре-маунте не было дублей обработчиков)
      unsubs.forEach((fn) => fn());

      // ✅ Самое важное: НЕ делать detach/destroy сразу —
      // иначе StrictMode убивает рукопожатие Hocuspocus.
      // Через 250ms таймер сработает, если cancelProviderCleanup не отменит его.
      scheduleProviderCleanup(currentProvider, socketEntry, websocketProvider, instanceId);

      // Отпускаем общий сокет (releaseSocket имеет свой debounce 200ms)
      releaseSocket(socketEntry, hostUrl);
    };
  }, [yDoc, store, yStore, meta, readonlyMap, currentUser, instanceId, socketEntry, hostUrl]);

  /* ---------- Public Undo/Redo API ---------- */
  function undo() {
    const um = undoManagerRef.current;
    if (!um?.canUndo()) return;

    suppressSyncRef.current = true;
    try {
      um.undo();
    } finally {
      suppressSyncRef.current = false;
    }

    setCanUndo(um.canUndo());
    setCanRedo(um.canRedo());
  }

  function redo() {
    const um = undoManagerRef.current;
    if (!um?.canRedo()) return;

    suppressSyncRef.current = true;
    try {
      um.redo();
    } finally {
      suppressSyncRef.current = false;
    }

    setCanUndo(um.canUndo());
    setCanRedo(um.canRedo());
  }

  /* ---------- Public Readonly API ---------- */
  function toggleReadonly() {
    const newReadonly = !isReadonly;
    setIsReadonly(newReadonly);

    yDoc.transact(() => {
      readonlyMap.set('isReadonly', newReadonly);
    }, 'readonly-toggle');

    toast.success(newReadonly ? 'Доска заблокирована!' : 'Доска разблокирована!');
  }

  const finalIsReadonly = serverReadonly || isReadonly;

  return {
    ...storeWithStatus,
    undo,
    redo,
    canUndo,
    canRedo,
    toggleReadonly,
    isReadonly: finalIsReadonly,
  };
}
