import { type TagKind, type TagSchema, tagsApiConfig, TagsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError } from '../utils';

export type UpdateTagVars = {
  kind: TagKind;
  id: number;
  name: string;
};

export async function updateTagRequest({ kind, id, name }: UpdateTagVars): Promise<TagSchema> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = tagsApiConfig[TagsQueryKey.UpdateTag];

  const response = await axiosInst<TagSchema>({
    method,
    url: getUrl(kind, id),
    data: { name },
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
      queryClient.invalidateQueries({ queryKey: [TagsQueryKey.TagsAutocomplete, kind] });
      queryClient.invalidateQueries({ queryKey: [TagsQueryKey.GetTagById, kind] });
    },
  });
};
