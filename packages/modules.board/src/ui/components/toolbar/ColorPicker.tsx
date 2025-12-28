import { useState } from 'react';
import { track, useEditor } from 'tldraw';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { Button } from '@xipkg/button';
import { colorOptions } from '../../../utils/customConfig';
import { useTldrawStyles } from '../../../hooks/useTldrawStyles';
import { cn } from '@xipkg/utils';

type ColorOptionT = (typeof colorOptions)[number]['name'];

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
  const [selectedColor, setSelectedColor] = useState<ColorOptionT>('black');

  const selectedShapes = editor.getSelectedShapes();

  const handleColorClick = (colorName: ColorOptionT) => {
    setSelectedShapesColor(colorName);
    setSelectedColor(colorName);
    setOpen(false);
  };

  // Показываем только для стрелок и линий (в tldraw линии - это стрелки без наконечников)
  const isArrowOrLine = selectedShapes.some((shape) => shape.type === 'arrow');

  if (!isArrowOrLine || selectedShapes.length === 0) {
    return null;
  }

  // Находим цвет для иконки
  const currentColorOption = colorOptions.find((opt) => opt.name === selectedColor);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="s" className="hover:bg-brand-0 w-[32px] p-1" title="Цвет">
          <div className={`h-4 w-4 rounded-full ${currentColorOption?.class || 'bg-gray-100'}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={8}
        className="border-gray-10 bg-gray-0 w-auto rounded-xl border p-4 shadow-md"
      >
        <div className="grid grid-cols-5 gap-2">
          {colorOptions.map(({ name, class: colorClass }) => (
            <ColorCircle
              key={name}
              colorClass={colorClass}
              isSelected={selectedColor === name}
              handleClick={() => handleColorClick(name)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
});
