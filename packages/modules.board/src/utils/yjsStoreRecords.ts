import type { DrRecord, DrStore } from '@ibodr/draw';
import type { YKeyValue } from 'y-utility/y-keyvalue';
import { stripInlineAssetSrc } from './boardAssetHygiene';
import { persistableAssetSrc } from './storedFileSrc';

/** YKeyValue.delete снимает только первое вхождение ключа — чистим все дубликаты. */
export function deleteYjsRecordFully(yStore: YKeyValue<DrRecord>, id: string) {
  let guard = 0;
  while (yStore.has(id) && guard++ < 32) yStore.delete(id);
}

/** В Yjs должны попадать только document-записи — session/instance ломают локальное выделение. */
export function isDocumentRecord(store: DrStore, record: DrRecord): boolean {
  return store.scopedTypes.document.has(record.typeName);
}

/** Нормализует props.src перед записью в Yjs — контракт в utils/storedFileSrc.ts */
export function normalizeRecordForYjsPersistence(record: DrRecord): DrRecord {
  const stripped = stripInlineAssetSrc(record);
  const props = (stripped as { props?: { src?: unknown } }).props;
  if (!props?.src || typeof props.src !== 'string') return stripped;

  const normalizedSrc = persistableAssetSrc(props.src);
  if (normalizedSrc === props.src) return stripped;

  return { ...stripped, props: { ...props, src: normalizedSrc } } as DrRecord;
}
