import type { DrAssetId, DrContent, DrRecord, Editor } from '@ibodr/draw';
import { inlineSrcToFile } from './blobToDataUrl';
import { isInlineAssetSrc, persistableAssetSrc } from './storedFileSrc';

type RecordWithSrc = DrRecord & {
  typeName?: string;
  props?: { src?: unknown; [key: string]: unknown };
  meta?: Record<string, unknown>;
};

function asRecordWithSrc(record: DrRecord): RecordWithSrc {
  return record as RecordWithSrc;
}

/**
 * Снимает `data:`/`blob:` из props.src перед записью в store/Yjs.
 * Если в meta есть originalSrc с file id — возвращаем его, иначе пустую строку.
 */
export function stripInlineAssetSrc<T extends DrRecord>(record: T): T {
  const rec = asRecordWithSrc(record);
  const src = rec.props?.src;
  if (typeof src !== 'string' || !isInlineAssetSrc(src)) return record;

  const originalSrc = rec.meta?.originalSrc;
  const nextSrc =
    typeof originalSrc === 'string' ? persistableAssetSrc(originalSrc) : persistableAssetSrc('');

  if (nextSrc === src) return record;

  return {
    ...record,
    props: { ...rec.props, src: nextSrc },
  } as T;
}

export function collectReferencedAssetIds(records: Iterable<DrRecord>): Set<string> {
  const ids = new Set<string>();

  for (const record of records) {
    if (record.typeName !== 'shape') continue;
    const props = asRecordWithSrc(record).props;
    if (!props) continue;

    for (const value of Object.values(props)) {
      if (typeof value === 'string' && value.startsWith('asset:')) {
        ids.add(value);
      }
    }
  }

  return ids;
}

export function findOrphanAssetIds(records: Record<string, DrRecord> | DrRecord[]): string[] {
  const list = Array.isArray(records) ? records : Object.values(records);
  const referenced = collectReferencedAssetIds(list);

  return list
    .filter((record) => record.typeName === 'asset' && !referenced.has(record.id))
    .map((record) => record.id);
}

export function pruneBoardRecordsForPersistence(
  records: Record<string, DrRecord>,
): Record<string, DrRecord> {
  const next: Record<string, DrRecord> = {};

  for (const [id, record] of Object.entries(records)) {
    next[id] = stripInlineAssetSrc(record);
  }

  for (const orphanId of findOrphanAssetIds(next)) {
    delete next[orphanId];
  }

  return next;
}

function collectAssetIdsFromShape(record: DrRecord): DrAssetId[] {
  if (record.typeName !== 'shape') return [];
  const props = asRecordWithSrc(record).props;
  if (!props) return [];

  return Object.values(props).filter(
    (value): value is DrAssetId => typeof value === 'string' && value.startsWith('asset:'),
  );
}

function referencedAssetIdsInEditor(editor: Editor): Set<string> {
  return collectReferencedAssetIds(editor.store.allRecords());
}

/**
 * Не даём `data:`/`blob:` попасть в store и удаляем asset, на который больше
 * никто не ссылается, после удаления shape.
 */
export function registerBoardAssetHygiene(editor: Editor): void {
  editor.sideEffects.registerBeforeCreateHandler('asset', (asset) => stripInlineAssetSrc(asset));
  editor.sideEffects.registerBeforeChangeHandler('asset', (_, next) => stripInlineAssetSrc(next));

  editor.sideEffects.registerAfterDeleteHandler('shape', (shape) => {
    const candidateIds = collectAssetIdsFromShape(shape);
    if (candidateIds.length === 0) return;

    queueMicrotask(() => {
      const stillUsed = referencedAssetIdsInEditor(editor);
      const toDelete = candidateIds.filter((id) => !stillUsed.has(id) && editor.getAsset(id));
      if (toDelete.length === 0) return;
      editor.deleteAssets(toDelete);
    });
  });
}

type ContentWithInlineSrc = {
  assets?: Array<{
    id: string;
    props?: { src?: string; name?: string };
    meta?: Record<string, unknown>;
  }>;
  shapes?: Array<{ props?: { src?: string }; meta?: Record<string, unknown> }>;
};

/** Preview из clipboard data:/blob: — до putContentOntoCurrentPage, чтобы первый кадр уже видел url. */
export async function attachTemporaryPreviewsFromContent(
  editor: Editor,
  content: ContentWithInlineSrc | DrContent,
): Promise<void> {
  const assets = (content as ContentWithInlineSrc).assets ?? [];
  await Promise.all(
    assets.map(async (asset) => {
      const src = asset.props?.src;
      if (typeof src !== 'string' || !isInlineAssetSrc(src)) return;
      const file = await inlineSrcToFile(src, asset.props?.name ?? 'image');
      if (file) editor.createTemporaryAssetPreview(asset.id as DrAssetId, file);
    }),
  );
}

/** Снимает inline src из clipboard content перед записью в store. */
export function stripInlineSourcesFromContent(content: ContentWithInlineSrc | DrContent): void {
  const next = content as ContentWithInlineSrc;

  for (const asset of next.assets ?? []) {
    const src = asset.props?.src;
    if (typeof src !== 'string' || !isInlineAssetSrc(src)) continue;
    const originalSrc = asset.meta?.originalSrc;
    asset.props = {
      ...asset.props,
      src: typeof originalSrc === 'string' ? persistableAssetSrc(originalSrc) : '',
    };
  }

  for (const shape of next.shapes ?? []) {
    const src = shape.props?.src;
    if (typeof src !== 'string' || !isInlineAssetSrc(src)) continue;
    const originalSrc = shape.meta?.originalSrc;
    shape.props = {
      ...shape.props,
      src: typeof originalSrc === 'string' ? persistableAssetSrc(originalSrc) : '',
    };
  }
}
