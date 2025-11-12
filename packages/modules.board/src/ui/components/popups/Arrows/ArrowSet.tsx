import { useEditor, ArrowShapeArrowheadStartStyle, ArrowShapeArrowheadEndStyle } from 'tldraw';
import { useState } from 'react';
import { arrowVariants } from './arrowVariants';
import { ArrowTypeT } from './types';
import { cn } from '@xipkg/utils';

export const ArrowSet = () => {
  const editor = useEditor();
  const [activeShape, setActiveShape] = useState<string | null>(null);

  const handleShapeClick = (item: ArrowTypeT) => {
    setActiveShape(item.name);

    editor.setCurrentTool('arrow');

    editor.setStyleForNextShapes(ArrowShapeArrowheadStartStyle, item.start);
    editor.setStyleForNextShapes(ArrowShapeArrowheadEndStyle, item.end);
  };

  return (
    <div className="border-gray-10 bg-gray-0 flex w-full gap-2 rounded-xl border p-1 shadow-none">
      {arrowVariants.map((item) => {
        const isActive = item.name === activeShape;
        return (
          <div
            key={item.name}
            className={cn(
              'flex rounded-lg border p-1',
              isActive ? 'border-brand-60' : 'border-transparent',
            )}
          >
            <button
              type="button"
              className="bg-transparent text-left"
              onClick={() => handleShapeClick(item)}
            >
              {item.icon}
            </button>
          </div>
        );
      })}
    </div>
  );
};
