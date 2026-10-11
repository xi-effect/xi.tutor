import { useMemo } from 'react';
import { type TagSchema } from 'common.api';
import { filterGenericTags, useGenericTags } from 'common.services';

export const useGenericTagSuggestions = (search: string, enabled = true) => {
  const { tags, isLoading, isError } = useGenericTags({ enabled });
  const suggestions = useMemo(
    (): TagSchema[] => (enabled ? filterGenericTags(tags, search) : []),
    [enabled, search, tags],
  );

  return {
    suggestions,
    isLoading: enabled ? isLoading : false,
    isError,
  };
};
