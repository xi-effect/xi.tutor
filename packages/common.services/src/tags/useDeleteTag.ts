import { type TagKind, tagsApiConfig, TagsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError } from '../utils';

export type DeleteTagVars = {
  kind: TagKind;
  id: number;
};

export async function deleteTagRequest({ kind, id }: DeleteTagVars): Promise<void> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = tagsApiConfig[TagsQueryKey.DeleteTag];

  await axiosInst({
    method,
    url: getUrl(kind, id),
  });
}

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteTagVars>({
    mutationFn: deleteTagRequest,
    onError: (err) => {
      handleError(err, 'tags');
    },
    onSuccess: (_data, { kind, id }) => {
      queryClient.removeQueries({ queryKey: [TagsQueryKey.GetTagById, kind, id] });
      queryClient.invalidateQueries({ queryKey: [TagsQueryKey.TagsAutocomplete, kind] });
      queryClient.invalidateQueries({ queryKey: [TagsQueryKey.GetTagById, kind] });
    },
  });
};
