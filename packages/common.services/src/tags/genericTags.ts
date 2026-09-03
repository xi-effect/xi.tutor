import { type TagSchema, tagsQueryKeys } from 'common.api';

export const GENERIC_TAGS_STALE_TIME_MS = 30 * 60 * 1000;
export const LEGACY_LIBRARY_TAGS_STORAGE_KEY = 'xi.tutor.library-tags.v1';

export const genericTagsQueryKey = tagsQueryKeys.genericList();

export const parseGenericTags = (data: unknown): TagSchema[] =>
  Array.isArray(data) ? (data as TagSchema[]) : [];

export const filterGenericTags = (tags: TagSchema[], search: string): TagSchema[] => {
  const needle = search.trim().toLocaleLowerCase();
  if (!needle) {
    return tags;
  }

  return tags.filter((tag) => tag.name.toLocaleLowerCase().includes(needle));
};

export const canManageGenericTag = (
  tag: Pick<TagSchema, 'tutor_id'>,
  userId: number | undefined,
): boolean => userId != null && tag.tutor_id === userId;

export const resolveTagsByIds = (tags: TagSchema[], ids: number[]): TagSchema[] => {
  const tagMap = new Map(tags.map((tag) => [tag.id, tag]));
  return ids.flatMap((id) => {
    const tag = tagMap.get(id);
    return tag ? [tag] : [];
  });
};

export const upsertGenericTag = (tags: TagSchema[] | undefined, next: TagSchema): TagSchema[] => {
  const current = tags ?? [];
  const index = current.findIndex((tag) => tag.id === next.id);
  if (index === -1) {
    return [...current, next];
  }

  const copy = [...current];
  copy[index] = next;
  return copy;
};

export const removeGenericTag = (tags: TagSchema[] | undefined, id: number): TagSchema[] =>
  (tags ?? []).filter((tag) => tag.id !== id);

export const clearLegacyLibraryTagsStorage = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(LEGACY_LIBRARY_TAGS_STORAGE_KEY);
  } catch {
    /* ignore */
  }
};
