import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@xipkg/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { MenuDots } from '@xipkg/icons';
import { track, useEditor } from 'tldraw';
import { navBarElements, NavbarElementT } from '../../../utils/navBarElements';
import { UndoRedo } from './UndoRedo';
import { useTldrawStore } from '../../../store';
import { useTldrawStyles, useHotkeys } from '../../../hooks';
import { NavbarButton } from '../shared';
import { ArrowsPopup, PenPopup, StickerPopup } from '../popups';
import { ShapesPopup } from '../popups/Shapes';
import { insertImage } from '../../../features/pickAndInsertImage';
import { insertPdf } from '../../../features/pickAndInsertPdf';
import { insertAudio, AUDIO_ACCEPT } from '../../../features/pickAndInsertAudio';

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
    token,
  }: {
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    token: string;
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
        input.accept =
          'image/jpeg,image/jpx,image/png,image/gif,image/webp,image/tiff,image/bmp,image/x-icon,image/avif';
        input.multiple = false;

        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            try {
              await insertImage(editor, file, token);
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

    const handleInsertPdf = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/pdf';
      input.multiple = false;
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          try {
            await insertPdf(editor, file, token);
          } catch (error) {
            console.error('Ошибка при загрузке PDF:', error);
          }
        }
      };
      input.click();
    };

    const handleInsertAudio = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = AUDIO_ACCEPT;
      input.multiple = false;
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          try {
            await insertAudio(editor, file, token);
          } catch (error) {
            console.error('Ошибка при загрузке аудио:', error);
          }
        }
      };
      input.click();
    };

    const currentTool = getCurrentTool();

    const mobileButtonClass = 'max-sm:flex-1 max-sm:min-h-12 max-sm:min-w-0 max-sm:h-full';

    return (
      <div className="pointer-events-none absolute inset-0">
        <div className="xs:bottom-4 absolute right-0 bottom-14 left-0 z-30 flex w-full items-center justify-center px-4 sm:px-0">
          <div className="relative z-30 flex w-full max-w-full gap-7 sm:w-auto">
            <div className="border-gray-10 bg-gray-0 absolute -left-[115px] z-30 hidden rounded-xl border p-1 sm:flex">
              <UndoRedo undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} />
            </div>
            <div className="border-gray-10 bg-gray-0 mx-auto flex w-full max-w-full gap-10 rounded-xl border sm:w-auto">
              <div className="flex w-full min-w-0 flex-1 gap-1 p-1 sm:w-auto sm:flex-initial">
                {navBarElements.map((item: NavbarElementT) => {
                  const isActive = item.action === currentTool;
                  const wrap = (node: React.ReactNode) => (
                    <div
                      key={item.action}
                      className="flex min-h-12 min-w-0 flex-1 sm:min-h-0 sm:flex-initial"
                    >
                      {node}
                    </div>
                  );

                  if (item.action === 'pen') {
                    return wrap(
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
                          className={mobileButtonClass}
                          onClick={() => handleSelectTool(item.action)}
                        />
                      </PenPopup>,
                    );
                  }

                  if (item.action === 'geo') {
                    return wrap(
                      <ShapesPopup
                        open={isPopupOpen('shapes')}
                        onOpenChange={(open) => handlePopupToggle('shapes', open)}
                      >
                        <NavbarButton
                          icon={item.icon}
                          title={item.title}
                          isActive={isActive}
                          className={mobileButtonClass}
                          onClick={() => handleSelectTool(item.action)}
                        />
                      </ShapesPopup>,
                    );
                  }

                  if (item.action === 'sticker') {
                    return wrap(
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
                          className={mobileButtonClass}
                          onClick={() => handleSelectTool(item.action)}
                        />
                      </StickerPopup>,
                    );
                  }

                  if (item.action === 'asset') {
                    return wrap(
                      <TooltipProvider>
                        <Tooltip>
                          <div className="pointer-events-auto flex h-full min-h-0 w-full min-w-0 sm:block sm:h-auto sm:w-auto">
                            <TooltipTrigger
                              className="flex h-full w-full rounded-lg sm:h-6 sm:w-6 lg:h-8 lg:w-8"
                              asChild
                            >
                              <button
                                type="button"
                                className={`pointer-events-auto flex h-6 w-6 flex-1 items-center justify-center rounded-lg lg:h-8 lg:w-8 ${mobileButtonClass} ${isActive ? 'bg-brand-0' : 'bg-gray-0'}`}
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
                      </TooltipProvider>,
                    );
                  }

                  if (item.action === 'arrow') {
                    return wrap(
                      <ArrowsPopup
                        open={isPopupOpen('arrow')}
                        onOpenChange={(open) => handlePopupToggle('arrow', open)}
                      >
                        <NavbarButton
                          icon={item.icon}
                          title={item.title}
                          isActive={isActive}
                          className={mobileButtonClass}
                          onClick={() => handleSelectTool(item.action)}
                        />
                      </ArrowsPopup>,
                    );
                  }

                  return wrap(
                    <TooltipProvider>
                      <Tooltip>
                        <div className="pointer-events-auto flex h-full min-h-0 w-full min-w-0 sm:block sm:h-auto sm:w-auto">
                          <TooltipTrigger
                            className="flex h-full w-full rounded-lg sm:h-6 sm:w-6 lg:h-8 lg:w-8"
                            asChild
                          >
                            <button
                              type="button"
                              className={`pointer-events-auto flex h-6 w-6 flex-1 items-center justify-center rounded-lg lg:h-8 lg:w-8 ${mobileButtonClass} ${isActive ? 'bg-brand-0' : 'bg-gray-0'}`}
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
                    </TooltipProvider>,
                  );
                })}
                <div className="flex min-h-12 min-w-0 flex-1 sm:min-h-0 sm:flex-initial">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className={`bg-gray-0 hover:bg-brand-0 pointer-events-auto flex h-6 w-6 flex-1 items-center justify-center rounded-lg lg:h-8 lg:w-8 ${mobileButtonClass}`}
                      >
                        <MenuDots className="rotate-90" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="top"
                      align="end"
                      sideOffset={8}
                      className="border-gray-10 bg-gray-0 w-[180px] rounded-xl border p-1"
                    >
                      <DropdownMenuItem onClick={handleInsertPdf} className="rounded-lg px-3">
                        Загрузить PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleInsertAudio} className="rounded-lg px-3">
                        Загрузить аудио
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
