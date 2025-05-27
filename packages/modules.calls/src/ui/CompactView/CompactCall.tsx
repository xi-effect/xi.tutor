import { FC } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export const CompactCall: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: 'draggable-call',
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    cursor: 'move',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="relative flex w-[300px] flex-col gap-2 rounded-lg bg-white p-4 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div className="font-medium">Компактный вид</div>
        <div className="h-6 w-6 cursor-move rounded bg-gray-200" />
      </div>
      {children}
    </div>
  );
};
