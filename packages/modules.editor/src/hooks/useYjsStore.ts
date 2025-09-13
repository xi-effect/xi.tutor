import { useEffect, useMemo, useCallback } from 'react';
import * as Y from 'yjs';
import { useEditor, Editor } from '@tiptap/react';
import { getExtensions } from '../config/editorConfig';
import { editorProps } from '../config/editorProps';
import { toast } from 'sonner';

import { HocuspocusProvider } from '@hocuspocus/provider';

type UseYjsStoreArgs = {
  documentName: string;
};

export type UseCollaborativeTiptapReturn = {
  editor: Editor | null;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isReadOnly: boolean;
};

export function useYjsStore({ documentName }: UseYjsStoreArgs): UseCollaborativeTiptapReturn {
  const ydoc = useMemo(() => {
    console.log('Создаем новый Y.Doc для документа:', documentName);
    return new Y.Doc();
  }, [documentName]);

  const provider = useMemo(() => {
    if (!documentName) {
      console.log('Document name не предоставлен, работаем в автономном режиме');
      return undefined;
    }
    console.log('Создаем Hocuspocus provider для документа:', documentName);
    return new HocuspocusProvider({
      url: 'wss://hocus.sovlium.ru',
      name: documentName, // documentName,
      document: ydoc,
      token: documentName, // documentName,
      connect: false,
      forceSyncInterval: 20000, // Принудительная синхронизация каждые 20 секунд
      onAuthenticationFailed: (data) => {
        if (data.reason === 'permission-denied') {
          toast('Ошибка доступа к серверу совместного редактирования');
          console.error('hocuspocus: permission-denied');
        }
      },
    });
  }, [documentName, ydoc]);

  const userData = useMemo(() => ({ name: 'Igor', color: '#ff00ff' }), []);

  useEffect(() => {
    if (provider) {
      provider.setAwarenessField('user', userData);

      // Добавляем обработчики событий для отладки
      provider.on('connect', () => {
        console.log('Hocuspocus provider подключен к серверу:', documentName);
      });

      provider.on('disconnect', () => {
        console.log('Hocuspocus provider отключен от сервера:', documentName);
      });

      provider.on('status', (event: { status: string }) => {
        console.log('Hocuspocus provider статус:', documentName, event);
      });

      // Подключаемся вручную, как в modules.board
      provider.connect();
      console.log('Hocuspocus provider подключен для документа:', documentName);
    }
  }, [provider, userData, documentName]);

  const editor = useEditor(
    {
      extensions: getExtensions(provider, ydoc, userData),
      editable: true,
      editorProps,
    },
    [provider, userData],
  ); // Убираем ydoc из зависимостей

  // Отладочная информация
  useEffect(() => {
    console.log('Editor state:', {
      hasEditor: !!editor,
      hasProvider: !!provider,
      hasYdoc: !!ydoc,
      providerConnected: provider?.isConnected,
      documentName,
      ydocState: ydoc ? 'ready' : 'not ready',
      providerState: provider ? 'created' : 'not created',
    });

    // Добавляем слушатель изменений документа для отладки
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
  }, [editor, provider, ydoc, documentName]);

  useEffect(() => {
    if (!provider || !editor) return;

    const onSynced = () => {
      console.log('Документ синхронизирован');
      const yXmlFragment = ydoc.getXmlFragment('default');

      console.log('Состояние документа после синхронизации:', {
        fragmentLength: yXmlFragment.length,
        fragmentContent: yXmlFragment.toString().substring(0, 200) + '...',
        hasContent: yXmlFragment.length > 0,
      });

      // Не устанавливаем никакого начального содержимого
      // Позволяем Yjs самому управлять содержимым документа
      console.log('Документ синхронизирован, содержимое управляется Yjs');
    };

    provider.on('synced', onSynced);

    return () => {
      provider.off('synced', onSynced);
      // Не отключаем провайдер здесь, так как он может использоваться другими компонентами
    };
  }, [provider, editor, ydoc]);

  // Отдельный эффект для очистки провайдера при размонтировании
  useEffect(() => {
    return () => {
      if (provider) {
        provider.disconnect();
        console.log('Hocuspocus provider отключен для документа:', documentName);
      }
    };
  }, [provider, documentName]);

  const undo = useCallback(() => editor?.commands.undo(), [editor]);
  const redo = useCallback(() => editor?.commands.redo(), [editor]);

  const canUndo = !!editor;
  const canRedo = !!editor;

  const isReadOnly = editor ? !editor.isEditable : false;

  return { editor: editor ?? null, undo, redo, canUndo, canRedo, isReadOnly };
}
