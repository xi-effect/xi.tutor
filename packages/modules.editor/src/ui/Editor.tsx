import { YjsProvider } from '../providers/YjsProvider';
import { TiptapEditor } from './components/TiptapEditor';
import { useParams } from '@tanstack/react-router';
import {
  useCurrentUser,
  useGetClassroomStorageItem,
  useGetClassroomStorageItemStudent,
  useGetStorageItem,
} from 'common.services';
import { StorageItemT } from 'common.types';
import { LoadingScreen } from 'common.ui';

type TEditorWithData = {
  storageItem: StorageItemT;
};

type TEditor = {
  storageItem?: StorageItemT;
};

const EditorWithoutData = () => {
  const { classroomId, noteId, materialId } = useParams({ strict: false });

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

  const materialIdValue = noteId ?? materialId;
  if (!materialIdValue) {
    throw new Error('noteId or materialId must be provided');
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
        <div className="text-red-60 text-lg">Ошибка загрузки: {storageItemError.message}</div>
      </div>
    );

  return (
    <div className="flex w-full justify-center pt-4 pb-8">
      <div className="w-full max-w-4xl pl-16">
        <YjsProvider key={storageItem?.ydoc_id} data={storageItem}>
          <TiptapEditor />
        </YjsProvider>
      </div>
    </div>
  );
};

const EditorWithData = ({ storageItem }: TEditorWithData) => {
  return (
    <YjsProvider key={storageItem.ydoc_id} data={storageItem}>
      <TiptapEditor />
    </YjsProvider>
  );
};

export const Editor = ({ storageItem }: TEditor) => {
  if (storageItem) {
    return <EditorWithData storageItem={storageItem} />;
  }

  return <EditorWithoutData />;
};
