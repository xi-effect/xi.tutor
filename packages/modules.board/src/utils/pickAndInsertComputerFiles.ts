import type { Editor } from '@ibodr/draw';
import type { RetryRequest } from 'common.services';
import { getBoardFileInputAccept } from '../constants/mimeTypes';
import { getRememberedInsertPoint } from './boardInsertPoint';
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
    const anchor = getRememberedInsertPoint();
    try {
      for (let index = 0; index < selected.length; index += 1) {
        const file = selected[index];
        if (!file) continue;
        const point = anchor ? { x: anchor.x + index * 28, y: anchor.y + index * 28 } : undefined;
        try {
          await insertAsset(editor, file, token, addToQueue, point);
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
