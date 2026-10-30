import { Slider } from '@xipkg/slider';
import { useDrawStore } from '../../../../store/useDrawStore';
import { useDrawStyles } from '../../../../hooks/useDrawStyles';
import { BOARD_COLORS, getBoardColorOption } from '../../../../utils/boardColors';
import { cn } from '@xipkg/utils';
import type { PenPreset, PenThickness } from '../../../../store/useDrawStore';
import { ColorDot } from '../../canvas';

const sizes = ['xs', 's', 'm', 'l', 'xl'] as const;

const thicknessSizeMap: Record<string, number> = {
  xs: 8,
  s: 12,
  m: 16,
  l: 20,
  xl: 24,
};

type PresetButtonProps = {
  preset: PenPreset;
  isActive: boolean;
  onClick: () => void;
};

const PresetButton = ({ preset, isActive, onClick }: PresetButtonProps) => {
  const dotSize = thicknessSizeMap[preset.thickness] ?? 16;
  const colorOption = getBoardColorOption(preset.color);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all',
        isActive
          ? 'ring-border-focus ring-2 ring-offset-1'
          : 'hover:ring-border-control hover:ring-1',
      )}
      aria-label="Preset"
    >
      <span
        className={cn('block rounded-full', !colorOption?.cssVar && 'bg-gray-100')}
        style={{
          width: dotSize,
          height: dotSize,
          opacity: preset.opacity / 100,
          backgroundColor: colorOption?.cssVar,
        }}
      />
    </button>
  );
};

const HORIZONTAL_SLIDER_LENGTH = 'w-20 sm:w-24';
/** Та же длина, что у горизонтального слайдера, только по вертикали. */
const VERTICAL_SLIDER_LENGTH = 'h-24';

const PenSlider = ({
  vertical,
  value,
  min,
  max,
  step,
  label,
  onValueChange,
}: {
  vertical: boolean;
  value: number[];
  min: number;
  max: number;
  step: number;
  label: string;
  onValueChange: (value: number[]) => void;
}) => (
  <div className={cn('flex gap-2', vertical ? 'flex-col items-center' : 'items-center')}>
    <div className={vertical ? VERTICAL_SLIDER_LENGTH : HORIZONTAL_SLIDER_LENGTH}>
      <Slider
        orientation={vertical ? 'vertical' : 'horizontal'}
        onValueChange={onValueChange}
        value={value}
        min={min}
        max={max}
        step={step}
        className={vertical ? 'h-full w-4 flex-col' : undefined}
        trackClassName={vertical ? 'h-full w-1' : undefined}
        rangeClassName={vertical ? 'w-full' : undefined}
      />
    </div>
    <span className={cn('text-text-primary shrink-0 text-xs', !vertical && 'w-5')}>{label}</span>
  </div>
);

export const OpacitySizeMenu = ({
  className,
  vertical = false,
}: {
  className?: string;
  vertical?: boolean;
}) => {
  const {
    pencilColor,
    pencilThickness,
    pencilOpacity,
    setPencilColor,
    setPencilThickness,
    setPencilOpacity,
    penPresets,
    activePresetIndex,
    setActivePreset,
  } = useDrawStore();

  const { setColor, setThickness, setOpacity } = useDrawStyles();

  const handleSize = (value: number[]) => {
    const size = sizes[value[0] - 1];
    setThickness(size);
    setPencilThickness(size);
  };

  const handleOpacity = (value: number[]) => {
    const opacity = value[0];
    setOpacity(opacity);
    setPencilOpacity(opacity);
  };

  const handleColorClick = (colorName: string) => {
    setColor(colorName);
    setPencilColor(colorName);
  };

  const handlePresetClick = (index: number) => {
    setActivePreset(index);
    const preset = penPresets[index];
    setColor(preset.color);
    setThickness(preset.thickness as PenThickness);
    setOpacity(preset.opacity);
  };

  const getSizeIndex = (size: string) => sizes.indexOf(size as (typeof sizes)[number]) + 1;

  return (
    <div
      className={cn(
        'border-border-default bg-background-surface rounded-xl border shadow-none',
        vertical ? 'w-fit' : 'w-full',
        className,
      )}
    >
      <div
        className={cn(
          'flex w-full flex-col items-stretch gap-3 p-3',
          vertical ? 'w-fit items-center' : 'sm:flex-row sm:items-center',
        )}
      >
        <div
          className={cn(
            'flex shrink-0 gap-1.5',
            vertical ? 'flex-col items-center' : 'items-center',
          )}
        >
          {penPresets.map((preset, index) => (
            <PresetButton
              key={index}
              preset={preset}
              isActive={index === activePresetIndex}
              onClick={() => handlePresetClick(index)}
            />
          ))}
        </div>

        <div
          className={cn(
            'bg-border-default shrink-0',
            vertical ? 'h-px w-full' : 'hidden h-8 w-px sm:block',
          )}
        />

        <div className={cn('flex min-w-0 gap-3', vertical ? 'items-end' : 'flex-col')}>
          <PenSlider
            vertical={vertical}
            value={[getSizeIndex(pencilThickness)]}
            min={1}
            max={5}
            step={1}
            label={pencilThickness.toUpperCase()}
            onValueChange={handleSize}
          />
          <PenSlider
            vertical={vertical}
            value={[pencilOpacity]}
            min={10}
            max={100}
            step={10}
            label={String(pencilOpacity)}
            onValueChange={handleOpacity}
          />
        </div>

        <div
          className={cn(
            'bg-border-default shrink-0',
            vertical ? 'h-px w-full' : 'hidden h-8 w-px sm:block',
          )}
        />

        <div
          className={cn('flex items-center gap-1.5', vertical ? 'grid grid-cols-2' : 'flex-wrap')}
        >
          {BOARD_COLORS.map(({ name, class: colorClass, cssVar }) => (
            <ColorDot
              key={name}
              colorClass={colorClass}
              colorCss={cssVar}
              isSelected={pencilColor === name}
              onClick={() => handleColorClick(name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
