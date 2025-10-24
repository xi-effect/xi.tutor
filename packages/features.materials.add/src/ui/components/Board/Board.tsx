import { useState } from 'react';

import { Button } from '@xipkg/button';
import { ChevronSmallBottom, ChevronSmallTop } from '@xipkg/icons';
interface BoardProps {
  onCreate: () => void;
}

export const Board = ({ onCreate }: BoardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Button
      size="s"
      variant="secondary"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className="flex flex-row items-center gap-[6px] rounded-lg border border-gray-50 px-4 py-1 max-[550px]:hidden"
    >
      <span className="text-s-base font-medium">Создать доску</span>
      {isOpen ? (
        <ChevronSmallTop className="fill-gray-0" />
      ) : (
        <ChevronSmallBottom className="fill-gray-100" />
      )}
    </Button>
  );
};
