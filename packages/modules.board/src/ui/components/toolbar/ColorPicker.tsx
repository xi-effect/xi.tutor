import { useState, useCallback } from 'react';
import { track, useEditor, useValue } from '@ibodr/draw';
import { Slider } from '@xipkg/slider';
import { BOARD_COLORS } from '../../../utils/boardColors';
import { useDrawStyles } from '../../../hooks/useDrawStyles';
import { ColorDot } from '../canvas';
import { FillTypePicker } from '../../../shapes/geo';
import { useDrawStore } from '../../../store';
import { Picker } from '../popups';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { FlipCardShape } from '../../../shapes/flipCard/FlipCardShape';

const sizes = ['xs', 's', 'm', 'l', 'xl'] as const;

const supportedShapeTypes = new Set([
  'arrow',
  'xi-geo',
  'xi-polygon',
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

  // useValue: React Compiler иначе запоминает getSelectedShapes() и слайдер
  // толщины (и цвет) остаются на значении с первого рендера.
  const selection = useValue(
    'color-picker-selection',
    () => {
      const shapes = editor.getSelectedShapes();
      const first = shapes[0] as
        | {
            id?: string;
            type?: string;
            opacity?: number;
            props?: {
              color?: string;
              size?: string;
              isFlipped?: boolean;
              frontColor?: string;
              backColor?: string;
            };
          }
        | undefined;
      const flip = shapes.length === 1 && first?.type === 'flip-card' ? first : null;
      let color = 'black';
      if (flip?.props) {
        color = flip.props.isFlipped
          ? (flip.props.backColor ?? 'black')
          : (flip.props.frontColor ?? 'black');
      } else if (
        first?.props?.color &&
        BOARD_COLORS.some((opt) => opt.name === first.props?.color)
      ) {
        color = first.props.color;
      }
      const opacity = first?.opacity;
      return {
        count: shapes.length,
        flipId: flip?.id ?? null,
        flipIsFlipped: flip?.props?.isFlipped ?? false,
        color,
        size: first?.props?.size || 'm',
        opacity: opacity === undefined ? 100 : Math.round(opacity * 100),
        isGeo: shapes.some((shape) => shape.type === 'xi-geo' || shape.type === 'xi-polygon'),
        isCoordinateAxes: shapes.some((shape) => shape.type === 'coordinate-axes'),
        isDrawShape: shapes.some((shape) => drawShapeTypes.has(shape.type)),
        isSupported: shapes.some((shape) => supportedShapeTypes.has(shape.type)),
      };
    },
    [editor],
  );

  const handleColorClick = useCallback(
    (colorName: string) => {
      if (selection.flipId) {
        const propKey = selection.flipIsFlipped ? 'backColor' : 'frontColor';
        editor.updateShape<FlipCardShape>({
          id: selection.flipId as FlipCardShape['id'],
          type: 'flip-card',
          props: { [propKey]: colorName as FlipCardShape['props']['frontColor'] },
        });
        return;
      }

      setSelectedShapesColor(colorName);
      if (selection.isGeo) setGeoColor(colorName);
    },
    [
      selection.flipId,
      selection.flipIsFlipped,
      selection.isGeo,
      editor,
      setSelectedShapesColor,
      setGeoColor,
    ],
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

  if (!selection.isSupported || selection.count === 0) {
    return null;
  }

  const currentColorOption = BOARD_COLORS.find((opt) => opt.name === selection.color);
  const getSizeIndex = (size: string) => {
    const index = sizes.indexOf(size as (typeof sizes)[number]);
    return (index === -1 ? sizes.indexOf('m') : index) + 1;
  };

  return (
    <Picker
      open={open}
      setOpen={setOpen}
      triggerTitle={selection.isCoordinateAxes ? t('toolbar.axisColor') : t('toolbar.style')}
      triggerChild={
        <div
          className={cn(
            'border-border-default h-4 w-4 rounded-full border',
            !currentColorOption?.cssVar && 'bg-gray-100',
          )}
          style={
            currentColorOption?.cssVar ? { backgroundColor: currentColorOption.cssVar } : undefined
          }
        />
      }
      popoverChild={
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          {selection.isDrawShape && (
            <>
              <div className="flex min-w-0 flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-20 shrink-0 sm:w-24">
                    <Slider
                      onValueChange={handleSize}
                      value={[getSizeIndex(selection.size)]}
                      min={1}
                      max={5}
                      step={1}
                    />
                  </div>
                  <span className="text-text-primary w-5 shrink-0 text-xs">
                    {(selection.size || 'm').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 shrink-0 sm:w-24">
                    <Slider
                      onValueChange={handleOpacity}
                      value={[selection.opacity]}
                      min={10}
                      max={100}
                      step={10}
                    />
                  </div>
                  <span className="text-text-primary w-5 shrink-0 text-xs">
                    {selection.opacity}
                  </span>
                </div>
              </div>
              <div className="bg-border-default hidden h-8 w-px shrink-0 sm:block" />
            </>
          )}

          {selection.isGeo && (
            <>
              <FillTypePicker />
              <div className="bg-border-default hidden h-8 w-px shrink-0 sm:block" />
            </>
          )}

          <div className="flex flex-wrap items-center gap-1.5">
            {BOARD_COLORS.map(({ name, class: colorClass, cssVar }) => (
              <ColorDot
                key={name}
                colorClass={colorClass}
                colorCss={cssVar}
                isSelected={selection.color === name}
                onClick={() => handleColorClick(name)}
              />
            ))}
          </div>
        </div>
      }
    />
  );
});
