import { useEffect, useMemo, useCallback } from 'react';
import * as Y from 'yjs';
import { useEditor, Editor } from '@tiptap/react';
import { getExtensions } from '../config/editorConfig';
import { editorProps } from '../config/editorProps';
import content from '../const/content';
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
  const ydoc = useMemo(() => new Y.Doc(), [documentName]);

  const provider = useMemo(() => {
    if (!documentName) return undefined;
    return new HocuspocusProvider({
      url: 'wss://hocus.sovlium.ru',
      name: documentName,
      document: ydoc,
      token: documentName,
      connect: false,
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
    provider?.setAwarenessField?.('user', userData);
  }, [provider, userData]);

  const editor = useEditor({
    extensions: getExtensions(provider, userData),
    editable: true,
    editorProps,
  });

  useEffect(() => {
    if (!provider) return;
    const onSynced = () => {
      const meta = ydoc.getMap('meta');
      if (!meta.get('init')) {
        meta.set('init', true);
        editor.commands.setContent(content);
      }
    };
    provider.on('synced', onSynced);
    return () => {
      provider.off('synced', onSynced);
      provider.disconnect();
    };
  }, [provider]);

  const undo = useCallback(() => editor?.commands.undo(), [editor]);
  const redo = useCallback(() => editor?.commands.redo(), [editor]);

  const canUndo = !!editor;
  const canRedo = !!editor;

  const isReadOnly = editor ? !editor.isEditable : false;

  return { editor: editor ?? null, undo, redo, canUndo, canRedo, isReadOnly };
}
