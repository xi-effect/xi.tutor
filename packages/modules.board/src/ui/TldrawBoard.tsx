// import { LoadingScreen } from 'common.ui';
import { YjsProvider } from '../providers/YjsProvider';
import { TldrawCanvas } from './components';
import { useParams } from '@tanstack/react-router';
import {
  useCurrentUser,
  useGetClassroomStorageItem,
  useGetClassroomStorageItemStudent,
  useGetStorageItem,
} from 'common.services';
import { DEMO_STORAGE_TOKEN } from '../utils/yjsConstants';

type TldrawBoardProps = {
  /** Если true — используются тестовые значения ydocId и storageToken */
  isDemo?: boolean;
};

export const TldrawBoard = ({ isDemo = false }: TldrawBoardProps) => {
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
  if (!materialIdValue && !isDemo) {
    throw new Error('boardId or materialId must be provided');
  }

  // isLoading
  const { data: storageItem } = getStorageItem({
    classroomId: classroomId || '',
    id: materialIdValue || '',
  });

  // if (isLoading) return <LoadingScreen />;

  // console.log('storageItem', storageItem);

  // В демо-режиме не проверяем наличие storageItem
  if (!isDemo && (!storageItem?.ydoc_id || !storageItem?.storage_token)) {
    return <div>Material not found</div>;
  }

  return (
    <YjsProvider storageItem={storageItem} isDemo={isDemo}>
      <TldrawCanvas token={isDemo ? DEMO_STORAGE_TOKEN : storageItem!.storage_token} />
    </YjsProvider>
  );
};
