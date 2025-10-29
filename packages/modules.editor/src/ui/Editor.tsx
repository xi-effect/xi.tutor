/* eslint-disable @typescript-eslint/ban-ts-comment */
import { YjsProvider } from '../providers/YjsProvider';
import { TiptapEditor } from './components/TiptapEditor';
import { useParams, useSearch } from '@tanstack/react-router';
import {
  useCurrentUser,
  useGetClassroomStorageItem,
  useGetClassroomStorageItemStudent,
  useGetStorageItem,
} from 'common.services';
import { LoadingScreen } from 'common.ui';

export const Editor = () => {
  const { editorId = 'empty' } = useParams({ strict: false });

  // @ts-ignore
  const { classroom } = useSearch({ strict: false });
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const getStorageItem = (() => {
    if (classroom) {
      if (isTutor) {
        return useGetClassroomStorageItem;
      } else {
        return useGetClassroomStorageItemStudent;
      }
    }

    return useGetStorageItem;
  })();

  const {
    data: storageItem,
    isLoading: isStorageItemLoading,
    error: storageItemError,
  } = getStorageItem({
    classroomId: classroom,
    id: editorId,
    disabled: !editorId,
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
