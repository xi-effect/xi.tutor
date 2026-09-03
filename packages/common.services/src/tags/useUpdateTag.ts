import {
  TAG_KIND,
  type TagColor,
  type TagKind,
  type TagSchema,
  tagsApiConfig,
  TagsQueryKey,
} from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError } from '../utils';
import { genericTagsQueryKey, upsertGenericTag } from './genericTags';
import { invalidateTagRelatedQueries } from './useCreateTag';

export type UpdateTagVars = {
  kind: TagKind;
  id: number;
  name?: string;
  color?: TagColor;
};

export async function updateTagRequest({
  kind,
  id,
  name,
  color,
}: UpdateTagVars): Promise<TagSchema> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = tagsApiConfig[TagsQueryKey.UpdateTag];

  const response = await axiosInst<TagSchema>({
    method,
    url: getUrl(kind, id),
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(color !== undefined ? { color } : {}),
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation<TagSchema, Error, UpdateTagVars>({
    mutationFn: updateTagRequest,
    onError: (err) => {
      handleError(err, 'tags');
    },
    onSuccess: (data, { kind, id }) => {
      queryClient.setQueryData([TagsQueryKey.GetTagById, kind, id], data);
      if (kind === TAG_KIND.Generic) {
        queryClient.setQueryData<TagSchema[]>(genericTagsQueryKey, (current) =>
          upsertGenericTag(current, data),
        );
      }
      invalidateTagRelatedQueries(queryClient, kind);
    },
  });
};
