import { Slider } from '@xipkg/slider';
import { ColorGrid } from './ColorSet';
import { useTldrawStore } from '../../../../store/useTldrawStore';
import { useTldrawStyles } from '../../../../hooks/useTldrawStyles';

const sizes = ['s', 'm', 'l', 'xl'] as const;

export const OpacitySizeMenu = () => {
  // Получаем значения и функции из стора
  const { pencilColor, pencilThickness, pencilOpacity, setPencilThickness, setPencilOpacity } =
    useTldrawStore();

  // Получаем функции для обновления стилей в редакторе
  const { setThickness, setOpacity } = useTldrawStyles();

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

  // Получаем индекс текущего размера для слайдера
  const getSizeIndex = (size: string) => {
    return sizes.indexOf(size as (typeof sizes)[number]) + 1;
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2 md:flex-row">
      <div className="w-[276px] p-2">
        <div className="flex w-full flex-col justify-center gap-6">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="w-full">
              <Slider
                onValueChange={(value) => handleSize(value)}
                value={[getSizeIndex(pencilThickness)]}
                min={1}
                max={4}
                step={1}
                minStepsBetweenThumbs={1}
              />
            </div>
            <div className="w-8">
              <p>{pencilThickness.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex w-full items-center justify-between gap-4">
            <div className="w-full">
              <Slider
                onValueChange={(value) => handleOpacity(value)}
                value={[pencilOpacity]}
                min={10}
                max={100}
                step={1}
              />
            </div>
            <div className="w-8">
              <p>{pencilOpacity}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[276px] p-2">
        <ColorGrid currentColor={pencilColor} />
      </div>
    </div>
  );
};
