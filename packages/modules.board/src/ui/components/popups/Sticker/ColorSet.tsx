import { useTldrawStyles } from '../../../../hooks';
import { useTldrawStore } from '../../../../store';
import { PopupItemT } from '../../../../utils/navBarElements';

export const ColorSet = ({ popupItems }: { popupItems?: PopupItemT[] }) => {
  const { setStickerColor, stickerColor } = useTldrawStore();

  const { setColor } = useTldrawStyles();

  const handleColorClick = (colorName: string) => {
    setColor(colorName);
    setStickerColor(colorName);
  };
  return (
    <>
      {popupItems?.map((item) => {
        const isActive = item.color === stickerColor;
        return (
          <div
            key={item.color}
            className={`flex rounded-lg p-1 ${isActive ? 'border-brand-60 border' : 'border border-transparent'}`}
          >
            <button
              type="button"
              className="bg-transparent text-left"
              onClick={() => handleColorClick(item.color)}
            >
              {item.icon}
            </button>
          </div>
        );
      })}
    </>
  );
};
