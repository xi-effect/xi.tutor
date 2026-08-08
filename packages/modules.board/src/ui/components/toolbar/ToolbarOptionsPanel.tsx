import { EmojiPickerPopup } from '@xipkg/emojipicker';
import { cn } from '@xipkg/utils';
import { PopupItemT } from '../../../utils/navBarElements';
import { boardDropdownZClass } from '../../boardTheme';
import { OpacitySizeMenu } from '../popups/Pen/OpacitySizeMenu';
import { ShapeSet } from '../popups/Shapes/ShapeSet';
import { ColorSet } from '../popups/Sticker/ColorSet';
import { ArrowSet } from '../popups/Arrows/ArrowSet';

type ToolbarSticker = {
  id: string;
  name: string;
  src: string;
};

type ToolbarOptionsPanelProps = {
  activePopup: string | null;
  stickerPopupItems?: PopupItemT[];
  recentEmojis: string[];
  stickers: ToolbarSticker[];
  onEmojiSelect: (emoji: string) => void;
  onEmojiStickerSelect: (sticker: ToolbarSticker) => void;
};

export const ToolbarOptionsPanel = ({
  activePopup,
  stickerPopupItems,
  recentEmojis,
  stickers,
  onEmojiSelect,
  onEmojiStickerSelect,
}: ToolbarOptionsPanelProps) => {
  if (!activePopup) return null;

  return (
    <div
      data-board-toolbar-ui
      className={cn(
        boardDropdownZClass,
        'pointer-events-auto absolute bottom-full left-1/2 mb-2 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2',
      )}
    >
      {activePopup === 'pen' && <OpacitySizeMenu />}
      {activePopup === 'shapes' && <ShapeSet />}
      {activePopup === 'sticker' && <ColorSet popupItems={stickerPopupItems} />}
      {activePopup === 'arrow' && <ArrowSet />}
      {activePopup === 'emoji' && (
        <EmojiPickerPopup
          recentEmojis={recentEmojis}
          onEmojiSelect={onEmojiSelect}
          stickers={stickers}
          onStickerSelect={onEmojiStickerSelect}
        />
      )}
    </div>
  );
};
