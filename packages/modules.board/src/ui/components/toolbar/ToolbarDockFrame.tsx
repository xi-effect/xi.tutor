import type { ReactNode } from 'react';
import { cn } from '@xipkg/utils';
import { boardChromeZClass, boardPanelClass } from '../../boardTheme';
import { BOARD_CHROME_EDGE_PX, type BoardToolbarDock } from '../../../utils/boardToolbarDock';
import { UndoRedo } from './UndoRedo';

type ToolbarDockFrameProps = {
  dock: BoardToolbarDock;
  options: ReactNode;
  tools: ReactNode;
};

export function ToolbarDockFrame({ dock, options, tools }: ToolbarDockFrameProps) {
  const vertical = dock === 'left' || dock === 'right';
  const frameStyle = vertical
    ? { top: BOARD_CHROME_EDGE_PX, bottom: BOARD_CHROME_EDGE_PX }
    : dock === 'top'
      ? { top: BOARD_CHROME_EDGE_PX }
      : { bottom: BOARD_CHROME_EDGE_PX };

  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        data-board-toolbar-dock={dock}
        className={cn(
          'pointer-events-none absolute flex',
          boardChromeZClass,
          vertical ? 'w-max flex-col items-center' : 'inset-x-0 justify-center px-4',
          dock === 'left' && 'left-4',
          dock === 'right' && 'right-4',
        )}
        style={frameStyle}
      >
        <div
          className={cn(
            'pointer-events-auto flex max-h-full min-h-0 items-center',
            vertical && 'my-auto flex-col gap-2',
          )}
        >
          {vertical && (
            <div className={cn(boardPanelClass, 'p-1')}>
              <UndoRedo direction="column" />
            </div>
          )}
          <div className={cn('relative', vertical ? 'min-h-0' : 'max-w-full')}>
            {!vertical && (
              <div className={cn(boardPanelClass, 'absolute top-0 right-full mr-2 p-1')}>
                <UndoRedo />
              </div>
            )}
            {options}
            <div
              data-board-toolbar-ui
              className={cn(
                boardPanelClass,
                'flex gap-1 p-1',
                vertical ? 'min-h-0 flex-col' : 'max-w-full items-center',
              )}
            >
              <div
                className={cn(
                  'flex gap-1',
                  vertical
                    ? 'max-h-[min(640px,calc(100dvh-16rem))] flex-col overflow-y-auto overscroll-contain'
                    : 'max-w-[calc(100vw-8rem)] items-center overflow-x-auto overscroll-contain',
                )}
              >
                {tools}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
