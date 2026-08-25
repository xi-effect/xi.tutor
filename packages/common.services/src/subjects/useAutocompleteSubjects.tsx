import { SubjectSchema, subjectsApiConfig, SubjectsQueryKey } from 'common.api';
import { useFetching } from 'common.config';
import { switchKeyboardLayout } from 'common.utils';
import { useMemo } from 'react';

const useSubjectsSearch = (search: string, limit: number, disabled?: boolean) =>
  useFetching({
    apiConfig: {
      method: subjectsApiConfig[SubjectsQueryKey.SubjectsAutocomplete].method,
      getUrl: () => subjectsApiConfig[SubjectsQueryKey.SubjectsAutocomplete].getUrl(search, limit),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    disabled,
    queryKey: [SubjectsQueryKey.SubjectsAutocomplete, search, limit],
  });

const toSubjectList = (data: unknown): SubjectSchema[] =>
  Array.isArray(data) ? (data as SubjectSchema[]) : [];

export const useAutocompleteSubjects = (search: string, limit: number = 10, disabled?: boolean) => {
  const layoutTwin = switchKeyboardLayout(search);
  const hasLayoutTwin = Boolean(search) && layoutTwin !== search;

  const primary = useSubjectsSearch(search, limit, disabled);
  const fallback = useSubjectsSearch(layoutTwin, limit, disabled || !hasLayoutTwin);

  const data = useMemo(() => {
    const primaryList = toSubjectList(primary.data);
    const fallbackList = toSubjectList(fallback.data);

    if (!hasLayoutTwin) return primary.data;

    const seen = new Set<number>();
    const merged: SubjectSchema[] = [];

    for (const subject of [...primaryList, ...fallbackList]) {
      if (seen.has(subject.id)) continue;
      seen.add(subject.id);
      merged.push(subject);
    }

    return merged;
  }, [fallback.data, hasLayoutTwin, primary.data]);

  const primaryEmpty = toSubjectList(primary.data).length === 0;

  return {
    ...primary,
    data,
    isError: hasLayoutTwin ? primary.isError && fallback.isError : primary.isError,
    isLoading: primary.isLoading || (hasLayoutTwin && primaryEmpty && fallback.isLoading),
  };
};
