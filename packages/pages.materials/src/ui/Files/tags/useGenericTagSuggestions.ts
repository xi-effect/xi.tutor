import { useEffect, useMemo } from 'react';
import { TAG_AUTOCOMPLETE_MAX_LIMIT, TAG_KIND, type TagSchema } from 'common.api';
import { useAutocompleteTags } from 'common.services';
import { rememberApiTags } from './libraryTagsStore';

export const useGenericTagSuggestions = (search: string, enabled = true) => {
  const query = search.trim();
  const { data, isLoading, isError } = useAutocompleteTags(
    TAG_KIND.Generic,
    query,
    TAG_AUTOCOMPLETE_MAX_LIMIT,
    !enabled || query.length < 1,
  );

  const suggestions = useMemo((): TagSchema[] => (Array.isArray(data) ? data : []), [data]);

  useEffect(() => {
    if (suggestions.length > 0) {
      rememberApiTags(suggestions);
    }
  }, [suggestions]);

  return {
    suggestions,
    isLoading,
    isError,
  };
};
