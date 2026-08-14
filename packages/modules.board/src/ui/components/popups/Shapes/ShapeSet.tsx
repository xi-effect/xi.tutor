import { useState } from 'react';
import { useEditor, GeoShapeGeoStyle } from '@ibodr/draw';
import { TShapeOption } from './types';
import { shapes } from './shapeVariants';
import { useDrawStyles } from '../../../../hooks';
import { TGeoShape } from '../../../../types';
import { cn } from '@xipkg/utils';

export const ShapeSet = ({ className }: { className?: string }) => {
  const editor = useEditor();
  const [activeShape, setActiveShape] = useState<TGeoShape | null>(null);
  const { applyStoreStylesForShape } = useDrawStyles();

  const handleShapeClick = (item: TShapeOption) => {
    editor.run(() => {
      editor.setCurrentTool('xi-geo');
      editor.setStyleForNextShapes(GeoShapeGeoStyle, item.geo);

      applyStoreStylesForShape('xi-geo');
      setActiveShape(item.name);
    });
  };

  return (
    <div
      className={cn(
        'border-border-default bg-background-surface flex w-full flex-wrap gap-2 rounded-xl border p-1 shadow-none',
        className,
      )}
    >
      {shapes.map((item) => {
        const isActive = item.name === activeShape;
        return (
          <div
            key={item.name}
            className={`flex rounded-lg p-1 ${isActive ? 'border-border-focus border' : 'border border-transparent'}`}
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
