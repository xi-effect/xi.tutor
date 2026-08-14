import { describe, expect, it } from 'vitest';
import * as Y from 'yjs';
import { YKeyValue } from 'y-utility/y-keyvalue';
import type { DrRecord } from '@ibodr/draw';
import {
  applyYjsBoardUpdate,
  ensureYjsStorePopulated,
  getYjsBoardDocInfo,
  ydocIdFromBoardDumpFilename,
} from '../parseYjsBoardDoc';

describe('ydocIdFromBoardDumpFilename', () => {
  it('достаёт uuid из имени board-{uuid}', () => {
    const id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    expect(ydocIdFromBoardDumpFilename(`/tmp/board-${id}`)).toBe(id);
    expect(ydocIdFromBoardDumpFilename('notes.txt')).toBeNull();
  });
});

describe('Yjs board doc helpers', () => {
  it('apply + getYjsBoardDocInfo читают tl_* массив', () => {
    const source = new Y.Doc();
    const arr = source.getArray('tl_room-1');
    arr.push([{ key: 'page:1', val: { id: 'page:1', typeName: 'page' } }]);
    source.getMap('meta').set('schemaVersion', 'draw');

    const target = new Y.Doc();
    applyYjsBoardUpdate(target, Y.encodeStateAsUpdate(source));

    const info = getYjsBoardDocInfo(target);
    expect(info.tlArrayKeys).toContain('tl_room-1');
    expect(info.suggestedYdocId).toBe('room-1');
    expect(info.recordsByArray['tl_room-1']).toBe(1);
    expect(info.meta.schemaVersion).toBe('draw');
  });

  it('ensureYjsStorePopulated копирует legacy tl_* в текущий ключ', () => {
    const doc = new Y.Doc();
    const legacy = doc.getArray('tl_old-id');
    legacy.push([{ key: 'shape:1', val: { id: 'shape:1', typeName: 'shape' } }]);

    const current = doc.getArray('tl_new-id');
    const yStore = new YKeyValue<DrRecord>(current);
    ensureYjsStorePopulated(doc, 'new-id', yStore);

    expect(yStore.get('shape:1')).toEqual({ id: 'shape:1', typeName: 'shape' });
  });
});
