/* eslint-disable @typescript-eslint/ban-ts-comment */
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

  const { data: storageItem } = getStorageItem({
    classroomId: classroom || '',
    id: boardId,
    disabled: !boardId,
  });

  console.log('storageItem', storageItem);

  return (
    <YjsProvider storageItem={storageItem}>
      <TldrawCanvas />
    </YjsProvider>
  );
};
