import { Slider } from '@xipkg/slider';
import { useTldrawStore } from '../../../../store/useTldrawStore';
import { useTldrawStyles } from '../../../../hooks/useTldrawStyles';
import { colorOptions } from '../../../../utils/customConfig';
import { cn } from '@xipkg/utils';
import type { PenPreset, PenThickness } from '../../../../store/useTldrawStore';
import { ColorDot } from '../../canvas';

const sizes = ['xs', 's', 'm', 'l', 'xl'] as const;

const colorClassMap: Record<string, string> = Object.fromEntries(
  colorOptions.map(({ name, class: cls }) => [name, cls]),
);

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

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all',
        isActive ? 'ring-brand-80 ring-2 ring-offset-1' : 'hover:ring-gray-30 hover:ring-1',
      )}
      aria-label="Preset"
    >
      <span
        className={cn('block rounded-full', colorClassMap[preset.color] || 'bg-gray-100')}
        style={{
          width: dotSize,
          height: dotSize,
          opacity: preset.opacity / 100,
        }}
      />
    </button>
  );
};

export const OpacitySizeMenu = () => {
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
  } = useTldrawStore();

  const { setColor, setThickness, setOpacity } = useTldrawStyles();

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
    <div className="border-gray-10 bg-gray-0 w-full rounded-xl border shadow-none">
      <div className="flex w-full flex-col items-stretch gap-3 p-3 sm:flex-row sm:items-center">
        {/* Пресеты */}
        <div className="flex shrink-0 items-center gap-1.5">
          {penPresets.map((preset, index) => (
            <PresetButton
              key={index}
              preset={preset}
              isActive={index === activePresetIndex}
              onClick={() => handlePresetClick(index)}
            />
          ))}
        </div>

        <div className="bg-gray-10 hidden h-8 w-px shrink-0 sm:block" />

        {/* Слайдеры */}
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-20 shrink-0 sm:w-24">
              <Slider
                onValueChange={handleSize}
                value={[getSizeIndex(pencilThickness)]}
                min={1}
                max={5}
                step={1}
                minStepsBetweenThumbs={1}
              />
            </div>
            <span className="text-gray-80 w-5 shrink-0 text-xs">
              {pencilThickness.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 shrink-0 sm:w-24">
              <Slider
                onValueChange={handleOpacity}
                value={[pencilOpacity]}
                min={10}
                max={100}
                step={10}
              />
            </div>
            <span className="text-gray-80 w-5 shrink-0 text-xs">{pencilOpacity}</span>
          </div>
        </div>

        <div className="bg-gray-10 hidden h-8 w-px shrink-0 sm:block" />

        {/* Цвета */}
        <div className="flex flex-wrap items-center gap-1.5">
          {colorOptions.map(({ name, class: colorClass }) => (
            <ColorDot
              key={name}
              colorClass={colorClass}
              isSelected={pencilColor === name}
              onClick={() => handleColorClick(name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
