import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@xipkg/tooltip';
import { track, useEditor } from 'tldraw';
import { navBarElements, NavbarElementT } from '../../../utils/navBarElements';
import { UndoRedo } from './UndoRedo';
// import { NavbarAction } from '../../../features';

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
    const [isTooltipOpen] = React.useState(false);
    const editor = useEditor();

    const handleSelectTool = (toolName: string) => {
      // Очищаем выделение перед сменой инструмента
      editor.selectNone();

      // Маппинг инструментов Kanva на Tldraw
      const toolMapping: Record<string, string> = {
        select: 'select',
        hand: 'hand',
        pen: 'draw',
        text: 'text',
        rectangle: 'rectangle',
        arrow: 'arrow',
        eraser: 'eraser',
        sticker: 'note', // Используем note как аналог стикера
        asset: 'image', // Используем image для загрузки изображений
      };

      const tldrawTool = toolMapping[toolName];
      if (tldrawTool) {
        editor.setCurrentTool(tldrawTool);
      }
    };

    const getCurrentTool = () => {
      const currentToolId = editor.getCurrentToolId();

      // Обратный маппинг для определения активного инструмента
      const reverseMapping: Record<string, string> = {
        select: 'select',
        hand: 'hand',
        draw: 'pen',
        text: 'text',
        rectangle: 'rectangle',
        arrow: 'arrow',
        eraser: 'eraser',
        note: 'sticker',
        image: 'asset',
      };

      return reverseMapping[currentToolId] || 'select';
    };

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
                  const isActive = item.action === getCurrentTool();
                  return (
                    <TooltipProvider key={item.action}>
                      <Tooltip open={item?.hasAToolTip && isTooltipOpen}>
                        <div className="pointer-events-auto">
                          <TooltipTrigger className="rounded-lg" asChild>
                            <button
                              type="button"
                              className={`pointer-events-auto flex h-6 w-6 items-center justify-center rounded-lg lg:h-8 lg:w-8 ${isActive ? 'bg-brand-0' : 'bg-gray-0'}`}
                              data-isactive={isActive}
                              onClick={() => {
                                handleSelectTool(item.action);
                              }}
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
