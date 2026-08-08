import { colorOptions } from '../../../../utils/customConfig';
import { useDrawStyles } from '../../../../hooks/useDrawStyles';
import { useDrawStore } from '../../../../store/useDrawStore';
import { ColorDot } from '../../canvas';

type ColorOptionT = (typeof colorOptions)[number]['name'];

type ColorGridProps = {
  currentColor?: string;
};

export const ColorGrid = ({ currentColor }: ColorGridProps) => {
  const { pencilColor, setPencilColor } = useDrawStore();
  const { setColor } = useDrawStyles();

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
