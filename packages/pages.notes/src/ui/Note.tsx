import { Editor } from 'modules.editor';
import { Header } from './Header';
import { useParams } from '@tanstack/react-router';
import {
  useCurrentUser,
  useGetClassroomStorageItem,
  useGetClassroomStorageItemStudent,
  useGetStorageItem,
} from 'common.services';
import { LoadingScreen, NotFoundPage } from 'common.ui';

export const Note = () => {
  const { classroomId, noteId, materialId } = useParams({ strict: false });
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const getStorageItem = classroomId
    ? isTutor
      ? useGetClassroomStorageItem
      : useGetClassroomStorageItemStudent
    : useGetStorageItem;

  const materialIdValue = noteId ?? materialId;
  if (!materialIdValue) {
    throw new Error('noteId or materialId must be provided');
  }

  const {
    data: storageItem,
    isLoading,
    isError,
  } = getStorageItem({
    classroomId: classroomId || '',
    id: materialIdValue,
  });

  if (isLoading) return <LoadingScreen />;
  if (isError || !storageItem?.ydoc_id || !storageItem?.storage_token) {
    return <NotFoundPage withLogo={false} />;
  }

  return (
    <div className="bg-background-page flex h-full min-h-[calc(100dvh)] flex-col overflow-auto px-5 pt-3.5 pb-5">
      <Header />
      <div className="flex w-full justify-center pt-4 pb-8">
        <div className="w-full max-w-4xl pl-16">
          <Editor storageItem={storageItem} />
        </div>
      </div>
    </div>
  );
};
