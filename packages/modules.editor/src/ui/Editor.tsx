/* eslint-disable @typescript-eslint/ban-ts-comment */
import { YjsProvider } from '../providers/YjsProvider';
import { TiptapEditor } from './components/TiptapEditor';
import { useParams } from '@tanstack/react-router';
import {
  useCurrentUser,
  useGetClassroomStorageItem,
  useGetClassroomStorageItemStudent,
  useGetStorageItem,
} from 'common.services';
import { LoadingScreen } from 'common.ui';

export const Editor = () => {
  const { classroomId, noteId, editorId, materialId } = useParams({ strict: false });

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const getStorageItem = (() => {
    if (classroomId) {
      if (isTutor) {
        return useGetClassroomStorageItem;
      } else {
        return useGetClassroomStorageItemStudent;
      }
    }

    return useGetStorageItem;
  })();

  const materialIdValue = noteId ?? editorId ?? materialId;
  if (!materialIdValue) {
    throw new Error('noteId or editorId or materialId must be provided');
  }

  const {
    data: storageItem,
    isLoading: isStorageItemLoading,
    error: storageItemError,
  } = getStorageItem({
    classroomId: classroomId || '',
    id: materialIdValue,
  });

  if (isStorageItemLoading) return <LoadingScreen />;

  if (storageItemError)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-red-500">Ошибка загрузки: {storageItemError.message}</div>
      </div>
    );

  return (
    <YjsProvider data={storageItem}>
      <TiptapEditor />
    </YjsProvider>
  );
};
