import type { FileKind, LibraryFile } from 'common.api';
import type { ClassroomMaterialResponse } from 'common.types';

const FILE_KINDS: ReadonlySet<string> = new Set([
  'uncategorized',
  'image',
  'document',
  'audio',
  'presentation',
]);

export const getClassroomMaterialFileId = (material: ClassroomMaterialResponse): string | null => {
  if (material.content_kind !== 'file') {
    return null;
  }

  if (typeof material.file_id === 'string' && material.file_id) {
    return material.file_id;
  }

  return material.id;
};

export const isLibraryFile = (value: unknown): value is LibraryFile => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.extension === 'string' &&
    typeof item.kind === 'string' &&
    FILE_KINDS.has(item.kind) &&
    typeof item.size_bytes === 'number' &&
    typeof item.created_at === 'string' &&
    typeof item.uploader_id === 'number'
  );
};

const toFileKind = (value: unknown): FileKind =>
  typeof value === 'string' && FILE_KINDS.has(value) ? (value as FileKind) : 'uncategorized';

export const classroomMaterialToLibraryFile = (
  material: ClassroomMaterialResponse,
): LibraryFile | null => {
  const fileId = getClassroomMaterialFileId(material);
  if (!fileId) {
    return null;
  }

  if (isLibraryFile(material)) {
    return { ...material, id: fileId };
  }

  const extra = material as ClassroomMaterialResponse & Partial<LibraryFile>;

  return {
    id: fileId,
    name: extra.name ?? 'file',
    extension: extra.extension ?? '',
    kind: toFileKind(extra.kind),
    size_bytes: extra.size_bytes ?? 0,
    created_at: extra.created_at ?? material.updated_at,
    uploader_id: extra.uploader_id ?? 0,
  };
};

export const mapClassroomMaterialsToLibraryFiles = (
  materials: ClassroomMaterialResponse[] | null | undefined,
  metaById: Record<string, LibraryFile> = {},
): LibraryFile[] => {
  if (!materials?.length) {
    return [];
  }

  return materials.flatMap((material) => {
    const fileId = getClassroomMaterialFileId(material);
    if (!fileId) {
      return [];
    }

    const mapped = classroomMaterialToLibraryFile(material);
    const meta = metaById[fileId];
    if (!mapped && !meta) {
      return [];
    }

    return [{ ...(mapped ?? meta), ...(meta ?? {}), id: fileId }];
  });
};
