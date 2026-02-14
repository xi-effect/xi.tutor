/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useCallback, useState } from 'react';
import * as Y from 'yjs';
import { useEditor, Editor } from '@tiptap/react';
import { getExtensions } from '../config/editorConfig';
import { editorProps } from '../config/editorProps';
import { toast } from 'sonner';
import { StorageItemT } from 'common.types';

import {
  HocuspocusProvider,
  WebSocketStatus,
  type onAuthenticatedParameters,
  type onAuthenticationFailedParameters,
  type onStatusParameters,
  type onSyncedParameters,
} from '@hocuspocus/provider';

type UseYjsStoreArgs = {
  ydocId: string;
  storageToken: string;
  storageItem: StorageItemT;
};

export type UseCollaborativeTiptapReturn = {
  editor: Editor | null;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isReadOnly: boolean;
  storageToken: string;
  storageItem: StorageItemT;
};

export function useYjsStore({
  ydocId,
  storageToken,
  storageItem,
}: UseYjsStoreArgs): UseCollaborativeTiptapReturn {
  const ydoc = useMemo(() => {
    console.log('Создаем новый Y.Doc для документа:', ydocId);
    return new Y.Doc();
  }, [ydocId]);

  /* ---------- Readonly state ---------- */
  const [serverReadonly, setServerReadonly] = useState<boolean>(false);

  const provider = useMemo(() => {
    if (!ydocId) {
      console.log('Document name не предоставлен, работаем в автономном режиме');
      return undefined;
    }
    console.log('Создаем Hocuspocus provider для документа:', ydocId);
    const prov = new HocuspocusProvider({
      url: 'wss://hocus.sovlium.ru',
      name: ydocId,
      document: ydoc,
      token: storageToken,
      forceSyncInterval: 20_000,
      // attach() / detach() будем дергать сами
    });
    return prov;
  }, [ydocId, storageToken, ydoc]);

  const userData = useMemo(() => ({ name: 'Igor', color: '#ff00ff' }), []);

  /* ---------- Подключение, события, очистка (V3 API) ---------- */
  useEffect(() => {
    if (!provider) return;

    const unsubs: Array<() => void> = [];

    // v3: attach() для подключения
    provider.attach();

    // Awareness
    if (provider.awareness) {
      provider.awareness.setLocalStateField('user', userData);
    }

    // Auth events
    const handleAuthFailed = ({ reason }: onAuthenticationFailedParameters) => {
      console.log('onAuthenticationFailed', { reason });
      if (reason === 'permission-denied') {
        toast('Ошибка доступа к серверу совместного редактирования');
        console.error('hocuspocus: permission-denied');
      }
    };

    const handleAuthenticated = ({ scope }: onAuthenticatedParameters) => {
      setServerReadonly(scope === 'readonly');
    };

    provider.on('authenticationFailed', handleAuthFailed as any);
    provider.on('authenticated', handleAuthenticated as any);
    unsubs.push(() => provider.off('authenticationFailed', handleAuthFailed as any));
    unsubs.push(() => provider.off('authenticated', handleAuthenticated as any));

    // Status events
    const handleStatus = ({ status }: onStatusParameters) => {
      if (status === WebSocketStatus.Connected) {
        console.log('Hocuspocus provider подключен к серверу:', ydocId);
      }
      if (status === WebSocketStatus.Disconnected) {
        console.log('Hocuspocus provider отключен от сервера:', ydocId);
      }
    };

    provider.on('status', handleStatus as any);
    unsubs.push(() => provider.off('status', handleStatus as any));

    // Synced event
    const handleSynced = ({ state }: onSyncedParameters) => {
      if (!state) return;

      console.log('Документ синхронизирован:', ydocId);
      const yXmlFragment = ydoc.getXmlFragment('default');

      console.log('Состояние документа после синхронизации:', {
        fragmentLength: yXmlFragment.length,
        fragmentContent: yXmlFragment.toString().substring(0, 200) + '...',
        hasContent: yXmlFragment.length > 0,
      });
    };

    provider.on('synced', handleSynced as any);
    unsubs.push(() => provider.off('synced', handleSynced as any));

    return () => {
      unsubs.forEach((fn) => fn());

      // v3: detach + destroy для очистки
      try {
        provider.detach();
      } catch {
        // ignore
      }

      try {
        provider.destroy();
      } catch {
        // ignore
      }

      console.log('Hocuspocus provider отключен для документа:', ydocId);
    };
  }, [provider, userData, ydocId, ydoc]);

  const editor = useEditor(
    {
      extensions: getExtensions(provider, ydoc, userData),
      editable: true,
      editorProps,
    },
    [provider, userData],
  );

  // Отладочная информация
  useEffect(() => {
    const wsStatus = provider?.configuration?.websocketProvider?.status;
    console.log('Editor state:', {
      hasEditor: !!editor,
      hasProvider: !!provider,
      hasYdoc: !!ydoc,
      providerStatus: wsStatus,
      ydocId,
      ydocState: ydoc ? 'ready' : 'not ready',
      providerState: provider ? 'created' : 'not created',
    });

    // Слушатель изменений документа для отладки
    if (ydoc) {
      const updateHandler = (update: Uint8Array, origin: unknown) => {
        const yXmlFragment = ydoc.getXmlFragment('default');
        console.log('Документ изменен:', {
          fragmentLength: yXmlFragment.length,
          fragmentContent: yXmlFragment.toString().substring(0, 100) + '...',
          origin: origin?.constructor?.name || 'unknown',
          updateSize: update.length,
        });
      };

      ydoc.on('update', updateHandler);

      return () => {
        ydoc.off('update', updateHandler);
      };
    }
  }, [editor, provider, ydoc, ydocId]);

  /* ---------- Обновление editable редактора на основе serverReadonly ---------- */
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const isEditable = !serverReadonly;
    if (editor.isEditable !== isEditable) {
      editor.setEditable(isEditable);
      console.log('Редактор обновлен, editable:', isEditable, 'serverReadonly:', serverReadonly);
    }
  }, [editor, serverReadonly]);

  const undo = useCallback(() => editor?.commands.undo(), [editor]);
  const redo = useCallback(() => editor?.commands.redo(), [editor]);

  const canUndo = !!editor;
  const canRedo = !!editor;

  // Объединяем readonly с сервера - если сервер установил readonly, это имеет приоритет
  const isReadOnly = serverReadonly || (editor ? !editor.isEditable : false);

  return {
    editor: editor ?? null,
    undo,
    redo,
    canUndo,
    canRedo,
    isReadOnly,
    storageToken,
    storageItem,
  };
}
