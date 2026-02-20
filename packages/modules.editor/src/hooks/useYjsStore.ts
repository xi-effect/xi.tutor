/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useCallback, useState } from 'react';
import * as Y from 'yjs';
import { useEditor, Editor } from '@tiptap/react';
import { getExtensions } from '../config/editorConfig';
import { editorProps } from '../config/editorProps';
import { toast } from 'sonner';
import { useCurrentUser } from 'common.services';
import { StorageItemT } from 'common.types';
import {
  HocuspocusProvider,
  type onAuthenticatedParameters,
  type onAuthenticationFailedParameters,
} from '@hocuspocus/provider';
import { generateUserColor } from '../utils/userColor';

type UseYjsStoreArgs = {
  hostUrl: string;
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
  hostUrl,
  ydocId,
  storageToken,
  storageItem,
}: UseYjsStoreArgs): UseCollaborativeTiptapReturn {
  /* ==========================================================
   * 1. Provider + Y.Doc через useState — React гарантирует
   *    стабильность state через StrictMode remount.
   *    Пересоздание при смене документа — через key prop.
   * ========================================================== */
  const [{ provider, ydoc }] = useState(() => {
    const ydoc = new Y.Doc();

    // autoConnect: false передаётся в HocuspocusProviderWebsocket — не подключаться в конструкторе,
    // только в useEffect (иначе при StrictMode — предупреждение "WebSocket is closed before the connection is established").
    const provider = new HocuspocusProvider({
      url: hostUrl,
      name: ydocId,
      document: ydoc,
      token: storageToken,
      forceSyncInterval: 20_000,
      autoConnect: false,
    } as any);

    return { provider, ydoc };
  });

  /* ==========================================================
   * 2. Readonly state
   * ========================================================== */
  const [serverReadonly, setServerReadonly] = useState(false);

  /* ==========================================================
   * 3. User data для курсоров и awareness — из текущего пользователя
   * ========================================================== */
  const { data: currentUser } = useCurrentUser();
  const userData = useMemo(() => {
    const name = currentUser?.display_name || currentUser?.username || 'Участник';
    const idForColor = currentUser?.id?.toString() ?? 'anonymous';
    return { name, color: generateUserColor(idForColor) };
  }, [currentUser?.id, currentUser?.display_name, currentUser?.username]);

  /* ==========================================================
   * 4. Extensions — мемоизированы, стабильная ссылка
   *    provider и ydoc из useState, userData из useMemo([])
   *    → extensions создаются один раз.
   * ========================================================== */
  const extensions = useMemo(
    () => getExtensions(provider, ydoc, userData),
    [provider, ydoc, userData],
  );

  /* ==========================================================
   * 5. Provider lifecycle: connect, events, cleanup
   * ========================================================== */
  useEffect(() => {
    // Отложенный connect: при StrictMode cleanup успевает отменить таймер,
    // и мы не вызываем disconnect() до установки соединения.
    const connectTimeoutId = window.setTimeout(() => {
      provider.connect();
    }, 0);

    // Awareness
    if (provider.awareness) {
      provider.awareness.setLocalStateField('user', userData);
    }

    // Auth events
    const handleAuthFailed = ({ reason }: onAuthenticationFailedParameters) => {
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

    return () => {
      window.clearTimeout(connectTimeoutId);
      provider.off('authenticationFailed', handleAuthFailed as any);
      provider.off('authenticated', handleAuthenticated as any);

      // Только disconnect — provider принадлежит useState и будет
      // переиспользован при StrictMode-ремаунте.
      // destroy() вызовется при unmount через key-prop remount.
      try {
        provider.disconnect();
      } catch {
        // ignore
      }
    };
  }, [provider, userData]);

  /* ==========================================================
   * 6. Editor — extensions в deps: при загрузке currentUser
   *    userData обновляется, пересоздаём редактор с правильным именем/цветом для курсора.
   * ========================================================== */
  const editor = useEditor(
    {
      extensions,
      editable: true,
      editorProps,
    },
    [extensions],
  );

  /* ==========================================================
   * 7. Обновление editable на основе serverReadonly
   * ========================================================== */
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const isEditable = !serverReadonly;
    if (editor.isEditable !== isEditable) {
      editor.setEditable(isEditable);
    }
  }, [editor, serverReadonly]);

  /* ==========================================================
   * 8. Undo / Redo
   * ========================================================== */
  const undo = useCallback(() => editor?.commands.undo(), [editor]);
  const redo = useCallback(() => editor?.commands.redo(), [editor]);

  const canUndo = !!editor;
  const canRedo = !!editor;
  const isReadOnly = serverReadonly || (editor ? !editor.isEditable : false);

  /* ==========================================================
   * 9. Мемоизированное возвращаемое значение — предотвращает
   *    ре-рендер ВСЕХ context consumers на каждый рендер
   * ========================================================== */
  return useMemo(
    () => ({
      editor: editor ?? null,
      undo,
      redo,
      canUndo,
      canRedo,
      isReadOnly,
      storageToken,
      storageItem,
    }),
    [editor, undo, redo, canUndo, canRedo, isReadOnly, storageToken, storageItem],
  );
}
