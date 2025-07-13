import * as Y from 'yjs';
import type { RecordsDiff } from '@tldraw/store';
import type { TLRecord } from '@tldraw/tlschema';
import type { TLStore } from 'tldraw';

/** Двусторонняя дифф-синхронизация TLStore ⇄ Y.Map<TLRecord>. */
export function bindStoreDiff(store: TLStore, doc: Y.Doc) {
  const yMap = doc.getMap<TLRecord>('records');

  // 1) Локальные изменения → Yjs
  const unsubStore = store.listen(
    (e) => {
      const diff = e.changes as RecordsDiff<TLRecord>;
      Object.values(diff.added).forEach((rec) => yMap.set(rec.id, rec));
      Object.values(diff.updated).forEach(([, next]) => yMap.set(next.id, next));
      Object.values(diff.removed).forEach((rec) => yMap.delete(rec.id));
    },
    { scope: 'document', source: 'user' },
  );

  // 2) Изменения из Yjs → Store
  const applyRemote = (evt: Y.YMapEvent<TLRecord>) => {
    store.mergeRemoteChanges(() => {
      evt.keysChanged.forEach((_, id) => {
        if (!yMap.has(id)) {
          // ← оборачиваем id в массив
          store.remove([id as TLRecord['id']]);
        } else {
          store.put([yMap.get(id)!]);
        }
      });
    });
  };

  yMap.observe(applyRemote);

  // dispose
  return () => {
    unsubStore();
    yMap.unobserve(applyRemote);
  };
}
