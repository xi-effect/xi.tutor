import { useEditor, GeoShapeGeoStyle, DefaultDashStyle } from 'tldraw';
import { ShapeOptionT } from './types';
import { shapes } from './shapeVariants';
import { useState } from 'react';

export const ShapeSet = () => {
  const editor = useEditor();
  const [activeShape, setActiveShape] = useState<string | null>(null);

  const handleShapeClick = (item: ShapeOptionT) => {
    editor.run(() => {
      editor.setStyleForNextShapes(GeoShapeGeoStyle, item.geo);

      if (item.dash) {
        editor.setStyleForNextShapes(DefaultDashStyle, item.dash);
      }

      editor.setCurrentTool('geo');
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
