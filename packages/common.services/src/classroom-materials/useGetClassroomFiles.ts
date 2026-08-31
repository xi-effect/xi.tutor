import { useQuery } from '@tanstack/react-query';
import { ClassroomMaterialsQueryKey, type FileFilters } from 'common.api';
import { useSearchLibraryFiles } from '../libraryFiles/useSearchLibraryFiles';
import { getMockClassroomFiles } from './mockClassroomFiles';

type UseGetClassroomFilesParams = {
  classroomId: string;
  isTutor: boolean;
  disabled?: boolean;
  filters?: FileFilters | null;
};

export const useGetClassroomFiles = ({
  classroomId,
  isTutor,
  disabled = false,
  filters,
}: UseGetClassroomFilesParams) => {
  const enabled = !disabled && Boolean(classroomId);

  const tutorLibrarySearch = useSearchLibraryFiles({
    enabled: enabled && isTutor,
    filters,
  });

  const studentQuery = useQuery({
    queryKey: [ClassroomMaterialsQueryKey.ClassroomMaterialsStudent, classroomId, 'file', 'list'],
    queryFn: async () => getMockClassroomFiles(classroomId),
    enabled: enabled && !isTutor,
  });

  if (!isTutor) {
    return {
      files: studentQuery.data ?? [],
      isLoading: studentQuery.isLoading,
      isError: studentQuery.isError,
    };
  }

  return {
    files: tutorLibrarySearch.files,
    isLoading: tutorLibrarySearch.isLoading,
    isError: tutorLibrarySearch.isError,
  };
};
