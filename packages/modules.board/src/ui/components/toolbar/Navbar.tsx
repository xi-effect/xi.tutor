import React, { useCallback, useEffect } from 'react';
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
import { ToolbarOptionsPanel } from './ToolbarOptionsPanel';
import { useCloseToolbarPanel } from './useCloseToolbarPanel';
import { useDrawStore } from '../../../store';
import { useDrawStyles, useHotkeys } from '../../../hooks';
import { NavbarButton } from '../shared';
import { initFileDB, useRetryFileQueue } from 'common.services';
import {
  boardDropdownZClass,
  boardMenuItemClass,
  boardPanelClass,
  boardToolbarIconClass,
} from '../../boardTheme';
import { EmojiStickerStyle, EmojiStyle } from '../../../shapes/shapeStyles';
import { insertAsset } from '../../../utils/uploadAsset';
import { ALL_ALLOWED_TYPES } from '../../../constants/mimeTypes';
import { stickers } from '../../../config';

const toolMapping: Record<string, string> = {
  select: 'select',
  hand: 'hand',
  pen: 'draw',
  text: 'text',
  geo: 'xi-geo',
  arrow: 'arrow',
  eraser: 'eraser',
  sticker: 'note',
  frame: 'frame',
  emoji: 'emoji',
  'emoji-sticker': 'emoji-sticker',
  'coordinate-axes': 'coordinate-axes',
};

const MORE_MENU_ACTION = 'more-menu';
const COMMENT_ACTION = 'comment';

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

    const stickerPopupItems = navBarElements.find(
      (item) => item.action === 'sticker',
    )?.menuPopupContent;

    const closeToolbarPanel = useCallback(() => {
      if (activePopup && activePopup !== 'pen') resetToDefaults();
      setActivePopup(null);
    }, [activePopup, resetToDefaults]);

    useCloseToolbarPanel(activePopup, closeToolbarPanel);

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

    useHotkeys();

    const handleSelectTool = (toolName: string) => {
      editor.selectNone();
      setPlacingComment(false);

      const popupId = toolPopupIdByAction[toolName] ?? null;

      if (popupId) {
        if (activePopup === popupId) {
          if (popupId !== 'pen') resetToDefaults();
          setActivePopup(null);
        } else {
          setActivePopup(popupId);
        }
      } else {
        if (activePopup && activePopup !== 'pen') resetToDefaults();
        setActivePopup(null);
      }

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
      setActivePopup(null);
    };

    const currentTool = getCurrentTool();

    const renderToolbarItem = (item: NavbarElementT) => {
      const isActive = item.action === currentTool;

      if (
        item.action === 'select' ||
        item.action === 'hand' ||
        item.action === 'eraser' ||
        item.action === 'text' ||
        item.action === 'asset'
      ) {
        return (
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
      }

      return (
        <NavbarButton
          icon={item.icon}
          title={item.title}
          isActive={isActive}
          onClick={() => handleSelectTool(item.action)}
        />
      );
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
            <div
              data-board-toolbar-ui
              className={`${boardPanelClass} relative mx-auto w-full max-w-full sm:w-auto`}
            >
              <ToolbarOptionsPanel
                activePopup={activePopup}
                stickerPopupItems={stickerPopupItems}
                recentEmojis={recentEmojis}
                stickers={stickers}
                onEmojiSelect={(emoji) => {
                  editor.setStyleForNextShapes(EmojiStyle, emoji);
                  addRecentEmoji(emoji);
                }}
                onEmojiStickerSelect={(sticker) => {
                  editor.setStyleForNextShapes(EmojiStickerStyle, sticker.src);
                  editor.setCurrentTool('emoji-sticker');
                  setActivePopup(null);
                }}
              />
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
