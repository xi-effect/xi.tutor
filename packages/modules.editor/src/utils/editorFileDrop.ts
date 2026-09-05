import type { Editor } from '@tiptap/core';
import type { EditorView } from '@tiptap/pm/view';
import { collectDroppedFiles } from 'common.services';
import { insertEditorAsset } from './insertEditorAsset';

type FileDropOptions = {
  getEditor: () => Editor | null;
  getToken: () => string;
};

async function waitForUploadToken(getToken: () => string, timeoutMs = 15_000) {
  if (getToken()) return getToken();
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    if (getToken()) return getToken();
  }
  return getToken();
}

async function ingestFiles(files: File[], getEditor: () => Editor | null, getToken: () => string) {
  const editor = getEditor();
  const token = await waitForUploadToken(getToken);
  if (!editor || editor.isDestroyed || !editor.isEditable || !token) return;

  for (const file of files) {
    await insertEditorAsset(editor, file, token);
  }
}

export function createEditorFileDropProps({ getEditor, getToken }: FileDropOptions) {
  return {
    handleDrop: (_view: EditorView, event: DragEvent, _slice: unknown, moved: boolean) => {
      if (moved) return false;

      const files = collectDroppedFiles(event.dataTransfer);
      if (!files.length) return false;

      event.preventDefault();
      void ingestFiles(files, getEditor, getToken);
      return true;
    },
    handlePaste: (_view: EditorView, event: ClipboardEvent) => {
      const files = collectDroppedFiles(event.clipboardData);
      if (!files.length) return false;

      event.preventDefault();
      void ingestFiles(files, getEditor, getToken);
      return true;
    },
  };
}
