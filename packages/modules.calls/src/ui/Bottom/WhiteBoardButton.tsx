import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { cn } from '@xipkg/utils';
import { WhiteBoard } from '@xipkg/icons';
import { useState } from 'react';
import { WhiteboardsModal } from './WhiteboardsModal';

export const WhiteBoardButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Tooltip delayDuration={1000}>
        <TooltipTrigger className="bg-transparent">
          <button
            type="button"
            onClick={handleClick}
            className={cn(
              'bg-gray-0 hover:bg-gray-10 flex h-10 w-10 items-center justify-center rounded-[12px] transition-colors',
            )}
          >
            <WhiteBoard />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" align="center">
          Выбрать доску для совместной работы
        </TooltipContent>
      </Tooltip>

      <WhiteboardsModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
};
