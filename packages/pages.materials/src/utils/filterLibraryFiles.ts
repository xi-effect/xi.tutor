import type { FileFilters, FileKind, LibraryFile } from 'common.api';
import { TAG_FILTER_MAX_COUNT, normalizeTagIds } from 'common.api';
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

export const hasClientFilesFilters = (filters: FilesFiltersT): boolean =>
  Boolean(filters.search.trim());

export const toLibraryFileSearchFilters = (filters: FilesFiltersT): FileFilters => ({
  kinds: filters.kinds.length > 0 ? filters.kinds : null,
  is_uploaded_by_owner:
    filters.uploader === 'mine' ? true : filters.uploader === 'students' ? false : null,
  tag_ids: normalizeTagIds(
    filters.tags.map((tag) => tag.id),
    TAG_FILTER_MAX_COUNT,
  ),
});

export const filterLibraryFiles = (files: LibraryFile[], filters: FilesFiltersT): LibraryFile[] => {
  const search = filters.search.trim();
  if (!search) {
    return files;
  }

  return files.filter((file) => matchesSearchQuery(getLibraryFileDisplayName(file), search));
};

export const FILE_TYPE_OPTIONS: FileKind[] = [
  'image',
  'document',
  'presentation',
  'audio',
  'uncategorized',
];
