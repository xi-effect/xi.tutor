import { BOARD_COLORS } from '../../../../utils/boardColors';
import { useDrawStyles } from '../../../../hooks/useDrawStyles';
import { useDrawStore } from '../../../../store/useDrawStore';
import { ColorDot } from '../../canvas';
import type { TColor } from '../../../../types';

type ColorGridProps = {
  currentColor?: string;
};

export const ColorGrid = ({ currentColor }: ColorGridProps) => {
  const { pencilColor, setPencilColor } = useDrawStore();
  const { setColor } = useDrawStyles();

  const handleColorClick = (colorName: TColor) => {
    setColor(colorName);
    setPencilColor(colorName);
  };

  const selectedColor = currentColor || pencilColor;

  return (
    <div className="grid grid-cols-5 gap-2">
      {BOARD_COLORS.map(({ name, class: colorClass, cssVar }) => (
        <ColorDot
          key={name}
          colorClass={colorClass}
          colorCss={cssVar}
          isSelected={selectedColor === name}
          onClick={() => handleColorClick(name)}
        />
      ))}
    </div>
  );
};
