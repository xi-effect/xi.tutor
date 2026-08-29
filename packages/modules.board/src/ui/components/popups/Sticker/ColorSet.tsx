import { Sticker } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useEditor } from '@ibodr/draw';
import { useDrawStyles } from '../../../../hooks';
import { useDrawStore } from '../../../../store';
import { BOARD_COLORS } from '../../../../utils/boardColors';

const stickerColors = [
  ...BOARD_COLORS.filter((color) => color.name === 'grey'),
  ...BOARD_COLORS.filter(
    (color) => color.name !== 'black' && color.name !== 'white' && color.name !== 'grey',
  ),
];

export const ColorSet = ({ className }: { className?: string }) => {
  const editor = useEditor();
  const { setStickerColor, stickerColor } = useDrawStore();
  const { setColor } = useDrawStyles();

  const handleColorClick = (colorName: string) => {
    // После постановки стикера draw уходит в select.editing_shape —
    // без возврата на note следующий клик по канвасу ничего не создаёт.
    if (editor.getEditingShapeId()) {
      editor.setEditingShape(null);
    }
    editor.setCurrentTool('note');
    setColor(colorName);
    setStickerColor(colorName);
  };

  return (
    <div
      className={cn(
        'border-border-default bg-background-surface flex flex-wrap gap-2 rounded-xl border p-1',
        className,
      )}
    >
      {stickerColors.map(({ name, fillClass }) => {
        const isActive = name === stickerColor;
        return (
          <div
            key={name}
            className={`flex rounded-lg p-1 ${isActive ? 'border-border-focus border' : 'border border-transparent'}`}
          >
            <button
              type="button"
              className="bg-transparent text-left"
              onClick={() => handleColorClick(name)}
              aria-label={name}
            >
              <Sticker className={fillClass} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
