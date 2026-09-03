import { useQuery } from '@tanstack/react-query';
import { TAG_KIND, type TagSchema, tagsApiConfig, TagsQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useCurrentUser } from '../user';
import {
  GENERIC_TAGS_STALE_TIME_MS,
  clearLegacyLibraryTagsStorage,
  genericTagsQueryKey,
  parseGenericTags,
} from './genericTags';

export async function getGenericTags(): Promise<TagSchema[]> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = tagsApiConfig[TagsQueryKey.GetGenericTags];
  const response = await axiosInst<TagSchema[]>({
    method,
    url: getUrl(),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const tags = parseGenericTags(response.data);
  clearLegacyLibraryTagsStorage();
  return tags;
}

export async function getGenericTag(id: number): Promise<TagSchema> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = tagsApiConfig[TagsQueryKey.GetTagById];
  const response = await axiosInst<TagSchema>({
    method,
    url: getUrl(TAG_KIND.Generic, id),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}

type UseGenericTagsOptions = {
  enabled?: boolean;
};

export const useGenericTags = (options: UseGenericTagsOptions = {}) => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const enabled = options.enabled ?? isTutor;

  const query = useQuery({
    queryKey: genericTagsQueryKey,
    queryFn: getGenericTags,
    enabled,
    staleTime: GENERIC_TAGS_STALE_TIME_MS,
    gcTime: GENERIC_TAGS_STALE_TIME_MS,
  });

  return {
    ...query,
    tags: query.data ?? [],
  };
};

/** Совместимый алиас: каталог generic-тегов — серверный список. */
export const useGenericTagsCatalog = () => {
  const { tags, isLoading, isError } = useGenericTags();
  return { tags, isLoading, isError };
};
