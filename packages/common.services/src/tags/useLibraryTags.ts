import { TAG_KIND, TAG_MAX_COUNT, type TagColor, type TagSchema } from 'common.api';
import { useCallback, useMemo } from 'react';
import { useCurrentUser } from '../user';
import { canManageGenericTag } from './genericTags';
import { useCreateTag } from './useCreateTag';
import { useDeleteTag } from './useDeleteTag';
import { useGenericTags } from './useGenericTags';
import { useUpdateTag } from './useUpdateTag';

export const useLibraryTags = () => {
  const { data: user } = useCurrentUser();
  const { tags, isLoading, isFetched } = useGenericTags();
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const deleteMutation = useDeleteTag();

  const createTag = useCallback(
    async (name: string, color: TagColor): Promise<TagSchema> =>
      createMutation.mutateAsync({ kind: TAG_KIND.Generic, name, color }),
    [createMutation],
  );

  const updateTag = useCallback(
    async (tagId: number, patch: { name?: string; color?: TagColor }): Promise<void> => {
      await updateMutation.mutateAsync({
        kind: TAG_KIND.Generic,
        id: tagId,
        ...patch,
      });
    },
    [updateMutation],
  );

  const deleteTag = useCallback(
    async (tagId: number): Promise<void> => {
      await deleteMutation.mutateAsync({ kind: TAG_KIND.Generic, id: tagId });
    },
    [deleteMutation],
  );

  const ownTags = useMemo(
    () => tags.filter((tag) => canManageGenericTag(tag, user?.id)),
    [tags, user?.id],
  );

  return {
    tags,
    ownTags,
    isLoading,
    isFetched,
    createTag,
    updateTag,
    deleteTag,
    canManageTag: (tag: TagSchema) => canManageGenericTag(tag, user?.id),
    canCreateMore: tags.length < TAG_MAX_COUNT,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
