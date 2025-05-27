import { FC, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  useDroppable,
  DragOverlay,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { CompactCall } from './CompactCall';

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const DroppableCorner: FC<{ id: Corner; className?: string }> = ({ id, className }) => {
  const { setNodeRef } = useDroppable({
    id,
  });

  return <div ref={setNodeRef} className={`absolute h-1/2 w-1/2 ${className}`} />;
};

export const CompactView: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCorner, setActiveCorner] = useState<Corner>('top-left');
  const [isDragging, setIsDragging] = useState(false);

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
    setIsDragging(false);
  };

  const getCornerPosition = (corner: Corner) => {
    switch (corner) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      onDragStart={() => setIsDragging(true)}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="relative flex h-[calc(100vh-64px)] flex-col gap-2 bg-transparent">
        <DroppableCorner id="top-left" className="top-0 left-0" />
        <DroppableCorner id="top-right" className="top-0 right-0" />
        <DroppableCorner id="bottom-left" className="bottom-0 left-0" />
        <DroppableCorner id="bottom-right" className="right-0 bottom-0" />

        <div
          className={`absolute z-100 ${getCornerPosition(activeCorner)} transition-all duration-500 ease-out`}
        >
          <CompactCall>
            <div className="p-2">
              <h3 className="mb-2 font-medium">Детали звонка</h3>
              <p>Здесь может быть информация о звонке</p>
            </div>
          </CompactCall>
        </div>

        <DragOverlay>
          {isDragging ? (
            <CompactCall>
              <div className="p-2">
                <h3 className="mb-2 font-medium">Детали звонка</h3>
                <p>Здесь может быть информация о звонке</p>
              </div>
            </CompactCall>
          ) : null}
        </DragOverlay>
        {children}
      </div>
    </DndContext>
  );
};
