import React, { useCallback, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@xipkg/tooltip';
import { track, useEditor } from '@ibodr/draw';
import { cn } from '@xipkg/utils';
import { navBarElements, NavbarElementT } from '../../../utils/navBarElements';
import { CommentPlaceButton, useCommentsUiStore } from '../../../comments';
import { UndoRedo } from './UndoRedo';
import { NavbarMobileSwiper } from './NavbarMobileSwiper';
import { ToolbarOptionsPanel } from './ToolbarOptionsPanel';
import { useCloseToolbarPanel } from './useCloseToolbarPanel';
import { ActivityPicker } from '../../../activities';
import { useDrawStore } from '../../../store';
import { useDrawStyles, useHotkeys } from '../../../hooks';
import { NavbarButton } from '../shared';
import { initFileDB, useRetryFileQueue } from 'common.services';
import { boardChromeZClass, boardPanelClass } from '../../boardTheme';
import { EmojiStickerStyle, EmojiStyle } from '../../../shapes/shapeStyles';
import { stickers } from '../../../config';
import { AssetUploadControl } from './AssetUploadControl';

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
  'flip-card': 'flip-card',
};

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
    const [activityPickerOpen, setActivityPickerOpen] = React.useState(false);
    const editor = useEditor();
    const { processQueue, isOnline, addToQueue } = useRetryFileQueue();
    const setPlacingComment = useCommentsUiStore((s) => s.setPlacing);
    const isPlacingComment = useCommentsUiStore((s) => s.isPlacing);

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

      if (toolName === 'activity') {
        if (activePopup && activePopup !== 'pen') resetToDefaults();
        setActivePopup(null);
        setActivityPickerOpen((open) => !open);
        editor.setCurrentTool('select');
        return;
      }

      setActivityPickerOpen(false);

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
        'flip-card': 'flip-card',
        'math-figure': 'geo',
      };

      return reverseMapping[currentToolId] || 'select';
    };

    const currentTool = getCurrentTool();

    const renderToolbarItem = (item: NavbarElementT) => {
      const isActive =
        item.action === 'activity' ? activityPickerOpen : item.action === currentTool;

      if (item.action === 'asset') {
        return (
          <AssetUploadControl
            icon={item.icon}
            title={item.title}
            isActive={isActive}
            editor={editor}
            token={token}
            addToQueue={addToQueue}
          />
        );
      }

      if (
        item.action === 'select' ||
        item.action === 'hand' ||
        item.action === 'eraser' ||
        item.action === 'text'
      ) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <NavbarButton
                  icon={item.icon}
                  title={item.title}
                  isActive={isActive}
                  data-board-tool={item.action}
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
          data-board-tool={item.action}
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
    ];

    const activeSlideIndex = (() => {
      if (isPlacingComment) {
        return toolbarSlides.findIndex((slide) => slide.key === COMMENT_ACTION);
      }

      const toolIndex = toolbarSlides.findIndex((slide) => slide.key === currentTool);
      return toolIndex >= 0 ? toolIndex : 0;
    })();

    return (
      <>
        <ActivityPicker open={activityPickerOpen} onOpenChange={setActivityPickerOpen} />
        <div className="pointer-events-none absolute inset-0">
          <div
            className={cn(
              'absolute right-0 bottom-4 left-0 flex w-full items-center justify-center px-4 sm:px-0',
              boardChromeZClass,
            )}
          >
            <div className={cn('relative flex w-full max-w-full sm:w-auto', boardChromeZClass)}>
              <div
                className={cn(
                  boardPanelClass,
                  'absolute -left-[115px] hidden p-1 sm:flex',
                  boardChromeZClass,
                )}
              >
                <UndoRedo undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} />
              </div>
              <div
                data-board-toolbar-ui
                className={`${boardPanelClass} relative mx-auto w-full max-w-full sm:w-auto`}
              >
                <ToolbarOptionsPanel
                  activePopup={activePopup}
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
                  onClose={closeToolbarPanel}
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
      </>
    );
  },
);
