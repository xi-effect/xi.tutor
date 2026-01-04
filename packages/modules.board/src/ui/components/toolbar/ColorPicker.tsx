import { useState, useMemo } from 'react';
import { track, useEditor } from 'tldraw';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { Button } from '@xipkg/button';
import { colorOptions } from '../../../utils/customConfig';
import { navBarElements } from '../../../utils/navBarElements';
import { useTldrawStyles } from '../../../hooks/useTldrawStyles';
import { cn } from '@xipkg/utils';

// Маппинг цветов стикеров на CSS классы
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

// Цвета для стикеров из navBarElements
const stickerColors =
  navBarElements
    .find((item) => item.action === 'sticker')
    ?.menuPopupContent?.map((item) => ({
      name: item.color,
      class: stickerColorMap[item.color] || 'bg-gray-60',
    })) || [];

type ColorCircleT = {
  colorClass: string;
  isSelected: boolean;
  handleClick: () => void;
};

const ColorCircle = ({ colorClass, isSelected, handleClick }: ColorCircleT) => (
  <div
    className={cn(
      'm-auto flex h-[36px] w-[36px] items-center justify-center rounded-full',
      isSelected ? 'border-grey-100 border' : 'border border-transparent',
    )}
  >
    <button
      onClick={handleClick}
      type="button"
      aria-label={`Select ${colorClass}`}
      tabIndex={0}
      className={`h-[31px] w-[31px] cursor-pointer rounded-full ${colorClass}`}
    />
  </div>
);

export const ColorPicker = track(() => {
  const editor = useEditor();
  const { setSelectedShapesColor } = useTldrawStyles();
  const [open, setOpen] = useState(false);

  const selectedShapes = editor.getSelectedShapes();

  // Определяем, является ли выбранный элемент стикером
  const isSticker = useMemo(() => {
    return selectedShapes.some((shape) => shape.type === 'note');
  }, [selectedShapes]);

  // Получаем доступные цвета в зависимости от типа элемента
  const availableColors = useMemo(() => {
    return isSticker ? stickerColors : colorOptions;
  }, [isSticker]);

  // Получаем текущий цвет из выбранной фигуры (стрелки, геометрические фигуры, текст, рукописные линии или стикеры)
  const currentColor = useMemo((): string => {
    if (selectedShapes.length === 0) return isSticker ? 'grey' : 'black';

    try {
      const firstShape = selectedShapes[0];
      // В tldraw стили хранятся в props фигуры
      // Цвет может быть в shape.props.color для стрелок, geo фигур, текста, рукописных линий и стикеров
      const shapeProps = (firstShape as { props?: { color?: string } }).props;
      if (shapeProps?.color) {
        const color = shapeProps.color;
        // Проверяем, что цвет есть в списке доступных цветов
        if (availableColors.some((opt) => opt.name === color)) {
          return color;
        }
      }
    } catch (error) {
      console.warn('Error getting shape color:', error);
    }

    return isSticker ? 'grey' : 'black';
  }, [selectedShapes, isSticker, availableColors]);

  const handleColorClick = (colorName: string) => {
    setSelectedShapesColor(colorName);
    setOpen(false);
  };

  // Показываем для стрелок, линий, геометрических фигур, текста, рукописных линий и стикеров
  // В tldraw линии - это стрелки без наконечников, геометрические фигуры имеют тип 'geo',
  // текст - тип 'text', рукописные линии - тип 'draw', стикеры - тип 'note'
  const isSupportedShape = selectedShapes.some(
    (shape) =>
      shape.type === 'arrow' ||
      shape.type === 'geo' ||
      shape.type === 'text' ||
      shape.type === 'draw' ||
      shape.type === 'note',
  );

  if (!isSupportedShape || selectedShapes.length === 0) {
    return null;
  }

  // Находим цвет для иконки
  const currentColorOption = availableColors.find((opt) => opt.name === currentColor);

  // Определяем количество колонок для сетки (для стикеров может быть другое количество)
  const gridCols = isSticker ? 'grid-cols-5' : 'grid-cols-5';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="s" className="hover:bg-brand-0 w-[32px] p-1" title="Цвет">
          <div
            className={`h-4 w-4 rounded-full ${currentColorOption?.class || (isSticker ? 'bg-gray-60' : 'bg-gray-100')}`}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={8}
        className="border-gray-10 bg-gray-0 w-auto rounded-xl border p-4 shadow-md"
      >
        <div className={`grid ${gridCols} gap-2`}>
          {availableColors.map(({ name, class: colorClass }) => (
            <ColorCircle
              key={name}
              colorClass={colorClass}
              isSelected={currentColor === name}
              handleClick={() => handleColorClick(name)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
});
