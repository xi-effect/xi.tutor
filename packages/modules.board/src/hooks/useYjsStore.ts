/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { HocuspocusProvider } from '@hocuspocus/provider';
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

export type ExtendedStoreStatus = {
  store?: TLStore;
  status: TLStoreWithStatus['status'];
  error?: Error;
  connectionStatus?: 'online' | 'offline';
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isReadonly: boolean;
  toggleReadonly: () => void;
};

export function useYjsStore({
  ydocId = 'test/demo-room',
  storageToken = 'test/demo-room',
  hostUrl = 'ws://localhost:1234',
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
  const suppressSyncRef = useRef(false); // защита от эха
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  /* ---------- Readonly state ---------- */
  const [isReadonly, setIsReadonly] = useState<boolean>(false);
  const [serverReadonly, setServerReadonly] = useState<boolean>(false);

  /* ---------- Статус ---------- */
  const [storeWithStatus, setStoreWithStatus] = useState<TLStoreWithStatus>({
    status: 'loading',
  });

  /* ---------- Отслеживание предыдущих значений зависимостей ---------- */
  const prevDepsRef = useRef<{
    hostUrl?: string;
    ydocId?: string;
    storageToken?: string;
  }>({});

  /* ---------- BATChING: буфер изменений store -> Yjs ---------- */
  const pendingChangesRef = useRef<{
    added: Record<string, TLRecord>;
    updated: Record<string, TLRecord>;
    removed: Record<string, TLRecord>;
  } | null>(null);

  const flushTimeoutRef = useRef<number | null>(null);

  /* ---------- Yjs структуры + провайдер ---------- */
  const { yDoc, yStore, meta, room, readonlyMap, instanceId } = useMemo(() => {
    const instanceId = createProviderInstance();
    const createdAt = Date.now();

    // Определяем, какие зависимости изменились
    const changedDeps: string[] = [];
    if (prevDepsRef.current.hostUrl !== hostUrl) {
      changedDeps.push('hostUrl');
    }
    if (prevDepsRef.current.ydocId !== ydocId) {
      changedDeps.push('ydocId');
    }
    if (prevDepsRef.current.storageToken !== storageToken) {
      changedDeps.push('storageToken');
    }

    // Сохраняем текущие значения
    prevDepsRef.current = { hostUrl, ydocId, storageToken };

    // Предупреждение о частых пересозданиях
    if (instanceId > 1) {
      const previousProfile = getProfile(instanceId - 1);
      if (previousProfile) {
        const timeSinceLast = createdAt - previousProfile.createdAt;
        if (timeSinceLast < 5000) {
          console.warn(
            `⚠️ КРИТИЧНО: Провайдер пересоздан через ${Math.round(timeSinceLast)}мс! ` +
              `Это может указывать на проблему с зависимостями useMemo.`,
          );
          console.warn(
            `📋 Изменившиеся зависимости:`,
            changedDeps.length > 0 ? changedDeps : 'НЕТ (возможно, объект пересоздан)',
          );
          if (changedDeps.includes('storageToken')) {
            console.warn(
              `⚠️ storageToken изменился! ` +
                `Предыдущее: ${maskToken(prevDepsRef.current.storageToken)} ` +
                `Новое: ${maskToken(storageToken)}`,
            );
          }
        }
      }
    }

    // logProviderEvent(instanceId, 'СОЗДАНИЕ ПРОВАЙДЕРА', {
    //   hostUrl: maskUrl(hostUrl),
    //   ydocId: maskId(ydocId),
    //   storageToken: maskToken(storageToken),
    //   причина:
    //     changedDeps.length > 0
    //       ? `изменение зависимостей: ${changedDeps.join(', ')}`
    //       : 'useMemo пересоздание (зависимости не изменились)',
    //   зависимостей: `[hostUrl, ydocId, storageToken]`,
    //   всегоСоздано: instanceId,
    //   изменившиесяЗависимости: changedDeps,
    // });

    const yDoc = new Y.Doc({ gc: true });
    const yArr = yDoc.getArray<{ key: string; val: TLRecord }>(`tl_${ydocId}`);
    const yStore = new YKeyValue(yArr);
    const meta = yDoc.getMap<SerializedSchema | string>('meta');
    meta.set('schemaVersion', BOARD_SCHEMA_VERSION);
    const readonlyMap = yDoc.getMap<boolean>('readonly');

    const room = new HocuspocusProvider({
      url: hostUrl,
      name: ydocId,
      document: yDoc,
      token: storageToken,
      forceSyncInterval: 20000,
      onAuthenticationFailed: ({ reason }) => {
        if (reason === 'permission-denied') {
          toast('Ошибка доступа к серверу совместного редактирования');
          console.error('hocuspocus: permission-denied');
        } else {
          console.error('hocuspocus: authentication failed', reason);
        }
      },
      onAuthenticated: ({ scope }) => {
        setServerReadonly(scope === 'readonly');
      },
    });

    room.on('connect', () => {
      setStoreWithStatus({
        store,
        status: 'synced-remote',
        connectionStatus: 'online',
      });
    });

    // Инициализация профиля
    getOrCreateProfile(instanceId);

    return { yDoc, yStore, meta, room, readonlyMap, instanceId };
  }, [hostUrl, ydocId, storageToken]);

  /* ---------- Защита от повторных подключений ---------- */
  const isConnectingRef = useRef(false);
  const hasConnectedRef = useRef(false);
  const roomRef = useRef(room);

  // Обновляем ref при изменении room (но не вызываем эффект)
  roomRef.current = room;

  /* ---------- Главный эффект ---------- */
  useEffect(() => {
    const profile = getProfile(instanceId);
    const currentRoom = roomRef.current;

    // Функции батчинга привязаны к конкретному yDoc/yStore данного эффекта
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

      // 25 мс — фиксированный интервал батчинга
      flushTimeoutRef.current = window.setTimeout(() => {
        flushTimeoutRef.current = null;
        flushPendingChanges();
      }, 25);
    };

    // Защита от React Strict Mode двойного вызова
    // Используем только instanceId для ключа, чтобы эффект не пересоздавался при изменении статуса
    // const effectKey = `effect-${instanceId}`;

    // logProviderEvent(instanceId, 'ВЫЗОВ useEffect', {
    //   причина: 'изменение зависимостей',
    //   зависимости: {
    //     room: !!currentRoom,
    //     yDoc: !!yDoc,
    //     store: !!store,
    //     currentUser: !!currentUser,
    //   },
    //   ужеПодключался: hasConnectedRef.current,
    //   hasCalledConnect: profile?.hasCalledConnect,
    //   effectKey,
    //   примечание: import.meta.env?.DEV
    //     ? 'В dev режиме React Strict Mode может вызывать эффекты дважды - это нормально'
    //     : undefined,
    // });

    // КРИТИЧНО: Проверяем, был ли уже вызван connect() для этого экземпляра провайдера
    // Этот флаг НЕ сбрасывается в cleanup, поэтому защищает от повторных вызовов в React Strict Mode
    // НО: мы все равно регистрируем обработчики событий, чтобы они работали
    const shouldConnect =
      !profile?.hasCalledConnect && !isConnectingRef.current && !hasConnectedRef.current;

    if (shouldConnect) {
      // Устанавливаем флаг подключения СРАЗУ, до всех остальных операций
      isConnectingRef.current = true;

      // КРИТИЧНО: Устанавливаем флаг, что connect() был вызван для этого экземпляра
      // Этот флаг НЕ сбрасывается в cleanup, поэтому защищает от повторных вызовов
      updateProfile(instanceId, {
        hasCalledConnect: true,
        connectCount: (getProfile(instanceId)?.connectCount || 0) + 1,
        lastConnectTime: Date.now(),
      });

      setStoreWithStatus({ status: 'loading' });

      // logProviderEvent(instanceId, 'ВЫЗОВ room.connect()', {
      //   текущийСтатус: currentRoom.status,
      //   ужеПодключен: currentRoom.isConnected,
      // });

      currentRoom.connect();
    } else {
      // logProviderEvent(instanceId, 'ПРОПУСК connect()', {
      //   причина: profile?.hasCalledConnect
      //     ? 'connect() уже был вызван для этого экземпляра провайдера'
      //     : isConnectingRef.current
      //       ? 'уже идет процесс подключения'
      //       : 'провайдер уже подключен',
      //   текущийСтатус: currentRoom.status,
      //   effectKey,
      // });
    }

    const unsubs: (() => void)[] = [];

    function handleSync() {
      const profile = getProfile(instanceId);
      if (profile) {
        updateProfile(instanceId, {
          syncedEvents: profile.syncedEvents + 1,
        });
      }

      // logProviderEvent(instanceId, 'СОБЫТИЕ synced', {
      //   всегоSynced: profile?.syncedEvents || 0,
      // });

      /* ========== DOCUMENT: store -> yDoc (С БАТЧИНГОМ) ========== */
      unsubs.push(
        store.listen(
          ({ changes }) => {
            if (suppressSyncRef.current) return;

            if (!pendingChangesRef.current) {
              pendingChangesRef.current = {
                added: {},
                updated: {},
                removed: {},
              };
            }

            const pending = pendingChangesRef.current;

            // Добавленные
            Object.values(changes.added).forEach((r) => {
              pending.added[r.id] = r;
              delete pending.removed[r.id];
            });

            // Обновлённые
            Object.values(changes.updated).forEach(([_, r]) => {
              pending.updated[r.id] = r;
            });

            // Удалённые
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
        // Пропускаем локальные НЕ undo/redo транзакции
        if (transaction.local && transaction.origin !== undoManagerRef.current) {
          return;
        }

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

      /* ========== READONLY ========== */
      const getReadonlyValue = () => readonlyMap.get('isReadonly') ?? false;
      const handleReadonlyChange = () => setIsReadonly(getReadonlyValue());

      readonlyMap.observe(handleReadonlyChange);
      unsubs.push(() => readonlyMap.unobserve(handleReadonlyChange));

      setIsReadonly(getReadonlyValue());

      /* ========== AWARENESS ========== */
      if (!currentRoom.awareness) return;

      const yClientId = currentRoom.awareness.clientID.toString();
      const userName =
        currentUser?.display_name || currentUser?.username || defaultUserPreferences.name;
      const userColor = generateUserColor(currentUser?.id?.toString() || yClientId);

      setUserPreferences({
        id: yClientId,
        name: userName,
        color: userColor,
      });

      const userPreferences = computed<{
        id: string;
        color: string;
        name: string;
      }>('userPreferences', () => {
        const user = getUserPreferences();
        return {
          id: user.id,
          color: user.color ?? userColor,
          name: user.name ?? userName,
        };
      });

      const presenceId = InstancePresenceRecordType.createId(yClientId);
      const presenceDerivation = createPresenceStateDerivation(userPreferences, presenceId)(store);

      currentRoom.setAwarenessField('presence', presenceDerivation.get());

      unsubs.push(
        react('when presence changes', () => {
          const presence = presenceDerivation.get();
          requestAnimationFrame(() => {
            currentRoom.setAwarenessField('presence', presence);
          });
        }),
      );

      const handleAwarenessUpdate = (update: {
        added: number[];
        updated: number[];
        removed: number[];
      }) => {
        const states = currentRoom.awareness!.getStates() as Map<
          number,
          { presence: TLInstancePresence }
        >;

        const toRemove: TLInstancePresence['id'][] = [];
        const toPut: TLInstancePresence[] = [];

        for (const id of update.added.concat(update.updated)) {
          const st = states.get(id);
          if (st?.presence && st.presence.id !== presenceId) {
            toPut.push(st.presence);
          }
        }
        for (const id of update.removed) {
          toRemove.push(InstancePresenceRecordType.createId(id.toString()));
        }

        store.mergeRemoteChanges(() => {
          if (toRemove.length) store.remove(toRemove);
          if (toPut.length) store.put(toPut);
        });
      };

      currentRoom.awareness.on('update', handleAwarenessUpdate);
      unsubs.push(() => currentRoom.awareness?.off('update', handleAwarenessUpdate));

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

      /* ========== UNDO MANAGER (после seed) ========== */
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
    }

    /* ========== SERVER READONLY (from Hocuspocus v3: AuthorizedScope) ========== */
    const checkServerReadonly = () => {
      setServerReadonly(currentRoom.authorizedScope === 'readonly');
    };

    let hasConnectedBefore = false;
    function handleStatusChange({ status }: { status: 'disconnected' | 'connected' }) {
      const profile = getProfile(instanceId);
      if (profile) {
        const statusChanges = [...profile.statusChanges, { status, timestamp: Date.now() }];
        const updates: Partial<typeof profile> = {
          statusChanges,
        };
        if (status === 'disconnected') {
          updates.disconnectCount = profile.disconnectCount + 1;
          updates.lastDisconnectTime = Date.now();
          hasConnectedRef.current = false;
          isConnectingRef.current = false;
        }
        updateProfile(instanceId, updates);
      }

      // logProviderEvent(instanceId, `ИЗМЕНЕНИЕ СТАТУСА: ${status}`, {
      //   былоПодключений: hasConnectedBefore,
      //   всегоИзмененийСтатуса: profile?.statusChanges.length || 0,
      // });

      if (status === 'disconnected') {
        setStoreWithStatus({
          store,
          status: 'synced-remote',
          connectionStatus: 'offline',
        });
        return;
      }

      currentRoom.off('synced', handleSync);
      if (status === 'connected') {
        // Устанавливаем флаги при успешном подключении
        hasConnectedRef.current = true;
        isConnectingRef.current = false;

        checkServerReadonly();
        if (hasConnectedBefore) {
          // logProviderEvent(instanceId, 'ПОВТОРНОЕ ПОДКЛЮЧЕНИЕ (пропуск handleSync)', {
          //   предупреждение: 'handleSync уже был зарегистрирован ранее',
          // });
          return;
        }
        hasConnectedBefore = true;
        currentRoom.on('synced', handleSync);
        unsubs.push(() => currentRoom.off('synced', handleSync));
      }
    }

    currentRoom.on('status', handleStatusChange);
    unsubs.push(() => currentRoom.off('status', handleStatusChange));

    const handleSynced = () => {
      // logProviderEvent(instanceId, 'СОБЫТИЕ synced (второй обработчик)', {
      //   примечание: 'проверка readonly',
      // });
      checkServerReadonly();
    };
    currentRoom.on('synced', handleSynced);
    unsubs.push(() => currentRoom.off('synced', handleSynced));

    return () => {
      // logProviderEvent(instanceId, 'ОЧИСТКА useEffect', {
      //   количествоПодписок: unsubs.length,
      //   будетОтключен: true,
      //   былПодключен: hasConnectedRef.current,
      // });

      // Сбрасываем флаги
      isConnectingRef.current = false;

      // Чистим таймер батчинга и буфер
      if (flushTimeoutRef.current != null) {
        clearTimeout(flushTimeoutRef.current);
        flushTimeoutRef.current = null;
      }
      pendingChangesRef.current = null;

      // Отключаем провайдер при очистке только если он был подключен
      if (hasConnectedRef.current) {
        // logProviderEvent(instanceId, 'ОТКЛЮЧЕНИЕ ПРОВАЙДЕРА', {
        //   причина: 'cleanup useEffect',
        // });
        currentRoom.disconnect();
        hasConnectedRef.current = false;
      }

      unsubs.forEach((fn) => fn());
    };
  }, [yDoc, store, yStore, meta, readonlyMap, currentUser, instanceId]);

  /* ---------- Public Undo/Redo API ---------- */
  function undo() {
    const um = undoManagerRef.current;
    if (!um?.canUndo()) return;
    suppressSyncRef.current = true;
    try {
      um.undo(); // производит локальную транзакцию с origin === um
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

  // Объединяем readonly с сервера и локальный readonly
  // Если сервер установил readonly, это имеет приоритет
  const finalIsReadonly = serverReadonly || isReadonly;

  return {
    ...storeWithStatus,
    connectionStatus: (storeWithStatus as any).connectionStatus,
    undo,
    redo,
    canUndo,
    canRedo,
    toggleReadonly,
    isReadonly: finalIsReadonly,
  };
}
