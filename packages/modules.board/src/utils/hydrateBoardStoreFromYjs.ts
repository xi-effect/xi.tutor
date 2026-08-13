import { loadSnapshot, type DrRecord, type DrStore, type SerializedSchema } from '@ibodr/draw';
import type { YKeyValue } from 'y-utility/y-keyvalue';
import * as Y from 'yjs';
import {
  nextBoardSchemaVersion,
  prepareLegacyYjsStoreSnapshot,
  repairMigratedBoardStore,
} from './migrateLegacyTldrawSnapshot';
import { ensureYjsStorePopulated } from './parseYjsBoardDoc';
import { BOARD_SCHEMA_VERSION } from './yjsConstants';
import {
  deleteYjsRecordFully,
  isDocumentRecord,
  normalizeRecordForYjsPersistence,
} from './yjsStoreRecords';

type HydrateBoardStoreArgs = {
  store: DrStore;
  yDoc: Y.Doc;
  yStore: YKeyValue<DrRecord>;
  meta: Y.Map<SerializedSchema | string>;
  ydocId: string;
  /** Пустую комнату заполняем из локального store — только после remote sync. */
  seedIfEmpty?: boolean;
};

export type HydrateBoardStoreResult = 'hydrated' | 'seeded' | 'empty' | 'migration-error';

export function hydrateBoardStoreFromYjs({
  store,
  yDoc,
  yStore,
  meta,
  ydocId,
  seedIfEmpty = false,
}: HydrateBoardStoreArgs): HydrateBoardStoreResult {
  ensureYjsStorePopulated(yDoc, ydocId, yStore);

  if (!yStore.yarray.length) {
    if (!seedIfEmpty) return 'empty';

    const docSnapshot = store.getStoreSnapshot();
    yDoc.transact(() => {
      for (const rec of Object.values(docSnapshot.store) as DrRecord[]) {
        yStore.set(rec.id, rec);
      }
      meta.set('schema', docSnapshot.schema);
      meta.set('schemaVersion', BOARD_SCHEMA_VERSION);
    }, 'init');

    return 'seeded';
  }

  const ourSchema = store.schema.serialize();
  const theirSchema = meta.get('schema') as SerializedSchema | undefined;
  const metaSchemaVersion = meta.get('schemaVersion');

  if (!theirSchema) {
    throw new Error('No schema found in the yjs doc');
  }

  const allYjsRecords = yStore.yarray.toJSON().map(({ val }) => val) as DrRecord[];
  const legacySessionRecords = allYjsRecords.filter((r) => !isDocumentRecord(store, r));

  if (legacySessionRecords.length > 0) {
    yDoc.transact(() => {
      for (const r of legacySessionRecords) deleteYjsRecordFully(yStore, r.id);
    }, 'init-cleanup-session');
  }

  const records = allYjsRecords.filter((r) => isDocumentRecord(store, r));
  const storeSnapshot = Object.fromEntries(records.map((r) => [r.id, r]));

  const prepared = prepareLegacyYjsStoreSnapshot({
    schema: theirSchema,
    store: storeSnapshot,
    metaSchemaVersion,
  });

  if (prepared.wasLegacy) {
    console.info(
      '[modules.board] Migrating legacy tldraw Yjs room to draw schema (com.tldraw.* → com.draw.*)',
    );
  }

  const migrationResult = store.schema.migrateStoreSnapshot({
    schema: prepared.schema,
    store: prepared.store,
  });

  if (migrationResult.type === 'error') {
    console.warn('Schema updated, refresh.');
    return 'migration-error';
  }

  let migratedStore = migrationResult.value as Record<string, DrRecord>;
  migratedStore = repairMigratedBoardStore(migratedStore);
  migratedStore = Object.fromEntries(
    Object.entries(migratedStore).map(([id, record]) => [
      id,
      normalizeRecordForYjsPersistence(record),
    ]),
  ) as Record<string, DrRecord>;

  const shouldWriteBack = prepared.wasLegacy || recordsNeedWriteBack(records, migratedStore);

  if (shouldWriteBack) {
    yDoc.transact(() => {
      for (const r of records) {
        if (!migratedStore[r.id]) deleteYjsRecordFully(yStore, r.id);
      }

      for (const r of Object.values(migratedStore) as DrRecord[]) {
        if (isDocumentRecord(store, r)) yStore.set(r.id, r);
      }

      meta.set('schema', ourSchema);
      meta.set('schemaVersion', nextBoardSchemaVersion(metaSchemaVersion, prepared.wasLegacy));
    }, 'init');
  }

  loadSnapshot(store, { store: migratedStore, schema: ourSchema });
  return 'hydrated';
}

function recordsNeedWriteBack(
  records: DrRecord[],
  migratedStore: Record<string, DrRecord>,
): boolean {
  if (records.length !== Object.keys(migratedStore).length) return true;

  for (const record of records) {
    const migrated = migratedStore[record.id];
    if (!migrated) return true;
    if (migrated !== record) {
      const originalSrc = (record as { props?: { src?: unknown } }).props?.src;
      const migratedSrc = (migrated as { props?: { src?: unknown } }).props?.src;
      if (originalSrc !== migratedSrc) return true;
    }
  }

  return false;
}
