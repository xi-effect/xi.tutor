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

/* ---------- Цвет по ID ---------- */
function generateUserColor(userId: string): string {
  const hash = Array.from(userId).reduce((h, c) => c.charCodeAt(0) + ((h << 5) - h), 0);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

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
  hostUrl = 'wss://hocus.sovlium.ru',
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

  /* ---------- Yjs структуры + провайдер ---------- */
  const { yDoc, yStore, meta, room, readonlyMap } = useMemo(() => {
    const yDoc = new Y.Doc({ gc: true });
    const yArr = yDoc.getArray<{ key: string; val: TLRecord }>(`tl_${ydocId}`);
    const yStore = new YKeyValue(yArr);
    const meta = yDoc.getMap<SerializedSchema>('meta');
    const readonlyMap = yDoc.getMap<boolean>('readonly');

    const room = new HocuspocusProvider({
      url: hostUrl,
      name: ydocId,
      document: yDoc,
      token: storageToken,
      connect: false,
      forceSyncInterval: 20000,
      onAuthenticationFailed: (data) => {
        if (data.reason === 'permission-denied') {
          toast('Ошибка доступа к серверу совместного редактирования');
          console.error('hocuspocus: permission-denied');
        } else {
          console.error('hocuspocus: unknown error', data);
        }
      },
      onAuthenticated: () => {
        setTimeout(() => {
          const authorizedScope = (room as any).authorizedScope;
          const isReadOnly =
            authorizedScope === 'read' ||
            authorizedScope === 'readonly' ||
            (typeof authorizedScope === 'string' &&
              authorizedScope.includes('read') &&
              !authorizedScope.includes('write'));
          setServerReadonly(isReadOnly);
        }, 100);
      },
    });

    return { yDoc, yStore, meta, room, readonlyMap };
  }, [hostUrl, ydocId, storageToken]);

  /* ---------- Главный эффект ---------- */
  useEffect(() => {
    setStoreWithStatus({ status: 'loading' });
    room.connect();

    const unsubs: (() => void)[] = [];

    function handleSync() {
      /* ========== DOCUMENT: store -> yDoc ========== */
      unsubs.push(
        store.listen(
          ({ changes }) => {
            if (suppressSyncRef.current) return;
            yDoc.transact(
              () => {
                Object.values(changes.added).forEach((r) => yStore.set(r.id, r));
                Object.values(changes.updated).forEach(([_, r]) => yStore.set(r.id, r));
                Object.values(changes.removed).forEach((r) => yStore.delete(r.id));
              },
              'user', // origin: локальные пользовательские изменения
            );
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
      if (!room.awareness) return;

      const yClientId = room.awareness.clientID.toString();
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

      room.awareness.setLocalStateField('presence', presenceDerivation.get());

      unsubs.push(
        react('when presence changes', () => {
          const presence = presenceDerivation.get();
          requestAnimationFrame(() => {
            room.awareness?.setLocalStateField('presence', presence);
          });
        }),
      );

      const handleAwarenessUpdate = (update: {
        added: number[];
        updated: number[];
        removed: number[];
      }) => {
        const states = room.awareness!.getStates() as Map<number, { presence: TLInstancePresence }>;

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

      room.awareness.on('update', handleAwarenessUpdate);
      unsubs.push(() => room.awareness?.off('update', handleAwarenessUpdate));

      /* ========== INITIAL SEED ========== */
      if (yStore.yarray.length) {
        const ourSchema = store.schema.serialize();
        const theirSchema = meta.get('schema');
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

        store.loadSnapshot({
          store: migrationResult.value,
          schema: ourSchema,
        });
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

    /* ========== SERVER READONLY (from Hocuspocus) ========== */
    const checkServerReadonly = () => {
      const authorizedScope = (room as any).authorizedScope;
      const isReadOnly =
        authorizedScope === 'read' ||
        authorizedScope === 'readonly' ||
        (typeof authorizedScope === 'string' &&
          authorizedScope.includes('read') &&
          !authorizedScope.includes('write'));
      setServerReadonly(isReadOnly);
    };

    let hasConnectedBefore = false;
    function handleStatusChange({ status }: { status: 'disconnected' | 'connected' }) {
      if (status === 'disconnected') {
        setStoreWithStatus({
          store,
          status: 'synced-remote',
          connectionStatus: 'offline',
        });
        return;
      }

      room.off('synced', handleSync);
      if (status === 'connected') {
        checkServerReadonly();
        if (hasConnectedBefore) return;
        hasConnectedBefore = true;
        room.on('synced', handleSync);
        unsubs.push(() => room.off('synced', handleSync));
      }
    }

    room.on('status', handleStatusChange);
    unsubs.push(() => room.off('status', handleStatusChange));

    const handleSynced = () => {
      checkServerReadonly();
    };
    room.on('synced', handleSynced);
    unsubs.push(() => room.off('synced', handleSynced));

    return () => {
      unsubs.forEach((fn) => fn());
    };
  }, [room, yDoc, store, yStore, meta, readonlyMap, currentUser]);

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
