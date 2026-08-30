import {
  TAG_AUTOCOMPLETE_DEFAULT_LIMIT,
  TAG_AUTOCOMPLETE_MAX_SEARCH_LENGTH,
  TAG_AUTOCOMPLETE_MIN_SEARCH_LENGTH,
  TAG_KIND,
  type TagKind,
  type TagSchema,
  tagsApiConfig,
  TagsQueryKey,
  tagsQueryKeys,
  normalizeTagAutocompleteLimit,
} from 'common.api';
import { useFetching } from 'common.config';
import { switchKeyboardLayout } from 'common.utils';
import { useMemo } from 'react';

const useTagsSearch = (kind: TagKind, search: string, limit: number, disabled?: boolean) =>
  useFetching({
    apiConfig: {
      method: tagsApiConfig[TagsQueryKey.TagsAutocomplete].method,
      getUrl: () => tagsApiConfig[TagsQueryKey.TagsAutocomplete].getUrl(kind, search, limit),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled,
    queryKey: tagsQueryKeys.autocomplete(kind, search, limit),
  });

const toTagList = (data: unknown): TagSchema[] =>
  Array.isArray(data) ? (data as TagSchema[]) : [];

const isSearchLengthValid = (search: string): boolean =>
  search.length >= TAG_AUTOCOMPLETE_MIN_SEARCH_LENGTH &&
  search.length <= TAG_AUTOCOMPLETE_MAX_SEARCH_LENGTH;

export const useAutocompleteTags = (
  kind: TagKind,
  search: string,
  limit: number = TAG_AUTOCOMPLETE_DEFAULT_LIMIT,
  disabled?: boolean,
) => {
  const normalizedLimit = normalizeTagAutocompleteLimit(limit);
  const layoutTwin = switchKeyboardLayout(search);
  const hasLayoutTwin = Boolean(search) && layoutTwin !== search;
  const searchDisabled = disabled || !isSearchLengthValid(search);

  const primary = useTagsSearch(kind, search, normalizedLimit, searchDisabled);
  const fallback = useTagsSearch(
    kind,
    layoutTwin,
    normalizedLimit,
    searchDisabled || !hasLayoutTwin || !isSearchLengthValid(layoutTwin),
  );

  const data = useMemo(() => {
    const primaryList = toTagList(primary.data);
    const fallbackList = toTagList(fallback.data);

    if (!hasLayoutTwin) return primary.data;

    const seen = new Set<number>();
    const merged: TagSchema[] = [];

    for (const tag of [...primaryList, ...fallbackList]) {
      if (seen.has(tag.id)) continue;
      seen.add(tag.id);
      merged.push(tag);
    }

    return merged;
  }, [fallback.data, hasLayoutTwin, primary.data]);

  const primaryEmpty = toTagList(primary.data).length === 0;

  return {
    ...primary,
    data,
    isError: hasLayoutTwin ? primary.isError && fallback.isError : primary.isError,
    isLoading: primary.isLoading || (hasLayoutTwin && primaryEmpty && fallback.isLoading),
  };
};

export const useAutocompleteSubjects = (
  search: string,
  limit: number = TAG_AUTOCOMPLETE_DEFAULT_LIMIT,
  disabled?: boolean,
) => useAutocompleteTags(TAG_KIND.Subject, search, limit, disabled);
