/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  HocuspocusProvider,
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
import { PdfShapeUtil } from '../shapes/pdf';
import { BOARD_SCHEMA_VERSION } from '../utils/yjsConstants';
import { generateUserColor } from '../utils/userColor';

type UseYjsStoreArgs = Partial<{
  hostUrl: string;
  ydocId: string;
  storageToken: string;
  shapeUtils: TLAnyShapeUtilConstructor[];
  token: string; // токен для asset store
}>;

type ConnectionStatus = 'online' | 'offline';

type StoreWithStatusExt = {
  status: TLStoreWithStatus['status'];
  store?: TLStore;
  error?: Error;
  connectionStatus?: ConnectionStatus;
};

/** Координаты камеры (viewport) для персиста — x, y, zoom (z) */
export type CameraState = { x: number; y: number; z: number };

export type ExtendedStoreStatus = {
  store: TLStore;
  status: TLStoreWithStatus['status'];
  error?: Error;
  connectionStatus?: ConnectionStatus;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isReadonly: boolean;
  toggleReadonly: () => void;
  /** ID своего presence (для фильтрации в списке коллабораторов). null до первой синхронизации. */
  myPresenceId: string | null;
  /** Последняя сохранённая камера текущего пользователя для этой доски (из Yjs meta) */
  getUserCamera: () => CameraState | undefined;
  /** Сохранить камеру текущего пользователя в Yjs meta (синхронизируется через Hocuspocus) */
  setUserCamera: (camera: CameraState) => void;
  /** Y.Map для хранения текущей страницы PDF по ключу `${shapeId}:${userId}` */
  pdfPagesMap: Y.Map<number>;
  /** Токен для доступа к файлам */
  token: string;
};

type PendingChanges = {
  added: Record<string, TLRecord>;
  updated: Record<string, TLRecord>;
  removed: Record<string, TLRecord>;
};

/**
 * В tldraw тип changes иногда уезжает в unknown (зависит от версии/сборки),
 * поэтому описываем минимально нужную форму и приводим к ней.
 */
type TLStoreChanges = {
  added: Record<string, TLRecord>;
  updated: Record<string, [TLRecord, TLRecord]>;
  removed: Record<string, TLRecord>;
};

const FLUSH_MS = 50;

/**
 * Throttle для awareness/presence (курсоры / presence).
 * 80ms ≈ 12.5Hz — плавно, но без спама.
 */
const PRESENCE_FLUSH_MS = 80;

/** =========================
 * Provider singleton registry
 * ========================= */
type ProviderKey = string;

type SharedEntry = {
  key: ProviderKey;
  refs: number;
  provider: HocuspocusProvider;
  yDoc: Y.Doc;
  yStore: YKeyValue<TLRecord>;
  meta: Y.Map<SerializedSchema | string>;
  readonlyMap: Y.Map<boolean>;
  /** Камеры по userId — каждый пользователь хранит свою последнюю позицию камеры (синхронизируется с сервером) */
  userCamerasMap: Y.Map<CameraState>;
  /** Текущие страницы PDF: ключ — `${shapeId}:${userId}`, значение — номер страницы */
  pdfPagesMap: Y.Map<number>;
  releaseTimer: number | null;
};

const shared = new Map<ProviderKey, SharedEntry>();

function makeKey(hostUrl: string, ydocId: string, storageToken: string) {
  return `${hostUrl}__${ydocId}__${storageToken}`;
}

function getOrCreateShared(hostUrl: string, ydocId: string, storageToken: string): SharedEntry {
  const key = makeKey(hostUrl, ydocId, storageToken);
  const existing = shared.get(key);

  if (existing) {
    existing.refs += 1;

    if (existing.releaseTimer != null) {
      clearTimeout(existing.releaseTimer);
      existing.releaseTimer = null;
    }

    return existing;
  }

  const yDoc = new Y.Doc({ gc: true });
  const yArr = yDoc.getArray<{ key: string; val: TLRecord }>(`tl_${ydocId}`);
  const yStore = new YKeyValue<TLRecord>(yArr);

  const meta = yDoc.getMap<SerializedSchema | string>('meta');
  meta.set('schemaVersion', BOARD_SCHEMA_VERSION);

  const readonlyMap = yDoc.getMap<boolean>('readonly');
  const userCamerasMap = yDoc.getMap<CameraState>('userCameras');
  const pdfPagesMap = yDoc.getMap<number>('pdfPages');

  const provider = new HocuspocusProvider({
    url: hostUrl,
    name: ydocId,
    document: yDoc,
    token: storageToken,
    forceSyncInterval: 20_000,
    // attach() / detach() управляем снаружи (в хуке + refCount)
  });

  const entry: SharedEntry = {
    key,
    refs: 1,
    provider,
    yDoc,
    yStore,
    meta,
    readonlyMap,
    userCamerasMap,
    pdfPagesMap,
    releaseTimer: null,
  };

  shared.set(key, entry);

  return entry;
}

function releaseShared(entry: SharedEntry) {
  entry.refs = Math.max(0, entry.refs - 1);

  if (entry.refs > 0) return;

  // debounce — чтобы StrictMode mount->cleanup->mount не рвал коннект
  entry.releaseTimer = window.setTimeout(() => {
    entry.releaseTimer = null;

    if (entry.refs > 0) return;

    try {
      entry.provider.detach();
    } catch {
      // ignore
    }

    try {
      entry.provider.destroy();
    } catch {
      // ignore
    }

    shared.delete(entry.key);
  }, 250);
}

/** =========================
 * Hook
 * ========================= */
export function useYjsStore({
  ydocId = '',
  storageToken = '',
  hostUrl = import.meta.env.VITE_SERVER_URL_HOCUS ?? 'wss://hocus.sovlium.ru',
  shapeUtils = [],
  token,
}: UseYjsStoreArgs): ExtendedStoreStatus {
  const { data: currentUser } = useCurrentUser();

  /** TLStore должен быть ОДИН и всегда один и тот же */
  const [store] = useState(() => {
    const assetStore = token ? myAssetStore(token) : undefined;

    return createTLStore({
      shapeUtils: [...defaultShapeUtils, PdfShapeUtil, ...shapeUtils],
      ...(assetStore ? { assets: assetStore } : {}),
    });
  });

  const undoManagerRef = useRef<Y.UndoManager | null>(null);
  const suppressSyncRef = useRef(false);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [serverReadonly, setServerReadonly] = useState(false);
  const [localReadonly, setLocalReadonly] = useState(false);

  const [storeWithStatus, setStoreWithStatus] = useState<StoreWithStatusExt>(() => ({
    status: 'loading',
    store,
    connectionStatus: 'offline',
  }));

  const [myPresenceId, setMyPresenceId] = useState<string | null>(null);

  /** batching store -> yjs */
  const pendingChangesRef = useRef<PendingChanges | null>(null);
  const flushTimeoutRef = useRef<number | null>(null);

  const sharedEntry = useMemo(() => {
    return getOrCreateShared(hostUrl, ydocId, storageToken);
  }, [hostUrl, ydocId, storageToken]);

  const { provider, yDoc, yStore, meta, readonlyMap, userCamerasMap, pdfPagesMap } = sharedEntry;

  useEffect(() => {
    setStoreWithStatus((prev) => ({ ...prev, status: 'loading', store }));

    // ВАЖНО: attach тут, а detach — ТОЛЬКО в releaseShared (когда refs = 0).
    // Иначе при 2 потребителях или StrictMode будет "чужой" cleanup ронять сокет.
    provider.attach();

    const unsubs: Array<() => void> = [];

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
      }, FLUSH_MS);
    };

    const handleAuthFailed = ({ reason }: onAuthenticationFailedParameters) => {
      setStoreWithStatus({
        status: 'error',
        store,
        error: new Error(`Authentication failed: ${reason}`),
        connectionStatus: 'offline',
      });

      if (reason === 'permission-denied') {
        toast('Ошибка доступа к серверу совместного редактирования');
      }
    };

    const handleAuthenticated = ({ scope }: onAuthenticatedParameters) => {
      const s = String(scope).toLowerCase();
      setServerReadonly(s === 'read-only' || s === 'readonly' || s === 'read_only');
    };

    provider.on('authenticationFailed', handleAuthFailed as any);
    provider.on('authenticated', handleAuthenticated as any);

    const handleStatus = ({ status }: onStatusParameters) => {
      if (status === WebSocketStatus.Disconnected) {
        setStoreWithStatus((prev) => ({ ...prev, connectionStatus: 'offline' }));
      }

      if (status === WebSocketStatus.Connected) {
        setStoreWithStatus((prev) => ({ ...prev, connectionStatus: 'online' }));
      }
    };

    provider.on('status', handleStatus as any);
    unsubs.push(() => provider.off('status', handleStatus as any));

    const handleSynced = ({ state }: onSyncedParameters) => {
      if (!state) return;

      /** 1) store -> yjs (батчинг) */
      unsubs.push(
        store.listen(
          ({ changes }) => {
            if (suppressSyncRef.current) return;

            if (!pendingChangesRef.current) {
              pendingChangesRef.current = { added: {}, updated: {}, removed: {} };
            }

            const pending = pendingChangesRef.current;
            const typedChanges = changes as unknown as TLStoreChanges;

            Object.values(typedChanges.added).forEach((r) => {
              pending.added[r.id] = r;
              delete pending.removed[r.id];
            });

            Object.values(typedChanges.updated).forEach(([, r]) => {
              pending.updated[r.id] = r;
            });

            Object.values(typedChanges.removed).forEach((r) => {
              delete pending.added[r.id];
              delete pending.updated[r.id];
              pending.removed[r.id] = r;
            });

            scheduleFlush();
          },
          { scope: 'document', source: 'user' },
        ),
      );

      /** 2) yjs -> store */
      const handleChange = (
        changes: Map<
          string,
          | { action: 'delete'; oldValue: TLRecord }
          | { action: 'update'; oldValue: TLRecord; newValue: TLRecord }
          | { action: 'add'; newValue: TLRecord }
        >,
        transaction: Y.Transaction,
      ) => {
        /**
         * ВАЖНО (фикс readonly):
         * Не фильтруем по transaction.local — сетевые апдейты могут применяться "локально"
         * в Y.Doc. Нам нужно отсечь только эхо своих store->yjs транзакций.
         */
        if (transaction.origin === 'user') return;

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

      /** 3) readonly (shared map) */
      const getReadonlyValue = () => readonlyMap.get('isReadonly') ?? false;
      const handleReadonlyChange = () => setLocalReadonly(getReadonlyValue());

      readonlyMap.observe(handleReadonlyChange);
      unsubs.push(() => readonlyMap.unobserve(handleReadonlyChange));
      setLocalReadonly(getReadonlyValue());

      /** 4) awareness/presence */
      const awareness = provider.awareness;

      if (awareness) {
        const yClientId = awareness.clientID.toString();
        const userName =
          currentUser?.display_name || currentUser?.username || defaultUserPreferences.name;
        const userColor = generateUserColor(currentUser?.id?.toString() || yClientId);

        setUserPreferences({ id: yClientId, name: userName, color: userColor });

        const userPreferences = computed<{ id: string; color: string; name: string }>(
          'userPreferences',
          () => {
            const u = getUserPreferences();
            return {
              id: u.id,
              color: u.color ?? userColor,
              name: u.name ?? userName,
            };
          },
        );

        const presenceId = InstancePresenceRecordType.createId(yClientId);
        setMyPresenceId(presenceId);
        const presenceDerivation = createPresenceStateDerivation(
          userPreferences,
          presenceId,
        )(store);

        // ==== LOCAL presence batching (throttle + last-value-wins) ====
        let presenceTimer: number | null = null;
        let pendingPresence: TLInstancePresence | null = null;

        const enrichPresenceWithBackendId = (p: TLInstancePresence): TLInstancePresence => {
          const backendId = currentUser?.id;
          if (backendId == null) return p;
          return {
            ...p,
            meta: { ...(p.meta ?? {}), backendUserId: String(backendId) },
          };
        };

        const flushPresence = () => {
          presenceTimer = null;

          if (!pendingPresence) return;

          const presenceToSend = enrichPresenceWithBackendId(pendingPresence);
          awareness.setLocalStateField('presence', presenceToSend);
          // Свою presence кладём и в store, чтобы свой аватар отображался в CollaboratorAvatars
          store.put([presenceToSend]);
          pendingPresence = null;
        };

        const schedulePresence = (next: TLInstancePresence | null | undefined) => {
          if (!next) return;

          pendingPresence = next;

          if (presenceTimer != null) return;

          presenceTimer = window.setTimeout(() => {
            flushPresence();
          }, PRESENCE_FLUSH_MS);
        };

        // initial push (сразу, чтобы другие сразу увидели и свой аватар был в store)
        const initialPresence = presenceDerivation.get();
        if (initialPresence) {
          const initialEnriched = enrichPresenceWithBackendId(initialPresence);
          awareness.setLocalStateField('presence', initialEnriched);
          store.put([initialEnriched]);
        }

        // Повторная отправка presence через 2 с (когда currentUser уже мог подгрузиться), чтобы у других отображалась аватарка
        const retryPresenceTimer = window.setTimeout(() => {
          const p = presenceDerivation.get();
          if (p) {
            const enriched = enrichPresenceWithBackendId(p);
            awareness.setLocalStateField('presence', enriched);
            store.put([enriched]);
          }
        }, 2000);
        unsubs.push(() => clearTimeout(retryPresenceTimer));

        // подписка на изменения presence в store
        unsubs.push(
          react('when presence changes', () => {
            const presence = presenceDerivation.get();
            schedulePresence(presence);
          }),
        );

        // cleanup local presence batching
        unsubs.push(() => {
          if (presenceTimer != null) clearTimeout(presenceTimer);
          presenceTimer = null;
          pendingPresence = null;
        });

        // ==== REMOTE presence batching (raf) ====
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
      }

      /** 5) initial seed / migrate */
      if (yStore.yarray.length) {
        const ourSchema = store.schema.serialize();
        const theirSchema = meta.get('schema') as SerializedSchema | undefined;

        if (!theirSchema) {
          throw new Error('No schema found in the yjs doc');
        }

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

      /** 6) undo manager */
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

    provider.on('synced', handleSynced as any);
    unsubs.push(() => provider.off('synced', handleSynced as any));

    return () => {
      if (flushTimeoutRef.current != null) {
        clearTimeout(flushTimeoutRef.current);
        flushTimeoutRef.current = null;
      }

      pendingChangesRef.current = null;

      unsubs.forEach((fn) => fn());

      provider.off('authenticationFailed', handleAuthFailed as any);
      provider.off('authenticated', handleAuthenticated as any);

      // ВАЖНО: НЕТ provider.detach() здесь!
      // detach/destroy делаем только когда refs упадет в 0 (releaseShared).
      releaseShared(sharedEntry);
    };
  }, [provider, yDoc, yStore, meta, readonlyMap, store, currentUser, sharedEntry]);

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

  function toggleReadonly() {
    const newReadonly = !(readonlyMap.get('isReadonly') ?? false);
    setLocalReadonly(newReadonly);

    yDoc.transact(() => {
      readonlyMap.set('isReadonly', newReadonly);
    }, 'readonly-toggle');

    toast.success(newReadonly ? 'Доска заблокирована!' : 'Доска разблокирована!');
  }

  function getUserCamera(): CameraState | undefined {
    const id = currentUser?.id?.toString();
    if (!id) return undefined;
    const v = userCamerasMap.get(id);
    if (typeof v !== 'object' || !v || !('x' in v) || !('y' in v) || !('z' in v)) return undefined;
    return v as CameraState;
  }

  function setUserCamera(camera: CameraState) {
    const id = currentUser?.id?.toString();
    if (!id) return;
    yDoc.transact(() => {
      userCamerasMap.set(id, camera);
    }, 'user-camera');
  }

  const finalIsReadonly = serverReadonly || localReadonly;

  return {
    store,
    status: storeWithStatus.status,
    error: storeWithStatus.error,
    connectionStatus: storeWithStatus.connectionStatus,

    undo,
    redo,
    canUndo,
    canRedo,

    toggleReadonly,
    isReadonly: finalIsReadonly,

    myPresenceId,
    getUserCamera,
    setUserCamera,

    pdfPagesMap,
    token: token ?? '',
  };
}
