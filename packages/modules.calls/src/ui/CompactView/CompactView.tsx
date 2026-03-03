import { FC, useEffect, useRef, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  useDroppable,
  DragOverlay,
  useDndMonitor,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { RoomAudioRenderer } from '@livekit/components-react';
import { CompactCall } from './CompactCall';
import { Chat } from '../Chat/Chat';
import { PermissionsDialog } from '../shared/PermissionsDialog';
import { useCallStore } from '../../store/callStore';
import type { Corner } from '../../store/callStore';
import { useFocusModeStore } from 'common.ui';
import { useMedia } from 'common.utils';
import { useNavigate, useRouter, useSearch, useLocation } from '@tanstack/react-router';
import { useRoom } from '../../providers/RoomProvider';
import { useParticipantJoinSync } from '../../hooks/useParticipantJoinSync';

type CompactViewProps = {
  children: React.ReactNode;
};

const OPPOSITE_CORNER: Record<Corner, Corner> = {
  'top-left': 'top-right',
  'top-right': 'top-left',
  'bottom-left': 'bottom-right',
  'bottom-right': 'bottom-left',
};

const DroppableCorner = ({ id, className }: { id: string; className: string }) => {
  const { setNodeRef } = useDroppable({
    id,
  });
  const [isDragging, setIsDragging] = useState(false);

  useDndMonitor({
    onDragStart: () => {
      setIsDragging(true);
    },
    onDragEnd: () => {
      setIsDragging(false);
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`absolute z-100 size-1/3 ${className} pointer-events-none transition-all duration-200 ${
        isDragging ? 'bg-brand-0/20 ring-brand-20 pointer-events-auto rounded-lg ring-2' : ''
      }`}
    />
  );
};

const DroppableAreas: FC = () => {
  const [isDragging, setIsDragging] = useState(false);

  useDndMonitor({
    onDragStart: () => {
      setIsDragging(true);
    },
    onDragEnd: () => {
      setIsDragging(false);
    },
  });

  return (
    <>
      <DroppableCorner id="top-left" className="top-16 left-4" />
      <DroppableCorner id="top-right" className="top-16 right-4" />
      <DroppableCorner id="bottom-left" className="bottom-18 left-4" />
      <DroppableCorner id="bottom-right" className="right-4 bottom-18" />
      <DragOverlay>{isDragging ? <CompactCall /> : null}</DragOverlay>
    </>
  );
};

export const Compact: FC<CompactViewProps> = ({ children }) => {
  const router = useRouter();
  const { activeCorner, updateStore } = useCallStore();
  const focusMode = useFocusModeStore((s) => s.focusMode);
  const isMobile = useMedia('(max-width: 720px)');
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (!isMobile || !headerRef.current) return;
    const el = headerRef.current;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setHeaderHeight(entry.contentRect.height);
    });
    observer.observe(el);
    setHeaderHeight(el.getBoundingClientRect().height);
    return () => observer.disconnect();
  }, [isMobile]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;
    if (over) {
      updateStore('activeCorner', over.id as Corner);
    }
  };

  const isBoardPage = router.state.location.pathname.includes('/board');
  const bottomOffset = isBoardPage ? 'bottom-[72px]' : 'bottom-4';

  const getCornerPosition = (corner: Corner) => {
    switch (corner) {
      case 'top-left':
        return 'top-16 left-4';
      case 'top-right':
        return 'top-16 right-4';
      case 'bottom-left':
        return `${bottomOffset} left-4`;
      case 'bottom-right':
        return `${bottomOffset} right-4`;
    }
  };

  /** Противоположный угол для чата (та же логика позиционирования, другой угол) */
  const getChatPositionClasses = (corner: Corner) => {
    const opposite = OPPOSITE_CORNER[corner];
    const horizontal = opposite.includes('left') ? 'left-22' : 'right-4';
    return `top-32 ${bottomOffset} ${horizontal}`;
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
      <div
        className={`relative flex flex-col bg-transparent ${focusMode ? 'h-screen' : 'h-[calc(100vh-64px)]'}`}
      >
        {isMobile ? (
          <>
            {/* На мобилке: конференция фиксирована сверху под контролами доски (header), без перетаскивания */}
            <div ref={headerRef} className="fixed top-[64px] right-0 left-0 z-10 w-full px-2">
              <CompactCall withOutShadows />
            </div>
            <div
              className="flex min-h-0 flex-1 flex-col"
              style={{ marginTop: headerHeight > 0 ? headerHeight : 120 }}
            >
              {children}
            </div>
          </>
        ) : (
          <>
            <DroppableAreas />
            {/* Чат в противоположном углу, те же правила позиционирования что и компакт-ВКС */}
            <Chat compactPositionClassName={getChatPositionClasses(activeCorner)} />
            <div
              className={`absolute z-100 ${getCornerPosition(activeCorner)} transition-all duration-500 ease-out`}
            >
              <CompactCall />
            </div>
            {children}
          </>
        )}

        <RoomAudioRenderer />
      </div>
    </DndContext>
  );
};

export const CompactView = ({ children }: CompactViewProps) => {
  const { mode } = useCallStore();
  const { room } = useRoom();
  const { token } = useCallStore();

  // Синхронизация состояния при подключении новых участников (работает и в compact mode)
  useParticipantJoinSync();

  const search = useSearch({ strict: false }) as { call?: string };
  const navigate = useNavigate();
  const location = useLocation();

  // Очищаем URL параметр call, только если комната действительно отключена
  // Не очищаем при навигации, если есть activeClassroom в store (комната может быть в процессе подключения)
  useEffect(() => {
    const { activeClassroom } = useCallStore.getState();
    const isOnBoardPage = location.pathname.includes('/board');

    // Очищаем только если:
    // 1. Комната и токен отсутствуют
    // 2. НЕ находимся на странице доски (чтобы не очищать при навигации на доску)
    // 3. НЕТ activeClassroom в store (комната действительно отключена, а не в процессе подключения)
    if ((!room || !token) && search.call && !isOnBoardPage && !activeClassroom) {
      const searchWithoutCall = { ...search };
      delete searchWithoutCall.call;
      navigate({
        to: location.pathname,
        search: searchWithoutCall,
        replace: true,
      });

      // Очищаем все состояния интерфейса при отключении
      const { clearAllRaisedHands, updateStore: updateCallStore } = useCallStore.getState();

      // Очищаем поднятые руки
      clearAllRaisedHands();

      // Очищаем чат
      updateCallStore('isChatOpen', false);
      updateCallStore('chatMessages', []);
      updateCallStore('unreadMessagesCount', 0);

      // Очищаем информацию о доске при отключении
      updateCallStore('activeBoardId', undefined);
      updateCallStore('activeClassroom', undefined);

      updateCallStore('mode', 'full');
    }
  }, [room, token, search.call, search, navigate]);

  const contentWrapper = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );

  if (!room || !token) {
    return (
      <>
        {contentWrapper}
        <PermissionsDialog />
      </>
    );
  }

  if (mode === 'full') {
    return (
      <>
        {contentWrapper}
        <PermissionsDialog />
      </>
    );
  }

  return (
    <>
      <Compact>{children}</Compact>
      <PermissionsDialog />
    </>
  );
};
