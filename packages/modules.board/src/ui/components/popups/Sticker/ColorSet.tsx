import { useDrawStyles } from '../../../../hooks';
import { useDrawStore } from '../../../../store';
import { PopupItemT } from '../../../../utils/navBarElements';

export const ColorSet = ({ popupItems }: { popupItems?: PopupItemT[] }) => {
  const { setStickerColor, stickerColor } = useDrawStore();

  const { setColor } = useDrawStyles();

  const handleColorClick = (colorName: string) => {
    setColor(colorName);
    setStickerColor(colorName);
  };

  return (
    <div className="border-border-default bg-background-surface flex gap-2 rounded-xl border p-1">
      {popupItems?.map((item) => {
        const isActive = item.color === stickerColor;
        return (
          <div
            key={item.color}
            className={`flex rounded-lg p-1 ${isActive ? 'border-border-focus border' : 'border border-transparent'}`}
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
    </div>
  );
};
