import { FC, useEffect, useState } from 'react';
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
import { useCallStore } from '../../store/callStore';
import type { Corner } from '../../store/callStore';
import { useNavigate, useRouter, useSearch } from '@tanstack/react-router';
import { Chat } from '../Chat/Chat';
import { useRoom } from '../../providers/RoomProvider';

type CompactViewProps = {
  children: React.ReactNode;
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
      <DroppableCorner id="top-left" className="top-4 left-4" />
      <DroppableCorner id="top-right" className="top-4 right-4" />
      <DroppableCorner id="bottom-left" className="bottom-4 left-4" />
      <DroppableCorner id="bottom-right" className="right-4 bottom-18" />
      <DragOverlay>{isDragging ? <CompactCall /> : null}</DragOverlay>
    </>
  );
};

export const Compact: FC<CompactViewProps> = ({ children }) => {
  const router = useRouter();
  const { isChatOpen, activeCorner, updateStore } = useCallStore();

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

  const getCornerPosition = (corner: Corner) => {
    const isBoardPage = router.state.location.pathname.includes('/board');
    const bottomOffset = isBoardPage && corner === 'bottom-right' ? 'bottom-[72px]' : 'bottom-4';

    switch (corner) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return `${bottomOffset} left-4`;
      case 'bottom-right':
        return `${bottomOffset} right-4`;
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
      <div className="relative flex h-[calc(100vh-64px)] flex-col bg-transparent">
        <DroppableAreas />

        <div
          className={`absolute z-100 ${getCornerPosition(activeCorner)} transition-all duration-500 ease-out`}
        >
          <CompactCall />
        </div>

        {children}

        {/* Чат в режиме compact */}
        {isChatOpen && (
          <div className="absolute top-4 right-4 z-50">
            <div className="bg-gray-0 border-gray-20 flex h-96 w-80 flex-col rounded-2xl border shadow-lg">
              <Chat />
            </div>
          </div>
        )}

        {/* Обработка аудио как в основном режиме ВКС */}
        <RoomAudioRenderer />
      </div>
    </DndContext>
  );
};

export const CompactView = ({ children }: CompactViewProps) => {
  const { mode } = useCallStore();
  const { room } = useRoom();
  const { token } = useCallStore();

  const search = useSearch({ strict: false }) as { call?: string };
  const navigate = useNavigate();

  // Очищаем URL параметр call, если комната не инициализирована
  useEffect(() => {
    if ((!room || !token) && search.call) {
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

      updateCallStore('mode', 'full');
    }
  }, [room, token, search.call, search, navigate]);

  if (!room || !token) {
    return <>{children}</>;
  }

  if (mode === 'full') return <>{children}</>;

  return <Compact>{children}</Compact>;
};
