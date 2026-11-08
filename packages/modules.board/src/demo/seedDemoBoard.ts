import {
  Editor,
  createDrStore,
  createShapeId,
  defaultBindingUtils,
  defaultTools,
  toRichText,
  type DrParentId,
  type DrRecord,
  type DrShapeId,
  type SerializedSchema,
} from '@ibodr/draw';
import { YKeyValue } from 'y-utility/y-keyvalue';
import type * as Y from 'yjs';
import {
  DEMO_CABINET_BOARD_COPY,
  DEMO_CABINET_TEMPLATE_VERSION,
  readClassroomStorageItem,
} from 'common.services';
import { createEmptyAttempt } from '../activities/model/defaults';
import { createActivityId } from '../activities/model/ids';
import { getActivityDefaultProps } from '../activities/shape/ActivityShape';
import { boardAssetUtils } from '../assets/boardAssetUtils';
import { commentCustomRecords } from '../comments/commentRecords';
import { boardStoreShapeUtils } from '../shapes/boardShapeUtils';
import { BOARD_SCHEMA_VERSION } from '../utils/yjsConstants';
import { hydrateBoardStoreFromYjs } from '../utils/hydrateBoardStoreFromYjs';
import { writePreferredBoardBackground } from '../utils/preferredBoardBackground';
import {
  deleteYjsRecordFully,
  isDocumentRecord,
  normalizeRecordForYjsPersistence,
} from '../utils/yjsStoreRecords';
import { withCollabDocument } from './collabSession';
import { demoBoardLayout, type LayoutBox } from './demoBoardLayout';

const copy = DEMO_CABINET_BOARD_COPY;

const child = (children: readonly LayoutBox[], id: string): LayoutBox => {
  const found = children.find((item) => item.id === id);
  if (!found) throw new Error(`Нет блока раскладки ${id}`);
  return found;
};

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

const shapeCount = (editor: Editor): number => {
  try {
    return editor.getCurrentPageShapes().length;
  } catch {
    return 0;
  }
};

const addText = (
  editor: Editor,
  parentId: DrParentId,
  area: LayoutBox,
  value: string,
  size: 's' | 'm' | 'l' | 'xl',
) => {
  const defaults = editor.getShapeUtil('text').getDefaultProps();
  editor.createShape({
    id: createShapeId(),
    type: 'text',
    parentId,
    x: area.x,
    y: area.y,
    props: {
      ...defaults,
      richText: toRichText(value),
      autoSize: false,
      w: area.w,
      size,
      font: 'sans',
      color: 'black',
      textAlign: 'start',
    },
  });
};

const addGeo = (
  editor: Editor,
  parentId: DrParentId,
  area: LayoutBox,
  geo: 'rectangle' | 'ellipse',
  label: string,
  color: 'blue' | 'violet' | 'green' | 'orange' | 'light-blue',
  fill: 'none' | 'semi',
) => {
  const id = createShapeId();
  const defaults = editor.getShapeUtil('xi-geo').getDefaultProps();
  editor.createShape({
    id,
    type: 'xi-geo',
    parentId,
    x: area.x,
    y: area.y,
    props: {
      ...defaults,
      geo,
      w: area.w,
      h: area.h,
      fill,
      color,
      richText: toRichText(label),
      text: label,
      align: 'middle',
      verticalAlign: 'middle',
      font: 'sans',
      size: 's',
    },
  });
  return id;
};

const addNote = (
  editor: Editor,
  parentId: DrParentId,
  area: LayoutBox,
  label: string,
  color: 'yellow' | 'light-blue',
) => {
  const id = createShapeId();
  const defaults = editor.getShapeUtil('note').getDefaultProps();
  editor.createShape({
    id,
    type: 'note',
    parentId,
    x: area.x,
    y: area.y,
    props: {
      ...defaults,
      richText: toRichText(label),
      color,
      size: 's',
      font: 'sans',
      align: 'middle',
      verticalAlign: 'middle',
    },
  });
  return id;
};

const addEmoji = (editor: Editor, parentId: DrParentId, area: LayoutBox, emoji: string) => {
  const defaults = editor.getShapeUtil('emoji').getDefaultProps();
  editor.createShape({
    id: createShapeId(),
    type: 'emoji',
    parentId,
    x: area.x,
    y: area.y,
    props: {
      ...defaults,
      w: area.w,
      h: area.h,
      emoji,
    },
  });
};

const bindArrow = (editor: Editor, parentId: DrParentId, fromId: DrShapeId, toId: DrShapeId) => {
  const id = createShapeId();
  const defaults = editor.getShapeUtil('arrow').getDefaultProps();
  editor.createShape({
    id,
    type: 'arrow',
    parentId,
    props: {
      ...defaults,
      color: 'black',
      size: 's',
      bend: 0,
    },
  });

  const shared = {
    normalizedAnchor: { x: 0.5, y: 0.5 },
    isExact: false,
    isPrecise: false,
    snap: 'edge' as const,
  };
  editor.createBinding({
    type: 'arrow',
    fromId: id,
    toId: fromId,
    props: { ...shared, terminal: 'start' },
  });
  editor.createBinding({
    type: 'arrow',
    fromId: id,
    toId: toId,
    props: { ...shared, terminal: 'end' },
  });
};

const addFrame = (editor: Editor, pageId: DrParentId, area: LayoutBox, name: string) => {
  const id = createShapeId();
  const defaults = editor.getShapeUtil('frame').getDefaultProps();
  editor.createShape({
    id,
    type: 'frame',
    parentId: pageId,
    x: area.x,
    y: area.y,
    props: {
      ...defaults,
      w: area.w,
      h: area.h,
      name,
    },
  });
  return id;
};

const buildDemoBoard = (editor: Editor) => {
  const pageId = editor.getCurrentPageId();
  const welcomeId = addFrame(editor, pageId, demoBoardLayout.welcome.frame, 'Знакомство');
  const elementsId = addFrame(editor, pageId, demoBoardLayout.elements.frame, 'Элементы');
  const workflowId = addFrame(editor, pageId, demoBoardLayout.workflow.frame, 'Ход занятия');

  const welcome = demoBoardLayout.welcome.children;
  addText(editor, welcomeId, child(welcome, 'welcome-title'), copy.welcomeTitle, 'xl');
  addText(editor, welcomeId, child(welcome, 'welcome-body'), copy.welcomeBody, 'm');
  addText(editor, welcomeId, child(welcome, 'welcome-hint'), copy.welcomeHint, 's');
  addEmoji(editor, welcomeId, child(welcome, 'welcome-emoji'), '👋');

  const elements = demoBoardLayout.elements.children;
  addText(editor, elementsId, child(elements, 'elements-title'), copy.elementsTitle, 'l');
  const rectangleId = addGeo(
    editor,
    elementsId,
    child(elements, 'rectangle'),
    'rectangle',
    copy.rectangle,
    'blue',
    'semi',
  );
  const ellipseId = addGeo(
    editor,
    elementsId,
    child(elements, 'ellipse'),
    'ellipse',
    copy.ellipse,
    'light-blue',
    'none',
  );
  bindArrow(editor, elementsId, rectangleId, ellipseId);
  const stickerA = addNote(
    editor,
    elementsId,
    child(elements, 'sticker-a'),
    copy.stickerA,
    'yellow',
  );
  const stickerB = addNote(
    editor,
    elementsId,
    child(elements, 'sticker-b'),
    copy.stickerB,
    'light-blue',
  );
  editor.groupShapes([stickerA, stickerB]);
  addEmoji(editor, elementsId, child(elements, 'elements-emoji'), '💡');

  const flip = child(elements, 'flip-card');
  const flipDefaults = editor.getShapeUtil('flip-card').getDefaultProps();
  editor.createShape({
    id: createShapeId(),
    type: 'flip-card',
    parentId: elementsId,
    x: flip.x,
    y: flip.y,
    props: {
      ...flipDefaults,
      w: flip.w,
      h: flip.h,
      richText: toRichText(copy.flipFront),
      frontRichText: toRichText(copy.flipFront),
      backRichText: toRichText(copy.flipBack),
    },
  });
  addText(editor, elementsId, child(elements, 'elements-hint'), copy.elementsHint, 's');

  const workflow = demoBoardLayout.workflow.children;
  addText(editor, workflowId, child(workflow, 'workflow-title'), copy.workflowTitle, 'l');
  addText(editor, workflowId, child(workflow, 'workflow-intro'), copy.workflowIntro, 's');
  const stepIds = (['idea', 'plan', 'lesson', 'result'] as const).map((id, index) =>
    addGeo(
      editor,
      workflowId,
      child(workflow, id),
      'rectangle',
      copy.steps[index] ?? '',
      (['blue', 'violet', 'green', 'orange'] as const)[index] ?? 'blue',
      'semi',
    ),
  );
  for (let index = 0; index < stepIds.length - 1; index += 1) {
    const fromId = stepIds[index];
    const toId = stepIds[index + 1];
    if (fromId && toId) bindArrow(editor, workflowId, fromId, toId);
  }
  addText(editor, workflowId, child(workflow, 'workflow-hint'), copy.workflowHint, 's');

  const activity = demoBoardLayout.activity;
  const options = copy.activityOptions.map((option) => ({
    id: createActivityId(),
    text: option.text,
    correct: option.correct,
  }));
  const definition = {
    kind: 'multiple-choice' as const,
    question: copy.activityQuestion,
    multiple: false,
    randomize: false,
    options,
  };
  const activityDefaults = getActivityDefaultProps('multiple-choice');
  editor.createShape({
    id: createShapeId(),
    type: 'activity',
    parentId: pageId,
    x: activity.x,
    y: activity.y,
    props: {
      ...activityDefaults,
      w: activity.w,
      h: activity.h,
      title: copy.activityTitle,
      definition,
      attempt: createEmptyAttempt(definition),
    },
  });
};

const documentHasShapes = (yStore: YKeyValue<DrRecord>): boolean =>
  yStore.yarray.toJSON().some((item) => item.val?.typeName === 'shape');

const persistBoard = (
  yDoc: Y.Doc,
  yStore: YKeyValue<DrRecord>,
  meta: Y.Map<SerializedSchema | string>,
  editor: Editor,
  replace: boolean,
) => {
  const snapshot = editor.store.getStoreSnapshot();
  yDoc.transact(() => {
    if (replace) {
      for (const item of [...yStore.yarray.toJSON()]) {
        deleteYjsRecordFully(yStore, item.key);
      }
    }

    for (const record of Object.values(snapshot.store) as DrRecord[]) {
      if (!isDocumentRecord(editor.store, record)) continue;
      yStore.set(record.id, normalizeRecordForYjsPersistence(record));
    }

    meta.set('schema', snapshot.schema);
    meta.set('schemaVersion', BOARD_SCHEMA_VERSION);
    meta.set('demoTemplateVersion', String(DEMO_CABINET_TEMPLATE_VERSION));
    writePreferredBoardBackground(yDoc);
  }, 'demo-seed');
};

const fillBoardDocument = (yDoc: Y.Doc, ydocId: string) => {
  const yStore = new YKeyValue<DrRecord>(yDoc.getArray(`tl_${ydocId}`));
  const meta = yDoc.getMap<SerializedSchema | string>('meta');
  if (documentHasShapes(yStore)) return;

  let editor = createDemoEditor();
  try {
    let replace = false;
    if (yStore.yarray.length > 0) {
      try {
        const result = hydrateBoardStoreFromYjs({
          store: editor.store,
          yDoc,
          yStore,
          meta,
          ydocId,
          seedIfEmpty: false,
        });
        if (result === 'hydrated' && shapeCount(editor) > 0) return;
        if (result === 'migration-error') throw new Error('board-migration');
      } catch (error) {
        if (shapeCount(editor) > 0) throw error;
        if (!editor.isDisposed) editor.dispose();
        editor = createDemoEditor();
        replace = true;
      }
    }

    buildDemoBoard(editor);
    persistBoard(yDoc, yStore, meta, editor, replace);
  } finally {
    if (!editor.isDisposed) editor.dispose();
  }
};

export const seedDemoBoard = async (target: {
  classroomId: string;
  boardId: string;
}): Promise<void> => {
  const storage = await readClassroomStorageItem(target.classroomId, target.boardId);
  await withCollabDocument(
    { ydocId: storage.ydocId, contentToken: storage.contentToken },
    (yDoc) => {
      fillBoardDocument(yDoc, storage.ydocId);
    },
  );
};
