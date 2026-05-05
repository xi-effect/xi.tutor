import { colorOptions } from '../../../../utils/customConfig';
import { useTldrawStyles } from '../../../../hooks/useTldrawStyles';
import { useTldrawStore } from '../../../../store/useTldrawStore';
import { ColorDot } from '../../canvas';

type ColorOptionT = (typeof colorOptions)[number]['name'];

type ColorGridProps = {
  currentColor?: string;
};

export const ColorGrid = ({ currentColor }: ColorGridProps) => {
  const { pencilColor, setPencilColor } = useTldrawStore();
  const { setColor } = useTldrawStyles();

  const handleColorClick = (colorName: ColorOptionT) => {
    setColor(colorName);
    setPencilColor(colorName);
  };

  // Используем цвет из стора, если не передан внешний
  const selectedColor = currentColor || pencilColor;

  return (
    <div className="grid grid-cols-5 gap-2">
      {colorOptions.map(({ name, class: colorClass }) => (
        <ColorDot
          key={name}
          colorClass={colorClass}
          isSelected={selectedColor === name}
          onClick={() => handleColorClick(name)}
        />
      ))}
    </div>
  );
};
