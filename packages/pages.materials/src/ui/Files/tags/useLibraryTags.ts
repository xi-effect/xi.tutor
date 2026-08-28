import { useMemo, useSyncExternalStore } from 'react';
import {
  createLibraryTag,
  deleteLibraryTag,
  getLibraryTagsServerSnapshot,
  getLibraryTagsSnapshot,
  subscribeLibraryTags,
  toggleFileLibraryTag,
  updateLibraryTag,
  type LibraryTag,
} from './libraryTagsStore';

export const useLibraryTags = () => {
  const snapshot = useSyncExternalStore(
    subscribeLibraryTags,
    getLibraryTagsSnapshot,
    getLibraryTagsServerSnapshot,
  );

  const tagsById = useMemo(
    () => new Map(snapshot.tags.map((tag) => [tag.id, tag])),
    [snapshot.tags],
  );

  const getTagsForFile = (fileId: string): LibraryTag[] => {
    const ids = snapshot.fileTagIds[fileId] ?? [];
    return ids.flatMap((id) => {
      const tag = tagsById.get(id);
      return tag ? [tag] : [];
    });
  };

  return {
    tags: snapshot.tags,
    fileTagIds: snapshot.fileTagIds,
    getTagsForFile,
    createTag: createLibraryTag,
    updateTag: updateLibraryTag,
    deleteTag: deleteLibraryTag,
    toggleFileTag: toggleFileLibraryTag,
  };
};
