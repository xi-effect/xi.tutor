/* eslint-disable @typescript-eslint/ban-ts-comment */
import { LoadingScreen } from 'common.ui';
import { YjsProvider } from '../providers/YjsProvider';
import { TldrawCanvas } from './components';
import { useParams } from '@tanstack/react-router';
import {
  useCurrentUser,
  useGetClassroomStorageItem,
  useGetClassroomStorageItemStudent,
  useGetStorageItem,
} from 'common.services';

export const TldrawBoard = () => {
  const { classroomId, boardId, materialId } = useParams({ strict: false });

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

  const materialIdValue = boardId ?? materialId;
  if (!materialIdValue) {
    throw new Error('boardId or materialId must be provided');
  }

  const { data: storageItem, isLoading } = getStorageItem({
    classroomId: classroomId || '',
    id: materialIdValue,
  });

  if (isLoading) return <LoadingScreen />;

  if (!storageItem.ydoc_id || !storageItem.storage_token) return <div>Material not found</div>;

  return (
    <YjsProvider storageItem={storageItem}>
      <TldrawCanvas token={storageItem.storage_token} />
    </YjsProvider>
  );
};
