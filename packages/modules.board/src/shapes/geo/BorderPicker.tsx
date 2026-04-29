import { useCallback, useState } from 'react';
import { ColorDot, Picker } from '../../ui/components';
import { colorOptions } from '../../utils/customConfig';
import { useTldrawStyles } from '../../hooks';
import { useTldrawStore } from '../../store';
import { Slider } from '@xipkg/slider';
import { TColor } from '../../types';
import { useXiGeoStyles } from './useXiGeoStyles';

const sizes = ['s', 'm', 'l', 'xl'] as const;

export const BorderPicker = () => {
  const [open, setOpen] = useState(false);
  const { setSelectedShapesBorderColor, setSelectedShapesThickness } = useTldrawStyles();
  const { setGeoBorderColor, setGeoBorderThickness } = useTldrawStore();
  const { currentBorderColorOption, borderCurrentColorClass, currentBorderThickness } =
    useXiGeoStyles();

  const handleSize = useCallback(
    (value: number[]) => {
      const size = sizes[value[0] - 1];
      setGeoBorderThickness(size);
      setSelectedShapesThickness(size);
    },
    [setGeoBorderThickness, setSelectedShapesThickness],
  );

  const handleColorClick = useCallback(
    (colorName: TColor) => {
      setSelectedShapesBorderColor(colorName);
      setGeoBorderColor(colorName);
    },
    [setSelectedShapesBorderColor, setGeoBorderColor],
  );

  const getSizeIndex = (size: string) => sizes.indexOf(size as (typeof sizes)[number]) + 1;

  return (
    <Picker
      open={open}
      setOpen={setOpen}
      triggerTitle="Цвет обводки"
      triggerChild={<div className={`h-5 w-5 rounded-full border-3 ${borderCurrentColorClass}`} />}
      popoverChild={
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-20 shrink-0 sm:w-24">
                <Slider
                  onValueChange={handleSize}
                  value={[getSizeIndex(currentBorderThickness)]}
                  min={1}
                  max={4}
                  step={1}
                  minStepsBetweenThumbs={1}
                />
              </div>
              <span className="text-gray-80 w-5 shrink-0 text-xs">
                {currentBorderThickness.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="bg-gray-10 hidden h-8 w-px shrink-0 sm:block" />
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-1.5">
              {colorOptions &&
                colorOptions.map(({ name, class: colorClass }) => (
                  <ColorDot
                    key={name}
                    colorClass={colorClass}
                    isSelected={currentBorderColorOption?.name === name}
                    onClick={() => handleColorClick(name)}
                  />
                ))}
            </div>
          </div>
        </div>
      }
    />
  );
};
