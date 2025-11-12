import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { WhiteBoard } from '@xipkg/icons';
import { useState } from 'react';
import { WhiteboardsModal } from './WhiteboardsModal';
import { Button } from '@xipkg/button';
import { ONBOARDING_IDS } from '../Onboarding/CallsOnboarding';

export const WhiteBoardButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Tooltip delayDuration={1000}>
        <TooltipTrigger className="bg-transparent" asChild>
          <Button
            id={ONBOARDING_IDS.WHITEBOARD_BUTTON}
            size="icon"
            variant="ghost"
            onClick={handleClick}
            className={'hover:bg-gray-5 relative m-0 h-10 w-10 rounded-xl p-0 text-gray-100'}
          >
            <WhiteBoard />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" align="center">
          Выбрать доску для совместной работы
        </TooltipContent>
      </Tooltip>

      <WhiteboardsModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
};
