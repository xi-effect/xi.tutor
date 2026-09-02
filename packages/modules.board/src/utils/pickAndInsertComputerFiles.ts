import type { Editor } from '@ibodr/draw';
import type { RetryRequest } from 'common.services';
import { getBoardFileInputAccept } from '../constants/mimeTypes';
import { insertAsset } from './uploadAsset';

export function pickAndInsertComputerFiles(
  editor: Editor,
  token: string,
  addToQueue: (request: Omit<RetryRequest, 'id' | 'timestamp'>) => void,
): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = getBoardFileInputAccept();
  input.multiple = true;
  input.style.display = 'none';
  document.body.appendChild(input);

  input.onchange = async (e) => {
    const selected = Array.from((e.target as HTMLInputElement).files ?? []);
    try {
      for (const file of selected) {
        try {
          await insertAsset(editor, file, token, addToQueue);
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
