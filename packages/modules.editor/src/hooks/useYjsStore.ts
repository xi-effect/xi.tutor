import { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import * as Y from 'yjs';
import { useEditor, Editor } from '@tiptap/react';
import i18n from 'i18next';
import { getExtensions } from '../config/editorConfig';
import { editorProps } from '../config/editorProps';
import { createEditorFileDropProps } from '../utils/editorFileDrop';
import { toast } from 'sonner';
import { useCurrentUser } from 'common.services';
import { ContentYDocItem } from 'common.types';
import {
  HocuspocusProvider,
  HocuspocusProviderWebsocket,
  type onAuthenticatedParameters,
  type onAuthenticationFailedParameters,
  type onSyncedParameters,
} from '@hocuspocus/provider';
import { generateUserColor } from '../utils/userColor';
import { useCollaborators } from './useCollaborators';
import { TCollaborator } from '../types';

type UseYjsStoreArgs = {
  hostUrl: string;
  ydocId: string;
  storageToken: string;
  storageItem: ContentYDocItem;
  forceReadOnly?: boolean;
};

export type UseCollaborativeTiptapReturn = {
  editor: Editor | null;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isReadOnly: boolean;
  isSynced: boolean;
  hasSyncError: boolean;
  storageToken: string;
  storageItem: ContentYDocItem;
  audioSyncMap: Y.Map<number>;
};

export function useYjsStore({
  hostUrl,
  ydocId,
  storageToken,
  storageItem,
  forceReadOnly = false,
}: UseYjsStoreArgs): UseCollaborativeTiptapReturn {
  const storageTokenRef = useRef(storageToken);
  storageTokenRef.current = storageToken;
  const releaseTimerRef = useRef<number | null>(null);

  /* ==========================================================
   * 1. Provider + Y.Doc через useState — React гарантирует
   *    стабильность state через StrictMode remount.
   *    Пересоздание при смене документа — через key prop.
   * ========================================================== */
  const [{ provider, websocketProvider, ydoc }] = useState(() => {
    const ydoc = new Y.Doc();
    const websocketProvider = new HocuspocusProviderWebsocket({
      url: hostUrl,
      autoConnect: false,
    });
    const provider = new HocuspocusProvider({
      name: ydocId,
      document: ydoc,
      token: () => storageTokenRef.current,
      forceSyncInterval: 20_000,
      // v4: клиент и сервер выкатываются вместе. Нужен, чтобы два провайдера
      // с одним document name могли жить на одном WebSocket (иначе attach() бросит).
      sessionAwareness: true,
      websocketProvider,
    });

    return { provider, websocketProvider, ydoc };
  });

  const audioSyncMap = ydoc.getMap<number>('audioSync');

  const { awareness } = provider;
  const { setCollaboratorsIfChanged, reset } = useCollaborators();

  /* ==========================================================
   * 2. Readonly / sync state
   * ========================================================== */
  const [serverReadonly, setServerReadonly] = useState(false);
  const [isSynced, setIsSynced] = useState(() => Boolean(provider.synced));
  const [hasSyncError, setHasSyncError] = useState(false);

  /* ==========================================================
   * 3. User data для курсоров и awareness — из текущего пользователя
   * ========================================================== */
  const { data: currentUser } = useCurrentUser();
  const userData = useMemo(() => {
    const id = currentUser?.id;
    const name =
      currentUser?.display_name ||
      currentUser?.username ||
      i18n.t('status.participant', { ns: 'editor' });
    const idForColor = currentUser?.id?.toString() ?? 'anonymous';
    return { id, name, color: generateUserColor(idForColor) };
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
   * 5. Provider lifecycle: attach/connect, events, cleanup
   * ========================================================== */
  useEffect(() => {
    if (releaseTimerRef.current != null) {
      window.clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }

    provider.attach();

    // Отложенный connect: при StrictMode cleanup успевает отменить таймер,
    // и мы не закрываем сокет до установки соединения.
    const connectTimeoutId = window.setTimeout(() => {
      void websocketProvider.connect();
    }, 0);

    if (awareness) {
      awareness.setLocalStateField('user', userData);
    }

    const handleAuthFailed = ({ reason }: onAuthenticationFailedParameters) => {
      setHasSyncError(true);
      if (reason === 'permission-denied') {
        toast(i18n.t('status.accessError', { ns: 'editor' }));
        console.error('hocuspocus: permission-denied');
      }
    };

    const handleAuthenticated = ({ scope }: onAuthenticatedParameters) => {
      setServerReadonly(scope === 'readonly');
    };

    const handleSynced = ({ state }: onSyncedParameters) => {
      if (state) setIsSynced(true);
    };

    provider.on('authenticationFailed', handleAuthFailed);
    provider.on('authenticated', handleAuthenticated);
    provider.on('synced', handleSynced);

    if (provider.synced) {
      setIsSynced(true);
    }

    return () => {
      window.clearTimeout(connectTimeoutId);
      provider.off('authenticationFailed', handleAuthFailed);
      provider.off('authenticated', handleAuthenticated);
      provider.off('synced', handleSynced);

      // destroy откладываем: StrictMode mount→cleanup→mount не должен рвать сокет.
      // Реальный unmount (смена key / уход со страницы) успеет уничтожить провайдер.
      releaseTimerRef.current = window.setTimeout(() => {
        releaseTimerRef.current = null;
        try {
          provider.destroy();
        } catch {
          // ignore
        }
        try {
          websocketProvider.destroy();
        } catch {
          // ignore
        }
      }, 250);
    };
  }, [provider, websocketProvider, awareness, userData]);

  useEffect(() => {
    if (!awareness) return;

    const handleSyncUsersFromAwareness = () => {
      const awarenessUsers: TCollaborator[] = [...awareness.getStates()]
        .map((arr) => ({ id: arr[1].user?.id, userName: arr[1].user.name }))
        .filter((user) => user.id);
      setCollaboratorsIfChanged(awarenessUsers);
    };

    awareness.on('update', handleSyncUsersFromAwareness);
    handleSyncUsersFromAwareness();

    return () => {
      awareness.off('update', handleSyncUsersFromAwareness);
      reset();
    };
  }, [awareness, setCollaboratorsIfChanged, reset]);

  /* ==========================================================
   * 6. Editor — extensions в deps: при загрузке currentUser
   *    userData обновляется, пересоздаём редактор с правильным именем/цветом для курсора.
   * ========================================================== */
  const editorRef = useRef<Editor | null>(null);

  const fileDropProps = useMemo(
    () =>
      createEditorFileDropProps({
        getEditor: () => editorRef.current,
        getToken: () => storageTokenRef.current,
      }),
    [],
  );

  const editor = useEditor(
    {
      extensions,
      editable: true,
      editorProps: {
        ...editorProps,
        ...fileDropProps,
      },
    },
    [extensions, fileDropProps],
  );

  editorRef.current = editor ?? null;

  /* ==========================================================
   * 7. Обновление editable на основе serverReadonly
   * ========================================================== */
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const isEditable = !forceReadOnly && !serverReadonly;
    if (editor.isEditable !== isEditable) {
      editor.setEditable(isEditable);
    }
  }, [editor, serverReadonly, forceReadOnly]);

  /* ==========================================================
   * 8. Undo / Redo
   * ========================================================== */
  const undo = useCallback(() => editor?.commands.undo(), [editor]);
  const redo = useCallback(() => editor?.commands.redo(), [editor]);

  const canUndo = !!editor;
  const canRedo = !!editor;
  const isReadOnly = forceReadOnly || serverReadonly || (editor ? !editor.isEditable : false);

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
      isSynced,
      hasSyncError,
      storageToken,
      storageItem,
      audioSyncMap,
    }),
    [
      editor,
      undo,
      redo,
      canUndo,
      canRedo,
      isReadOnly,
      isSynced,
      hasSyncError,
      storageToken,
      storageItem,
      audioSyncMap,
    ],
  );
}
