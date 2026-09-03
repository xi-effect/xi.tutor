import type { Editor } from '@tiptap/core';
import { getEditorAttachmentInputAccept, getEditorImageInputAccept } from '../const/media';
import type { ActiveBlockT } from '../types';
import { insertEditorAsset } from './insertEditorAsset';

export type EditorPickMode = 'image' | 'file';

export function pickAndInsertComputerFiles(
  editor: Editor,
  token: string,
  activeBlock?: ActiveBlockT,
  mode: EditorPickMode = 'file',
): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = mode === 'image' ? getEditorImageInputAccept() : getEditorAttachmentInputAccept();
  input.multiple = true;
  input.style.display = 'none';
  document.body.appendChild(input);

  input.onchange = async (e) => {
    const selected = Array.from((e.target as HTMLInputElement).files ?? []);
    try {
      for (const file of selected) {
        try {
          await insertEditorAsset(editor, file, token, activeBlock);
        } catch (error) {
          console.error('Ошибка при загрузке файла:', error);
        }
      }
    } finally {
      input.remove();
    }
  };

  input.click();
}
