/* eslint-disable @typescript-eslint/ban-ts-comment */
import { LoadingScreen } from 'common.ui';
import { YjsProvider } from '../providers/YjsProvider';
import { TldrawCanvas } from './components';
import { useParams, useSearch } from '@tanstack/react-router';
import {
  useCurrentUser,
  useGetClassroomStorageItem,
  useGetClassroomStorageItemStudent,
  useGetStorageItem,
} from 'common.services';

export const TldrawBoard = () => {
  const { boardId = 'empty' } = useParams({ strict: false });

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

  const { data: storageItem, isLoading } = getStorageItem({
    classroomId: classroom || '',
    id: boardId,
    disabled: !boardId,
  });

  if (isLoading) return <LoadingScreen />;

  if (!storageItem.ydoc_id || !storageItem.storage_token) return <div>Material not found</div>;

  return (
    <YjsProvider storageItem={storageItem}>
      <TldrawCanvas token={storageItem.storage_token} />
    </YjsProvider>
  );
};
