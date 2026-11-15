import {
  Editor,
  createDrStore,
  defaultBindingUtils,
  defaultTools,
  loadSnapshot,
  type DrRecord,
  type SerializedSchema,
} from '@ibodr/draw';
import { YKeyValue } from 'y-utility/y-keyvalue';
import type * as Y from 'yjs';
import { DEMO_CABINET_TEMPLATE_VERSION, readClassroomStorageItem } from 'common.services';
import { boardAssetUtils } from '../assets/boardAssetUtils';
import { commentCustomRecords } from '../comments/commentRecords';
import { boardStoreShapeUtils } from '../shapes/boardShapeUtils';
import { BOARD_SCHEMA_VERSION } from '../utils/yjsConstants';
import { writePreferredBoardBackground } from '../utils/preferredBoardBackground';
import {
  deleteYjsRecordFully,
  isDocumentRecord,
  normalizeRecordForYjsPersistence,
} from '../utils/yjsStoreRecords';
import { withCollabDocument } from './collabSession';
import { loadDemoBoardArchive, type DemoBoardCamera } from './demoBoardArchive';

const createDemoEditor = (): Editor => {
  const shapeUtils = [...boardStoreShapeUtils];
  const store = createDrStore({
    shapeUtils,
    bindingUtils: defaultBindingUtils,
    assetUtils: [...boardAssetUtils],
    records: commentCustomRecords,
  });

  return new Editor({
    store,
    shapeUtils,
    bindingUtils: defaultBindingUtils,
    tools: defaultTools,
    autoFocus: false,
    getContainer: () => document.body,
  });
};

const persistBoard = (
  yDoc: Y.Doc,
  yStore: YKeyValue<DrRecord>,
  meta: Y.Map<SerializedSchema | string>,
  editor: Editor,
  camera: DemoBoardCamera | null,
) => {
  const snapshot = editor.store.getStoreSnapshot();
  yDoc.transact(() => {
    for (const item of [...yStore.yarray.toJSON()]) {
      deleteYjsRecordFully(yStore, item.key);
    }

    for (const record of Object.values(snapshot.store) as DrRecord[]) {
      if (!isDocumentRecord(editor.store, record)) continue;
      yStore.set(record.id, normalizeRecordForYjsPersistence(record));
    }

    meta.set('schema', snapshot.schema);
    meta.set('schemaVersion', BOARD_SCHEMA_VERSION);
    meta.set('demoTemplateVersion', String(DEMO_CABINET_TEMPLATE_VERSION));
    if (camera) meta.set('demoInitialCamera', JSON.stringify(camera));
    writePreferredBoardBackground(yDoc);
  }, 'demo-seed');
};

const DEMO_BOARD_MIN_SHAPES = 5;

/** Пустой документ демодоски нужно заполнить заново, даже если версия шаблона уже записана. */
export const demoBoardNeedsContent = (version: unknown, shapeCount: number): boolean =>
  version !== String(DEMO_CABINET_TEMPLATE_VERSION) || shapeCount < DEMO_BOARD_MIN_SHAPES;

const shapeCountInStore = (yStore: YKeyValue<DrRecord>): number =>
  yStore.yarray.toJSON().filter((item) => {
    const record = item?.val as { typeName?: string } | undefined;
    return record?.typeName === 'shape';
  }).length;

const fillBoardDocument = async (yDoc: Y.Doc, ydocId: string) => {
  const yStore = new YKeyValue<DrRecord>(yDoc.getArray(`tl_${ydocId}`));
  const meta = yDoc.getMap<SerializedSchema | string>('meta');
  if (!demoBoardNeedsContent(meta.get('demoTemplateVersion'), shapeCountInStore(yStore))) return;

  const archive = await loadDemoBoardArchive();
  const editor = createDemoEditor();
  try {
    const documentRecords = archive.records.filter((record) =>
      isDocumentRecord(editor.store, record),
    );
    if (documentRecords.length === 0) throw new Error('demo-board-empty');

    const schema = editor.store.schema.serialize();
    const migrated = editor.store.schema.migrateStoreSnapshot({
      schema,
      store: Object.fromEntries(documentRecords.map((record) => [record.id, record])),
    });
    if (migrated.type === 'error') throw new Error('demo-board-migration');

    editor.store.mergeRemoteChanges(() => {
      loadSnapshot(editor.store, { store: migrated.value, schema });
    });
    persistBoard(yDoc, yStore, meta, editor, archive.camera);
  } finally {
    if (!editor.isDisposed) editor.dispose();
  }
};

export const seedDemoBoard = async (target: {
  classroomId: string;
  boardId: string;
}): Promise<void> => {
  const storage = await readClassroomStorageItem(target.classroomId, target.boardId);
  await withCollabDocument({ ydocId: storage.ydocId, contentToken: storage.contentToken }, (yDoc) =>
    fillBoardDocument(yDoc, storage.ydocId),
  );
};
