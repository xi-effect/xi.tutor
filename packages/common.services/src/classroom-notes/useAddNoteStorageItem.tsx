import { classroomNotesApiConfig, ClassroomNotesQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialT } from 'common.types';
import { handleError } from 'common.services';

interface NoteStorageItemResponseT {
  data: MaterialT & {
    id: string;
    createdAt: string;
  };
}

interface MutationContext {
  previousQueries: [readonly unknown[], unknown][];
}

export type NoteStorageItemDataT = Record<string, never>;

export const useAddNoteStorageItem = () => {
  const queryClient = useQueryClient();

  const addNoteStorageItemMutation = useMutation<
    NoteStorageItemResponseT,
    Error,
    NoteStorageItemDataT & { classroomId: string },
    MutationContext
  >({
    mutationFn: async (noteData: { classroomId: string }) => {
      try {
        const axiosInst = await getAxiosInstance();
        const response = await axiosInst({
          method: classroomNotesApiConfig[ClassroomNotesQueryKey.AddNoteStorageItem].method,
          url: classroomNotesApiConfig[ClassroomNotesQueryKey.AddNoteStorageItem].getUrl(
            noteData.classroomId,
          ),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return response;
      } catch (err) {
        console.error('Ошибка при добавлении заметки кабинета:', err);
        throw err;
      }
    },
    onMutate: async (noteData) => {
      // Отменяем все queries для заметок кабинета
      await queryClient.cancelQueries({
        queryKey: [ClassroomNotesQueryKey.GetNoteStorageItem, noteData.classroomId],
      });

      return { previousQueries: [] };
    },
    onError: (err) => {
      handleError(err, 'materials');
    },
    onSuccess: () => {},
  });

  return { addNoteStorageItem: addNoteStorageItemMutation };
};
