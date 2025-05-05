/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { withCursors, withYHistory, withYjs, YjsEditor } from '@slate-yjs/core';

import { withNodeId } from '../plugins/withNodeId';
import { withNormalize } from '../plugins/withNormalize';
import { randomCursorData } from '../utils/randomCursorData';
import { CustomEditor } from '../types';

type UseCollaborativeEditingProps = {
  documentName?: string;
  serverUrl?: string;
  customData?: Record<string, any>;
};

type UseCollaborativeEditingReturn = {
  editor: CustomEditor;
  provider: HocuspocusProvider;
  connected: boolean;
  isReadOnly: boolean;
};

/**
 * Хук для подключения к Hocuspocus провайдеру коллаборативного редактирования
 */
export const useCollaborativeEditing = ({
  documentName = 'test/slate-yjs-demo',
  serverUrl = 'wss://hocus.xieffect.ru',
  customData,
}: UseCollaborativeEditingProps = {}): UseCollaborativeEditingReturn => {
  const [connected, setConnected] = useState(false);

  // Создаем провайдер для подключения к серверу
  const provider = useMemo(
    () =>
      new HocuspocusProvider({
        url: serverUrl,
        name: documentName,
        onConnect: () => setConnected(true),
        onDisconnect: () => setConnected(false),
        connect: false, // Отключаем автоматическое подключение
        broadcast: false,
        forceSyncInterval: 20000,
        onAuthenticated: () => {},
        onAuthenticationFailed: (data) => {
          console.log('onAuthenticationFailed', data);
          if (data.reason === 'permission-denied') {
            console.error('hocuspocus: permission-denied');
          }
        },
      }),
    [serverUrl, documentName],
  );

  // Создаем редактор с поддержкой коллаборативного редактирования
  const editor = useMemo(() => {
    const sharedType = provider.document.get('content', Y.XmlText) as Y.XmlText;

    const e = withNormalize(
      withNodeId(
        withReact(
          withHistory(
            withCursors(
              withYHistory(withYjs(createEditor(), sharedType, { autoConnect: false })),
              provider.awareness!,
              {
                data: customData || randomCursorData(),
              },
            ),
          ),
        ),
      ),
    ) as CustomEditor;

    return e;
  }, [provider.awareness, provider.document, customData]);

  // Подключение и отключение провайдера
  useEffect(() => {
    provider.connect();
    return () => provider.disconnect();
  }, [provider]);

  // Подключение и отключение редактора
  useEffect(() => {
    YjsEditor.connect(editor);
    return () => YjsEditor.disconnect(editor);
  }, [editor]);

  return {
    editor,
    provider,
    connected,
    isReadOnly: provider.authorizedScope === 'readonly',
  };
};
