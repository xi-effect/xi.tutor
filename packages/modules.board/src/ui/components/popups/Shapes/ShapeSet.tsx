import { useState } from 'react';
import { useEditor, GeoShapeGeoStyle } from 'tldraw';
import { TShapeOption } from './types';
import { shapes } from './shapeVariants';
import { useTldrawStyles } from '../../../../hooks';
import { TGeoShape } from '../../../../types';

export const ShapeSet = () => {
  const editor = useEditor();
  const [activeShape, setActiveShape] = useState<TGeoShape | null>(null);
  const { applyStoreStylesForShape } = useTldrawStyles();

  const handleShapeClick = (item: TShapeOption) => {
    editor.run(() => {
      editor.setCurrentTool('xi-geo');
      editor.setStyleForNextShapes(GeoShapeGeoStyle, item.geo);

      applyStoreStylesForShape('xi-geo');
      setActiveShape(item.name);
    });
  };

  return (
    <div className="border-gray-10 bg-gray-0 flex w-full gap-2 rounded-xl border p-1 shadow-none">
      {shapes.map((item) => {
        const isActive = item.name === activeShape;
        return (
          <div
            key={item.name}
            className={`flex rounded-lg p-1 ${isActive ? 'border-brand-60 border' : 'border border-transparent'}`}
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
