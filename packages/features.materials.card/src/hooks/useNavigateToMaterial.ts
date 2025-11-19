import { useNavigate, useParams, useSearch } from '@tanstack/react-router';

export const useNavigateToMaterial = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const { classroomId } = useParams({ strict: false });

  const getFilteredSearch = () => (search.call ? { call: search.call } : {});

  const navigateToMaterial = (id: number, contentKind: string) => {
    const filteredSearch = getFilteredSearch();

    if (classroomId) {
      const route =
        contentKind === 'board'
          ? '/classrooms/$classroomId/boards/$boardId'
          : '/classrooms/$classroomId/notes/$noteId';

      const params =
        contentKind === 'board'
          ? { classroomId, boardId: id.toString() }
          : { classroomId, noteId: id.toString() };

      navigate({
        to: route,
        params,
        search: filteredSearch,
      });
    } else {
      navigate({
        to: `/materials/${id}/${contentKind}`,
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          ...filteredSearch,
        }),
      });
    }
  };

  return { navigateToMaterial };
};
