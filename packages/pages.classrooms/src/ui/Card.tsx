import React from 'react';

import { Button } from '@xipkg/button';
import { UserProfile } from '@xipkg/userprofile';
import { Badge } from '@xipkg/badge';
import { MoreVert, Trash } from '@xipkg/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';

import { StatusBadge } from './StatusBadge';

import { ClassroomPropsT } from '../types';

export const Card: React.FC<ClassroomPropsT> = ({ id, name, status, deleted, groupSize }) => {
  return (
    <div className="hover:bg-gray-5 border-gray-30 bg-gray-0 flex cursor-pointer justify-between rounded-2xl border p-4">
      <div className="flex max-w-[350px] flex-col gap-4">
        {deleted ? (
          <div className="flex items-center gap-2">
            <Trash className="bg-gray-10 fill-gray-30 h-12 w-12 rounded-3xl p-3" />
            <div className="text-m-base text-gray-60 font-medium">{name}</div>
          </div>
        ) : (
          <UserProfile
            text={name}
            userId={id}
            size="l"
            classNameText="text-m-base font-medium text-gray-100 w-full line-clamp-1"
          />
        )}

        <div className="mt-auto flex items-center gap-2">
          <StatusBadge status={status} groupSize={groupSize} deleted={deleted} />

          <Badge size="m" className="text-gray-80 bg-gray-5 rounded-lg border-none px-2 py-1">
            Предмет
          </Badge>
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
