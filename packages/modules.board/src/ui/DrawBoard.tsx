import { YjsProvider } from '../providers/YjsProvider';
import { DrawCanvas } from './components';
import { useParams, useSearch } from '@tanstack/react-router';
import {
  useCurrentUser,
  useGetClassroomStorageItem,
  useGetClassroomStorageItemStudent,
  useGetStorageItem,
} from 'common.services';
import { useCachedBoardDoc } from '../hooks/useCachedBoardDoc';
import { DEMO_STORAGE_TOKEN } from '../utils/yjsConstants';
import { LoadingScreen, NotFoundPage } from 'common.ui';

type DrawBoardProps = {
  /** Если true — используются тестовые значения ydocId и storageToken */
  isDemo?: boolean;
};

const localYdocDumpUrl = import.meta.env.VITE_BOARD_LOCAL_YDOC_URL as string | undefined;
const localYdocDumpMode = import.meta.env.DEV && Boolean(localYdocDumpUrl);
const localYdocStorageToken = import.meta.env.VITE_BOARD_LOCAL_STORAGE_TOKEN as string | undefined;

export const DrawBoard = ({ isDemo = false }: DrawBoardProps) => {
  const { classroomId, boardId, materialId } = useParams({ strict: false });
  const search = useSearch({ strict: false }) as { demo?: string | number };
  const isOfflineDemo = isDemo || (import.meta.env.DEV && String(search.demo) === '1');

  const { data: user, isLoading: isUserLoading } = useCurrentUser();
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
  const cacheUserId = user?.id != null ? String(user.id) : undefined;
  const cacheEnabled =
    !isOfflineDemo && !localYdocDumpMode && Boolean(cacheUserId) && Boolean(materialIdValue);
  const cachedBoard = useCachedBoardDoc(cacheUserId, materialIdValue, cacheEnabled);

  const {
    data: storageItem,
    isLoading,
    isError,
  } = getStorageItem({
    classroomId: classroomId || '',
    id: materialIdValue || '',
  });

  if (!materialIdValue && !isOfflineDemo) {
    throw new Error('boardId or materialId must be provided');
  }

  const storageUsable = Boolean(storageItem?.ydoc_id && storageItem?.content_token);
  const cachedDoc =
    cachedBoard.doc && (!storageItem?.ydoc_id || storageItem.ydoc_id === cachedBoard.doc.ydocId)
      ? cachedBoard.doc
      : null;
  const canShowFromCache = Boolean(cachedDoc?.ydocId && cachedDoc.yjsUpdate.length);

  if (!isOfflineDemo && !localYdocDumpMode) {
    // Ждём IndexedDB (~10–50 мс), чтобы не смонтировать провайдер без кэша и потом пересоздать его.
    if (isUserLoading || cachedBoard.status === 'loading') {
      return <LoadingScreen />;
    }

    if (!storageUsable && !canShowFromCache) {
      if (isLoading) return <LoadingScreen />;
      if (isError || !storageItem?.ydoc_id || !storageItem?.content_token) {
        return <NotFoundPage withLogo={false} />;
      }
    }
  }

  const canvasToken = isOfflineDemo
    ? DEMO_STORAGE_TOKEN
    : (localYdocStorageToken ?? storageItem?.content_token ?? '');

  return (
    <YjsProvider
      storageItem={storageItem}
      isDemo={isOfflineDemo}
      cachedYdocId={cachedDoc?.ydocId}
      initialYjsUpdate={cachedDoc?.yjsUpdate}
      cacheBoardId={materialIdValue}
      cacheUserId={cacheUserId}
    >
      <DrawCanvas token={canvasToken} />
    </YjsProvider>
  );
};
