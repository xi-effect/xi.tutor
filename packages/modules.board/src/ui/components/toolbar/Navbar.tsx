import React, { useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@xipkg/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { MenuDots } from '@xipkg/icons';
import { track, useEditor } from '@ibodr/draw';
import { cn } from '@xipkg/utils';
import { navBarElements, NavbarElementT } from '../../../utils/navBarElements';
import { CommentPlaceButton, useCommentsUiStore } from '../../../comments';
import { UndoRedo } from './UndoRedo';
import { NavbarMobileSwiper } from './NavbarMobileSwiper';
import { useDrawStore } from '../../../store';
import { useDrawStyles, useHotkeys } from '../../../hooks';
import { NavbarButton, ToolPopup } from '../shared';
import { ArrowsPopup, PenPopup, StickerPopup } from '../popups';
import { ShapesPopup } from '../popups/Shapes';
import { initFileDB, useRetryFileQueue } from 'common.services';
import {
  boardDropdownZClass,
  boardMenuItemClass,
  boardPanelClass,
  boardToolbarIconClass,
} from '../../boardTheme';
import { EmojiPickerPopup } from '@xipkg/emojipicker';
import { EmojiStickerStyle, EmojiStyle } from '../../../shapes/shapeStyles';
import { insertAsset } from '../../../utils/uploadAsset';
import { ALL_ALLOWED_TYPES } from '../../../constants/mimeTypes';
import { stickers } from '../../../config';

// Маппинг инструментов Kanva на Draw
const toolMapping: Record<string, string> = {
  select: 'select',
  hand: 'hand',
  pen: 'draw',
  text: 'text',
  geo: 'xi-geo',
  arrow: 'arrow',
  eraser: 'eraser',
  sticker: 'note', // Используем note как аналог стикера
  frame: 'frame',
  emoji: 'emoji',
  'emoji-sticker': 'emoji-sticker',
  'coordinate-axes': 'coordinate-axes',
};

const MORE_MENU_ACTION = 'more-menu';
const COMMENT_ACTION = 'comment';

/** Инструменты тулбара с попапом настроек */
const toolPopupIdByAction: Record<string, string> = {
  pen: 'pen',
  geo: 'shapes',
  sticker: 'sticker',
  arrow: 'arrow',
  emoji: 'emoji',
};

export const Navbar = track(
  ({
    undo,
    redo,
    canUndo,
    canRedo,
    token,
  }: {
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    token: string;
  }) => {
    const {
      pencilColor,
      pencilThickness,
      pencilOpacity,
      stickerColor,
      recentEmojis,
      addRecentEmoji,
    } = useDrawStore();
    const { resetToDefaults, setColor, setThickness, setOpacity } = useDrawStyles();
    const [activePopup, setActivePopup] = React.useState<string | null>(null);
    const editor = useEditor();
    const { processQueue, isOnline, addToQueue } = useRetryFileQueue();
    const setPlacingComment = useCommentsUiStore((s) => s.setPlacing);
    const isPlacingComment = useCommentsUiStore((s) => s.isPlacing);

    useEffect(() => {
      if (!isOnline) return;

      (async () => {
        const fileQueue = await processQueue();

        fileQueue?.forEach(({ fileId, shapeId }) => {
          if (!editor.getShape(shapeId)) return;

          editor.updateShape({
            id: shapeId,
            type: 'file',
            props: {
              src: fileId,
              status: 'uploaded',
            },
          });
        });
      })();
    }, [isOnline, processQueue, editor]);

    useEffect(() => {
      initFileDB();
    }, []);

    // Добавляем горячие клавиши
    useHotkeys();

    const isPopupOpen = (popup: string) => activePopup === popup;
    const handlePopupToggle = (popup: string, open: boolean) => {
      setActivePopup(open ? popup : null);

      if (!open && popup !== 'pen') {
        resetToDefaults();
      }
    };

    const handleSelectTool = (toolName: string) => {
      editor.selectNone();
      setPlacingComment(false);

      const popupId = toolPopupIdByAction[toolName] ?? null;
      setActivePopup(popupId);

      if (toolName === 'pen') {
        setColor(pencilColor);
        setThickness(pencilThickness);
        setOpacity(pencilOpacity);
      } else if (toolName === 'sticker') {
        setColor(stickerColor);
      } else if (!popupId) {
        resetToDefaults();
      }

      if (toolName === 'asset') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = ALL_ALLOWED_TYPES.toString();
        input.multiple = false;

        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            try {
              insertAsset(editor, file, token, addToQueue);
            } catch (error) {
              console.error('Ошибка при загрузке файла:', error);
            }
          }
        };

        input.click();
        return;
      }

      const mappedTool = toolMapping[toolName];
      if (mappedTool) {
        editor.setCurrentTool(mappedTool);
      }
    };

    const getCurrentTool = () => {
      const currentToolId = editor.getCurrentToolId();
      const reverseMapping: Record<string, string> = {
        select: 'select',
        hand: 'hand',
        draw: 'pen',
        text: 'text',
        'xi-geo': 'geo',
        arrow: 'arrow',
        eraser: 'eraser',
        note: 'sticker',
        frame: 'frame',
        emoji: 'emoji',
        'emoji-sticker': 'emoji-sticker',
        'coordinate-axes': 'coordinate-axes',
      };

      return reverseMapping[currentToolId] || 'select';
    };

    const handleInsertCoordinateAxes = () => {
      editor.selectNone();
      editor.setCurrentTool('coordinate-axes');
    };

    const currentTool = getCurrentTool();

    const renderNavbarButton = (item: NavbarElementT, isActive: boolean) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavbarButton
              icon={item.icon}
              title={item.title}
              isActive={isActive}
              onClick={() => handleSelectTool(item.action)}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>{item.title}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const renderToolbarItem = (item: NavbarElementT) => {
      const isActive = item.action === currentTool;

      if (item.action === 'pen') {
        return (
          <PenPopup
            open={isPopupOpen('pen')}
            onOpenChange={(open) => {
              if (open) {
                setColor(pencilColor);
                setThickness(pencilThickness);
                setOpacity(pencilOpacity);
              }
              handlePopupToggle('pen', open);
            }}
          >
            <NavbarButton
              icon={item.icon}
              title={item.title}
              isActive={isActive}
              onClick={() => handleSelectTool(item.action)}
            />
          </PenPopup>
        );
      }

      if (item.action === 'geo') {
        return (
          <ShapesPopup
            open={isPopupOpen('shapes')}
            onOpenChange={(open) => handlePopupToggle('shapes', open)}
          >
            <NavbarButton
              icon={item.icon}
              title={item.title}
              isActive={isActive}
              onClick={() => handleSelectTool(item.action)}
            />
          </ShapesPopup>
        );
      }

      if (item.action === 'sticker') {
        return (
          <StickerPopup
            open={isPopupOpen('sticker')}
            onOpenChange={(open) => {
              if (open) {
                setColor(stickerColor);
              }
              handlePopupToggle('sticker', open);
            }}
            popupItems={item.menuPopupContent}
          >
            <NavbarButton
              icon={item.icon}
              title={item.title}
              isActive={isActive}
              onClick={() => handleSelectTool(item.action)}
            />
          </StickerPopup>
        );
      }

      if (item.action === 'arrow') {
        return (
          <ArrowsPopup
            open={isPopupOpen('arrow')}
            onOpenChange={(open) => handlePopupToggle('arrow', open)}
          >
            <NavbarButton
              icon={item.icon}
              title={item.title}
              isActive={isActive}
              onClick={() => handleSelectTool(item.action)}
            />
          </ArrowsPopup>
        );
      }

      if (item.action === 'emoji') {
        return (
          <ToolPopup
            open={isPopupOpen('emoji')}
            onOpenChange={(open) => handlePopupToggle('emoji', open)}
            isCloseOnOutside
            content={
              <EmojiPickerPopup
                recentEmojis={recentEmojis}
                onEmojiSelect={(emoji) => {
                  editor.setStyleForNextShapes(EmojiStyle, emoji);
                  addRecentEmoji(emoji);
                }}
                stickers={stickers}
                onStickerSelect={(sticker) => {
                  editor.setStyleForNextShapes(EmojiStickerStyle, sticker.src);
                  editor.setCurrentTool('emoji-sticker');
                  setActivePopup(null);
                }}
              />
            }
          >
            <NavbarButton
              icon={item.icon}
              title={item.title}
              isActive={isActive}
              onClick={() => handleSelectTool(item.action)}
            />
          </ToolPopup>
        );
      }

      if (item.action === 'frame') {
        return (
          <NavbarButton
            icon={item.icon}
            title={item.title}
            isActive={isActive}
            onClick={() => handleSelectTool(item.action)}
          />
        );
      }

      return renderNavbarButton(item, isActive);
    };

    const toolbarSlides = [
      ...navBarElements.map((item) => ({
        key: item.action,
        node: renderToolbarItem(item),
      })),
      {
        key: COMMENT_ACTION,
        node: <CommentPlaceButton />,
      },
      {
        key: MORE_MENU_ACTION,
        node: (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <NavbarButton
                icon={<MenuDots className={cn('rotate-90', boardToolbarIconClass)} />}
                isActive={false}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="end"
              sideOffset={8}
              className={cn(
                boardDropdownZClass,
                'border-gray-10 bg-gray-0 w-[180px] rounded-xl border p-1',
              )}
            >
              <DropdownMenuItem
                onClick={handleInsertCoordinateAxes}
                className={cn(boardMenuItemClass, 'flex gap-2 px-3')}
              >
                <span>Оси координат</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ];

    const activeSlideIndex = (() => {
      if (isPlacingComment) {
        return toolbarSlides.findIndex((slide) => slide.key === COMMENT_ACTION);
      }

      const toolIndex = toolbarSlides.findIndex((slide) => slide.key === currentTool);
      return toolIndex >= 0 ? toolIndex : 0;
    })();

    return (
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 bottom-4 left-0 z-260 flex w-full items-center justify-center px-4 sm:px-0">
          <div className="relative z-260 flex w-full max-w-full sm:w-auto">
            <div className={`${boardPanelClass} absolute -left-[115px] z-260 hidden p-1 sm:flex`}>
              <UndoRedo undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} />
            </div>
            <div className={`${boardPanelClass} mx-auto w-full max-w-full sm:w-auto`}>
              <div className="hidden items-center gap-1 p-1 sm:flex">
                {toolbarSlides.map(({ key, node }) => (
                  <div key={key} className="shrink-0">
                    {node}
                  </div>
                ))}
              </div>
              <div className="p-1 sm:hidden">
                <NavbarMobileSwiper activeIndex={activeSlideIndex} slides={toolbarSlides} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
