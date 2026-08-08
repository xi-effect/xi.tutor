import type { DrRecord } from '@ibodr/draw';
import { YKeyValue } from 'y-utility/y-keyvalue';
import * as Y from 'yjs';

export type YjsBoardDocInfo = {
  shareKeys: string[];
  tlArrayKeys: string[];
  meta: Record<string, unknown>;
  recordsByArray: Record<string, number>;
  suggestedYdocId: string | null;
};

/** Имя файла из БД: `board-{uuid}` → ydoc_id для Hocuspocus / `tl_{uuid}`. */
export function ydocIdFromBoardDumpFilename(filename: string): string | null {
  const base = filename.replace(/^.*[/\\]/, '');
  const m = /^board-([0-9a-f-]{36})$/i.exec(base);
  return m ? m[1] : null;
}

export function applyYjsBoardUpdate(doc: Y.Doc, update: Uint8Array): void {
  Y.applyUpdate(doc, update);
}

export function getYjsBoardDocInfo(doc: Y.Doc): YjsBoardDocInfo {
  const shareKeys = [...doc.share.keys()];
  const tlArrayKeys = shareKeys.filter((k) => k.startsWith('tl_'));
  const metaMap = doc.getMap('meta');
  const meta = Object.fromEntries(metaMap.entries()) as Record<string, unknown>;

  const recordsByArray: Record<string, number> = {};
  let suggestedYdocId: string | null = null;
  let maxLen = 0;

  for (const key of tlArrayKeys) {
    const len = doc.getArray(key).length;
    recordsByArray[key] = len;
    if (len > maxLen) {
      maxLen = len;
      suggestedYdocId = key.slice(3);
    }
  }

  return {
    shareKeys,
    tlArrayKeys,
    meta,
    recordsByArray,
    suggestedYdocId,
  };
}

/**
 * При дублировании доски бэкенд копирует бинарный Y.Doc, но записи остаются в `tl_{sourceId}`.
 * Клиент читает `tl_{currentYdocId}` — переносим данные из непустого legacy-массива.
 */
export function ensureYjsStorePopulated(
  yDoc: Y.Doc,
  ydocId: string,
  yStore: YKeyValue<DrRecord>,
): void {
  if (yStore.yarray.length > 0) return;

  const currentKey = `tl_${ydocId}`;

  for (const [key] of yDoc.share.entries()) {
    if (key === currentKey || !key.startsWith('tl_')) continue;

    const candidateArr = yDoc.getArray<{ key: string; val: DrRecord }>(key);
    if (candidateArr.length === 0) continue;

    yDoc.transact(() => {
      for (const item of candidateArr.toJSON()) {
        yStore.set(item.key, item.val);
      }
    }, 'duplicate-migration');
    break;
  }
}

export function readYjsBoardRecords(doc: Y.Doc, ydocId: string): DrRecord[] {
  const yArr = doc.getArray<{ key: string; val: DrRecord }>(`tl_${ydocId}`);
  const yStore = new YKeyValue<DrRecord>(yArr);
  ensureYjsStorePopulated(doc, ydocId, yStore);
  return yStore.yarray.toJSON().map(({ val }) => val) as DrRecord[];
}
