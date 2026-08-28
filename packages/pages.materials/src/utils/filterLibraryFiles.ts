import type { FileKind, LibraryFile } from 'common.api';
import { matchesSearchQuery } from 'common.utils';
import type { FilesFiltersT } from '../types';

export const getLibraryFileNameParts = (
  file: Pick<LibraryFile, 'name' | 'extension'>,
): { name: string; extension: string } => {
  const extension = file.extension?.replace(/^\./, '') ?? '';
  let name = file.name;

  if (extension) {
    const suffix = `.${extension}`;
    if (name.toLowerCase().endsWith(suffix.toLowerCase())) {
      name = name.slice(0, -suffix.length);
    }
  }

  return { name, extension };
};

export const getLibraryFileDisplayName = (file: LibraryFile): string => {
  const { name, extension } = getLibraryFileNameParts(file);
  return extension ? `${name}.${extension}` : name;
};

export const hasActiveFilesFilters = (filters: FilesFiltersT): boolean =>
  Boolean(filters.search.trim()) ||
  filters.uploader !== 'mine' ||
  filters.kinds.length > 0 ||
  filters.tags.length > 0;

export const filterLibraryFiles = (
  files: LibraryFile[],
  filters: FilesFiltersT,
  currentUserId?: number,
  fileTagIds: Record<string, string[]> = {},
): LibraryFile[] => {
  const search = filters.search.trim();
  const selectedTagIds = filters.tags.map((tag) => tag.id);

  return files.filter((file) => {
    if (search && !matchesSearchQuery(getLibraryFileDisplayName(file), search)) {
      return false;
    }

    if (filters.kinds.length > 0 && !filters.kinds.includes(file.kind)) {
      return false;
    }

    if (currentUserId != null) {
      if (filters.uploader === 'mine' && file.uploader_id !== currentUserId) {
        return false;
      }
      if (filters.uploader === 'students' && file.uploader_id === currentUserId) {
        return false;
      }
    }

    if (selectedTagIds.length > 0) {
      const assigned = fileTagIds[file.id] ?? [];
      if (!assigned.some((id) => selectedTagIds.includes(id))) {
        return false;
      }
    }

    return true;
  });
};

export const FILE_TYPE_OPTIONS: FileKind[] = [
  'image',
  'document',
  'presentation',
  'audio',
  'uncategorized',
];
