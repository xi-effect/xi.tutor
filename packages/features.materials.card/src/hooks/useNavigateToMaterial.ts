import { useNavigate, useParams, useSearch } from '@tanstack/react-router';

export const useNavigateToMaterial = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const { classroomId } = useParams({ strict: false });

  const getFilteredSearch = () => (search.call ? { call: search.call } : {});

  const navigateToMaterial = (id: string, contentKind: string) => {
    const filteredSearch = getFilteredSearch();

    if (classroomId) {
      const route =
        contentKind === 'board'
          ? '/classrooms/$classroomId/boards/$boardId'
          : '/classrooms/$classroomId/notes/$noteId';

      const params =
        contentKind === 'board' ? { classroomId, boardId: id } : { classroomId, noteId: id };

      navigate({
        to: route,
        params,
        search: filteredSearch,
      });
    } else {
      navigate({
        to: `/materials/${id}/${contentKind}`,
        search: () => ({
          ...filteredSearch,
        }),
      });
    }
  };

  return { navigateToMaterial };
};
