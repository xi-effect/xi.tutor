import { Extension } from '@tiptap/core';
import { isChangeOrigin } from '@tiptap/extension-collaboration';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin, type Transaction } from '@tiptap/pm/state';
import { ReplaceStep } from '@tiptap/pm/transform';
import { isStorageQuotaReached, requestStorageLimitDialog } from 'common.subscription';

/** Текстовые блоки и атомарные блоки (картинка, файл, аудио). Обёртки вроде списка не считаются. */
const countContentBlocks = (doc: ProseMirrorNode): number => {
  let count = 0;

  doc.descendants((node) => {
    if (node.isTextblock || (node.isAtom && node.isBlock)) count += 1;
  });

  return count;
};

const isEmptyDocument = (doc: ProseMirrorNode): boolean => {
  let hasAtom = false;
  doc.descendants((node) => {
    if (node.isAtom && node.isBlock) hasAtom = true;
    return !hasAtom;
  });
  return !hasAtom && doc.textContent.trim().length === 0;
};

/** TrailingNode дописывает пустой абзац в конец документа — это служебная правка, а не новый блок. */
const isTrailingEmptyParagraph = (transaction: Transaction): boolean => {
  if (transaction.steps.length !== 1) return false;

  const [step] = transaction.steps;
  if (!(step instanceof ReplaceStep)) return false;

  const end = transaction.before.content.size;
  if (step.from !== end || step.to !== end) return false;

  const { content } = step.slice;
  const inserted = content.firstChild;
  return (
    content.childCount === 1 &&
    inserted !== null &&
    inserted.isTextblock &&
    inserted.content.size === 0
  );
};

export const StorageQuotaGuard = Extension.create({
  name: 'storageQuotaGuard',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        filterTransaction(transaction) {
          if (!transaction.docChanged || isChangeOrigin(transaction)) return true;
          if (!isStorageQuotaReached()) return true;
          if (isTrailingEmptyParagraph(transaction)) return true;

          // Пустую заметку можно начать: первый абзац и переносы в ней не считаются новым содержимым.
          if (isEmptyDocument(transaction.before)) return true;

          const before = countContentBlocks(transaction.before);
          const after = countContentBlocks(transaction.doc);
          if (after <= before) return true;

          requestStorageLimitDialog();
          return false;
        },
      }),
    ];
  },
});
