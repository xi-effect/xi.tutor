import { describe, expect, it } from 'vitest';
import type { ClassroomMaterialResponse } from 'common.types';
import {
  classroomMaterialToLibraryFile,
  getClassroomMaterialFileId,
  mapClassroomMaterialsToLibraryFiles,
} from '../mapClassroomFiles';

const fileMaterial: ClassroomMaterialResponse = {
  id: 'material-1',
  updated_at: '2026-08-28T10:00:00Z',
  content_kind: 'file',
  name: 'notes',
  file_id: 'file-1',
};

describe('mapClassroomFiles', () => {
  it('берёт file_id материала кабинета', () => {
    expect(getClassroomMaterialFileId(fileMaterial)).toBe('file-1');
    expect(
      getClassroomMaterialFileId({
        ...fileMaterial,
        content_kind: 'board',
      }),
    ).toBeNull();
  });

  it('собирает stub LibraryFile из материала кабинета', () => {
    expect(classroomMaterialToLibraryFile(fileMaterial)).toEqual({
      id: 'file-1',
      name: 'notes',
      extension: '',
      kind: 'uncategorized',
      size_bytes: 0,
      created_at: '2026-08-28T10:00:00Z',
      uploader_id: 0,
    });
  });

  it('подмешивает meta библиотеки', () => {
    const files = mapClassroomMaterialsToLibraryFiles([fileMaterial], {
      'file-1': {
        id: 'file-1',
        name: 'homework',
        extension: 'pdf',
        kind: 'document',
        size_bytes: 1024,
        created_at: '2026-08-01T00:00:00Z',
        uploader_id: 7,
      },
    });

    expect(files).toEqual([
      {
        id: 'file-1',
        name: 'homework',
        extension: 'pdf',
        kind: 'document',
        size_bytes: 1024,
        created_at: '2026-08-01T00:00:00Z',
        uploader_id: 7,
      },
    ]);
  });
});
