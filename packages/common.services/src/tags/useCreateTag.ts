import {
  ClassroomMaterialsQueryKey,
  MaterialsQueryKey,
  type TagColor,
  type TagKind,
  type TagSchema,
  tagsApiConfig,
  TagsQueryKey,
} from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError } from '../utils';

export type CreateTagVars = {
  kind: TagKind;
  name: string;
  color: TagColor;
};

export async function createTagRequest({ kind, name, color }: CreateTagVars): Promise<TagSchema> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = tagsApiConfig[TagsQueryKey.CreateTag];

  const response = await axiosInst<TagSchema>({
    method,
    url: getUrl(kind),
    data: { name, color },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

export const invalidateTagRelatedQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  kind: TagKind,
) => {
  queryClient.invalidateQueries({ queryKey: [TagsQueryKey.TagsAutocomplete, kind] });
  queryClient.invalidateQueries({ queryKey: [TagsQueryKey.GetTagById, kind] });
  queryClient.invalidateQueries({ queryKey: [MaterialsQueryKey.Materials] });
  queryClient.invalidateQueries({ queryKey: [ClassroomMaterialsQueryKey.ClassroomMaterials] });
  queryClient.invalidateQueries({
    queryKey: [ClassroomMaterialsQueryKey.ClassroomMaterialsStudent],
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation<TagSchema, Error, CreateTagVars>({
    mutationFn: createTagRequest,
    onError: (err) => {
      handleError(err, 'tags');
    },
    onSuccess: (_data, { kind }) => {
      invalidateTagRelatedQueries(queryClient, kind);
    },
  });
};
