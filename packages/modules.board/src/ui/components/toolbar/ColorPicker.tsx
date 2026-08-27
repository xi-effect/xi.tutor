import { useState, useMemo, useCallback } from 'react';
import { track, useEditor } from '@ibodr/draw';
import { Slider } from '@xipkg/slider';
import { BOARD_COLORS } from '../../../utils/boardColors';
import { useDrawStyles } from '../../../hooks/useDrawStyles';
import { ColorDot } from '../canvas';
import { FillTypePicker } from '../../../shapes/geo';

import { useDrawStore } from '../../../store';
import { Picker } from '../popups';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';

const sizes = ['xs', 's', 'm', 'l', 'xl'] as const;

const supportedShapeTypes = new Set([
  'arrow',
  'xi-geo',
  'text',
  'draw',
  'note',
  'frame',
  'coordinate-axes',
  'flip-card',
  'math-figure',
]);
const drawShapeTypes = new Set(['draw']);

export const ColorPicker = track(() => {
  const { t } = useTranslation('board');
  const [open, setOpen] = useState(false);
  const editor = useEditor();
  const { setSelectedShapesColor, setSelectedShapesThickness, setSelectedShapesOpacity } =
    useDrawStyles();
  const { setGeoColor } = useDrawStore();

  const selectedShapes = editor.getSelectedShapes();

  const isGeo = useMemo(
    () => selectedShapes.some((shape) => shape.type === 'xi-geo'),
    [selectedShapes],
  );

  const isCoordinateAxes = useMemo(
    () => selectedShapes.some((shape) => shape.type === 'coordinate-axes'),
    [selectedShapes],
  );

  const isDrawShape = useMemo(
    () => selectedShapes.some((shape) => drawShapeTypes.has(shape.type)),
    [selectedShapes],
  );

  const currentColor = useMemo((): string => {
    if (selectedShapes.length === 0) return 'black';
    try {
      const shapeProps = (selectedShapes[0] as { props?: { color?: string } }).props;
      if (shapeProps?.color && BOARD_COLORS.some((opt) => opt.name === shapeProps.color)) {
        return shapeProps.color;
      }
    } catch (error) {
      console.warn('Error getting shape color:', error);
    }
    return 'black';
  }, [selectedShapes]);

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
    [ setSelectedShapesColor, isGeo, setGeoColor],
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

  const currentColorOption = BOARD_COLORS.find((opt) => opt.name === currentColor);
  const getSizeIndex = (size: string) => sizes.indexOf(size as (typeof sizes)[number]) + 1;

  return (
    <Picker
      open={open}
      setOpen={setOpen}
      triggerTitle={isCoordinateAxes ? t('toolbar.axisColor') : t('toolbar.style')}
      triggerChild={
        <div
          className={cn('h-4 w-4 rounded-full', !currentColorOption?.cssVar && 'bg-gray-100')}
          style={
            currentColorOption?.cssVar ? { backgroundColor: currentColorOption.cssVar } : undefined
          }
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
                    />
                  </div>
                  <span className="text-text-primary w-5 shrink-0 text-xs">
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
                  <span className="text-text-primary w-5 shrink-0 text-xs">{currentOpacity}</span>
                </div>
              </div>
              <div className="bg-border-default hidden h-8 w-px shrink-0 sm:block" />
            </>
          )}

          {/* Тип заливки */}
          {isGeo && (
            <>
              <FillTypePicker />
              <div className="bg-border-default hidden h-8 w-px shrink-0 sm:block" />
            </>
          )}

          {/* Цвета */}
          <div className="flex flex-wrap items-center gap-1.5">
            {BOARD_COLORS.map(({ name, class: colorClass, cssVar }) => (
              <ColorDot
                key={name}
                colorClass={colorClass}
                colorCss={cssVar}
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
