import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@xipkg/tooltip';
import { track, useEditor } from 'tldraw';
import { navBarElements, NavbarElementT } from '../../../utils/navBarElements';
import { UndoRedo } from './UndoRedo';
import { useTldrawStore } from '../../../store';
import { useTldrawStyles, useHotkeys } from '../../../hooks';
import { NavbarButton } from '../shared';
import { PenPopup, StickerPopup } from '../popups';
import { ShapesPopup } from '../popups/Shapes';
import { insertImage } from '../../../features/pickAndInsertImage';

// Маппинг инструментов Kanva на Tldraw
const toolMapping: Record<string, string> = {
  select: 'select',
  hand: 'hand',
  pen: 'draw',
  text: 'text',
  geo: 'geo',
  arrow: 'arrow',
  eraser: 'eraser',
  sticker: 'note', // Используем note как аналог стикера
  // asset: 'image', // Убираем image, так как его нет в Tldraw
};

export const Navbar = track(
  ({
    undo,
    redo,
    canUndo,
    canRedo,
  }: {
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
  }) => {
    const { pencilColor, pencilThickness, pencilOpacity, stickerColor } = useTldrawStore();
    const { resetToDefaults, setColor, setThickness, setOpacity } = useTldrawStyles();
    const [activePopup, setActivePopup] = React.useState<string | null>(null);
    const editor = useEditor();

    // Добавляем горячие клавиши
    useHotkeys();

    const isPopupOpen = (popup: string) => activePopup === popup;
    const handlePopupToggle = (popup: string, open: boolean) => {
      setActivePopup(open ? popup : null);

      if (!open) {
        resetToDefaults();
      }
    };

    const handleSelectTool = (toolName: string) => {
      editor.selectNone();
      setActivePopup(null);

      // Специальная обработка для загрузки изображений
      if (toolName === 'asset') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = false;

        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            try {
              await insertImage(editor, file);
            } catch (error) {
              console.error('Ошибка при загрузке изображения:', error);
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
        geo: 'geo',
        arrow: 'arrow',
        eraser: 'eraser',
        note: 'sticker',
        // image: 'asset', // Убираем, так как image не существует в Tldraw
      };

      return reverseMapping[currentToolId] || 'select';
    };

    const currentTool = getCurrentTool();

    return (
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 bottom-4 left-0 z-30 flex w-full items-center justify-center">
          <div className="relative z-30 flex gap-7">
            <div className="border-gray-10 bg-gray-0 absolute -left-[115px] z-30 flex rounded-xl border p-1">
              <UndoRedo undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} />
            </div>
            <div className="border-gray-10 bg-gray-0 mx-auto flex gap-10 rounded-xl border">
              <div className="flex gap-2 p-1">
                {navBarElements.map((item: NavbarElementT) => {
                  const isActive = item.action === currentTool;

                  if (item.action === 'pen') {
                    return (
                      <PenPopup
                        key={item.action}
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
                        key={item.action}
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
                        key={item.action}
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

                  if (item.action === 'asset') {
                    return (
                      <TooltipProvider key={item.action}>
                        <Tooltip>
                          <div className="pointer-events-auto">
                            <TooltipTrigger className="rounded-lg" asChild>
                              <button
                                type="button"
                                className={`pointer-events-auto flex h-6 w-6 items-center justify-center rounded-lg lg:h-8 lg:w-8 ${isActive ? 'bg-brand-0' : 'bg-gray-0'}`}
                                data-isactive={isActive}
                                onClick={() => handleSelectTool(item.action)}
                              >
                                {item.icon ? item.icon : item.title}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{item.title}</p>
                            </TooltipContent>
                          </div>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  }

                  return (
                    <TooltipProvider key={item.action}>
                      <Tooltip>
                        <div className="pointer-events-auto">
                          <TooltipTrigger className="rounded-lg" asChild>
                            <button
                              type="button"
                              className={`pointer-events-auto flex h-6 w-6 items-center justify-center rounded-lg lg:h-8 lg:w-8 ${isActive ? 'bg-brand-0' : 'bg-gray-0'}`}
                              data-isactive={isActive}
                              onClick={() => handleSelectTool(item.action)}
                            >
                              {item.icon ? item.icon : item.title}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{item.title}</p>
                          </TooltipContent>
                        </div>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
