import { Extension } from '@tiptap/core';
import { isChangeOrigin } from '@tiptap/extension-collaboration';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin } from '@tiptap/pm/state';
import { isStorageQuotaReached, requestStorageLimitDialog } from 'common.subscription';

/** Текстовые блоки и атомарные блоки (картинка, файл, аудио). Обёртки вроде списка не считаются. */
const countContentBlocks = (doc: ProseMirrorNode): number => {
  let count = 0;

  doc.descendants((node) => {
    if (node.isTextblock || (node.isAtom && node.isBlock)) count += 1;
  });

  return count;
};

export const StorageQuotaGuard = Extension.create({
  name: 'storageQuotaGuard',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        filterTransaction(transaction) {
          if (!transaction.docChanged || isChangeOrigin(transaction)) return true;
          if (!isStorageQuotaReached()) return true;

          const before = countContentBlocks(transaction.before);
          const after = countContentBlocks(transaction.doc);

          // Пустой документ может получить первый абзац. Дальше новые блоки не добавляем.
          if (before === 0 || after <= before) return true;

          requestStorageLimitDialog();
          return false;
        },
      }),
    ];
  },
});
