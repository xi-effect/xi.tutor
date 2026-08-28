import type { FileKind, LibraryFile } from 'common.api';
import { matchesSearchQuery } from 'common.utils';
import type { FilesFiltersT } from '../types';

export const getLibraryFileDisplayName = (file: LibraryFile): string => {
  const extension = file.extension?.replace(/^\./, '');
  if (!extension) return file.name;
  if (file.name.toLowerCase().endsWith(`.${extension.toLowerCase()}`)) {
    return file.name;
  }
  return `${file.name}.${extension}`;
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
): LibraryFile[] => {
  const search = filters.search.trim();

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
