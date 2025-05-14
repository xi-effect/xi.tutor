import React from 'react';

import { Button } from '@xipkg/button';
import { MoreVert } from '@xipkg/icons';
import { UserProfile } from '@xipkg/userprofile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';

import { MaterialPropsT } from '../types';

export const Card: React.FC<MaterialPropsT> = ({ nameMaterial, idUser, nameUser, updatedAt }) => {
  return (
    <div className="hover:bg-gray-5 border-gray-30 flex cursor-pointer justify-between rounded-2xl border bg-white p-4">
      <div className="flex flex-col gap-1">
        <UserProfile
          text={nameUser}
          userId={idUser}
          size="s"
          className="text-xs-base font-medium text-gray-100"
        />

        <div className="flex flex-col gap-4">
          <div className="text-l-base font-medium text-gray-100">{nameMaterial}</div>
          <div className="text-s-base text-gray-60 font-normal">Обновлено: {updatedAt}</div>
        </div>
      </div>

      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-6 w-6" variant="ghost" size="icon">
              <MoreVert className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="end"
            className="border-gray-10 border bg-white p-1"
          >
            <DropdownMenuItem>Копировать</DropdownMenuItem>
            <DropdownMenuItem>Удалить</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
