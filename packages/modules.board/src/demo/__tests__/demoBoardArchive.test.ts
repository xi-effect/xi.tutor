import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDrStore, defaultBindingUtils } from '@ibodr/draw';
import { describe, expect, it } from 'vitest';
import { boardAssetUtils } from '../../assets/boardAssetUtils';
import { commentCustomRecords } from '../../comments/commentRecords';
import { boardStoreShapeUtils } from '../../shapes/boardShapeUtils';
import { isDocumentRecord } from '../../utils/yjsStoreRecords';
import {
  DEMO_BOARD_ARCHIVE_ROOT,
  prepareDemoBoardArchive,
  publicDemoBoardSrc,
  type DemoBoardArchiveFile,
} from '../demoBoardArchive';

const archiveDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../../apps/xi.web/public/demo-board',
);

const readArchive = () => {
  const board = JSON.parse(readFileSync(resolve(archiveDir, 'board.json'), 'utf8')) as {
    records: Array<{ id: string; typeName: string; props?: { src?: string } }>;
  };
  const manifest = JSON.parse(readFileSync(resolve(archiveDir, 'files.json'), 'utf8')) as {
    files: DemoBoardArchiveFile[];
  };
  return { board, manifest };
};

describe('demo board archive', () => {
  it('переписывает id файлов на публичные пути', () => {
    const { board, manifest } = readArchive();
    const prepared = prepareDemoBoardArchive(board, manifest);
    const encoded = JSON.stringify(prepared.records);

    expect(prepared.camera).toEqual({
      x: -11358.171095563544,
      y: 3193.1115319943888,
      z: 0.20212237033528285,
    });

    for (const file of manifest.files) {
      const next = publicDemoBoardSrc(file);
      expect(next?.startsWith(`${DEMO_BOARD_ARCHIVE_ROOT}/`)).toBe(true);
      expect(encoded).toContain(next);
      expect(encoded).not.toContain(`"${file.src}"`);
    }
  });

  it('проходит схему доски', () => {
    const { board, manifest } = readArchive();
    const prepared = prepareDemoBoardArchive(board, manifest);
    const store = createDrStore({
      shapeUtils: [...boardStoreShapeUtils],
      bindingUtils: defaultBindingUtils,
      assetUtils: [...boardAssetUtils],
      records: commentCustomRecords,
    });
    const documentRecords = prepared.records.filter((record) => isDocumentRecord(store, record));
    const migrated = store.schema.migrateStoreSnapshot({
      schema: store.schema.serialize(),
      store: Object.fromEntries(documentRecords.map((record) => [record.id, record])),
    });

    expect(migrated.type).toBe('success');
    if (migrated.type !== 'success') return;
    const shapes = Object.values(migrated.value).filter((record) => record.typeName === 'shape');
    expect(shapes.length).toBeGreaterThan(20);
  });
});
