import { EmojiPickerPopup } from '@xipkg/emojipicker';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { PopupItemT } from '../../../utils/navBarElements';
import { boardDropdownZClass } from '../../boardTheme';
import { OpacitySizeMenu } from '../popups/Pen/OpacitySizeMenu';
import { ShapeSet } from '../popups/Shapes/ShapeSet';
import { ColorSet } from '../popups/Sticker/ColorSet';
import { ArrowSet } from '../popups/Arrows/ArrowSet';
import { BoardDrawer, useBoardIsMobile } from '../shared';

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
  onClose?: () => void;
};

const drawerPanelClass = 'border-0 bg-transparent p-0 shadow-none';

const mobileEmojiPickerClass = cn(
  'flex min-h-0 !w-full max-w-none flex-1 flex-col rounded-none bg-transparent',
  '[&>div.relative.min-h-0]:min-h-0 [&>div.relative.min-h-0]:w-full [&>div.relative.min-h-0]:flex-1',
  '[&_.absolute.right-0]:static [&_.absolute.right-0]:inset-auto [&_.absolute.right-0]:min-h-0 [&_.absolute.right-0]:min-w-0 [&_.absolute.right-0]:flex-1',
  '[&>div.relative.min-h-0>div.bg-background-subtle]:min-h-full [&>div.relative.min-h-0>div.bg-background-subtle]:self-stretch',
  '[&>div.overflow-y-auto]:!h-0 [&>div.overflow-y-auto]:min-h-0 [&>div.overflow-y-auto]:flex-1',
  '[&>div.overflow-y-auto_.grid]:w-full [&>div.overflow-y-auto_.grid]:gap-3 [&>div.overflow-y-auto_.grid]:pb-2',
  '[&_.grid-cols-8]:w-full',
);

export const ToolbarOptionsPanel = ({
  activePopup,
  stickerPopupItems,
  recentEmojis,
  stickers,
  onEmojiSelect,
  onEmojiStickerSelect,
  onClose,
}: ToolbarOptionsPanelProps) => {
  const { t } = useTranslation('board');
  const isMobile = useBoardIsMobile();

  if (!activePopup) return null;

  const titleByPopup: Record<string, string> = {
    pen: t('navbar.pen'),
    shapes: t('navbar.shapes'),
    sticker: t('navbar.sticker'),
    arrow: t('navbar.arrow'),
    emoji: t('navbar.emoji'),
  };

  const content = (
    <>
      {activePopup === 'pen' && (
        <OpacitySizeMenu className={isMobile ? drawerPanelClass : undefined} />
      )}
      {activePopup === 'shapes' && (
        <ShapeSet className={isMobile ? drawerPanelClass : undefined} onClose={onClose} />
      )}
      {activePopup === 'sticker' && (
        <ColorSet
          popupItems={stickerPopupItems}
          className={isMobile ? drawerPanelClass : undefined}
        />
      )}
      {activePopup === 'arrow' && <ArrowSet className={isMobile ? drawerPanelClass : undefined} />}
      {activePopup === 'emoji' && (
        <EmojiPickerPopup
          recentEmojis={recentEmojis}
          onEmojiSelect={onEmojiSelect}
          stickers={stickers}
          onStickerSelect={onEmojiStickerSelect}
          className={isMobile ? mobileEmojiPickerClass : undefined}
        />
      )}
    </>
  );

  if (isMobile) {
    return (
      <BoardDrawer
        open
        onOpenChange={(open) => {
          if (!open) onClose?.();
        }}
        title={titleByPopup[activePopup] ?? t('navbar.more')}
        hideTitle={activePopup === 'emoji'}
        fill={activePopup === 'emoji'}
      >
        <div
          data-board-toolbar-ui
          className={cn('min-h-0', activePopup === 'emoji' && 'flex min-h-0 flex-1 flex-col')}
        >
          {content}
        </div>
      </BoardDrawer>
    );
  }

  return (
    <div
      data-board-toolbar-ui
      className={cn(
        boardDropdownZClass,
        'pointer-events-auto absolute bottom-full left-1/2 mb-2 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2',
      )}
    >
      {content}
    </div>
  );
};
