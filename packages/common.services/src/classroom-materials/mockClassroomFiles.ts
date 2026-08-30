import type { LibraryFile } from 'common.api';

/** Временные файлы кабинета для ученика, пока нет ручки материалов кабинета. */
export const getMockClassroomFiles = (classroomId: string): LibraryFile[] => {
  const suffix = classroomId.slice(-4).padStart(4, '0');

  return [
    {
      id: `mock-file-${classroomId}-1`,
      uploader_id: 1,
      name: `Конспект занятия ${suffix}`,
      extension: 'pdf',
      kind: 'document',
      size_bytes: 245_760,
      created_at: '2026-08-20T10:00:00Z',
    },
    {
      id: `mock-file-${classroomId}-2`,
      uploader_id: 1,
      name: `Схема ${suffix}`,
      extension: 'png',
      kind: 'image',
      size_bytes: 512_000,
      created_at: '2026-08-22T14:30:00Z',
    },
    {
      id: `mock-file-${classroomId}-3`,
      uploader_id: 1,
      name: `Презентация ${suffix}`,
      extension: 'pptx',
      kind: 'presentation',
      size_bytes: 1_048_576,
      created_at: '2026-08-25T09:15:00Z',
    },
    {
      id: `mock-file-${classroomId}-4`,
      uploader_id: 42,
      name: `Аудиоразбор ${suffix}`,
      extension: 'mp3',
      kind: 'audio',
      size_bytes: 3_145_728,
      created_at: '2026-08-28T18:00:00Z',
    },
  ];
};
