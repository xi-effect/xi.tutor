import { useNavigate, useParams, useSearch } from '@tanstack/react-router';

export const useNavigateToMaterial = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const { classroomId } = useParams({ strict: false });

  const getFilteredSearch = () => (search.call ? { call: search.call } : {});

  const navigateToMaterial = (id: string, contentKind: string, materialClassroomId?: string) => {
    const filteredSearch = getFilteredSearch();
    const targetClassroomId = classroomId ?? materialClassroomId;
    const isBoard = contentKind === 'board';

    if (targetClassroomId) {
      navigate({
        to: isBoard
          ? '/classrooms/$classroomId/boards/$boardId'
          : '/classrooms/$classroomId/notes/$noteId',
        params: isBoard
          ? { classroomId: targetClassroomId, boardId: id }
          : { classroomId: targetClassroomId, noteId: id },
        search: filteredSearch,
      });
      return;
    }

    navigate({
      to: isBoard ? '/materials/$materialId/board' : '/materials/$materialId/note',
      params: { materialId: id },
      search: filteredSearch,
    });
  };

  return { navigateToMaterial };
};
