import { colorOptions } from '../../../../utils/customConfig';
import { useTldrawStyles } from '../../../../hooks/useTldrawStyles';
import { useTldrawStore } from '../../../../store/useTldrawStore';

type ColorOptionT = (typeof colorOptions)[number]['name'];

type ColorCircleT = {
  colorClass: string;
  isSelected: boolean;
  handleClick: () => void;
};

const ColorCircle = ({ colorClass, isSelected, handleClick }: ColorCircleT) => (
  <div
    className={`m-auto flex h-[36px] w-[36px] items-center justify-center rounded-full ${isSelected ? 'border-grey-100 border' : 'border border-transparent'}`}
  >
    <button
      onClick={() => handleClick()}
      type="button"
      aria-label={`Select ${colorClass}`}
      tabIndex={0}
      className={`h-[31px] w-[31px] cursor-pointer rounded-full ${colorClass}`}
    />
  </div>
);

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
        <ColorCircle
          key={name}
          colorClass={colorClass}
          isSelected={selectedColor === name}
          handleClick={() => handleColorClick(name)}
        />
      ))}
    </div>
  );
};
