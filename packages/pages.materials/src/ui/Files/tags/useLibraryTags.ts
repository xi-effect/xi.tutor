import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { AxiosError } from 'axios';
import { TAG_KIND, TAG_MAX_COUNT, type TagSchema, tagsApiConfig, TagsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { createTagRequest, useCreateTag, useDeleteTag, useUpdateTag } from 'common.services';
import {
  deleteLibraryTag,
  getLibraryTagsServerSnapshot,
  getLibraryTagsSnapshot,
  isBackendTagId,
  remapLibraryTagId,
  rememberApiTags,
  subscribeLibraryTags,
  toggleFileLibraryTag,
  updateLibraryTag,
  upsertLibraryTag,
  type LibraryTag,
} from './libraryTagsStore';
import type { LibraryTagColorId } from './tagColors';

let legacyMigration: Promise<void> | null = null;

const findTagByName = async (name: string): Promise<TagSchema | null> => {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = tagsApiConfig[TagsQueryKey.TagsAutocomplete];
  const response = await axiosInst<TagSchema[]>({
    method,
    url: getUrl(TAG_KIND.Generic, name, 20),
    headers: { 'Content-Type': 'application/json' },
  });
  const list = Array.isArray(response.data) ? response.data : [];
  return list.find((tag) => tag.name === name) ?? null;
};

const migrateLegacyTags = async () => {
  const legacy = getLibraryTagsSnapshot().tags.filter((tag) => !isBackendTagId(tag.id));
  if (!legacy.length) {
    return;
  }

  for (const tag of legacy) {
    try {
      const created = await createTagRequest({ kind: TAG_KIND.Generic, name: tag.name });
      remapLibraryTagId(tag.id, String(created.id), created.name);
    } catch (error) {
      const status = error instanceof AxiosError ? error.response?.status : undefined;
      if (status === 409) {
        try {
          const existing = await findTagByName(tag.name);
          if (existing) {
            remapLibraryTagId(tag.id, String(existing.id), existing.name);
            continue;
          }
        } catch {
          /* keep local tag */
        }
      }
    }
  }
};

export const useLibraryTags = () => {
  const snapshot = useSyncExternalStore(
    subscribeLibraryTags,
    getLibraryTagsSnapshot,
    getLibraryTagsServerSnapshot,
  );
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const deleteMutation = useDeleteTag();
  const migratedRef = useRef(false);

  useEffect(() => {
    if (migratedRef.current) {
      return;
    }
    migratedRef.current = true;
    if (!legacyMigration) {
      legacyMigration = migrateLegacyTags();
    }
  }, []);

  const tagsById = useMemo(
    () => new Map(snapshot.tags.map((tag) => [tag.id, tag])),
    [snapshot.tags],
  );

  const getTagsForFile = useCallback(
    (fileId: string): LibraryTag[] => {
      const ids = snapshot.fileTagIds[fileId] ?? [];
      return ids.flatMap((id) => {
        const tag = tagsById.get(id);
        return tag ? [tag] : [];
      });
    },
    [snapshot.fileTagIds, tagsById],
  );

  const createTag = useCallback(
    async (name: string, color: LibraryTagColorId): Promise<LibraryTag> => {
      const created = await createMutation.mutateAsync({ kind: TAG_KIND.Generic, name });
      return upsertLibraryTag({
        id: String(created.id),
        name: created.name,
        color,
      });
    },
    [createMutation],
  );

  const updateTag = useCallback(
    async (tagId: string, patch: { name?: string; color?: LibraryTagColorId }): Promise<void> => {
      const current = tagsById.get(tagId);
      const nextName = patch.name?.trim() || current?.name;
      if (nextName && nextName !== current?.name && isBackendTagId(tagId)) {
        const updated = await updateMutation.mutateAsync({
          kind: TAG_KIND.Generic,
          id: Number(tagId),
          name: nextName,
        });
        updateLibraryTag(tagId, { name: updated.name, color: patch.color });
        return;
      }

      updateLibraryTag(tagId, patch);
    },
    [tagsById, updateMutation],
  );

  const deleteTag = useCallback(
    async (tagId: string): Promise<void> => {
      if (isBackendTagId(tagId)) {
        await deleteMutation.mutateAsync({ kind: TAG_KIND.Generic, id: Number(tagId) });
      }
      deleteLibraryTag(tagId);
    },
    [deleteMutation],
  );

  return {
    tags: snapshot.tags,
    fileTagIds: snapshot.fileTagIds,
    getTagsForFile,
    createTag,
    updateTag,
    deleteTag,
    toggleFileTag: toggleFileLibraryTag,
    rememberApiTags,
    canCreateMore: snapshot.tags.length < TAG_MAX_COUNT,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
