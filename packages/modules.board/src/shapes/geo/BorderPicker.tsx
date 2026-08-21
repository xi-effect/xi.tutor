import { useCallback, useState } from 'react';
import { ColorDot, Picker } from '../../ui/components';
import { BOARD_COLORS } from '../../utils/boardColors';
import { useDrawStyles } from '../../hooks';
import { useDrawStore } from '../../store';
import { Slider } from '@xipkg/slider';
import { Button } from '@xipkg/button';
import { cn } from '@xipkg/utils';
import { useXiGeoStyles } from './useXiGeoStyles';
import { useTranslation } from 'react-i18next';
import { BorderColorStyle } from '../shapeStyles';

const sizes = ['s', 'm', 'l', 'xl'] as const;

type BorderColorName = typeof BorderColorStyle.defaultValue;

export const BorderPicker = () => {
  const { t } = useTranslation('board');
  const [open, setOpen] = useState(false);
  const { setSelectedShapesBorderColor, setSelectedShapesThickness } = useDrawStyles();
  const { setGeoBorderColor, setGeoBorderThickness } = useDrawStore();
  const {
    currentBorderColorOption,
    borderCurrentColorClass,
    borderCurrentColorCss,
    currentBorderThickness,
    isBorderNone,
  } = useXiGeoStyles();

  const handleSize = useCallback(
    (value: number[]) => {
      const size = sizes[value[0] - 1];
      setGeoBorderThickness(size);
      setSelectedShapesThickness(size);
    },
    [setGeoBorderThickness, setSelectedShapesThickness],
  );

  const handleColorClick = useCallback(
    (colorName: BorderColorName) => {
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
      triggerTitle={t('geo.borderColor')}
      triggerChild={
        isBorderNone ? (
          <div
            className="border-border-default h-5 w-5 rounded-full border-2"
            style={{
              backgroundImage:
                'repeating-conic-gradient(rgba(0,0,0,0.3) 0% 25%, transparent 0% 50%)',
              backgroundSize: '10px 10px',
            }}
          />
        ) : (
          <div
            className={cn(
              'h-5 w-5 rounded-full border-3',
              !borderCurrentColorCss && borderCurrentColorClass,
            )}
            style={borderCurrentColorCss ? { borderColor: borderCurrentColorCss } : undefined}
          />
        )
      }
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
                  disabled={isBorderNone}
                />
              </div>
              <span className="text-text-primary w-5 shrink-0 text-xs">
                {currentBorderThickness.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="bg-background-subtle hidden h-8 w-px shrink-0 sm:block" />
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              variant="none"
              size="s"
              className={cn(
                isBorderNone ? 'bg-background-subtle' : 'bg-transparent!',
                'hover:bg-status-info-background p-1',
              )}
              onClick={() => handleColorClick('none')}
              title={t('geo.noBorder')}
            >
              <div
                className="border-border-default h-6 w-6 rounded-full border-2"
                style={{
                  backgroundImage:
                    'repeating-conic-gradient(rgba(0,0,0,0.3) 0% 25%, transparent 0% 50%)',
                  backgroundSize: '10px 10px',
                }}
              />
            </Button>
            {BOARD_COLORS.map(({ name, class: colorClass, cssVar }) => (
              <ColorDot
                key={name}
                colorClass={colorClass}
                colorCss={cssVar}
                isSelected={!isBorderNone && currentBorderColorOption?.name === name}
                onClick={() => handleColorClick(name as BorderColorName)}
              />
            ))}
          </div>
        </div>
      }
    />
  );
};
