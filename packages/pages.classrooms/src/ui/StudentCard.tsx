import { Badge } from '@xipkg/badge';
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { MoreVert } from '@xipkg/icons';
import { UserProfile } from '@xipkg/userprofile';
import React from 'react';

type StudentStatus = 'study' | 'pause' | 'completed' | 'group';

interface StudentCardProps {
  name: string;
  avatar?: string;
  status: StudentStatus;
  groupSize?: number;
  onClick?: () => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({ name, status, groupSize }) => {
  const getStatusText = () => {
    switch (status) {
      case 'study':
        return 'Учится';
      case 'pause':
        return 'На паузе';
      case 'completed':
        return 'Обучение завершено';
      case 'group':
        return `${groupSize} человека`;
      default:
        return '';
    }
  };

  return (
    <div className="border-gray-30 hover:bg-gray-5 relative flex cursor-pointer flex-col gap-4 rounded-2xl border bg-white p-4">
      <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-6 w-6" variant="ghost" size="icon">
              <MoreVert className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end">
            <DropdownMenuItem>Пункт меню</DropdownMenuItem>
            <DropdownMenuItem>Пункт меню</DropdownMenuItem>
            <DropdownMenuItem>Пункт меню</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center">
        <UserProfile text={name} userId={1} size="l" />
      </div>

      <div className="mt-auto flex items-center gap-2">
        <Badge variant="success">{getStatusText()}</Badge>
        <Badge>Предмет</Badge>
      </div>
    </div>
  );
};
