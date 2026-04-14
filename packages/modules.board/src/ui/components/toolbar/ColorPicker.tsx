import { useState, useMemo, useCallback } from 'react';
import { track, useEditor } from 'tldraw';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { Slider } from '@xipkg/slider';
import { Button } from '@xipkg/button';
import { colorOptions } from '../../../utils/customConfig';
import { navBarElements } from '../../../utils/navBarElements';
import { useTldrawStyles } from '../../../hooks/useTldrawStyles';
import { cn } from '@xipkg/utils';

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

const supportedShapeTypes = new Set(['arrow', 'geo', 'text', 'draw', 'note']);
const drawShapeTypes = new Set(['draw']);

type ColorDotProps = {
  colorClass: string;
  isSelected: boolean;
  onClick: () => void;
};

const ColorDot = ({ colorClass, isSelected, onClick }: ColorDotProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'h-6 w-6 shrink-0 cursor-pointer rounded-full transition-all',
      colorClass,
      isSelected ? 'ring-2 ring-gray-100 ring-offset-1' : 'hover:scale-110',
    )}
    aria-label={`Color ${colorClass}`}
  />
);

export const ColorPicker = track(() => {
  const editor = useEditor();
  const { setSelectedShapesColor, setSelectedShapesThickness, setSelectedShapesOpacity } =
    useTldrawStyles();
  const [open, setOpen] = useState(false);

  const selectedShapes = editor.getSelectedShapes();

  const isSticker = useMemo(
    () => selectedShapes.some((shape) => shape.type === 'note'),
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
    },
    [setSelectedShapesColor],
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="none" size="s" className="hover:bg-brand-0 w-[32px] p-1" title="Стиль">
          <div
            className={`h-4 w-4 rounded-full ${currentColorOption?.class || (isSticker ? 'bg-gray-60' : 'bg-gray-100')}`}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={8}
        className="border-gray-10 bg-gray-0 w-auto rounded-xl border p-3 shadow-md"
      >
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
                  <div className="w-20 shrink-0 sm:w-24">
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
      </PopoverContent>
    </Popover>
  );
});
