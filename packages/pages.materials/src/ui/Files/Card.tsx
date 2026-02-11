import React from 'react';

import { Button } from '@xipkg/button';
import { MoreVert } from '@xipkg/icons';
import { File } from '@xipkg/file';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';

import { MaterialPropsT } from '../../types';

export const Card: React.FC<MaterialPropsT> = ({ name }) => {
  return (
    <div className="hover:bg-gray-5 border-gray-30 bg-gray-0 relative flex h-[96px] cursor-pointer justify-between rounded-2xl border p-0">
      <File
        className="m-0 flex h-full w-[calc(100%-36px)] border-none bg-transparent p-0 hover:bg-transparent"
        name={name}
        size={100}
        url="https://www.google.com"
      />

      <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-6 w-6" variant="none" size="icon">
              <MoreVert className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="end"
            className="border-gray-10 bg-gray-0 border p-1"
          >
            <DropdownMenuItem>Копировать</DropdownMenuItem>
            <DropdownMenuItem>Удалить</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
