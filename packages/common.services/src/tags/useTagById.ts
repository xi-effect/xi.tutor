import { TAG_KIND, type TagKind, tagsApiConfig, TagsQueryKey, tagsQueryKeys } from 'common.api';
import { useFetching } from 'common.config';

export const useTagById = (kind: TagKind, id: number, disabled?: boolean) => {
  const { data, isError, isLoading, ...rest } = useFetching({
    apiConfig: {
      method: tagsApiConfig[TagsQueryKey.GetTagById].method,
      getUrl: () => tagsApiConfig[TagsQueryKey.GetTagById].getUrl(kind, id),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled,
    queryKey: tagsQueryKeys.byId(kind, id),
  });

  return {
    data,
    isError,
    isLoading,
    ...rest,
  };
};

export const useSubjectsById = (id: number, disabled?: boolean) =>
  useTagById(TAG_KIND.Subject, id, disabled);
