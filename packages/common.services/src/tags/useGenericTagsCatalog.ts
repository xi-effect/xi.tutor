import { useMemo, useSyncExternalStore } from 'react';
import { type TagSchema } from 'common.api';
import {
  getLibraryTagsServerSnapshot,
  getLibraryTagsSnapshot,
  isBackendTagId,
  subscribeLibraryTags,
} from './libraryTagsStore';

export const useGenericTagsCatalog = () => {
  const snapshot = useSyncExternalStore(
    subscribeLibraryTags,
    getLibraryTagsSnapshot,
    getLibraryTagsServerSnapshot,
  );

  const tags: TagSchema[] = useMemo(
    () =>
      snapshot.tags.flatMap((tag) => {
        if (!isBackendTagId(tag.id)) {
          return [];
        }

        return [
          {
            id: Number(tag.id),
            name: tag.name,
            color: tag.color,
          },
        ];
      }),
    [snapshot.tags],
  );

  return {
    tags,
    isLoading: false,
  };
};
