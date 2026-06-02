import { YjsProvider } from '../providers/YjsProvider';
import { DrawCanvas } from './components';
import { useParams } from '@tanstack/react-router';
import {
  useCurrentUser,
  useGetClassroomStorageItem,
  useGetClassroomStorageItemStudent,
  useGetStorageItem,
} from 'common.services';
import { DEMO_STORAGE_TOKEN } from '../utils/yjsConstants';
import { LoadingScreen } from 'common.ui';

type DrawBoardProps = {
  /** Если true — используются тестовые значения ydocId и storageToken */
  isDemo?: boolean;
};

const localYdocDumpUrl = import.meta.env.VITE_BOARD_LOCAL_YDOC_URL as string | undefined;
const localYdocDumpMode = import.meta.env.DEV && Boolean(localYdocDumpUrl);
const localYdocStorageToken = import.meta.env.VITE_BOARD_LOCAL_STORAGE_TOKEN as string | undefined;

export const DrawBoard = ({ isDemo = false }: DrawBoardProps) => {
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

  const { data: storageItem, isLoading } = getStorageItem({
    classroomId: classroomId || '',
    id: materialIdValue || '',
  });

  if (isLoading && !localYdocDumpMode) return <LoadingScreen />;

  // В демо-режиме и при локальном Y.Doc из БД не требуем storageItem с API
  if (!isDemo && !localYdocDumpMode && (!storageItem?.ydoc_id || !storageItem?.storage_token)) {
    return <div>Material not found</div>;
  }

  const canvasToken = isDemo
    ? DEMO_STORAGE_TOKEN
    : (localYdocStorageToken ?? storageItem?.storage_token ?? '');

  return (
    <YjsProvider storageItem={storageItem} isDemo={isDemo}>
      <DrawCanvas token={canvasToken} />
    </YjsProvider>
  );
};
