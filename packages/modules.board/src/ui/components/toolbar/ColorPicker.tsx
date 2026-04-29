import { useState, useMemo, useCallback } from 'react';
import { track, useEditor } from 'tldraw';
import { Slider } from '@xipkg/slider';
import { colorOptions } from '../../../utils/customConfig';
import { navBarElements } from '../../../utils/navBarElements';
import { useTldrawStyles } from '../../../hooks/useTldrawStyles';
import { ColorDot } from '../canvas';
import { FillTypePicker } from '../../../shapes/geo';
import { useTldrawStore } from '../../../store';
import { Picker } from '../popups';

const stickerColorMap: Record<string, string> = {
  grey: 'bg-gray-60',
  blue: 'bg-brand-80',
  red: 'bg-red-80',
  green: 'bg-green-80',
  'light-red': 'bg-orange-80',
  yellow: 'bg-yellow-100',
  violet: 'bg-violet-100',
  'light-violet': 'bg-pink-100',
  'light-blue': 'bg-cyan-100',
};

const stickerColors =
  navBarElements
    .find((item) => item.action === 'sticker')
    ?.menuPopupContent?.map((item) => ({
      name: item.color,
      class: stickerColorMap[item.color] || 'bg-gray-60',
    })) || [];

const sizes = ['xs', 's', 'm', 'l', 'xl'] as const;

const supportedShapeTypes = new Set(['arrow', 'xi-geo', 'text', 'draw', 'note', 'frame']);
const drawShapeTypes = new Set(['draw']);

export const ColorPicker = track(() => {
  const [open, setOpen] = useState(false);
  const editor = useEditor();
  const { setSelectedShapesColor, setSelectedShapesThickness, setSelectedShapesOpacity } =
    useTldrawStyles();
  const { setGeoColor } = useTldrawStore();

  const selectedShapes = editor.getSelectedShapes();

  const isSticker = useMemo(
    () => selectedShapes.some((shape) => shape.type === 'note'),
    [selectedShapes],
  );

  const isGeo = useMemo(
    () => selectedShapes.some((shape) => shape.type === 'xi-geo'),
    [selectedShapes],
  );

  const isDrawShape = useMemo(
    () => selectedShapes.some((shape) => drawShapeTypes.has(shape.type)),
    [selectedShapes],
  );

  const availableColors = useMemo(() => (isSticker ? stickerColors : colorOptions), [isSticker]);

  const currentColor = useMemo((): string => {
    if (selectedShapes.length === 0) return isSticker ? 'grey' : 'black';
    try {
      const shapeProps = (selectedShapes[0] as { props?: { color?: string } }).props;
      if (shapeProps?.color && availableColors.some((opt) => opt.name === shapeProps.color)) {
        return shapeProps.color;
      }
    } catch (error) {
      console.warn('Error getting shape color:', error);
    }
    return isSticker ? 'grey' : 'black';
  }, [selectedShapes, isSticker, availableColors]);

  const currentThickness = useMemo((): string => {
    if (selectedShapes.length === 0) return 'm';
    try {
      const shapeProps = (selectedShapes[0] as { props?: { size?: string } }).props;
      if (shapeProps?.size) return shapeProps.size;
    } catch {
      /* fallback */
    }
    return 'm';
  }, [selectedShapes]);

  const currentOpacity = useMemo((): number => {
    if (selectedShapes.length === 0) return 100;
    try {
      const opacity = (selectedShapes[0] as { opacity?: number }).opacity;
      if (opacity !== undefined) return Math.round(opacity * 100);
    } catch {
      /* fallback */
    }
    return 100;
  }, [selectedShapes]);

  const handleColorClick = useCallback(
    (colorName: string) => {
      setSelectedShapesColor(colorName);
      if (isGeo) setGeoColor(colorName);
    },
    [setSelectedShapesColor, setGeoColor, isGeo],
  );

  const handleSize = useCallback(
    (value: number[]) => {
      const size = sizes[value[0] - 1];
      setSelectedShapesThickness(size);
    },
    [setSelectedShapesThickness],
  );

  const handleOpacity = useCallback(
    (value: number[]) => {
      setSelectedShapesOpacity(value[0]);
    },
    [setSelectedShapesOpacity],
  );

  const isSupportedShape = selectedShapes.some((shape) => supportedShapeTypes.has(shape.type));

  if (!isSupportedShape || selectedShapes.length === 0) {
    return null;
  }

  const currentColorOption = availableColors.find((opt) => opt.name === currentColor);
  const getSizeIndex = (size: string) => sizes.indexOf(size as (typeof sizes)[number]) + 1;

  return (
    <Picker
      open={open}
      setOpen={setOpen}
      triggerTitle="Стиль"
      triggerChild={
        <div
          className={`h-4 w-4 rounded-full ${currentColorOption?.class || (isSticker ? 'bg-gray-60' : 'bg-gray-100')}`}
        />
      }
      popoverChild={
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          {/* Слайдеры — только для draw-фигур */}
          {isDrawShape && (
            <>
              <div className="flex min-w-0 flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-20 shrink-0 sm:w-24">
                    <Slider
                      onValueChange={handleSize}
                      value={[getSizeIndex(currentThickness)]}
                      min={1}
                      max={5}
                      step={1}
                      minStepsBetweenThumbs={1}
                    />
                  </div>
                  <span className="text-gray-80 w-5 shrink-0 text-xs">
                    {(currentThickness || 'm').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="border-green-80 w-20 shrink-0 sm:w-24">
                    <Slider
                      onValueChange={handleOpacity}
                      value={[currentOpacity]}
                      min={10}
                      max={100}
                      step={10}
                    />
                  </div>
                  <span className="text-gray-80 w-5 shrink-0 text-xs">{currentOpacity}</span>
                </div>
              </div>
              <div className="bg-gray-10 hidden h-8 w-px shrink-0 sm:block" />
            </>
          )}

          {/* Тип заливки */}
          {isGeo && (
            <>
              <FillTypePicker />
              <div className="bg-gray-10 hidden h-8 w-px shrink-0 sm:block" />
            </>
          )}

          {/* Цвета */}
          <div className="flex flex-wrap items-center gap-1.5">
            {availableColors.map(({ name, class: colorClass }) => (
              <ColorDot
                key={name}
                colorClass={colorClass}
                isSelected={currentColor === name}
                onClick={() => handleColorClick(name)}
              />
            ))}
          </div>
        </div>
      }
    />
  );
});
