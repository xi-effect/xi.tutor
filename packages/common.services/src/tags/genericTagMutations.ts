import { TAG_KIND, type TagColor, type TagSchema } from 'common.api';
import { createTagRequest, useCreateTag, type CreateTagVars } from './useCreateTag';
import { deleteTagRequest, useDeleteTag } from './useDeleteTag';
import { updateTagRequest, useUpdateTag, type UpdateTagVars } from './useUpdateTag';

export const createGenericTag = (vars: Omit<CreateTagVars, 'kind'>): Promise<TagSchema> =>
  createTagRequest({ ...vars, kind: TAG_KIND.Generic });

export const updateGenericTag = (vars: Omit<UpdateTagVars, 'kind'>): Promise<TagSchema> =>
  updateTagRequest({ ...vars, kind: TAG_KIND.Generic });

export const deleteGenericTag = (id: number): Promise<void> =>
  deleteTagRequest({ kind: TAG_KIND.Generic, id });

export const useCreateGenericTag = () => {
  const mutation = useCreateTag();
  return {
    ...mutation,
    mutateAsync: (vars: { name: string; color: TagColor }) =>
      mutation.mutateAsync({ ...vars, kind: TAG_KIND.Generic }),
  };
};

export const useUpdateGenericTag = () => {
  const mutation = useUpdateTag();
  return {
    ...mutation,
    mutateAsync: (vars: Omit<UpdateTagVars, 'kind'>) =>
      mutation.mutateAsync({ ...vars, kind: TAG_KIND.Generic }),
  };
};

export const useDeleteGenericTag = () => {
  const mutation = useDeleteTag();
  return {
    ...mutation,
    mutateAsync: (id: number) => mutation.mutateAsync({ kind: TAG_KIND.Generic, id }),
  };
};
