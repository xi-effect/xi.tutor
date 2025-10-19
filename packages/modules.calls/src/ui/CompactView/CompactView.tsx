import { FC, useState } from 'react';
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
import { CompactCall } from './CompactCall';
import { useCallStore } from '../../store/callStore';
import { useRouter } from '@tanstack/react-router';
import { Chat } from '../Chat/Chat';

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

type CompactViewProps = {
  children: React.ReactNode;
  firstId?: string;
  secondId?: string;
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
  const [activeCorner, setActiveCorner] = useState<Corner>('top-left');
  const router = useRouter();
  const { isChatOpen } = useCallStore();

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
      setActiveCorner(over.id as Corner);
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
      <div className="relative flex h-[calc(100vh-64px)] flex-col gap-2 bg-transparent">
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
      </div>
    </DndContext>
  );
};

export const CompactView = ({ children }: CompactViewProps) => {
  const { mode } = useCallStore();

  if (mode === 'full') return <>{children}</>;

  return <Compact>{children}</Compact>;
};
